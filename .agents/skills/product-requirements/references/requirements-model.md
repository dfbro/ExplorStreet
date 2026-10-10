# Requirement Model

## Purpose

Keep one traceable answer to four questions: what outcome matters, which requirements serve it, what has been delivered, and what still needs a human decision. Do not turn the model into a second task system.

## Requirement types

- `business_outcome`: measurable reason for investment.
- `user_need`: user problem or outcome that contributes to the business outcome.
- `product_requirement`: behavior or capability the product must provide.
- `enabler`: supporting requirement that exists for another requirement and names it in `supports`.
- `constraint`: policy, legal, commercial, compatibility, time, or operating boundary.

Use `parent_id` for decomposition and `supports` for purpose. Tests, architecture modules, UI components, reviews, and task records remain evidence or delivery mappings.

## One baseline decision

Store the agreed scope in `baseline.requirement_ids`. A single `HUMAN_APPROVAL` evidence item approves that baseline. Child requirements and enablers do not need separate human approvals.

Set `decision_required: true` only when an unresolved choice would change outcome, scope, priority, risk, cost, or user-visible behavior. Set `acceptance_required: true` only for outcomes that must be verified before release. Supporting enablers normally set both fields to `false`.

## Automated delivery state

The Agent maintains `delivery_status`, `verification_status`, `architecture_refs`, evidence, and blocker details from primary sources. Missing implementation evidence and incomplete blocker details are warnings during delivery; they do not stop unrelated work.

Primary evidence types include `SOURCE_CODE`, `TEST_RESULT`, `RUNTIME_OBSERVATION`, `CONTRACT`, and `EXTERNAL_PRIMARY_SOURCE`. `AI_PROPOSAL` can draft or locate evidence but cannot approve a baseline, prove implementation, or establish acceptance.

## One acceptance decision

Verification comes from tests, runtime observations, and contracts. Human judgment applies once at module or release level through `release_acceptance` and `HUMAN_ACCEPTANCE`. Enablers inherit that decision unless they introduce a separate material product consequence.

## Phase behavior

| Phase | Blocks | Warns |
|---|---|---|
| `report` | malformed graph or invalid references | open decisions, missing evidence, incomplete blocker details |
| `align` | invalid graph, unapproved baseline, explicitly open required decision, missing required acceptance criteria | ordinary evidence gaps |
| `delivery` | invalid graph, unapproved baseline, explicitly open required decision | missing implementation evidence, incomplete blocker details |
| `acceptance` | invalid graph, unapproved baseline, unverified required outcomes, missing release-level human acceptance | non-material delivery gaps |

Report approved requirements without implementation coverage, implementation without an approved requirement, failed outcomes, blocked work, and scope changes. Escalate only the smallest decision that a human must make.
