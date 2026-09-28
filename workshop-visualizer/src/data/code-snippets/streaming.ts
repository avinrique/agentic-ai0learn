// Lesson 11 – Streaming: The Typing Effect. The same create() call as Basic API,
// plus stream=True and a for-loop that prints each small piece as it arrives.
// Comments sit on their own lines, the user message is split over two lines and the
// prompts are short, so every line fits the code panel at 1440 wide (narrower screens wrap).
export const streamingCode = `# part1/streaming.py
from openai import OpenAI
client = OpenAI()

print("Asking the AI to write (streaming)...")

# stream=True: get the answer piece by piece
stream = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user",
         "content": "Tell a 3-sentence robot story."}
    ],
    stream=True,
)

# Starts empty; every piece gets added to it
full_story = ""

# Each chunk carries a tiny new piece of the answer
for chunk in stream:
    piece = chunk.choices[0].delta.content
    # Skip chunks with no text ("" or None)
    if piece:
        # end="": same line. flush=True: show now
        print(piece, end="", flush=True)
        full_story += piece

print(f"\\n\\nDone! {len(full_story)} characters in total.")`;
