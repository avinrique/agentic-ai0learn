
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
Simple interest is calculated as (Principal * Rate * Time) / 100.
Percentage represents a portion of a whole, calculated as (part / total) * 100.
""")

# ------------------------------------------------------
# Step 2: Define all the tools (functions)
# ------------------------------------------------------

def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

def multiply(a, b):
    return a * b

def divide(a, b):
    if b == 0:
        return "Cannot divide by zero!"
    return a / b

def percentage(part, total):
    if total == 0:
        return "Total cannot be zero!"
    return (part / total) * 100

def simple_interest(principal, rate, time):
    return (principal * rate * time) / 100

def lookup(query):
    text = open("study_buddy_notes.txt").read()
    for line in text.splitlines():
        if query.lower() in line.lower():
            return line
    return "Sorry, I don't know that."

# ------------------------------------------------------
# Step 3: Describe all tools to the LLM
# ------------------------------------------------------

tools = [
    {
        "type": "function",
        "function": {
            "name": "add",
            "description": "Add two numbers.",
            "parameters": {
                "type": "object",
                "properties": {
                    "a": {"type": "number"},
                    "b": {"type": "number"}
                },
                "required": ["a", "b"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "subtract",
            "description": "Subtract b from a.",
            "parameters": {
                "type": "object",
                "properties": {
                    "a": {"type": "number"},
                    "b": {"type": "number"}
                },
                "required": ["a", "b"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "multiply",
            "description": "Multiply two numbers.",
            "parameters": {
                "type": "object",
                "properties": {
                    "a": {"type": "number"},
                    "b": {"type": "number"}
                },
                "required": ["a", "b"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "divide",
            "description": "Divide a by b.",
            "parameters": {
                "type": "object",
                "properties": {
                    "a": {"type": "number"},
                    "b": {"type": "number"}
                },
                "required": ["a", "b"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "percentage",
            "description": "Calculate percentage as (part/total)*100.",
            "parameters": {
                "type": "object",
                "properties": {
                    "part": {"type": "number"},
                    "total": {"type": "number"}
                },
                "required": ["part", "total"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "simple_interest",
            "description": "Calculate simple interest using (principal * rate * time) / 100.",
            "parameters": {
                "type": "object",
                "properties": {
                    "principal": {"type": "number"},
                    "rate": {"type": "number"},
                    "time": {"type": "number"}
                },
                "required": ["principal", "rate", "time"]
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
                    "query": {"type": "string"}
                },
                "required": ["query"]
            }
        }
    }
]

# ------------------------------------------------------
# Step 4: Define system prompt (agent personality)
# ------------------------------------------------------

system_prompt = """
You are StudyBuddy Pro ðŸ¤“ â€” a smart and friendly AI tutor.
You can solve math problems (add, subtract, multiply, divide, percentages, simple interest)
and explain topics using the lookup tool.
Always choose the correct function based on the userâ€™s request.
Explain your reasoning in simple, encouraging language with emojis.
"""

# ------------------------------------------------------
# Step 5: User Query (Try changing this!)
# ------------------------------------------------------

user_query = input("enter the prompt")
# user_query = "Find the simple interest on 1000 at 5% for 2 years"
# user_query = "What is 12 + 8?"
# user_query = "Divide 45 by 5"
# user_query = "What is LangChain?"

messages = [
    {"role": "system", "content": system_prompt},
    {"role": "user", "content": user_query}
]

# ------------------------------------------------------
# Step 6: Let GPT decide which tool to call
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

# Run the corresponding function
if name == "add":
    result = add(**args)
elif name == "subtract":
    result = subtract(**args)
elif name == "multiply":
    result = multiply(**args)
elif name == "divide":
    result = divide(**args)
elif name == "percentage":
    result = percentage(**args)
elif name == "simple_interest":
    result = simple_interest(**args)
elif name == "lookup":
    result = lookup(**args)
else:
    result = "Tool not found."

print("ðŸ”§ Tool result:", result, "\n")

# ------------------------------------------------------
# Step 8: Send result back to GPT for final natural answer
# ------------------------------------------------------

messages.append(assistant_message)
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