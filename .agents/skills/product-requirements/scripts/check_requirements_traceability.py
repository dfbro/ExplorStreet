#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any


REQUIREMENT_TYPES = {"business_outcome", "user_need", "product_requirement", "enabler", "constraint"}
BASELINE_STATES = {"DRAFT", "ALIGNED", "APPROVED"}
DECISION_STATES = {"OPEN", "SETTLED", "DRAFT", "ALIGNED", "APPROVED", "REJECTED"}
DELIVERY_STATES = {"NOT_STARTED", "IN_PROGRESS", "BLOCKED", "IMPLEMENTED"}
VERIFICATION_STATES = {"NOT_VERIFIED", "PASS", "FAIL"}
ACCEPTANCE_STATES = {"PENDING", "ACCEPTED", "REJECTED"}
WORK_PACKAGE_STATES = {"READY", "IN_PROGRESS", "BLOCKED", "DONE", "ACCEPTED"}
WORK_PACKAGE_DONE_STATES = {"DONE", "ACCEPTED"}
WORK_PACKAGE_READY_STATES = {"READY"}
IMPLEMENTATION_EVIDENCE = {"SOURCE_CODE", "TEST_RESULT", "RUNTIME_OBSERVATION", "CONTRACT"}
VERIFICATION_EVIDENCE = {"TEST_RESULT", "RUNTIME_OBSERVATION", "CONTRACT"}


def load(path: Path) -> dict[str, Any]:
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"cannot read requirements model: {exc}") from exc
    if not isinstance(payload, dict) or not isinstance(payload.get("requirements"), list):
        raise ValueError("requirements must be an array")
    return payload


def validate(payload: dict[str, Any], phase: str) -> tuple[list[str], list[str], list[str]]:
    blockers: list[str] = []
    warnings: list[str] = []
    requirements = payload["requirements"]
    by_id: dict[str, dict[str, Any]] = {}

    for item in requirements:
        if not isinstance(item, dict):
            blockers.append("each requirement must be an object")
            continue
        requirement_id = item.get("id")
        if not isinstance(requirement_id, str) or not requirement_id:
            blockers.append("requirement requires a non-empty id")
            continue
        if requirement_id in by_id:
            blockers.append(f"duplicate requirement id: {requirement_id}")
        by_id[requirement_id] = item

    baseline = payload.get("baseline")
    in_scope = _validate_baseline(baseline, by_id, phase, blockers, warnings)

    for requirement_id, item in by_id.items():
        requirement_type = item.get("type")
        if requirement_type not in REQUIREMENT_TYPES:
            blockers.append(f"{requirement_id}: invalid requirement type")
        _check_optional_state(blockers, requirement_id, item, "decision_status", DECISION_STATES)
        _check_optional_state(blockers, requirement_id, item, "delivery_status", DELIVERY_STATES)
        _check_optional_state(blockers, requirement_id, item, "verification_status", VERIFICATION_STATES)

        parent_id = item.get("parent_id")
        if parent_id is not None and parent_id not in by_id:
            blockers.append(f"{requirement_id}: unknown parent {parent_id!r}")
        supports = item.get("supports", [])
        if not isinstance(supports, list):
            blockers.append(f"{requirement_id}: supports must be an array")
            supports = []
        unknown_supports = [target for target in supports if target not in by_id]
        if unknown_supports:
            blockers.append(f"{requirement_id}: unknown supports target {unknown_supports[0]!r}")
        if requirement_type == "enabler" and not supports:
            blockers.append(f"{requirement_id}: enabler must support another requirement")

        if item.get("decision_required") is True and item.get("decision_status") not in {"SETTLED", "APPROVED"}:
            message = f"{requirement_id}: required product decision is still open"
            (blockers if phase in {"align", "delivery", "acceptance"} else warnings).append(message)

        if item.get("acceptance_required") is True and not item.get("acceptance_criteria"):
            message = f"{requirement_id}: required acceptance criteria are missing"
            (blockers if phase in {"align", "acceptance"} else warnings).append(message)

        evidence_types = {
            evidence.get("type")
            for evidence in item.get("evidence", [])
            if isinstance(evidence, dict)
        }
        if item.get("delivery_status") == "IMPLEMENTED" and not evidence_types & IMPLEMENTATION_EVIDENCE:
            message = f"{requirement_id}: implemented requirement lacks primary implementation evidence"
            if phase == "acceptance" and item.get("acceptance_required") is True:
                blockers.append(message)
            else:
                warnings.append(message)
        if item.get("delivery_status") == "BLOCKED":
            blocker = item.get("blocker")
            keys = ("reason", "owner", "next_action")
            if not isinstance(blocker, dict) or any(not blocker.get(key) for key in keys):
                warnings.append(f"{requirement_id}: blocker lacks reason, owner, or next_action")

        if phase == "acceptance" and requirement_id in in_scope and item.get("acceptance_required") is True:
            if item.get("verification_status") != "PASS":
                blockers.append(f"{requirement_id}: required outcome is not verified")
            elif not evidence_types & VERIFICATION_EVIDENCE:
                blockers.append(f"{requirement_id}: PASS lacks primary verification evidence")

    _check_parent_cycles(by_id, blockers)
    _check_support_cycles(by_id, blockers)
    _validate_release_acceptance(payload.get("release_acceptance"), phase, blockers)
    ready = _validate_work_packages(payload.get("work_packages", []), by_id, in_scope, blockers)
    return blockers, warnings, ready


