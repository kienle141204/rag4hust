from src.graph import State, StateGraph

class Agent():
    def __init__(self):
        self.graph = StateGraph(State)
        self.agent = self.graph.create_graph().compile()
    def run_chatbot(self):
        app = self.agent
        state = {
                "question": "",
                "answer": "",
                "summary": ""
            }
        while True:
            user_input = input("😁  You: ")
            if user_input == "q":
                break
            state["question"] = user_input
            
            result = app.invoke(state)
            state["answer"] = result["answer"]
            state["summary"] = result["summary"]
            print("🐸  Bot:", result["answer"])
            print("_____________________")
            print(result["summary"])
            print("_____________________")