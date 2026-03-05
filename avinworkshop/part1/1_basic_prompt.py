# prompt_1a.py
from openai import OpenAI
client = OpenAI()

print("Sending a basic prompt to the AI...")

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": "Write a funny 3-line poem about AI and pizza."}
    ]
)

print("\nAI's Response:")
print(response.choices[0].message.content)



# export OPENAI_API_KEY='your_key_here'                  # To set your OpenAI API key, use the following command in your terminal:
# export OPENAI_API_KEY='your_key_here'                  # To set your OpenAI API key, use the following command in your terminal: