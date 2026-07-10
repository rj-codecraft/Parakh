import os
from typing import BinaryIO

def is_valid_pdf(file: BinaryIO) -> bool:
    """Fast, lightweight validation of a PDF file using binary signatures."""
    try:           
        current = file.tell()
        # Check Header: First 4 bytes must be b'%PDF'
        header = file.read(4)
        if header != b"%PDF":
            return False
                
        # Check Footer: Look for b'%%EOF' within the last 1024 bytes
        try:
            file.seek(-1024, os.SEEK_END)
        except OSError:
            # File is smaller than 1024 bytes, scan from the beginning
            file.seek(0)
                
        trailing_bytes = file.read()
        if b"%%EOF" not in trailing_bytes:
            return False
                
        return True
    finally:
        file.seek(current)