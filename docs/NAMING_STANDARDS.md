# Naming Standards

## General Rules
- Use `snake_case` for variables, functions, and file names.
- Use `PascalCase` for class names.
- Use `UPPER_SNAKE_CASE` for constants and regex pattern dictionaries.
- Names must be descriptive and unabbreviated except for well-known terms (pdf, ocr, api, pii, rag, ner).

## File Naming
| File | Purpose |
|---|---|
| `scanning_agent.py` | File type detection, scanned/digital check, extraction orchestration |
| `pattern_matching_agent.py` | Regex + spaCy NER detection |
| `masking_agent.py` | Redaction logic |
| `rag_agent.py` | LlamaIndex indexing, summarization, Q&A |
| `risk_scorer.py` | Risk classification logic |
| `app.py` | Streamlit entrypoint |

## Class Naming
- Agent classes: `<Purpose>Agent` -> `ScanningAgent`, `PatternMatchingAgent`, `MaskingAgent`, `RAGAgent`
- Non-agent utility classes: `<Purpose><Role>` -> `RiskScorer`, `DocumentSession`

## Method Naming
- Primary agent action verbs: `process()`, `detect()`, `mask()`, `classify()`, `query()`, `summarize()`
- Private helpers: prefix with underscore -> `_is_scanned_pdf()`, `_apply_regex()`, `_extract_via_ocr()`
- Boolean-returning functions must start with `is_`, `has_`, or `should_` -> `is_scanned_pdf()`, `has_high_risk_findings()`

## Variable Naming
| Concept | Variable Name |
|---|---|
| Raw extracted text | `raw_text` |
| Masked text | `masked_text` |
| Detection results dict | `findings` |
| Risk label (Low/Medium/High) | `risk_label` |
| Numeric risk score | `risk_score` |
| Uploaded file object | `uploaded_file` |
| Document identifier (filename) | `doc_id` |
| Session-stored documents dict | `st.session_state.documents` |

## Regex Pattern Naming
- Store all patterns in a single `PATTERNS` dict keyed by data type in Title Case string matching the UI label:
```python
PATTERNS = {
    "Aadhaar": r"...",
    "PAN": r"...",
    "Email": r"...",
    "Phone": r"...",
    "CreditCard": r"...",
    "IFSC": r"...",
    "APIKey": r"...",
    "EmployeeID": r"...",
}
```
- Keys in `PATTERNS` must exactly match the keys used in `findings` dict and the Risk Weight table, to avoid mismatches across modules.

## Constants
```python
RISK_WEIGHTS = {"Aadhaar": 10, "PAN": 10, "CreditCard": 10, "IFSC": 8, "APIKey": 8, "Phone": 3, "Email": 3, "EmployeeID": 2}
LOW_RISK_THRESHOLD = 5
HIGH_RISK_THRESHOLD = 15
OCR_FALLBACK_MIN_CHARS = 30
```

## Streamlit Widget Keys
- Every widget with state must have an explicit `key=` argument, named `<purpose>_<widget_type>` -> `key="doc_selector_dropdown"`, `key="qa_chat_input"` — prevents silent state collisions across tabs/reruns.
