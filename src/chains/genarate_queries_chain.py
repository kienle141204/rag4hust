from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

def genarate_queries(llm):
    template = """
    Bạn là một trợ lý AI ngôn ngữ. Nhiệm vụ của bạn là tạo ra năm phiên bản khác nhau của câu hỏi do người dùng đưa ra, nhằm truy xuất các tài liệu liên quan từ cơ sở dữ liệu vector.
    Bằng cách tạo ra nhiều góc nhìn khác nhau về câu hỏi của người dùng, mục tiêu của bạn là giúp người dùng vượt qua một số hạn chế của việc tìm kiếm dựa trên độ tương đồng khoảng cách.
    Hãy cung cấp các câu hỏi thay thế này, cách nhau bằng dấu xuống dòng.
    Câu hỏi gốc: {question}
    Lưu ý: chỉ trả về câu hỏi được sinh ra, mỗi câu 1 dòng, không nói gì thêm.
    """

    prompt = PromptTemplate(
        template=template,
        input_variables=["question"]
    )

    genarate_queries_chain = (
        prompt
        | llm
        | StrOutputParser()
        | (lambda x: x.strip().split("\n"))
    )

    return genarate_queries_chain