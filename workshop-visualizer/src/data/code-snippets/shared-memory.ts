// Lesson 32 – Code: A Shared Whiteboard (course kit file part4/shared_memory.py; keep identical)
export const sharedMemoryCode = String.raw`# part4/shared_memory.py
# A shared whiteboard: every agent reads ALL the notes, then adds one.
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

# The shared whiteboard: every agent can read and write here
whiteboard = []

def add_note(author, note):
    whiteboard.append(f"{author}: {note}")  # label who wrote it

def read_board():
    return "\n".join(whiteboard)  # all the notes, each on a new line

# The teacher writes the event on the board first
event = "End-of-year class party for 24 students, budget $60"
add_note("Teacher", event)

# Rita reads the board, then adds her ideas
rita_prompt = ("You are Rita, a researcher. Suggest 3 fun activities "
               "that suit the group. Keep it short.")
ideas = run_agent(rita_prompt, "Whiteboard:\n" + read_board())
add_note("Rita", ideas)

# Milo reads the board (the group size and budget are on it!)
milo_prompt = ("You are Milo, a math whiz. Make a shopping plan that fits "
               "the budget. Show the cost per person. Keep it short.")
shopping = run_agent(milo_prompt, "Whiteboard:\n" + read_board())
add_note("Milo", shopping)

# Wally reads the WHOLE board and writes the invitation
wally_prompt = ("You are Wally, a writer. Write a short, fun invitation "
                "(2-3 sentences) using everything on the board.")
invite = run_agent(wally_prompt, "Whiteboard:\n" + read_board())
add_note("Wally", invite)

# Everyone's work, in one place
print(read_board())`;
