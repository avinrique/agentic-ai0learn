// The helper files in the course code kit (see src/lib/courseKit.ts).
// Python is kept in String.raw so backslashes (Windows paths) stay as written.

export const requirementsTxt = `openai
python-dotenv
tiktoken
`;

export const envExample = `# Copy this file to a new file called .env, then paste your key after the = sign.
# Keep .env secret: never share it, screenshot it or upload it.
OPENAI_API_KEY=sk-your-key-here
`;

export const gitignore = `# Your secret key and your private Python box stay on your computer.
.env
.venv/
__pycache__/
`;

export const runPy = String.raw`# run.py - runs one course program with your API key loaded.
#
#     python run.py part1/basic_api.py
#
# It reads OPENAI_API_KEY from the .env file in this folder, then runs the program
# from inside its own folder, so the program can open files that sit next to it.
import os
import runpy
import sys

KIT_FOLDER = os.path.dirname(os.path.abspath(__file__))

# An emoji in an AI reply should never crash a program on an old terminal.
for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(errors="replace")


def list_programs():
    for part in sorted(os.listdir(KIT_FOLDER)):
        folder = os.path.join(KIT_FOLDER, part)
        if part.startswith("part") and os.path.isdir(folder):
            for name in sorted(os.listdir(folder)):
                if name.endswith(".py"):
                    print(f"    python run.py {part}/{name}")


def friendly_hint(error):
    """A plain-English explanation for the most common errors (or None)."""
    if isinstance(error, ModuleNotFoundError) and error.name in ("openai", "dotenv", "tiktoken"):
        return ("The course libraries aren't installed yet, or your .venv isn't turned on. "
                "Turn on the .venv (see README.md), then run: pip install -r requirements.txt")
    try:
        import openai
    except ImportError:
        return None
    if isinstance(error, openai.AuthenticationError):
        return "OpenAI didn't accept your API key. Check the key in .env, then run: python check_setup.py"
    if isinstance(error, openai.RateLimitError):
        if getattr(error, "code", None) == "insufficient_quota" or "insufficient_quota" in str(error):
            return ("Your OpenAI account has no credit left (insufficient_quota). "
                    "Add credit in the Billing page on platform.openai.com. Retrying won't help.")
        return "Too many requests in a short time. Wait a minute, then try again."
    if isinstance(error, openai.APIConnectionError):
        return "Couldn't reach OpenAI. Check your internet connection, then try again."
    return None


if len(sys.argv) < 2:
    print("Tell me which program to run, like this:")
    print("    python run.py part1/basic_api.py")
    print("\nThe programs you can run:")
    list_programs()
    sys.exit(1)

program = sys.argv[1]
if not os.path.isfile(program):
    # Also look inside the course folder, so this works from any folder.
    program = os.path.join(KIT_FOLDER, sys.argv[1])
if not os.path.isfile(program):
    print(f"I can't find a file called {sys.argv[1]}")
    print("Check the spelling (a / goes between the folder and the file name).")
    print("\nThe programs you can run:")
    list_programs()
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    print("The course libraries aren't installed yet, or your .venv isn't turned on.")
    print("Turn on the .venv (see README.md), then run:  pip install -r requirements.txt")
    sys.exit(1)

load_dotenv(os.path.join(KIT_FOLDER, ".env"))
if not os.environ.get("OPENAI_API_KEY", "").strip():
    print("No API key found.")
    print("Copy .env.example to a new file called .env and paste your key after OPENAI_API_KEY=")
    print("Then check it with:  python check_setup.py")
    sys.exit(1)

program = os.path.abspath(program)
os.chdir(os.path.dirname(program))
sys.path.insert(0, os.path.dirname(program))
sys.argv = [program] + sys.argv[2:]

try:
    runpy.run_path(program, run_name="__main__")
except (KeyboardInterrupt, EOFError):  # Ctrl+C, or Ctrl+D while it waits for you to type
    print("\nStopped.")
except Exception as error:
    hint = friendly_hint(error)
    if hint is None:
        raise
    print(f"\n{type(error).__name__}: {hint}")
    sys.exit(1)
`;

