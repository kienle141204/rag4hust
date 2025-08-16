from langchain_google_genai import GoogleGenerativeAI
import os
from dotenv import load_dotenv

def get_llm():
    load_dotenv(".env")
    return GoogleGenerativeAI(
        model="gemma-3-12b-it",
        # model="meta-llama/llama-4-scout-17b-16e-instruct",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0,
    )