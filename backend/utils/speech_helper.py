import re

def sanitize_for_speech(text: str) -> str:
    """
    Cleans up text specifically for TTS engines to pronounce better.
    Removes weird symbols, normalizes punctuation, and ensures good pacing.
    """
    if not text:
        return ""
    
    # Remove internal metadata tags from our RAG responses
    text = text.replace("GREETING:", "")
    text = text.replace("WHAT I'LL HELP:", "")
    text = text.replace("SUMMARY:", "")
    text = text.replace("NEXT STEP:", "")
    
    # Clean up bullet points or dashes
    text = text.replace("-", " ")
    
    # Remove quotes
    text = text.replace('"', "")
    text = text.replace("'", "")
    
    # Normalize excessive newlines and spaces
    text = re.sub(r'\s+', ' ', text)
    
    # Ensure punctuation is followed by space for better TTS pacing
    text = text.replace(".", ". ")
    text = text.replace(",", ", ")
    text = text.replace("!", "! ")
    text = text.replace("?", "? ")
    
    # Clean up double spaces created by the above
    text = re.sub(r' +', ' ', text)
    
    return text.strip()