export const checkSetupPy = String.raw`# check_setup.py - checks that your computer is ready for the course.
#
#     python check_setup.py
#
# It checks Python, the libraries and your API key. Then it asks before making
# one tiny test call to OpenAI (that call costs a tiny fraction of a cent).
import os
import sys

KIT_FOLDER = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(KIT_FOLDER, ".env")
problems = 0

# The check marks should never crash an old terminal.
for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(errors="replace")


def ok(message):
    print(f"✓ {message}")


def problem(message, fix):
    global problems
    problems += 1
    print(f"✗ {message}")
    print(f"  Fix: {fix}")


print("Checking your setup...")

# 1. Python 3.10 or newer
v = sys.version_info
if v >= (3, 10):
    ok(f"Python {v.major}.{v.minor}.{v.micro}")
else:
    problem(f"Python {v.major}.{v.minor} is too old (you need 3.10 or newer)",
            "install a newer Python from https://www.python.org/downloads/")

# 2. The three libraries
missing = False
for module, package in [("openai", "openai"), ("dotenv", "python-dotenv"), ("tiktoken", "tiktoken")]:
    try:
        __import__(module)
        ok(f"{package} is installed")
    except ImportError:
        missing = True
        problem(f"{package} is not installed", "pip install -r requirements.txt")
if missing and sys.prefix == sys.base_prefix:
    print("  Tip: your .venv isn't turned on. Mac/Linux: source .venv/bin/activate")
    print(r"       Windows: .venv\Scripts\activate")

# 3. The API key, from the .env file. (Check it BEFORE making a client:
#    with no key at all, OpenAI() stops with an error straight away.)
try:
    from dotenv import load_dotenv
    load_dotenv(ENV_FILE)
except ImportError:
    pass
key = os.environ.get("OPENAI_API_KEY", "").strip()
if not key:
    if os.path.exists(ENV_FILE):
        problem("Your .env file has no key in it", "open .env and paste your key after OPENAI_API_KEY=")
    else:
        problem("No .env file with your API key", "copy .env.example to a new file called .env, then paste your key into it")
elif key == "sk-your-key-here":
    problem("The key in .env is still the example one", "replace sk-your-key-here with your real key")
elif not key.startswith("sk-"):
    problem("Your key doesn't start with sk-", "copy the whole key again from https://platform.openai.com/api-keys")
elif os.path.exists(ENV_FILE):
    ok("Found OPENAI_API_KEY in .env")
else:
    ok("Found OPENAI_API_KEY (from your computer's settings, not .env)")

if problems:
    print("\nFix the lines marked ✗, then run this check again.")
    sys.exit(1)

# 4. One tiny test call, only if you say yes
try:
    answer = input("Make one tiny test call to OpenAI? (costs a tiny fraction of a cent) [y/N] ")
except EOFError:
    answer = ""
if answer.strip().lower() not in ("y", "yes"):
    print("Skipped the test call.")
    print("All set! Next: python run.py part1/basic_api.py")
    sys.exit(0)

from openai import OpenAI, APIConnectionError, APIStatusError, AuthenticationError, RateLimitError

client = OpenAI(api_key=key)
try:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "Say hello to a new AI student in 5 words or fewer."}],
    )
except AuthenticationError:
    problem("OpenAI didn't accept your key (401: it's wrong, or it was deleted)",
            "make a new key at https://platform.openai.com/api-keys and paste it into .env")
    sys.exit(1)
except RateLimitError as error:
    if getattr(error, "code", None) == "insufficient_quota" or "insufficient_quota" in str(error):
        problem("Your key works, but the account has no credit (insufficient_quota)",
                "add credit in the Billing page on platform.openai.com. Retrying won't help.")
    else:
        problem("Too many requests right now (RateLimitError)", "wait a minute, then run this check again")
    sys.exit(1)
except APIConnectionError:
    problem("Couldn't reach OpenAI (APIConnectionError)", "check your internet connection, then try again")
    sys.exit(1)
except APIStatusError as error:
    problem(f"OpenAI sent back an error ({error.status_code}): {error.message}", "try again in a minute")
    sys.exit(1)

usage = response.usage
ok(f"OpenAI answered: {response.choices[0].message.content}")
print(f"  Tokens used: {usage.prompt_tokens} in + {usage.completion_tokens} out = {usage.total_tokens}")
print("All set! Next: python run.py part1/basic_api.py")
`;
