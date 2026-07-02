import os
import shutil
import fitz  # PyMuPDF
import pytesseract
from pdf2image import convert_from_bytes
from typing import Any
import logging

logger = logging.getLogger(__name__)

# Constants as per naming standards
OCR_FALLBACK_MIN_CHARS = 30

class ScanningAgent:
    """Agent responsible for file type detection and text extraction (digital vs scanned PDF)."""

    def process(self, uploaded_file: Any, file_type: str) -> str:
        """Processes the uploaded file and extracts raw text.

        Args:
            uploaded_file (Any): The uploaded file object (file-like).
            file_type (str): The file type extension (pdf, txt, csv).

        Returns:
            str: Extracted raw text from the file.
        """
        file_type = file_type.lower().strip(".")
        
        try:
            if file_type == "pdf":
                return self._extract_pdf(uploaded_file)
            elif file_type in ("txt", "csv"):
                return self._extract_text_or_csv(uploaded_file)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
        except Exception as e:
            logger.error(f"Error extracting text from file: {str(e)}")
            raise

    def _extract_text_or_csv(self, uploaded_file: Any) -> str:
        """Extracts text from text-based files like TXT or CSV.

        Args:
            uploaded_file (Any): The uploaded file object.

        Returns:
            str: The decoded file content.
        """
        # Read the file content and decode it
        content_bytes = uploaded_file.read()
        # Reset stream position if possible
        if hasattr(uploaded_file, "seek"):
            uploaded_file.seek(0)
        return content_bytes.decode("utf-8", errors="ignore")

    def _extract_pdf(self, uploaded_file: Any) -> str:
        """Orchestrates PDF text extraction, selecting digital or OCR page-by-page.

        Args:
            uploaded_file (Any): The uploaded file object.

        Returns:
            str: The aggregated raw text from all pages.
        """
        pdf_bytes = uploaded_file.read()
        if hasattr(uploaded_file, "seek"):
            uploaded_file.seek(0)

        # Open the PDF using PyMuPDF from bytes stream
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        extracted_pages = []

        for page_num in range(len(doc)):
            page = doc[page_num]
            digital_text = page.get_text()
            
            # Check if page is scanned or empty
            if len(digital_text.strip()) < OCR_FALLBACK_MIN_CHARS:
                logger.info(f"Page {page_num + 1} classified as scanned. Running OCR fallback.")
                ocr_text = self._extract_via_ocr(pdf_bytes, page_num)
                extracted_pages.append(ocr_text)
            else:
                extracted_pages.append(digital_text)

        doc.close()
        return "\n--- Page Break ---\n".join(extracted_pages)

    def _extract_via_ocr(self, pdf_bytes: bytes, page_num: int) -> str:
        """Runs OCR on a specific PDF page.

        Args:
            pdf_bytes (bytes): The full PDF bytes.
            page_num (int): The 0-indexed page number to extract.

        Returns:
            str: The text extracted via Tesseract OCR.
        """
    def _get_poppler_path(self) -> Any:
        """Helper to dynamically locate Poppler on Windows if not on PATH.

        Returns:
            Any: String path to poppler bin directory or None.
        """
        if shutil.which("pdftoppm") is not None:
            return None

        if os.name == 'nt':
            user_profile = os.environ.get("USERPROFILE", "C:\\Users\\vinay")
            winget_packages = os.path.join(user_profile, "AppData", "Local", "Microsoft", "WinGet", "Packages")
            if os.path.exists(winget_packages):
                try:
                    for item in os.listdir(winget_packages):
                        if "oschwartz10612.Poppler" in item:
                            for root, dirs, files in os.walk(os.path.join(winget_packages, item)):
                                if "pdftoppm.exe" in files:
                                    logger.info(f"Dynamically discovered Poppler at: {root}")
                                    return root
                except Exception as e:
                    logger.error(f"Error searching winget packages for poppler: {str(e)}")
        return None

    def _extract_via_ocr(self, pdf_bytes: bytes, page_num: int) -> str:
        """Runs OCR on a specific PDF page.

        Args:
            pdf_bytes (bytes): The full PDF bytes.
            page_num (int): The 0-indexed page number to extract.

        Returns:
            str: The text extracted via Tesseract OCR.
        """
        try:
            poppler_path = self._get_poppler_path()
            # Convert only the specific page to image to save memory and time
            images = convert_from_bytes(
                pdf_bytes, 
                first_page=page_num + 1, 
                last_page=page_num + 1,
                poppler_path=poppler_path
            )
            if not images:
                return ""
            
            # Extract text from the image using pytesseract
            ocr_text = pytesseract.image_to_string(images[0])
            return ocr_text
        except Exception as e:
            logger.error(f"OCR failed for page {page_num + 1}: {str(e)}")
            # Fallback to empty string rather than crashing the whole document
            return ""
