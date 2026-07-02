import re
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)

class MaskingAgent:
    """Agent responsible for redacting and masking detected sensitive values from raw text."""

    def mask(self, raw_text: str, findings: Dict[str, List[str]]) -> str:
        """Replaces detected sensitive values in raw_text with masked placeholders.

        Args:
            raw_text (str): The raw extracted text of the document.
            findings (Dict[str, List[str]]): Dictionary of findings from PatternMatchingAgent.

        Returns:
            str: The masked text, safe for LLM ingestion.
        """
        if not raw_text:
            return ""

        # Collect all (value, category) pairs to replace
        replacements: List[Tuple[str, str]] = []
        for category, values in findings.items():
            for val in values:
                if val:
                    replacements.append((val, category))

        # Sort replacements by length of the target value in descending order
        # This prevents partial masking issues (e.g. replacing "John" inside "John Doe" first)
        replacements.sort(key=lambda x: len(x[0]), reverse=True)

        masked_text = raw_text
        for val, category in replacements:
            masked_val = self._generate_placeholder(val, category)
            # Use escape if we need, but standard replace is clean.
            # We use standard string replace to replace all occurrences.
            masked_text = masked_text.replace(val, masked_val)

        return masked_text

    def _generate_placeholder(self, val: str, category: str) -> str:
        """Generates a masked placeholder for a given value based on its category.

        Args:
            val (str): The sensitive value to mask.
            category (str): The category of the sensitive value.

        Returns:
            str: The masked placeholder string.
        """
        category_upper = category.upper()

        # Handle NER entities with descriptive labels
        if category_upper in ("PERSON", "ORG", "GPE"):
            return f"[{category_upper}]"

        # Handle Email specifically
        if category_upper == "EMAIL" and "@" in val:
            try:
                username, domain = val.split("@", 1)
                if len(username) <= 2:
                    masked_username = "*" * len(username)
                else:
                    masked_username = username[0] + "*" * (len(username) - 2) + username[-1]
                return f"{masked_username}@{domain}"
            except Exception:
                pass

        # Handle Phone specifically (keep country code/formatting if possible)
        if category_upper == "PHONE":
            # Strip non-digits to see actual numbers, but preserve length of string
            digits = re.sub(r"\D", "", val)
            if len(digits) > 4:
                # Keep first 2 and last 2 digits of the string
                return val[0:2] + "*" * (len(val) - 4) + val[-2:]
            else:
                return "*" * len(val)

        # Default masking for other pattern matched formats (Aadhaar, PAN, CreditCard, IFSC, etc.)
        # Keeps the first 2 and last 2 characters, replacing the middle with *
        if len(val) <= 4:
            return "*" * len(val)
        else:
            return val[0:2] + "*" * (len(val) - 4) + val[-2:]
