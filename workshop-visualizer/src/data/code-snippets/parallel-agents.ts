// Lesson 31 – Code: Agents in Parallel (course kit file part4/parallel_agents.py; keep identical)
export const parallelAgentsCode = String.raw`# part4/parallel_agents.py
# Rita researches some topics: first one at a time, then all at once. Which is faster?
import time
from concurrent.futures import ThreadPoolExecutor
from openai import OpenAI
client = OpenAI()

# Same helper as before: one agent = one API call with its own job card.
def run_agent(system_prompt, task):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": task},
        ],
    )
    return response.choices[0].message.content

researcher_prompt = "You are Rita, a researcher. Give ONE amazing, true fact about the topic, in one sentence."
writer_prompt = "You are Wally, a writer for kids. Turn these facts into a fun 4-sentence poster."

topics = ["Mars", "Jupiter", "Saturn"]

# One job for Rita: ONE topic in, ONE fact out
def research(topic):
    return run_agent(researcher_prompt, f"Topic: {topic}")

# Race 1: one at a time. Each job waits for the one before it.
start = time.time()  # press the stopwatch
facts = [research(topic) for topic in topics]
print(f"One at a time: {time.time() - start:.1f} seconds")

# Race 2: all at once. A team of helpers, one job each.
# (We research twice on purpose, to compare. That doubles the cost of this part.)
start = time.time()  # reset the stopwatch
with ThreadPoolExecutor() as pool:
    facts = list(pool.map(research, topics))
print(f"All at once: {time.time() - start:.1f} seconds")

# Wally needs ALL the facts, so he waits until the whole team is done
fact_list = "
".join(facts)
poster = run_agent(writer_prompt, f"Facts:
{fact_list}")
print("
Wally's poster:
" + poster)`;