def _validate_work_packages(
    work_packages: Any,
    requirements: dict[str, dict[str, Any]],
    in_scope: set[str],
    blockers: list[str],
) -> list[str]:
    if not isinstance(work_packages, list):
        blockers.append("work_packages must be an array")
        return []
    by_id: dict[str, dict[str, Any]] = {}
    for item in work_packages:
        if not isinstance(item, dict):
            blockers.append("each work package must be an object")
            continue
        package_id = item.get("id")
        if not isinstance(package_id, str) or not package_id:
            blockers.append("work package requires a non-empty id")
            continue
        if package_id in by_id:
            blockers.append(f"duplicate work package id: {package_id}")
        by_id[package_id] = item

    for package_id, item in by_id.items():
        if item.get("status") not in WORK_PACKAGE_STATES:
            blockers.append(f"{package_id}: invalid work package status")
        requirement_ids = item.get("requirement_ids")
        if not isinstance(requirement_ids, list) or not requirement_ids:
            blockers.append(f"{package_id}: requirement_ids must be a non-empty array")
        else:
            for requirement_id in requirement_ids:
                if requirement_id not in requirements:
                    blockers.append(f"{package_id}: unknown requirement {requirement_id!r}")
                elif requirement_id not in in_scope:
                    blockers.append(
                        f"{package_id}: requirement {requirement_id!r} is outside the approved baseline"
                    )
        depends_on = item.get("depends_on", [])
        if not isinstance(depends_on, list):
            blockers.append(f"{package_id}: depends_on must be an array")
        else:
            for dependency in depends_on:
                if dependency not in by_id:
                    blockers.append(f"{package_id}: unknown work package dependency {dependency!r}")
        if not item.get("acceptance_criteria"):
            blockers.append(f"{package_id}: acceptance criteria are missing")

    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(package_id: str) -> bool:
        if package_id in visiting:
            return True
        if package_id in visited:
            return False
        visiting.add(package_id)
        dependencies = by_id[package_id].get("depends_on", [])
        if isinstance(dependencies, list):
            for dependency in dependencies:
                if dependency in by_id and visit(dependency):
                    return True
        visiting.remove(package_id)
        visited.add(package_id)
        return False

    for package_id in by_id:
        if visit(package_id):
            blockers.append("work package dependencies contain a cycle")
            return []

    ready: list[str] = []
    for package_id, item in by_id.items():
        if item.get("status") not in WORK_PACKAGE_READY_STATES:
            continue
        dependencies = item.get("depends_on", [])
        if isinstance(dependencies, list) and all(
            by_id.get(dependency, {}).get("status") in WORK_PACKAGE_DONE_STATES
            for dependency in dependencies
        ):
            ready.append(package_id)
    return sorted(ready)


