from src.graph import State, StateGraph

class Agent():
    def __init__(self):
        self.graph = StateGraph(State)
        self.agent = self.graph.create_graph().compile()
    def run_chatbot(self):
        app = self.agent
        while True:
            user_input = input("😁  You: ")
            if user_input == "q":
                break
            state = {
                "question": user_input,
                "answer": ""
            }
            result = app.invoke(state)
            print("🐸  Bot:", result["answer"])