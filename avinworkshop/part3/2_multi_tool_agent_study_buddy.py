
# ðŸ§  Study Buddy Agent â€” Multi-Tool Agent Demo
# Time: 1:30 PM â€“ 2:45 PM

from openai import OpenAI
import json

# Initialize OpenAI client
client = OpenAI()

# ------------------------------------------------------
# Step 1: Create a sample notes file for the lookup tool
# ------------------------------------------------------

with open("study_buddy_notes.txt", "w") as f:
    f.write("""LangChain is a framework for building applications with large language models.
RAG stands for Retrieval-Augmented Generation, a way to combine search and generation.
An LLM is a large language model trained to understand and generate text.
OpenAI Function Calling lets LLMs use external functions or APIs.
""")

# ------------------------------------------------------
# Step 2: Define the tools (functions)
# ------------------------------------------------------

def add(a, b):
    """Add two numbers together"""
    return a + b

def lookup(query):
    """Search for a concept in a local text file"""
    text = open("study_buddy_notes.txt").read()
    for line in text.splitlines():
        if query.lower() in line.lower():
            return line
    return "Sorry, I don't know that."

# ------------------------------------------------------
# Step 3: Describe both tools for the LLM
# ------------------------------------------------------

tools = [
    {
        "type": "function",
        "function": {
            "name": "add",
            "description": "Add two numbers together.",
            "parameters": {
                "type": "object",
                "properties": {
                    "a": {"type": "number", "description": "The first number"},
                    "b": {"type": "number", "description": "The second number"}
                },
                "required": ["a", "b"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "lookup",
            "description": "Search for a concept or term in the notes file.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "The term to search for"}
                },
                "required": ["query"]
            }
        }
    }
]

# ------------------------------------------------------
# Step 4: Define the system prompt (agent personality)
# ------------------------------------------------------

system_prompt = """
You are StudyBuddy ðŸ¤“ â€” a friendly AI assistant that helps students.
If the user asks a math question, use the calculator.
If the user asks a concept question, use the lookup function.
Always explain your answer clearly and add some motivation or emojis when appropriate.
"""

# ------------------------------------------------------
# Step 5: User query â€” try changing this!
# ------------------------------------------------------

user_query = input("enter the prompt")
# user_query = "What is LangChain?"
# user_query = "I'm tired of studying."

messages = [
    {"role": "system", "content": system_prompt},
    {"role": "user", "content": user_query}
]

# ------------------------------------------------------
# Step 6: Let GPT decide which tool to use
# ------------------------------------------------------

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages,
    tools=tools
)

assistant_message = response.choices[0].message
print("ðŸ¤– Raw LLM Decision:\n", assistant_message, "\n")

# ------------------------------------------------------
# Step 7: Execute the chosen tool
# ------------------------------------------------------

tool_call = assistant_message.tool_calls[0]
name = tool_call.function.name
args = json.loads(tool_call.function.arguments)

if name == "add":
    result = add(**args)
elif name == "lookup":
    result = lookup(**args)
else:
    result = "Tool not found."

print("ðŸ”§ Tool result:", result, "\n")

# ------------------------------------------------------
# Step 8: Send result back to GPT for natural explanation
# ------------------------------------------------------

messages.append(assistant_message)  # LLMâ€™s decision
messages.append({
    "role": "tool",
    "tool_call_id": tool_call.id,
    "content": str(result)
})

response_final = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages
)

final_answer = response_final.choices[0].message.content
print("ðŸŽ“ StudyBuddy:", final_answer)