def _validate_baseline(
    baseline: Any,
    by_id: dict[str, dict[str, Any]],
    phase: str,
    blockers: list[str],
    warnings: list[str],
) -> set[str]:
    if not isinstance(baseline, dict):
        message = "requirements baseline is missing"
        (blockers if phase in {"align", "delivery", "acceptance"} else warnings).append(message)
        return set(by_id)
    status = baseline.get("status")
    if status not in BASELINE_STATES:
        blockers.append("baseline has an invalid status")
    requirement_ids = baseline.get("requirement_ids", [])
    if not isinstance(requirement_ids, list):
        blockers.append("baseline requirement_ids must be an array")
        requirement_ids = []
    for requirement_id in requirement_ids:
        if requirement_id not in by_id:
            blockers.append(f"baseline references unknown requirement {requirement_id!r}")
    if phase in {"align", "delivery", "acceptance"}:
        if status != "APPROVED":
            blockers.append("requirements baseline is not approved")
        evidence_types = {
            evidence.get("type")
            for evidence in baseline.get("approval_evidence", [])
            if isinstance(evidence, dict)
        }
        if "HUMAN_APPROVAL" not in evidence_types:
            blockers.append("baseline approval requires one human decision")
    return {requirement_id for requirement_id in requirement_ids if requirement_id in by_id}


def _validate_release_acceptance(acceptance: Any, phase: str, blockers: list[str]) -> None:
    if phase != "acceptance":
        return
    if not isinstance(acceptance, dict) or acceptance.get("status") not in ACCEPTANCE_STATES:
        blockers.append("release acceptance is missing or invalid")
        return
    if acceptance.get("status") != "ACCEPTED":
        blockers.append("release is not accepted")
        return
    evidence_types = {
        evidence.get("type")
        for evidence in acceptance.get("evidence", [])
        if isinstance(evidence, dict)
    }
    if "HUMAN_ACCEPTANCE" not in evidence_types:
        blockers.append("release acceptance requires one human decision")


def _check_optional_state(
    blockers: list[str], requirement_id: str, item: dict[str, Any], field: str, allowed: set[str]
) -> None:
    if field in item and item[field] not in allowed:
        blockers.append(f"{requirement_id}: invalid {field}")


def _check_parent_cycles(by_id: dict[str, dict[str, Any]], blockers: list[str]) -> None:
    for start in by_id:
        seen: set[str] = set()
        current: str | None = start
        while current is not None and current in by_id:
            if current in seen:
                blockers.append(f"{start}: parent hierarchy contains a cycle")
                break
            seen.add(current)
            parent = by_id[current].get("parent_id")
            current = parent if isinstance(parent, str) else None


def _check_support_cycles(by_id: dict[str, dict[str, Any]], blockers: list[str]) -> None:
    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(requirement_id: str) -> bool:
        if requirement_id in visiting:
            return True
        if requirement_id in visited:
            return False
        visiting.add(requirement_id)
        supports = by_id[requirement_id].get("supports", [])
        if isinstance(supports, list):
            for target in supports:
                if target in by_id and visit(target):
                    return True
        visiting.remove(requirement_id)
        visited.add(requirement_id)
        return False

    for requirement_id in by_id:
        if visit(requirement_id):
            blockers.append("support relationships contain a cycle")
            return


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit a product requirement responsibility chain.")
    parser.add_argument("model", type=Path)
    parser.add_argument(
        "--phase",
        choices=("report", "align", "delivery", "acceptance"),
        default="report",
        help="Apply only the blocking rules needed for this phase.",
    )
    args = parser.parse_args()
    try:
        payload = load(args.model)
        blockers, warnings, ready = validate(payload, args.phase)
    except ValueError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    for warning in warnings:
        print(f"WARN: {warning}")
    for blocker in blockers:
        print(f"BLOCK: {blocker}", file=sys.stderr)

    requirements = payload["requirements"]
    work_packages = payload.get("work_packages", [])
    count = lambda field, value: sum(item.get(field) == value for item in requirements)
    accepted = int(payload.get("release_acceptance", {}).get("status") == "ACCEPTED")
    print(
        f"{'BLOCKED' if blockers else 'PASS'} "
        f"phase={args.phase} requirements={len(requirements)} "
        f"blockers={len(blockers)} warnings={len(warnings)} "
        f"implemented={count('delivery_status', 'IMPLEMENTED')} "
        f"blocked={count('delivery_status', 'BLOCKED')} "
        f"verified={count('verification_status', 'PASS')} accepted={accepted} "
        f"work_packages={len(work_packages) if isinstance(work_packages, list) else 0} "
        f"ready={','.join(ready) if ready else '-'}"
    )
    return 2 if blockers else 0


if __name__ == "__main__":
    raise SystemExit(main())
