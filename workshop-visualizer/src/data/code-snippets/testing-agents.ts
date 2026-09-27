// Lesson 25 – Testing Your Agent (code). Course kit file: part3/testing_agents.py
export const testingAgentsCode = `# part3/testing_agents.py
import json
from openai import OpenAI
client = OpenAI()

# --- The agent under test: a calculator with one tool ---
def add(a, b):
    return a + b

tools = [{"type": "function", "function": {
    "name": "add",
    "description": "Add two numbers together",
    "parameters": {"type": "object", "required": ["a", "b"],
                   "properties": {"a": {"type": "number"}, "b": {"type": "number"}}},
}}]

def ask_agent(question):  # returns (tool_used, answer)
    messages = [{"role": "user", "content": question}]
    response = client.chat.completions.create(
        model="gpt-4o-mini", messages=messages,
        tools=tools, temperature=0)
    message = response.choices[0].message
    if not message.tool_calls:
        return None, message.content  # no tool used
    tool_call = message.tool_calls[0]  # the AI asked for add
    arguments = json.loads(tool_call.function.arguments)
    result = add(arguments["a"], arguments["b"])
    messages.append(message)
    messages.append({"role": "tool", "tool_call_id": tool_call.id, "content": str(result)})
    final = client.chat.completions.create(
        model="gpt-4o-mini", messages=messages, temperature=0)
    answer = final.choices[0].message.content
    return tool_call.function.name, answer

# --- Tests: a question + what a good answer must have ---
tests = [
    {"question": "What is 45 + 13?",
     "expect_tool": "add", "must_contain": "58"},
    {"question": "What is 250 + 175?",
     "expect_tool": "add", "must_contain": "425"},
    {"question": "What is the capital of France?",
     "expect_tool": None, "must_contain": "Paris"},
]

# --- Run every test, check it, and keep score ---
passed = 0
for test in tests:
    tool_used, answer = ask_agent(test["question"])
    print(f"\\nQ: {test['question']}\\nA: {answer}")
    tool_ok = tool_used == test["expect_tool"]  # behaviour
    answer_ok = test["must_contain"] in answer  # output
    if tool_ok and answer_ok:
        print("✅ PASS")
        passed += 1
    if not tool_ok:
        print(f"❌ FAIL: expected tool {test['expect_tool']}, but it used {tool_used}")
    if not answer_ok:
        print(f"❌ FAIL: the answer should contain '{test['must_contain']}'")

print(f"\\nScore: {passed}/{len(tests)} passed")`;
