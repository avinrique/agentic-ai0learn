# 1_assembly_line.py
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
print(article)
