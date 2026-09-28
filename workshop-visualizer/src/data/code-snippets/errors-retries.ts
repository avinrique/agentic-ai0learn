// Lesson 17: When Things Go Wrong: Errors & Retries (course kit: part1/errors_retries.py)
// Keep this in sync with the kit file: the download is built from src/data/run/errors-retries.ts.
export const errorsRetriesCode = `# part1/errors_retries.py
import time
from openai import OpenAI, RateLimitError, APIConnectionError, AuthenticationError

client = OpenAI(max_retries=0)  # we handle retries ourselves in this lesson

def ask(question, tries=3):
    for attempt in range(1, tries + 1):
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": question}],
            )
            return response.choices[0].message.content

        # A wrong key stays wrong, so trying again won't help.
        except AuthenticationError:
            return "Oops! The API key was not accepted. Check OPENAI_API_KEY in your .env file."

        # 429 = "too many requests right now"... or "no credit left".
        except RateLimitError as error:
            if error.code == "insufficient_quota":
                return "Your account is out of credit. Add some on the billing page."
            print("The server is busy (too many requests).")

        # No internet, or the server can't be reached.
        except APIConnectionError:
            print("Can't reach the server. Is the internet on?")

        # Still here? It may fix itself: wait, then retry.
        if attempt < tries:
            wait = 2 ** (attempt - 1)  # 1s, 2s, 4s... doubles every time
            print(f"Waiting {wait}s before try {attempt + 1}...")
            time.sleep(wait)

    return "Sorry, the AI is not answering right now. Please try again later."

print(ask("Give me a fun fact about penguins."))`;
