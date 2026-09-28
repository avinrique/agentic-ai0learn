// Lesson 12 – Tokens & Cost in Code. Count the tokens before sending (tiktoken),
// read the exact counts from response.usage, then turn tokens into money.
export const tokensCostCode = `# part1/tokens_cost.py
import tiktoken
from openai import OpenAI
client = OpenAI()

question = "Explain what a black hole is in 2 sentences."

# Count tokens BEFORE sending. It's only an estimate:
# the API adds a few tokens for formatting.
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

# The exact counts come back on the receipt
usage = response.usage
print("Input tokens:", usage.prompt_tokens)
print("Output tokens:", usage.completion_tokens)
print("Total tokens:", usage.total_tokens)

# Example gpt-4o-mini prices, in $ per 1M tokens
# (prices change: check openai.com/api/pricing)
IN_PRICE = 0.15    # tokens we send
OUT_PRICE = 0.60   # tokens it writes

# Cost = tokens ÷ 1,000,000 × price
in_cost = usage.prompt_tokens / 1_000_000 * IN_PRICE
out_cost = usage.completion_tokens / 1_000_000 * OUT_PRICE
cost = in_cost + out_cost
print(f"This call cost: \${cost:.6f}")
print(f"1,000 calls like this: \${cost * 1000:.2f}")`;
