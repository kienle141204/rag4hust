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
                "summary": "",
                "source": None
            }
        while True:
            user_input = input("😁  You: ")
            if user_input == "q":
                break
            state["question"] = user_input
            
            result = app.invoke(state)
            state["answer"] = result["answer"]
            state["summary"] = result["summary"]
            state["source"] = result["source"]
            print("🐸  Bot:", result["answer"])
            print("_____________________")
            print(result["summary"])
            print("_____________________")
            print("Sources:", result["source"] if result["source"] else "No sources available")