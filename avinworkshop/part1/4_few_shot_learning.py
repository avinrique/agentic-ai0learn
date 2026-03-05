# prompt_1d.py
from openai import OpenAI
client = OpenAI()

print("Teaching the AI a new task (sentiment analysis) with examples...")

# Here is our "training data"
# We create a conversation history showing a pattern.
messages = [
    {"role": "system", "content": "You are a sentiment classifier. Respond with only 'Positive', 'Negative', or 'Neutral'."},

    # Example 1
    {"role": "user", "content": "I love this product!"}, 
    {"role": "assistant", "content": "Positive"},

    # Example 2
    {"role": "user", "content": "This is terrible."},
    {"role": "assistant", "content": "Negative"},

    # Now, the real question
    {"role": "user", "content": "It's okay, not great."}
]

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=messages
)

print(f"\nAI's classification for 'It's okay, not great.':")
print(response.choices[0].message.content)





# What's Happening?
# Look at the messages list. We've built a fake conversation.

# We provide user / assistant pairs. This shows the AI the exact pattern we want it to follow.

# When the AI sees our final user message ("It's okay, not great."), it follows the pattern it just learned from the examples and provides the classification.

# This is a powerful way to get reliable, specific behavior without complex instructions.