# Components, Tool Usage & CS Fundamentals

## Core Components Overview

| Component | Library | Role in Pipeline |
|---|---|---|
| Digital text extraction | PyMuPDF (fitz) | Extract text per page from text-based PDFs |
| OCR extraction | pytesseract + pdf2image | Convert scanned PDF pages to images, run OCR |
| Structured PII detection | `re` (regex) | Aadhaar, PAN, email, phone, credit card, IFSC, API keys |
| Unstructured entity detection | spaCy (`en_core_web_sm`) | Person names, organizations, confidential context |
| Data masking | Custom string logic | Redact detected values before downstream exposure |
| Risk classification | Custom weighted scoring | Low/Medium/High risk label + numeric score |
| Vector indexing & retrieval | LlamaIndex `VectorStoreIndex` | Targeted Q&A over masked document chunks |
| Summarization | LlamaIndex `SummaryIndex` | Compliance/security summary generation |
| LLM backend | Gemini API or Groq API | Generates natural language summary/answers from retrieved context |
| UI framework | Streamlit | Multi-document upload, tabbed dashboard, chat interface |
| State management | `st.session_state` | Persist per-document processed results across reruns |

## Agent Responsibilities (Detailed)

### ScanningAgent
- Input: uploaded file object, declared file type.
- Detects file type (PDF/TXT/CSV).
- For PDF: checks per-page extracted text length to classify scanned vs digital.
- Digital pages -> PyMuPDF `page.get_text()`.
- Scanned pages -> `pdf2image.convert_from_path()` + `pytesseract.image_to_string()`.
- Output: `raw_text: str`.

### PatternMatchingAgent
- Input: `raw_text`.
- Applies `PATTERNS` regex dict across text, collecting all matches per category.
- Runs spaCy NER pipeline (`nlp(raw_text)`) to extract `PERSON`, `ORG`, `GPE` entities as supplementary findings.
- Output: `findings: dict[str, list[str]]`.

### MaskingAgent
- Input: `raw_text`, `findings`.
- Replaces each detected value in the text with a masked placeholder (e.g., `AB****78`), preserving surrounding context for readability.
- Output: `masked_text: str`.

### RiskScorer
- Input: `findings`.
- Applies `RISK_WEIGHTS` to compute a numeric score; thresholds map to Low/Medium/High.
- Output: `(risk_label: str, risk_score: int)`.

### RAGAgent
- Input: `masked_text`, `findings`, `risk_label` (as metadata).
- Chunks text (`SentenceSplitter`), builds `VectorStoreIndex` and `SummaryIndex`.
- Exposes `query(question: str) -> str` (routes to vector tool for specific questions, summary tool for broad requests) and `summarize() -> str`.

## Core CS Fundamentals Applied

- **Separation of Concerns**: Each agent has exactly one responsibility; no agent reaches into another's internal state.
- **Single Responsibility Principle (SRP)**: Enforced at the class level — a class that both extracts and detects would violate this.
- **Determinism & Idempotency**: Given the same input document, detection/masking/scoring must always produce the same output — essential for auditability in compliance software.
- **Fail-safe defaults**: If detection finds nothing, default risk label is "Low Risk" — never silently skip risk classification.
- **Data minimization (security principle)**: Sensitive raw values are never persisted, logged, or passed to external APIs beyond the minimum needed for masking.
- **Pipeline/Pipe-and-filter architecture**: Data flows through agents in a fixed sequence, each filter (agent) transforming the data and passing it forward — a classic software architecture pattern applicable here.
- **State management vs statelessness**: Agents themselves are stateless (pure functions of their input); only the Streamlit layer holds session state, keeping the core logic testable in isolation.
- **Time-space tradeoff**: Conditional OCR (only when needed) is a direct application of avoiding unnecessary computation — trading a small detection check for large compute savings on digital-only documents.

## Recommended Prompts for AI-Assisted Coding
When asking an AI model to generate code from this documentation, provide it:
1. This file + `NAMING_STANDARDS.md` + `CODING_STANDARDS.md` together as context.
2. Ask for one agent class at a time (e.g., "Generate `ScanningAgent` per the spec in COMPONENTS_AND_FUNDAMENTALS.md, following NAMING_STANDARDS.md and CODING_STANDARDS.md").
3. Request unit tests immediately after each class to catch spec mismatches early.
