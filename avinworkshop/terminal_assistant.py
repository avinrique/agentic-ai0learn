import json
import subprocess
from openai import OpenAI

client = OpenAI()

# --- Colors (ANSI escape codes) ---
GREEN = "\033[32m"
BLUE = "\033[34m"
YELLOW = "\033[33m"
RED = "\033[31m"
BOLD = "\033[1m"
RESET = "\033[0m"

# --- Tool functions ---

def run_command(command):
    """Run a shell command and return the output."""
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=30)
        output = result.stdout
        if result.stderr:
            output += result.stderr
        if not output.strip():
            output = "(command ran successfully with no output)"
        return output
    except Exception as e:
        return f"Error running command: {e}"


def read_file(path):
    """Read a file and return its contents."""
    try:
        with open(path, "r") as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {e}"


def write_file(path, content):
    """Write content to a file (creates or overwrites)."""
    try:
        with open(path, "w") as f:
            f.write(content)
        return f"Successfully wrote to {path}"
    except Exception as e:
        return f"Error writing file: {e}"


# --- Tools list (the menu for the AI) ---

tools = [
    {
        "type": "function",
        "function": {
            "name": "run_command",
            "description": "Run a shell command in the terminal (e.g. ls, pwd, mkdir, cat, python, etc.) and return the output.",
            "parameters": {
                "type": "object",
                "properties": {
                    "command": {
                        "type": "string",
                        "description": "The shell command to run"
                    }
                },
                "required": ["command"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "read_file",
            "description": "Read the contents of a file at the given path.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "The path to the file to read"
                    }
                },
                "required": ["path"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "write_file",
            "description": "Write content to a file. Creates the file if it doesn't exist, or overwrites it if it does.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "The path to the file to write"
                    },
                    "content": {
                        "type": "string",
                        "description": "The content to write to the file"
                    }
                },
                "required": ["path", "content"]
            }
        }
    }
]

# --- Map function names to actual Python functions ---

available_functions = {
    "run_command": run_command,
    "read_file": read_file,
    "write_file": write_file,
}

# --- System prompt ---

system_prompt = """You are a friendly terminal assistant that helps users interact with their computer.
You can run shell commands, read files, and write files.

Guidelines:
- When the user asks you to do something on their computer, use the tools available to you.
- Explain what you're doing before and after running commands.
- If a command could be destructive (like rm, deleting files, overwriting important files), confirm with the user first before running it.
- Keep your responses concise and helpful.
- If you're unsure about something, ask the user for clarification."""

# --- Messages list (conversation memory) ---

messages = [
    {"role": "system", "content": system_prompt}
]

# --- Main chat loop ---

print(f"\n{BOLD}{GREEN}Terminal Assistant{RESET}")
print(f"{BLUE}I can run commands, read files, and write files on your computer.{RESET}")
print(f"{BLUE}Type 'exit' to quit.{RESET}\n")

while True:
    # Get user input
    user_input = input(f"{BOLD}You: {RESET}")

    if user_input.strip().lower() == "exit":
        print(f"\n{GREEN}Goodbye!{RESET}")
        break

    if not user_input.strip():
        continue

    # Add user message to conversation
    messages.append({"role": "user", "content": user_input})

    # Agent loop: keep going until the AI gives a final text response
    while True:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            tools=tools,
        )

        message = response.choices[0].message
        messages.append(message)

        # If no tool calls, we have the final answer
        if not message.tool_calls:
            print(f"\n{GREEN}Assistant:{RESET} {message.content}\n")
            break

        # Handle tool calls
        for tool_call in message.tool_calls:
            function_name = tool_call.function.name
            arguments = json.loads(tool_call.function.arguments)

            print(f"  {YELLOW}[Using tool: {function_name}]{RESET}")

            # Call the matching function
            function_to_call = available_functions[function_name]
            result = function_to_call(**arguments)

            # Add the tool result to messages
            messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": result,
            })
