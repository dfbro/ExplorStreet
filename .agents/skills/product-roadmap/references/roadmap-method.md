# Outcome Roadmap Method

Use this reference when creating or revising a roadmap.

## Roadmap model

Start with the business objective and measurable target, target customers, planning horizon, last evidence date, decision owner, intended audience, and assumptions that apply to the whole roadmap.

Each roadmap item contains:

```yaml
outcome: "observable customer or business change"
customer_problem: "need, pain point, or opportunity"
business_value: "why the outcome matters"
evidence: []
success_measure: "baseline, target, and observation window when known"
horizon: "NOW | NEXT | LATER | COMMITTED_WINDOW"
confidence: "HIGH | MEDIUM | LOW | UNKNOWN"
status: "CANDIDATE | VALIDATING | COMMITTED | DELIVERED | PAUSED"
product_dependencies: []
learning_next: "evidence that can change priority"
```

`COMMITTED` means an authorized product commitment exists. `DELIVERED` means the user-visible result exists; it does not prove the outcome was achieved. Record observed outcome evidence separately.

## Human-readable output

1. **Roadmap story:** the business objective, chosen direction, and decisive trade-offs.
2. **Roadmap:** a compact table grouped by horizon or outcome.
3. **Evidence and confidence:** why each item is where it is.
4. **Feedback:** contradictions, weak assumptions, missing measures, and opportunity costs.
5. **Decisions needed:** owner, decision, consequence, and useful deadline.
6. **Learning loop:** when evidence will be reviewed and which outcomes may change the roadmap.

## Source adaptations

- [Atlassian Agile roadmaps](https://www.atlassian.com/agile/product-management/roadmaps): treat the roadmap as a shared, evolving connection between strategy and delivery; prefer broader horizons and Now/Next/Later when dates are uncertain.
- [Atlassian product management](https://www.atlassian.com/agile/product-management): connect customer insight, business goals, strategy, prioritization, and lifecycle outcomes.
- [Product Talk opportunity solution trees](https://www.producttalk.org/discovering-solutions/): trace desired outcomes to customer opportunities, candidate solutions, and experiments instead of jumping directly from goals to features.

Use these ideas selectively. The roadmap must reflect the business's real decision process rather than reproduce a framework by default.
