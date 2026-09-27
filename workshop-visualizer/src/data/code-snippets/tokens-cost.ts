// Lesson 12 – Tokens & Cost in Code. Count the tokens before sending (tiktoken),
// read the exact counts from response.usage, then turn tokens into money.
export const tokensCostCode = `# part1/tokens_cost.py
import tiktoken
from openai import OpenAI
client = OpenAI()

question = "Explain what a black hole is in 2 sentences."

# Count tokens BEFORE sending (an estimate: the API adds a few for formatting)
enc = tiktoken.get_encoding("o200k_base")
estimate = len(enc.encode(question))
print(f"Estimated input tokens: {estimate}")

# Send the question, just like in Basic API Call
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "user", "content": question}
    ],
)
print("Answer:", response.choices[0].message.content)

# The exact counts come back on the receipt: response.usage
usage = response.usage
print("Input tokens (prompt):", usage.prompt_tokens)
print("Output tokens (completion):", usage.completion_tokens)
print("Total tokens:", usage.total_tokens)

# Example prices (USD per 1M tokens) — check openai.com/api/pricing
INPUT_PRICE_PER_MILLION = 0.15   # gpt-4o-mini, tokens we send
OUTPUT_PRICE_PER_MILLION = 0.60  # gpt-4o-mini, tokens it writes

# Cost = tokens ÷ 1,000,000 × price per million
input_cost = usage.prompt_tokens / 1_000_000 * INPUT_PRICE_PER_MILLION
output_cost = usage.completion_tokens / 1_000_000 * OUTPUT_PRICE_PER_MILLION
cost = input_cost + output_cost
print(f"This call cost: \${cost:.6f}")
print(f"1,000 calls like this: \${cost * 1000:.2f}")`;
