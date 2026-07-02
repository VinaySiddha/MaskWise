from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)

# Constants as per naming standards
RISK_WEIGHTS = {
    "Aadhaar": 10,
    "PAN": 10,
    "CreditCard": 10,
    "IFSC": 8,
    "APIKey": 8,
    "Phone": 3,
    "Email": 3,
    "EmployeeID": 2
}

LOW_RISK_THRESHOLD = 5
HIGH_RISK_THRESHOLD = 15

class RiskScorer:
    """Utility class to calculate risk score and classify risk level of a document."""

    def classify(self, findings: Dict[str, List[str]]) -> Tuple[str, int]:
        """Calculates risk score based on findings and classifies the risk level.

        Args:
            findings (Dict[str, List[str]]): The dictionary of detected sensitive items.

        Returns:
            Tuple[str, int]: A tuple containing (risk_label, risk_score).
                             risk_label is one of 'Low', 'Medium', 'High'.
        """
        risk_score = 0

        # Calculate weighted score based on findings
        for category, weight in RISK_WEIGHTS.items():
            if category in findings and findings[category]:
                # We multiply weight by number of occurrences of that PII category
                risk_score += weight * len(findings[category])

        # Map score to risk label
        if risk_score < LOW_RISK_THRESHOLD:
            risk_label = "Low"
        elif risk_score < HIGH_RISK_THRESHOLD:
            risk_label = "Medium"
        else:
            risk_label = "High"

        logger.info(f"Risk classification completed: Score={risk_score}, Label={risk_label}")
        return risk_label, risk_score
