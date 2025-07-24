from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from src.utils.llm_model import get_llm

def search_chain():
    llm = get_llm()
    template = """
        Bạn là một chuyên gia về giao tiếp và giải đáp các vấn đề của người dùng.
        Hãy giao tiếp với người dùng sau bằng tiếng Việt.
        Người dùng nói: {question}
    """

    prompt = PromptTemplate(
        template=template,
        input_variables=["question"]
    )

    chain = prompt | llm | StrOutputParser()
    return chain 
