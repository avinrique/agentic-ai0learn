# prompt_1c.py
from openai import OpenAI
client = OpenAI()

print("Asking the AI for structured JSON output...")

# We can also add a system prompt to help it
system_prompt = "You are a helpful assistant that only responds in valid JSON."

user_prompt = "Give me 3 Python interview questions in JSON format. Use the keys: 'question' and 'difficulty'."

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ],
    # This new line is the magic!
    response_format={ "type": "json_object" } 
)

print("\nAI's JSON Response:")
print(response.choices[0].message.content)


# 🧩 What's Happening?
# We added a new parameter: response_format={ "type": "json_object" }.

# This forces the model to output only valid JSON.

# This is much more reliable than just asking for JSON in the prompt (though we still do that to guide the content of the JSON).

# Now, you could use Python's json library to load this string directly into a Python dictionary.