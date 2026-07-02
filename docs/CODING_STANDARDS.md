# Coding Standards

## Language & Style
- Python 3.10+, PEP 8 compliant.
- Use type hints on all function signatures: `def detect(text: str) -> dict:`
- Max line length: 100 characters.
- One class per file for each Agent (Single Responsibility Principle).
- No global mutable state except Streamlit's `st.session_state`.

## Function Design
- Every function should do ONE thing. If a function needs "and" to describe it, split it.
- Pure functions preferred for detection/masking/scoring logic (no side effects, same input -> same output) — this supports unit testing and auditability, critical for a compliance tool.
- Agent classes expose exactly one primary public method (e.g., `process()`, `detect()`, `mask()`, `classify()`, `query()`). Internal helper logic stays private (prefixed `_`).

## Error Handling
- Never let a single malformed document crash the whole app. Wrap extraction/detection in try/except and surface a user-facing warning, not a stack trace.
- Validate file type and size before processing (reject unsupported formats early).
- Log all exceptions with context (filename, agent, step) — do not swallow errors silently.

## Security & Compliance-Specific Rules
- NEVER log or print raw sensitive values (Aadhaar, PAN, card numbers, API keys) anywhere, including debug output.
- Masking must happen before text is passed to any RAG/LLM component — no exceptions, even for testing.
- API keys/secrets for the app itself (Gemini/Groq) must be loaded from environment variables, never hardcoded.

## Comments & Docstrings
- Every public method requires a docstring: one-line summary + Args/Returns.
- Inline comments only for non-obvious logic (e.g., why a regex has a specific lookahead), not for restating code.

## Testing
- Each Agent should have at least one unit test with a synthetic sample containing known PII, verifying detection/masking correctness.
- Test edge cases: empty document, scanned-only PDF, document with zero sensitive data.

## Version Control
- Commit messages: `<type>: <short description>` (e.g., `feat: add OCR fallback to scanning agent`, `fix: regex false positive on employee ID`).
- Types: feat, fix, docs, refactor, test, chore.
- No committing of `.env`, API keys, or sample documents containing real PII.

## Dependency Management
- Pin exact versions in `requirements.txt` (e.g., `spacy==3.7.4`) to avoid environment drift before the deadline.
- List system-level dependencies (tesseract, poppler) separately in `packages.txt` and document them in README.
