# 3_boss_agent.py - The Boss Agent (its tools are other agents!)
import json
from openai import OpenAI
client = OpenAI()

# Every agent is the same helper: one LLM call with its own job.
def run_agent(system_prompt, task):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": task},
        ],
    )
    return response.choices[0].message.content

# --- The helpers: each one is a whole agent ---
def ask_researcher(question):
    return run_agent("You are Rita, a researcher. Answer with short, true facts.", question)

def ask_math_whiz(problem):
    return run_agent("You are Milo, a math whiz. Solve it step by step.", problem)

# --- The menu Max sees (same format as Part 2) ---
tools = [
    {"type": "function", "function": {
        "name": "ask_researcher",
        "description": "Ask Rita the researcher to find facts.",
        "parameters": {"type": "object", "properties": {
            "question": {"type": "string"}
        }, "required": ["question"]}
    }},
    {"type": "function", "function": {
        "name": "ask_math_whiz",
        "description": "Ask Milo the math whiz to do a calculation.",
        "parameters": {"type": "object", "properties": {
            "problem": {"type": "string"}
        }, "required": ["problem"]}
    }},
]
helpers = {"ask_researcher": ask_researcher, "ask_math_whiz": ask_math_whiz}

# --- Max the boss gets the request ---
boss_prompt = ("You are Max, the boss. Break the request into parts, ask your helpers "
               "using the tools, then write the final answer. Don't do the work yourself.")
request = "How tall is Mount Everest, and how many 30-story buildings (3 m per floor) stacked would reach it?"
print("You:", request)
messages = [
    {"role": "system", "content": boss_prompt},
    {"role": "user", "content": request},
]

# --- The boss loop: Max decides, helpers work, repeat ---
while True:
    response = client.chat.completions.create(
        model="gpt-4o-mini", messages=messages, tools=tools
    )
    message = response.choices[0].message
    messages.append(message)  # Max's reply goes on his notepad

    if not message.tool_calls:  # no order slips = Max is done
        print("Max:", message.content)
        break

    for tool_call in message.tool_calls:  # one order slip at a time
        name = tool_call.function.name
        args = json.loads(tool_call.function.arguments)
        print(f"Max asks {name}: {args}")
        result = helpers[name](**args)  # the helper agent does the job
        messages.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "content": result,
        })
