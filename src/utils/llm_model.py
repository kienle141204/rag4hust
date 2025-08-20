from langchain_google_genai import GoogleGenerativeAI
import os
from dotenv import load_dotenv

load_dotenv(".env")

def get_llm():
    return GoogleGenerativeAI(
        model="gemma-3n-e4b-it",
        # model="meta-llama/llama-4-scout-17b-16e-instruct",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0,
    )

def get_llm_answer():
    return GoogleGenerativeAI(
        model="gemma-3n-e4b-it",
        # model="meta-llama/llama-4-scout-17b-16e-instruct",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0,
    )