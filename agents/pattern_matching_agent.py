import re
import spacy
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

# Constants and patterns as per naming standards
PATTERNS = {
    "Aadhaar": r"\b[2-9]\d{3}[ -]?\d{4}[ -]?\d{4}\b",
    "PAN": r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b",
    "Email": r"\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b",
    "Phone": r"\b(?:\+?\d{1,3}[- ]?)?\(?[6-9]\d{2}\)?[- ]?\d{3}[- ]?\d{4}\b",
    "CreditCard": r"\b(?:\d{4}[ -]?){3}\d{4}\b|\b\d{16}\b",
    "IFSC": r"\b[A-Z]{4}0[A-Z0-9]{6}\b",
    "APIKey": r"(?i)\b(?:AIzaSy[A-Za-z0-9_-]{33}|sk-proj-[A-Za-z0-9_-]{48})\b|\b(?:api[_-]?key|client_secret|secret_key|private_key|aws[_-]?key)\b\s*[:=]\s*['\"]([a-zA-Z0-9_\-\.]{16,})['\"]",
    "EmployeeID": r"\bEMP[_-]?\d{4,6}\b",
}

class PatternMatchingAgent:
    """Agent responsible for pattern-based PII matching (regex) and NER entity extraction (spaCy)."""

    def __init__(self) -> None:
        """Initializes the PatternMatchingAgent and loads the spaCy model."""
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning("spaCy model 'en_core_web_sm' not loaded. Attempting fallback loading in detect.")
            self.nlp = None

    def detect(self, raw_text: str) -> Dict[str, List[str]]:
        """Applies regex and spaCy NER to find sensitive information in raw text.

        Args:
            raw_text (str): The raw extracted text of the document.

        Returns:
            Dict[str, List[str]]: A dictionary of findings, mapping categories to matching strings.
        """
        findings = {key: [] for key in PATTERNS.keys()}
        findings["PERSON"] = []
        findings["ORG"] = []
        findings["GPE"] = []

        if not raw_text:
            return findings

        # 1. Regex pattern matching
        for category, pattern_str in PATTERNS.items():
            matches = []
            pattern = re.compile(pattern_str)
            for m in pattern.finditer(raw_text):
                # If there are groups, take the first non-None group, else the whole match
                val = m.group(1) if m.groups() and m.group(1) else m.group(0)
                if val:
                    val_str = val.strip()
                    # Apply Luhn check for CreditCard
                    if category == "CreditCard" and not self._is_luhn_valid(val_str):
                        continue
                    matches.append(val_str)
            
            # De-duplicate matches while preserving order
            findings[category] = list(dict.fromkeys(matches))

        # 2. spaCy NER matching
        # Attempt to load nlp if not loaded yet
        if not self.nlp:
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except OSError:
                pass

        if self.nlp:
            try:
                doc = self.nlp(raw_text)
                person_matches = []
                org_matches = []
                gpe_matches = []
                for ent in doc.ents:
                    if ent.label_ == "PERSON":
                        person_matches.append(ent.text.strip())
                    elif ent.label_ == "ORG":
                        org_matches.append(ent.text.strip())
                    elif ent.label_ == "GPE":
                        gpe_matches.append(ent.text.strip())
                
                findings["PERSON"] = list(dict.fromkeys(person_matches))
                findings["ORG"] = list(dict.fromkeys(org_matches))
                findings["GPE"] = list(dict.fromkeys(gpe_matches))
            except Exception as e:
                logger.error(f"Error during spaCy NER execution: {str(e)}")

        return findings

    def _is_luhn_valid(self, card_number: str) -> bool:
        """Validates credit card number using Luhn algorithm.

        Args:
            card_number (str): The credit card number string.

        Returns:
            bool: True if valid according to Luhn algorithm, False otherwise.
        """
        # Strip spaces and hyphens
        digits_only = re.sub(r"\D", "", card_number)
        if not digits_only or len(digits_only) < 13 or len(digits_only) > 19:
            return False
            
        digits = [int(d) for d in digits_only]
        checksum = 0
        reverse_digits = digits[::-1]
        for i, digit in enumerate(reverse_digits):
            if i % 2 == 1:
                doubled = digit * 2
                checksum += doubled - 9 if doubled > 9 else doubled
            else:
                checksum += digit
        return checksum % 10 == 0
