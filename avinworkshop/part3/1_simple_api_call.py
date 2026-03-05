from openai import OpenAI

# Initialize the client
client = OpenAI()

# Send a test prompt
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Write a short poem about the sunrise."}
    ]
)

# Print the modelâ€™s response
print(response.choices[0].message.content)