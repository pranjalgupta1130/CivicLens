import re
from typing import Dict, Any, List

class NaturalLanguageAnalytics:
    def __init__(self, llm_client=None):
        self.llm_client = llm_client

    def parse_analytics_query(self, user_query: str) -> Dict[str, Any]:
        """
        Extracts intents, thresholds, and target metrics from natural language.
        """
        query_lower = user_query.lower()

        # Extract numeric percentages using regex (e.g., "over 15%")
        variance_match = re.search(r"(\d+)\s*%", query_lower)
        threshold_pct = float(variance_match.group(1)) if variance_match else 10.0

        # Determine directional focus
        if "increase" in query_lower or "rose" in query_lower:
            direction = "INCREASE"
        elif "decrease" in query_lower or "cut" in query_lower:
            direction = "DECREASE"
        else:
            direction = "ALL"

        # Determine audit filter trigger
        high_risk_only = any(term in query_lower for term in ["high risk", "flagged", "audit", "low faith"])

        return {
            "original_query": user_query,
            "parsed_filters": {
                "directional_change": direction,
                "min_variance_pct": threshold_pct,
                "high_risk_only": high_risk_only
            }
        }

    def summarize_dataset(self, records: List[Dict[str, Any]], query: str) -> Dict[str, Any]:
        """
        Filters and aggregates financial records based on parsed natural language query.
        """
        parsed = self.parse_analytics_query(query)
        filters = parsed["parsed_filters"]

        filtered_results = []
        for row in records:
            # Match direction
            if filters["directional_change"] != "ALL" and row.get("directional_change") != filters["directional_change"]:
                continue
            # Match percentage variance
            if abs(row.get("budget_variance_pct", 0)) < filters["min_variance_pct"]:
                continue
            # Match high risk flag
            if filters["high_risk_only"] and row.get("priority_level") != "HIGH":
                continue

            filtered_results.append(row)

        return {
            "query": query,
            "total_matches": len(filtered_results),
            "applied_filters": filters,
            "data": filtered_results
        }