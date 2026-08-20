import fitz  # PyMuPDF
import pandas as pd
from typing import List, Dict, Any
import re

class DocumentParser:
    @staticmethod
    def parse_pdf(file_bytes: bytes, filename: str, department: str = "General", year: int = 2026) -> List[Dict[str, Any]]:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        parsed_pages = []

        for page_num in range(len(doc)):
            page = doc[page_num]
            raw_text = page.get_text("text")

            # Clean text: remove repetitive headers/footers/page numbers
            cleaned_text = re.sub(r'Page\s+\d+\s+of\s+\d+', '', raw_text, flags=re.IGNORECASE)
            cleaned_text = re.sub(r'Government of Maharashtra.*Budget', '', cleaned_text, flags=re.IGNORECASE)
            cleaned_text = re.sub(r'\n+', '\n', cleaned_text).strip()

            if cleaned_text:
                parsed_pages.append({
                    "document_name": filename,
                    "page_number": page_num + 1,
                    "content": cleaned_text,
                    "department": department,
                    "year": year
                })

        return parsed_pages

    @staticmethod
    def parse_csv(file_bytes: bytes, filename: str) -> pd.DataFrame:
        df = pd.read_csv(pd.io.common.BytesIO(file_bytes))
        
        # Standardize column names
        df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]
        return df

    @staticmethod
    def parse_csv_to_text_chunks(df: pd.DataFrame, filename: str) -> List[Dict[str, Any]]:
        chunks = []
        for idx, row in df.iterrows():
            dept = row.get("department", "General")
            scheme = row.get("scheme", "N/A")
            year = row.get("year", 2026)
            locality = row.get("locality", "State")
            category = row.get("category", "General Expenditure")
            budget = row.get("budget_amount", "N/A")
            actual = row.get("actual_amount", "N/A")

            content = (
                f"Government Budget Record for Year {year}:\n"
                f"- Department: {dept}\n"
                f"- Scheme: {scheme}\n"
                f"- Locality/Region: {locality}\n"
                f"- Spending Category: {category}\n"
                f"- Allocated Budget: ₹{budget} Cr\n"
                f"- Actual Expenditure: ₹{actual} Cr"
            )

            metadata = {
                "document_name": filename,
                "page_number": idx + 1,  # Row index mapped as record page
                "department": dept,
                "scheme": scheme,
                "year": year,
                "locality": locality,
                "category": category,
                "chunk_index": idx
            }

            chunks.append({
                "chunk_id": f"{filename}_row{idx+1}",
                "content": content,
                "metadata": metadata
            })

        return chunks
