// Lesson 11 – Streaming: The Typing Effect. The same create() call as Basic API,
// plus stream=True and a for-loop that prints each small piece as it arrives.
// Comments sit on their own lines (and the user message is split over two lines) so
// every line fits the code panel without scrolling sideways.
export const streamingCode = `# part1/streaming.py
from openai import OpenAI
client = OpenAI()

print("Asking the AI to write (streaming)...")

# stream=True: get the answer in pieces as it's written
stream = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user",
         "content": "Tell a 3-sentence story about a robot who learns to paint."}
    ],
    stream=True,
)

# Starts empty; every piece gets added to it
full_story = ""

# Each chunk carries a tiny new piece of the answer
for chunk in stream:
    piece = chunk.choices[0].delta.content
    # Some chunks have no text ("" or None): skip them
    if piece:
        # end="": same line. flush=True: show it now
        print(piece, end="", flush=True)
        full_story += piece

print(f"\\n\\nDone! {len(full_story)} characters in total.")`;
