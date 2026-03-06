export const basicApiCode = `# 1_basic_prompt.py
from openai import OpenAI
client = OpenAI()

print("Sending a basic prompt to the AI...")

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "Write a funny 3-line poem about AI and pizza."}
    ]
)

print("\\nAI's Response:")
print(response.choices[0].message.content)`;

export const systemPromptsCode = `# 2_system_prompt_role_playing.py
from openai import OpenAI
client = OpenAI()

print("Using a system prompt to set the AI's role...")

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are a friendly Python tutor."},
        {"role": "user", "content": "Explain what a list comprehension is with an example."}
    ]
)

print("\\nPython Tutor's Response:")
print(response.choices[0].message.content)`;

export const jsonOutputCode = `# 3_json_output.py
from openai import OpenAI
client = OpenAI()

print("Asking the AI for structured JSON output...")

system_prompt = "You are a helpful assistant that only responds in valid JSON."

user_prompt = "Give me 3 Python interview questions in JSON format. Use the keys: 'question' and 'difficulty'."

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ],
    response_format={ "type": "json_object" }
)

print("\\nAI's JSON Response:")
print(response.choices[0].message.content)`;

export const fewShotCode = `# 4_few_shot_learning.py
from openai import OpenAI
client = OpenAI()

print("Teaching the AI a new task (sentiment analysis) with examples...")

messages = [
    {"role": "system", "content": "You are a sentiment classifier. Respond with only 'Positive', 'Negative', or 'Neutral'."},

    # Example 1
    {"role": "user", "content": "I love this product!"},
    {"role": "assistant", "content": "Positive"},

    # Example 2
    {"role": "user", "content": "This is terrible."},
    {"role": "assistant", "content": "Negative"},

    # Now, the real question
    {"role": "user", "content": "It's okay, not great."}
]

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages
)

print(f"\\nAI's classification for 'It's okay, not great.':")
print(response.choices[0].message.content)`;

export const conversationLoopCode = `# 3_conversation_loop.py
from openai import OpenAI
client = OpenAI()

messages = [{"role": "system", "content": "You are a helpful assistant."}]

print("Chat started! Type 'quit' to exit.\\n")

while True:
    user_input = input("You: ")
    if user_input.lower() == "quit":
        break

    messages.append({"role": "user", "content": user_input})

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages
    )

    assistant_msg = response.choices[0].message.content
    messages.append({"role": "assistant", "content": assistant_msg})
    print(f"AI: {assistant_msg}\\n")

print("Goodbye!")`;

export const challengeCode = `# 5_challenge_restaurant_recommender.py
from openai import OpenAI
import json

client = OpenAI()

print("Calling the Restaurant Recommender Bot (Bangalore)...")

system_prompt = "You are a helpful restaurant recommender. You will be given a cuisine and location, and must reply in valid JSON format."

user_prompt = """
Find 3 great South Indian restaurants in Bangalore, India.
The JSON output should be a list called "recommendations".
Each item in the list should be an object with two keys: "name" and "reason".
"""

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ],
    response_format={ "type": "json_object" }
)

print("\\n--- AI's Raw JSON Response ---")
raw_json = response.choices[0].message.content
print(raw_json)

print("\\n--- AI's 'Pretty' JSON Response ---")
try:
    parsed_json = json.loads(raw_json)
    pretty_json = json.dumps(parsed_json, indent=2)
    print(pretty_json)
except json.JSONDecodeError:
    print("AI did not return valid JSON.")`;

