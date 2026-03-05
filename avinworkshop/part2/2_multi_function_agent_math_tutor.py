# math_tutor.py
import json
from openai import OpenAI
client = OpenAI()

# --- Step 1: Define ALL our Python functions (THE TOOLS) ---

def add(a, b):
    """Add two numbers together"""
    print(f"\n[Debug: Running REAL Python code: add(a={a}, b={b})]")
    return a + b

def subtract(a, b):
    """Subtract b from a"""
    print(f"\n[Debug: Running REAL Python code: subtract(a={a}, b={b})]")
    return a - b

def multiply(a, b):
    """Multiply two numbers"""
    print(f"\n[Debug: Running REAL Python code: multiply(a={a}, b={b})]")
    return a * b

def divide(a, b):
    """Divide a by b"""
    print(f"\n[Debug: Running REAL Python code: divide(a={a}, b={b})]")
    if b == 0:
        return "Error: Cannot divide by zero."
    return a / b

# --- Step 2: Define the "tools" list (THE MENU) ---
# We now have four functions in our 'menu' for the AI.
tools = [
    {
        "type": "function",
        "function": {
            "name": "add",
            "description": "Add two numbers together",
            "parameters": {
                "type": "object",
                "properties": {
                    "a": {"type": "number"},
                    "b": {"type": "number"},
                }, "required": ["a", "b"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "subtract",
            "description": "Subtract the second number from the first number",
            "parameters": {
                "type": "object",
                "properties": {
                    "a": {"type": "number"},
                    "b": {"type": "number"},
                }, "required": ["a", "b"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "multiply",
            "description": "Multiply two numbers together",
            "parameters": {
                "type": "object",
                "properties": {
                    "a": {"type": "number"},
                    "b": {"type": "number"},
                }, "required": ["a", "b"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "divide",
            "description": "Divide the first number by the second number",
            "parameters": {
                "type":"object",
                "properties": {
                    "a": {"type": "number"},
                    "b": {"type": "number"},
                }, "required": ["a", "b"]
            }
        }
    }
]

# --- Step 3: Start the conversation ---
# We use a more complex prompt and add a system message.
messages = [
    {"role": "system", "content": "You are a friendly math tutor. Use your available tools to solve math problems, then explain the result in simple English."},
    {"role": "user", "content": "What is (50 * 2) - 15?"}
]

print(f"User: {messages[-1]['content']}") # Print the last message (the user's)

# --- Step 4: The Agent Loop ---
# This loop will continue until the AI gives a final answer
# instead of a tool call.

while True:
    print("\n--- 1. Sending to AI (with tools)... ---")
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        tools=tools,
        tool_choice="auto"
    )
    # ... (inside while True:)
    message = response.choices[0].message
    messages.append(message) # Add the AI's response to our history

    # --- Step 5: Check if the AI wants to call a tool ---
    if not message.tool_calls:
        # The AI gave a final answer!
        print("\n--- Final Answer from AI: ---")
        print(message.content)
        break # Exit the loop

    # --- Step 6: Handle ALL function calls (Code runs TOOLS) ---
    print(f"--- 2. AI decided to call {len(message.tool_calls)} function(s) ---")

    # We must respond to EVERY tool call
    for tool_call in message.tool_calls:
        function_name = tool_call.function.name
        arguments = json.loads(tool_call.function.arguments)
        
        print(f"--- Calling function: {function_name} with args: {arguments} ---")

        # Use a dictionary to map function names to functions
        available_functions = {
            "add": add,
            "subtract": subtract,
            "multiply": multiply,
            "divide": divide,
        }
        
        function_to_call = available_functions.get(function_name)
        
        if function_to_call:
            result = function_to_call(**arguments)
        else:
            result = f"Error: function {function_name} not found"

        print(f"--- 3. Ran function, result: {result} ---")

        # --- Step 7: Send EACH result back to the AI ---
        # Append a separate 'tool' message for each tool call
        messages.append(
            {
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": str(result)
            }
        )
# The 'while' loop continues from here...