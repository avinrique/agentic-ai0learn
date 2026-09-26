// Lesson 11 – Streaming: The Typing Effect. The same create() call as Basic API,
// plus stream=True and a for-loop that prints each small piece as it arrives.
export const streamingCode = `# part1/streaming.py
from openai import OpenAI
client = OpenAI()

print("Asking the AI to write (streaming)...")

# stream=True: send the answer in small pieces while the AI writes it
stream = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "Tell a 3-sentence story about a robot who learns to paint."}
    ],
    stream=True,
)

full_story = ""  # starts empty; every piece gets added to it

# Each chunk carries a tiny new piece of the answer
for chunk in stream:
    piece = chunk.choices[0].delta.content
    if piece:  # some chunks have no text (None), so we check
        print(piece, end="", flush=True)  # same line, show it right away
        full_story += piece

print(f"\\n\\nDone! The answer has {len(full_story)} characters.")`;