export const simpleAgentCode = `# calculator_agent.py
import json
from openai import OpenAI
client = OpenAI()

# --- Step 1: Define our Python function (THE TOOL) ---
def add(a, b):
    """Add two numbers together"""
    print(f"\\n[Debug: Running REAL Python code: add(a={a}, b={b})]")
    return a + b

# --- Step 2: Define the "tools" list (THE MENU) ---
tools = [
    {
        "type": "function",
        "function": {
            "name": "add",
            "description": "Add two numbers together",
            "parameters": {
                "type": "object",
                "properties": {
                    "a": {"type": "number", "description": "The first number"},
                    "b": {"type": "number", "description": "The second number"},
                },
                "required": ["a", "b"]
            }
        }
    }
]

# --- Step 3: Start the conversation ---
messages = [{"role": "user", "content": "What is 45 + 13?"}]
print(f"User: {messages[0]['content']}")

# --- Step 4: First call to the model (User -> AI) ---
print("--- 1. Sending to AI (with tools)... ---")
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages,
    tools=tools,
    tool_choice="auto"
)

message = response.choices[0].message
messages.append(message)

# --- Step 5: Handle the function call ---
if message.tool_calls:
    print(f"--- 2. AI decided to call: {message.tool_calls[0].function.name} ---")

    tool_call = message.tool_calls[0]
    function_name = tool_call.function.name
    arguments = json.loads(tool_call.function.arguments)

    result = add(a=arguments.get("a"), b=arguments.get("b"))
    print(f"--- 3. Ran function, result: {result} ---")

    # --- Step 6: Second call to the model ---
    messages.append({
        "role": "tool",
        "tool_call_id": tool_call.id,
        "content": str(result)
    })

    print("--- 4. Sending result back to AI... ---")
    final_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages
    )

    print("\\n--- 5. Final Answer from AI: ---")
    print(final_response.choices[0].message.content)
else:
    print("\\n--- Final Answer from AI (no tool needed): ---")
    print(message.content)`;

export const multiFunctionCode = `# math_tutor.py
import json
from openai import OpenAI
client = OpenAI()

# --- Step 1: Define ALL our Python functions (THE TOOLS) ---
def add(a, b):
    print(f"\\n[Debug: add(a={a}, b={b})]")
    return a + b

def subtract(a, b):
    print(f"\\n[Debug: subtract(a={a}, b={b})]")
    return a - b

def multiply(a, b):
    print(f"\\n[Debug: multiply(a={a}, b={b})]")
    return a * b

def divide(a, b):
    print(f"\\n[Debug: divide(a={a}, b={b})]")
    if b == 0: return "Error: Cannot divide by zero."
    return a / b

# --- Step 2: Define the "tools" list (THE MENU) ---
tools = [
    {"type": "function", "function": {"name": "add", ...}},
    {"type": "function", "function": {"name": "subtract", ...}},
    {"type": "function", "function": {"name": "multiply", ...}},
    {"type": "function", "function": {"name": "divide", ...}},
]

# --- Step 3: Start the conversation ---
messages = [
    {"role": "system", "content": "You are a friendly math tutor. Use tools to solve problems."},
    {"role": "user", "content": "What is (50 * 2) - 15?"}
]
print(f"User: {messages[-1]['content']}")

# --- Step 4: The Agent Loop ---
while True:
    print("\\n--- 1. Sending to AI (with tools)... ---")
    response = client.chat.completions.create(
        model="gpt-4o-mini", messages=messages,
        tools=tools, tool_choice="auto"
    )
    message = response.choices[0].message
    messages.append(message)

    if not message.tool_calls:
        print("\\n--- Final Answer from AI: ---")
        print(message.content)
        break

    print(f"--- 2. AI calls {len(message.tool_calls)} function(s) ---")
    for tool_call in message.tool_calls:
        function_name = tool_call.function.name
        arguments = json.loads(tool_call.function.arguments)
        available_functions = {"add": add, "subtract": subtract,
                               "multiply": multiply, "divide": divide}
        result = available_functions[function_name](**arguments)
        print(f"--- 3. {function_name}({arguments}) = {result} ---")
        messages.append({
            "role": "tool", "tool_call_id": tool_call.id,
            "content": str(result)
        })`;

export const multiToolCode = `# study_buddy.py - Multi-Tool Agent
from openai import OpenAI
import json
client = OpenAI()

# --- Tools ---
def add(a, b):
    return a + b

def lookup(query):
    text = open("study_buddy_notes.txt").read()
    for line in text.splitlines():
        if query.lower() in line.lower():
            return line
    return "Sorry, I don't know that."

# --- Tool Descriptions ---
tools = [
    {"type": "function", "function": {
        "name": "add",
        "description": "Add two numbers together.",
        "parameters": {"type": "object", "properties": {
            "a": {"type": "number"}, "b": {"type": "number"}
        }, "required": ["a", "b"]}
    }},
    {"type": "function", "function": {
        "name": "lookup",
        "description": "Search for a concept in the notes file.",
        "parameters": {"type": "object", "properties": {
            "query": {"type": "string"}
        }, "required": ["query"]}
    }}
]

system_prompt = "You are StudyBuddy - a friendly AI assistant."
user_query = "What is LangChain?"

messages = [
    {"role": "system", "content": system_prompt},
    {"role": "user", "content": user_query}
]

# --- Let GPT decide which tool ---
response = client.chat.completions.create(
    model="gpt-4o-mini", messages=messages, tools=tools
)
assistant_message = response.choices[0].message

# --- Execute the chosen tool ---
tool_call = assistant_message.tool_calls[0]
name = tool_call.function.name
args = json.loads(tool_call.function.arguments)

if name == "add": result = add(**args)
elif name == "lookup": result = lookup(**args)

# --- Send result back for final answer ---
messages.append(assistant_message)
messages.append({"role": "tool", "tool_call_id": tool_call.id, "content": str(result)})

final = client.chat.completions.create(model="gpt-4o-mini", messages=messages)
print("StudyBuddy:", final.choices[0].message.content)`;

