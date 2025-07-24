import streamlit as st
from src.graph import State, StateGraph

class Agent():
    def __init__(self):
        self.graph = StateGraph(State)
        self.agent = self.graph.create_graph().compile()
    
    def get_response(self, user_input):
        state = {
            "question": user_input,
            "answer": ""
        }
        result = self.agent.invoke(state)
        return result["answer"]

# Streamlit app configuration
st.set_page_config(
    page_title="AI Chatbot",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Initialize the agent (cached to avoid reloading)
@st.cache_resource
def load_agent():
    return Agent()

# Main app
def main():
    st.title("🤖 AI Chatbot")
    st.markdown("Chào mừng bạn đến với chatbot AI! Hãy đặt câu hỏi của bạn bên dưới.")
    
    try:
        agent = load_agent()
    except Exception as e:
        st.error(f"Lỗi khi tải agent: {str(e)}")
        st.stop()
    
    # Initialize chat history
    if "messages" not in st.session_state:
        st.session_state.messages = []
    
    # Display chat history
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
    
    # Chat input
    if prompt := st.chat_input("Nhập câu hỏi của bạn..."):
        # Add user message to chat history
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)
        
        # Get bot response
        with st.chat_message("assistant"):
            with st.spinner("Đang suy nghĩ..."):
                try:
                    response = agent.get_response(prompt)
                    st.markdown(response)
                    # Add assistant response to chat history
                    st.session_state.messages.append({"role": "assistant", "content": response})
                except Exception as e:
                    error_msg = f"Xin lỗi, đã xảy ra lỗi: {str(e)}"
                    st.error(error_msg)
                    st.session_state.messages.append({"role": "assistant", "content": error_msg})

# Sidebar
with st.sidebar:
    
    if st.button("🗑️ Xóa lịch sử chat"):
        st.session_state.messages = []
        st.rerun()
    


if __name__ == "__main__":
    main()