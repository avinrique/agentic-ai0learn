// Lesson 33 – Code: Guardrails & Human Approval (course kit file part4/guardrails.py; keep identical)
export const guardrailsCode = `# part4/guardrails.py - check what goes in, ask a human first, check what comes out
import json
from openai import OpenAI
client = OpenAI()

# Same helper as before: one agent = one API call with its own system prompt.
def run_agent(system_prompt, task):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": task},
        ],
    )
    return response.choices[0].message.content

# A guardrail can be a small agent: Cora answers with one word our code can read.
checker_prompt = "You are Cora. You check messages for a school helper app. Reply SAFE or UNSAFE only."
def is_safe(text):
    verdict = run_agent(checker_prompt, text)
    return verdict.strip().startswith("SAFE")

# A pretend tool: it only prints. It never really sends anything.
def send_email(to, body):
    print(f"📧 (pretend) Email to {to}: {body}")
    return "Email sent."

tools = [{"type": "function", "function": {
    "name": "send_email", "description": "Send an email to someone.",
    "parameters": {"type": "object", "properties": {
        "to": {"type": "string", "description": "a name, e.g. Ms. Lee"},
        "body": {"type": "string"}
    }, "required": ["to", "body"]}
}}]
RISKY_TOOLS = {"send_email"}  # actions a human must say yes to first

max_prompt = "You are Max, a school helper. The student's teacher is Ms. Lee."
request = "Email my teacher that I finished my science project."
print("You:", request)

# Gate 1 - input guardrail: Cora checks the request before Max sees it
if not is_safe(request):
    print("Sorry, I can't help with that. Let's keep things kind and safe.")
    raise SystemExit  # stop the program right here

# Max gets the request and his tool menu (one round, like the Part 2 agent)
messages = [{"role": "system", "content": max_prompt},
            {"role": "user", "content": request}]
response = client.chat.completions.create(model="gpt-4o-mini", messages=messages, tools=tools)
message = response.choices[0].message
messages.append(message)
reply = message.content  # his text answer (None if he asks for a tool)

if message.tool_calls:  # Max can only ASK for a tool; our code decides
    tool_call = message.tool_calls[0]
    name = tool_call.function.name
    args = json.loads(tool_call.function.arguments)

    # Gate 2 - human approval: a risky tool waits for a person's yes
    allowed = True
    if name in RISKY_TOOLS:
        answer = input(f"Allow {name} with {args}? (y/n) ")
        allowed = answer.strip().lower() == "y"
    if allowed:
        result = send_email(**args)
    else:
        result = "The human said no."

    messages.append({"role": "tool", "tool_call_id": tool_call.id, "content": result})
    final = client.chat.completions.create(model="gpt-4o-mini", messages=messages)
    reply = final.choices[0].message.content

# Gate 3 - output guardrail: Cora checks Max's answer before we show it
if not is_safe(reply):
    reply = "Sorry, I can't share that answer."
print("Max:", reply)`;