export const studyBuddyProCode = `# study_buddy_pro.py - 7 Tools
from openai import OpenAI
import json
client = OpenAI()

# --- 7 Tool Functions ---
def add(a, b): return a + b
def subtract(a, b): return a - b
def multiply(a, b): return a * b
def divide(a, b): return a / b if b != 0 else "Error: divide by zero"
def percentage(part, total): return (part / total) * 100
def simple_interest(principal, rate, time): return (principal * rate * time) / 100
def lookup(query):
    text = open("study_buddy_notes.txt").read()
    for line in text.splitlines():
        if query.lower() in line.lower():
            return line
    return "Sorry, I don't know that."

# --- Tool descriptions for the LLM ---
tools = [
    {"type": "function", "function": {"name": "add", ...}},
    {"type": "function", "function": {"name": "subtract", ...}},
    {"type": "function", "function": {"name": "multiply", ...}},
    {"type": "function", "function": {"name": "divide", ...}},
    {"type": "function", "function": {"name": "percentage", ...}},
    {"type": "function", "function": {"name": "simple_interest", ...}},
    {"type": "function", "function": {"name": "lookup", ...}},
]

system_prompt = "You are StudyBuddy Pro - a smart AI tutor with 7 tools."
user_query = "Find the simple interest on 1000 at 5% for 2 years"

messages = [
    {"role": "system", "content": system_prompt},
    {"role": "user", "content": user_query}
]

response = client.chat.completions.create(
    model="gpt-4o-mini", messages=messages, tools=tools
)
assistant_message = response.choices[0].message
tool_call = assistant_message.tool_calls[0]
name = tool_call.function.name
args = json.loads(tool_call.function.arguments)

# Route to correct function
result = {"add": add, "subtract": subtract, "multiply": multiply,
          "divide": divide, "percentage": percentage,
          "simple_interest": simple_interest, "lookup": lookup}[name](**args)

messages.append(assistant_message)
messages.append({"role": "tool", "tool_call_id": tool_call.id, "content": str(result)})
final = client.chat.completions.create(model="gpt-4o-mini", messages=messages)
print("StudyBuddy Pro:", final.choices[0].message.content)`;

export const terminalAssistantCode = `# terminal_assistant.py
import json, subprocess
from openai import OpenAI
client = OpenAI()

# --- Tool functions ---
def run_command(command):
    result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=30)
    return result.stdout + result.stderr or "(no output)"

def read_file(path):
    with open(path, "r") as f: return f.read()

def write_file(path, content):
    with open(path, "w") as f: f.write(content)
    return f"Successfully wrote to {path}"

# --- Tools list ---
tools = [
    {"type": "function", "function": {"name": "run_command", ...}},
    {"type": "function", "function": {"name": "read_file", ...}},
    {"type": "function", "function": {"name": "write_file", ...}},
]

system_prompt = "You are a friendly terminal assistant."
messages = [{"role": "system", "content": system_prompt}]

# --- Main chat loop ---
while True:
    user_input = input("You: ")
    if user_input.strip().lower() == "exit": break
    messages.append({"role": "user", "content": user_input})

    # Agent loop
    while True:
        response = client.chat.completions.create(
            model="gpt-4o-mini", messages=messages, tools=tools
        )
        message = response.choices[0].message
        messages.append(message)

        if not message.tool_calls:
            print(f"Assistant: {message.content}")
            break

        for tool_call in message.tool_calls:
            fn = tool_call.function.name
            args = json.loads(tool_call.function.arguments)
            result = {"run_command": run_command, "read_file": read_file,
                       "write_file": write_file}[fn](**args)
            messages.append({"role": "tool", "tool_call_id": tool_call.id,
                            "content": result})`;
