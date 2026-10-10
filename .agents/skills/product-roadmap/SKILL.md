---
name: product-roadmap
description: Build or revise an outcome-oriented product roadmap that connects business goals, customer opportunities, evidence, priorities, release horizons, and feedback. Use for roadmap, Now/Next/Later, release sequencing, portfolio direction, or stakeholder roadmap communication.
---

# Product Roadmap

Create a roadmap people can use to understand direction, challenge assumptions, and make the next decision. A roadmap communicates intent and confidence; it is not a disguised task list or an invented delivery promise.

## Establish the roadmap basis

Read the current product strategy, target customers, desired business and user outcomes, discovery evidence, active commitments, delivery constraints, and observed results. Distinguish confirmed facts, commitments, candidates, and unknowns.

Choose the lightest useful view:

- **Now/Next/Later — default:** when sequence is meaningful but distant timing is uncertain.
- **Outcome roadmap:** when discovery is active and the team is choosing which customer opportunities to pursue.
- **Release roadmap:** only when dates or windows are backed by real commitments and delivery evidence.
- **Portfolio roadmap:** when several products or customer groups must be compared against shared business goals.

Read [references/roadmap-method.md](references/roadmap-method.md) for the roadmap fields, confidence rules, feedback section, and source adaptations.

## Build the roadmap

For each item, connect the business objective to the customer problem, intended outcome, supporting evidence, success measure, horizon, and current confidence. Include a dependency only when it changes product sequence or release value.

Prioritize with explicit reasoning. Show impact, evidence strength, strategic fit, risk, cost or capacity constraint, and opportunity cost. Use scoring only as an input; explain the trade-off that determines the order.

Keep near-term items concrete and distant items outcome-focused. Preserve `UNKNOWN` dates and dependencies instead of converting guesses into commitments.

## Give humans useful feedback

Lead with the roadmap story: what the business is trying to change, what is being pursued now, what is deliberately later, and what evidence could reorder it. Surface conflicts, unsupported commitments, missing customer evidence, metric gaps, and decisions that require a human owner.

Return an editable Markdown roadmap by default. Add a presentation or interactive view only when the user requests one or when several audiences need materially different views. Keep one underlying roadmap model so visual exports do not become separate sources of truth.

Do not assign module ownership, design interfaces, estimate technical implementation, or invent delivery dates. Return architecture constraints to `system-architect` and delivery planning to the owning workflow.
