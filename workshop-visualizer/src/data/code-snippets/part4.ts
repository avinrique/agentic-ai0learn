// Part 4 code snippets. Each must match its avinworkshop/part4 Python file exactly.

// Lesson 23: Code: The Boss Agent (avinworkshop/part4/3_boss_agent.py)
export const bossAgentCode = `# 3_boss_agent.py - The Boss Agent (its tools are other agents!)
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
        })`;

// Lesson 21 – avinworkshop/part4/1_assembly_line.py (keep identical to the .py file)
export const assemblyLineCode = String.raw`# 1_assembly_line.py
# Two agents in a row: Rita finds the facts, then Wally writes them up.
from openai import OpenAI
client = OpenAI()

# Every agent is the SAME helper: one API call with its own system prompt.
def run_agent(system_prompt, task):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": task},
        ],
    )
    return response.choices[0].message.content

# Agent 1: Rita the researcher
researcher_prompt = "You are Rita, a researcher. List 3 short, true facts about the topic. Facts only."

# Agent 2: Wally the writer
writer_prompt = "You are Wally, a writer for kids. Turn these facts into a fun 4-sentence paragraph."

topic = "volcanoes"

# Station 1: Rita finds the facts
print(f"Rita is researching {topic}...")
facts = run_agent(researcher_prompt, f"Topic: {topic}")
print("\nRita's facts:")
print(facts)

# Station 2: our code hands Rita's facts to Wally
print("\nWally is writing...")
article = run_agent(writer_prompt, f"Facts:\n{facts}")
print("\nWally's paragraph:")
print(article)`;

// Lesson 22 – avinworkshop/part4/2_writer_critic.py (keep identical to the .py file)
export const writerCriticCode = String.raw`# 2_writer_critic.py
# Wally writes, Cora reviews. They loop until Cora says APPROVED.
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

# Agent 1: Wally the writer
writer_prompt = "You are Wally, a writer. Write short, catchy poems and slogans."

# Agent 2: Cora the critic
critic_prompt = "You are Cora, a critic. Review the draft. If it is great, reply exactly APPROVED. Otherwise give ONE short tip to improve it."

task = "Write a 2-line slogan for a school recycling club"

# Wally writes a first draft
draft = run_agent(writer_prompt, task)
print("First draft:\n" + draft)

# At most 3 rounds: a safety fuse, so they can't argue forever
for round_number in range(1, 4):
    feedback = run_agent(critic_prompt, draft)
    print(f"\nRound {round_number} - Cora says: {feedback}")

    if feedback.strip() == "APPROVED":
        print("Cora approved it!")
        break

    # Not approved yet: Wally rewrites, using Cora's tip
    rewrite_task = f"Task: {task}\nYour draft: {draft}\nFeedback: {feedback}\nWrite a better version."
    draft = run_agent(writer_prompt, rewrite_task)
    print("Wally's new draft:\n" + draft)

print("\nFinal slogan:\n" + draft)`;
