from typing import Dict, Any

def prioritize_audit(
    department: str,
    budget_variance_pct: float,
    dollar_amount: float,
    faithfulness_score: float,
    has_prior_flags: bool = False
) -> Dict[str, Any]:
    
    # 1. Score components (1-5 scale)
    magnitude_score = 5 if dollar_amount > 10_000_000 else (3 if dollar_amount > 1_000_000 else 1)
    volatility_score = 5 if abs(budget_variance_pct) > 20.0 else (3 if abs(budget_variance_pct) > 10.0 else 1)
    grounding_score = 5 if faithfulness_score < 0.6 else (3 if faithfulness_score < 0.8 else 1)
    history_score = 5 if has_prior_flags else 1

    # 2. Weighted Score Calculation
    composite_risk_score = (
        (magnitude_score * 0.35) +
        (volatility_score * 0.25) +
        (grounding_score * 0.20) +
        (history_score * 0.20)
    )

    # 3. Priority Tier Assignment
    if composite_risk_score >= 3.8:
        priority = "HIGH"
        action = "Flag for immediate manual audit verification and invoice audit."
    elif composite_risk_score >= 2.5:
        priority = "MEDIUM"
        action = "Schedule for automated spot-checking and LLM re-evaluation."
    else:
        priority = "LOW"
        action = "Log verification passed; standard monitoring."

    return {
        "department": department,
        "composite_risk_score": round(composite_risk_score, 2),
        "priority_level": priority,
        "recommended_action": action
    }