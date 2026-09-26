# 2_writer_critic.py
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

print("\nFinal slogan:\n" + draft)
