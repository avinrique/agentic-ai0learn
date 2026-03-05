# prompt_1b.py
from openai import OpenAI
client = OpenAI()

print("Using a system prompt to set the AI's role...")

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are a friendly Python tutor."},
        {"role": "user", "content": "Explain what a list comprehension is with an example."}
    ]
)

print("\nPython Tutor's Response:")
print(response.choices[0].message.content)





# What's Happening?
# We've added a new message: {"role": "system", ...}.

# This system message gives the AI its instructions for the entire conversation.

# By telling it "You are a friendly Python tutor," its answer will be helpful and simple, not overly technical. It changes the style of the response.