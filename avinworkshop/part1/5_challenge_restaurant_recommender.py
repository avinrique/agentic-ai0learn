# challenge_1_bangalore.py
from openai import OpenAI
import json # We import json to 'pretty-print' the output

client = OpenAI()

print("Calling the Restaurant Recommender Bot (Bangalore)...")

# 1. The System Prompt: Sets the AI's role and output format.
system_prompt = "You are a helpful restaurant recommender. You will be given a cuisine and location, and must reply in valid JSON format."

# 2. The User Prompt: Updated for Bangalore, India
user_prompt = """
Find 3 great South Indian restaurants in Bangalore, India.
The JSON output should be a list called "recommendations".
Each item in the list should be an object with two keys: "name" and "reason".
"""

response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt}
    ],
    # 3. Force JSON output
    response_format={ "type": "json_object" } 
)

print("\n--- AI's Raw JSON Response ---")
raw_json = response.choices[0].message.content
print(raw_json)

# --- Bonus: Pretty-Printing ---
print("\n--- AI's 'Pretty' JSON Response ---")
try:
    # Parse the JSON string into a Python object
    parsed_json = json.loads(raw_json)
    # Dump it back out as a string, but with nice formatting
    pretty_json = json.dumps(parsed_json, indent=2)
    print(pretty_json)
except json.JSONDecodeError:
    print("AI did not return valid JSON.")




# What's Happening Here?
# We combined all the skills from Part 1.

# "role": "system": We gave the AI its personality and rules.

# "role": "user": We gave it a clear, specific task.

# response_format: We forced the output to be JSON, making it reliable.

# Bonus: The json.dumps(..., indent=2) part at the end is a standard Python way to make ugly, single-line JSON text look clean and indented, which is much easier for humans to read.