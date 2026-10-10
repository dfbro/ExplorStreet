---
name: product-requirements
description: Align ambiguous work into a lightweight, hierarchical requirement baseline before implementation, then trace delivery, blockers, verification, and release acceptance with exception-driven human review. Use for PRDs, requirement dependencies, implementation readiness, module completion checks, scope drift, and post-build acceptance; do not use for settled one-step work, generic pressure-testing, or technical architecture design.
---

# Product Requirements

Turn product intent into a durable requirement responsibility chain. Let the Agent maintain routine structure and evidence; ask the human only for decisions that change the product commitment.

## Align before work starts

1. Read primary customer, business, policy, product, and existing-system evidence. Mark unverified claims `UNKNOWN`.
2. Separate business outcomes, user needs, product requirements, enablers, constraints, and acceptance criteria. Read [references/requirements-model.md](references/requirements-model.md) for the model and hierarchy rules.
3. Give every requirement a stable ID. Use `parent_id` for decomposition and `supports` for the reason a supporting requirement exists.
4. Resolve discoverable facts from evidence. Ask the human only about unresolved goals, scope, priority, risk tolerance, or acceptance judgments that change the product commitment.
5. Keep architecture placement out of the PRD. Send approved requirement IDs and constraints to `system-architect`; accept module and interface references back without rewriting product intent.
6. Ask the human to approve the baseline once. That decision covers the listed requirement IDs; do not request separate approval for each child requirement or enabler.
7. Record baseline approval separately from delivery, verification, and release acceptance. Implementation authority follows the user's task and workspace rules.

For a one-line, already-settled change, keep the result direct. Create the structured model when requirements depend on one another, work spans modules or sessions, or later traceability materially matters.

## Resolve unknowns before freezing the baseline

Use conversation for product choices that can be settled in words. When state, interaction, business logic, or a user interface must be experienced to answer the question, commission the smallest throwaway prototype that can produce the missing evidence. Keep the prototype as a cited decision source; production code starts separately from the approved requirement.

When decisive knowledge belongs to another person, produce a focused questionnaire for that gap. Bring the answers back as source material and preserve unanswered items as open decisions.

## Prepare delivery slices

After the baseline is approved, translate it into **tracer-bullet** work packages when delivery spans multiple sessions or independently verifiable outcomes:

- each package completes one narrow end-to-end behavior across the required layers;
- each package is independently demoable or verifiable;
- each package fits one fresh implementation context;
- each package names only the other packages that genuinely block it;
- the ready set is computed from blocking relationships rather than a numbered sequence.

For a wide mechanical refactor that cannot land as a green vertical slice, use expand-contract: add the new form beside the old, migrate callers in bounded batches, then remove the old form after every blocking migration completes.

## Maintain the responsibility chain

Use `assets/requirements-traceability.template.json` as the portable model. Select the phase that matches the current decision:

    python3 <skill-dir>/scripts/check_requirements_traceability.py requirements-traceability.json --phase report
    python3 <skill-dir>/scripts/check_requirements_traceability.py requirements-traceability.json --phase align
    python3 <skill-dir>/scripts/check_requirements_traceability.py requirements-traceability.json --phase delivery
    python3 <skill-dir>/scripts/check_requirements_traceability.py requirements-traceability.json --phase acceptance

Use `report` for a non-blocking health summary. Use `align` before consequential multi-part work, `delivery` while work is underway, and `acceptance` only when deciding whether the release outcome can be accepted.

Always block malformed identities, dangling references, and dependency cycles. During alignment, also block an unapproved baseline, explicitly unresolved material decisions, and acceptance criteria marked required but missing. During delivery, report missing evidence and incomplete blocker details as warnings so unrelated work can continue. During acceptance, block only required outcomes that lack verification and a release marked accepted without one human acceptance decision.

When a module is presented as complete:

1. reload the approved requirement model;
2. map the module and its tests or runtime evidence to requirement IDs;
3. report implemented, blocked, unverified, failed, accepted, and out-of-scope requirements without turning every gap into a stop condition;
4. detect orphan implementation that serves no approved requirement and approved requirements with no implementation coverage;
5. ask for one release or module-level human acceptance decision where outcome judgment cannot be automated.

Do not call a module complete because code exists or a task says done. Keep implementation, verification, and acceptance separate. Let supporting enablers inherit the baseline and release decisions unless one changes scope, cost, risk, or user-visible behavior.

## Protect evidence quality

Treat AI summaries, generated PRDs, diagrams, inferred mappings, and agent reports as `AI_PROPOSAL`. They may propose structure or point to evidence, but they cannot verify their own claims, satisfy implementation evidence, or establish human acceptance.

Trace decisive claims to a human-approved requirement, source code, executable test result, runtime observation, contract, primary external source, or explicit human acceptance. Do not use one AI artifact as the sole source for another. If primary evidence cannot be reached, preserve `UNKNOWN` and state what evidence is missing.

## Return useful human feedback

Lead with readiness or delivery status. Show the requirement chain that matters, uncovered requirements, blockers, scope drift, and evidence gaps. Ask the human only for the smallest outstanding decision. Use business language; keep internal process mechanics out of the PRD unless the reader needs them.

Return architecture decisions to `system-architect`, implementation to the developer, and roadmap sequencing to `product-roadmap`. Retain responsibility for checking that delivered behavior still satisfies the approved product requirements.
