import io
import unittest
from unittest.mock import MagicMock, patch

from agents.scanning_agent import ScanningAgent
from agents.pattern_matching_agent import PatternMatchingAgent
from agents.masking_agent import MaskingAgent
from risk_scorer import RiskScorer

class MockUploadedFile:
    """Mock Streamlit UploadedFile class for testing."""
    def __init__(self, content: bytes, name: str):
        self.content = content
        self.name = name
        self.pointer = 0

    def read(self) -> bytes:
        val = self.content[self.pointer:]
        self.pointer = len(self.content)
        return val

    def seek(self, offset: int, whence: int = 0) -> None:
        self.pointer = offset

class TestScanningAgent(unittest.TestCase):
    """Unit tests for the ScanningAgent."""

    def setUp(self):
        self.agent = ScanningAgent()

    def test_extract_txt(self):
        mock_file = MockUploadedFile(b"Hello World", "test.txt")
        result = self.agent.process(mock_file, "txt")
        self.assertEqual(result, "Hello World")

    def test_extract_csv(self):
        mock_file = MockUploadedFile(b"id,name\n1,Alice", "test.csv")
        result = self.agent.process(mock_file, "csv")
        self.assertEqual(result, "id,name\n1,Alice")

    def test_unsupported_file_type(self):
        mock_file = MockUploadedFile(b"binary", "test.bin")
        with self.assertRaises(ValueError):
            self.agent.process(mock_file, "bin")

class TestPatternMatchingAgent(unittest.TestCase):
    """Unit tests for the PatternMatchingAgent."""

    def setUp(self):
        self.agent = PatternMatchingAgent()

    def test_luhn_validation(self):
        # Test valid 16-digit cards
        self.assertTrue(self.agent._is_luhn_valid("4388576018402621"))
        self.assertFalse(self.agent._is_luhn_valid("4388576018402622"))

    def test_detect_patterns(self):
        sample_text = (
            "My Aadhaar is 9876 5432 1098.\n"
            "My PAN is ABCDE1234F.\n"
            "Email: test.user@example.com\n"
            "Phone: 9876543210 or +91 91234-56789\n"
            "Credit Card: 4388-5760-1840-2621\n"
            "IFSC: SBIN0001234\n"
            "APIKey: AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q\n"
            "Employee ID is EMP-10452.\n"
        )
        
        findings = self.agent.detect(sample_text)
        
        self.assertIn("9876 5432 1098", findings["Aadhaar"])
        self.assertIn("ABCDE1234F", findings["PAN"])
        self.assertIn("test.user@example.com", findings["Email"])
        self.assertIn("9876543210", findings["Phone"])
        self.assertIn("4388-5760-1840-2621", findings["CreditCard"])
        self.assertIn("SBIN0001234", findings["IFSC"])
        self.assertIn("AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q", findings["APIKey"])
        self.assertIn("EMP-10452", findings["EmployeeID"])

class TestMaskingAgent(unittest.TestCase):
    """Unit tests for the MaskingAgent."""

    def setUp(self):
        self.agent = MaskingAgent()

    def test_mask_patterns(self):
        raw_text = "Contact me at test.user@example.com or 9876543210. Aadhaar is 9876 5432 1098."
        findings = {
            "Email": ["test.user@example.com"],
            "Phone": ["9876543210"],
            "Aadhaar": ["9876 5432 1098"],
            "PERSON": [], "ORG": [], "GPE": []
        }
        
        masked = self.agent.mask(raw_text, findings)
        
        # Verify Email is masked before @ but domain preserved
        self.assertNotIn("test.user", masked)
        self.assertIn("t*******r@example.com", masked)
        
        # Verify Phone is masked
        self.assertNotIn("9876543210", masked)
        self.assertIn("98******10", masked)
        
        # Verify Aadhaar is masked
        self.assertNotIn("9876 5432 1098", masked)
        self.assertIn("98**********98", masked)

    def test_mask_ner_entities(self):
        raw_text = "John Doe works at Google in Mumbai."
        findings = {
            "PERSON": ["John Doe"],
            "ORG": ["Google"],
            "GPE": ["Mumbai"],
            "Email": [], "Phone": [], "Aadhaar": [], "PAN": [], "CreditCard": [], "IFSC": [], "APIKey": [], "EmployeeID": []
        }
        
        masked = self.agent.mask(raw_text, findings)
        self.assertEqual(masked, "[PERSON] works at [ORG] in [GPE].")

class TestRiskScorer(unittest.TestCase):
    """Unit tests for the RiskScorer."""

    def setUp(self):
        self.scorer = RiskScorer()

    def test_low_risk(self):
        # Empty findings -> Low
        findings = {k: [] for k in ["Aadhaar", "PAN", "CreditCard", "IFSC", "APIKey", "Phone", "Email", "EmployeeID"]}
        label, score = self.scorer.classify(findings)
        self.assertEqual(label, "Low")
        self.assertEqual(score, 0)

        # Single phone (weight 3) -> Low (threshold is 5)
        findings["Phone"] = ["9876543210"]
        label, score = self.scorer.classify(findings)
        self.assertEqual(label, "Low")
        self.assertEqual(score, 3)

    def test_medium_risk(self):
        # Single IFSC (weight 8) -> Medium (5 <= score < 15)
        findings = {k: [] for k in ["Aadhaar", "PAN", "CreditCard", "IFSC", "APIKey", "Phone", "Email", "EmployeeID"]}
        findings["IFSC"] = ["SBIN0001234"]
        label, score = self.scorer.classify(findings)
        self.assertEqual(label, "Medium")
        self.assertEqual(score, 8)

        # Two phones (weight 6) -> Medium
        findings = {k: [] for k in ["Aadhaar", "PAN", "CreditCard", "IFSC", "APIKey", "Phone", "Email", "EmployeeID"]}
        findings["Phone"] = ["9876543210", "9123456789"]
        label, score = self.scorer.classify(findings)
        self.assertEqual(label, "Medium")
        self.assertEqual(score, 6)

    def test_high_risk(self):
        # Single Aadhaar (weight 10) + IFSC (weight 8) -> Score 18 -> High (score >= 15)
        findings = {k: [] for k in ["Aadhaar", "PAN", "CreditCard", "IFSC", "APIKey", "Phone", "Email", "EmployeeID"]}
        findings["Aadhaar"] = ["9876 5432 1098"]
        findings["IFSC"] = ["SBIN0001234"]
        label, score = self.scorer.classify(findings)
        self.assertEqual(label, "High")
        self.assertEqual(score, 18)

        # Single credit card (weight 10) + Single PAN (weight 10) -> Score 20 -> High
        findings = {k: [] for k in ["Aadhaar", "PAN", "CreditCard", "IFSC", "APIKey", "Phone", "Email", "EmployeeID"]}
        findings["CreditCard"] = ["4388576018402626"]
        findings["PAN"] = ["ABCDE1234F"]
        label, score = self.scorer.classify(findings)
        self.assertEqual(label, "High")
        self.assertEqual(score, 20)

if __name__ == "__main__":
    unittest.main()
