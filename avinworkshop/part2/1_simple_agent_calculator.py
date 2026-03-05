# calculator_agent.py
import json
from openai import OpenAI
client = OpenAI()

# --- Step 1: Define our Python function (THE TOOL) ---
# This is a REAL Python function that does math.
def add(a, b):
    """Add two numbers together"""
    print(f"\n[Debug: Running REAL Python code: add(a={a}, b={b})]")
    return a + b

# --- Step 2: Define the "tools" list (THE MENU) ---
# This is a "menu" that tells the AI what functions are available.
# The 'description' is VERY important. It's how the AI knows
# WHEN to use the tool.
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
# We keep a history of the conversation in 'messages'
messages = [{"role": "user", "content": "What is 45 + 13?"}]
print(f"User: {messages[0]['content']}")

# --- Step 4: First call to the model (User -> AI) ---
# We send the user's message AND the list of 'tools'
print("--- 1. Sending to AI (with tools)... ---")
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages,
    tools=tools,
    tool_choice="auto"  # 'auto' lets the AI decide if it needs a tool
)

# Get the AI's first response (which will be a tool call)
message = response.choices[0].message
messages.append(message) # Add the AI's response to our history

# --- Step 5: Handle the function call (Code runs TOOL) ---
# The AI *didn't* give a final answer. It sent back a 'tool_calls' request.

if message.tool_calls:
    print(f"--- 2. AI decided to call a function: {message.tool_calls[0].function.name} ---")

    # Get the specific tool call
    tool_call = message.tool_calls[0]
    function_name = tool_call.function.name

    # Get the arguments the AI wants to use (as a string)
    arguments_str = tool_call.function.arguments
    # Parse the JSON string into a Python dictionary
    arguments = json.loads(arguments_str)

    # Call our REAL Python function with the arguments
    result = add(
        a=arguments.get("a"), 
        b=arguments.get("b")
    )

    print(f"--- 3. Ran function, result: {result} ---")

    # --- Step 6: Second call to the model (Tool Result -> AI) ---
    # Now we send the result back to the AI so it can give a final answer.
    messages.append(
        {
            "role": "tool",
            "tool_call_id": tool_call.id,
            "content": str(result) # Send the result back as a string
        }
    )

    print("--- 4. Sending result back to AI... ---")

    final_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages
    )

    print("\n--- 5. Final Answer from AI: ---")
    print(final_response.choices[0].message.content)

else:
    print("\n--- Final Answer from AI (no tool needed): ---")
    print(message.content)



# What's Happening? (The "Agent Loop")
# This is the most important concept, so let's break it down:

# User: "What is 45 + 13?"

# Code (You): Sends this message + the add function "menu" to the AI.

# AI (Thinks): "I see the user wants to add. I can't do math, but I see an add tool on the menu. I should use it. I will ask the programmer to call add(a=45, b=13)."

# Code (You): Receives the AI's request. It sees function_name is "add" and arguments are {"a": 45, "b": 13}. It runs your real Python add(45, 13) function, which returns the number 58.

# Code (You): Sends a new message back to the AI, saying: "Here is the result from tool_call_id xyz: 58."

# AI (Thinks): "Great, the tool result is 58. The user's original question was 'What is 45 + 13?'. I can now confidently answer."

# Final Answer (Printed): "45 + 13 is 58."

# You just built an agent! The AI provided the reasoning, and your Python code provided the tool.