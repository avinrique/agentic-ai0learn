# Beginner Test Plan

Goal: watch 2–3 real beginners (ideally one ~12-year-old) use the course, and find where they get stuck.
You learn more from 30 minutes of watching than from any amount of polishing.

## Who
- 1 kid (10–14), 1 adult who has never coded, 1 person who codes but has never used an AI API.
- One person at a time. Their own laptop if possible (tests the setup lesson for real).

## Before the session (5 min)
- Open https://workshop-visualizer-mu.vercel.app in a fresh browser window (private window = no saved progress).
- Have paper for notes, or a phone timer.
- For the setup lesson: have an API key ready that YOU control, with a small budget limit (e.g. $2). For a kid, you type the key.

## What to say
"This is a course about how AI works. Please think out loud: say what you're looking at, what you expect, and anything
confusing. You can't do anything wrong. If you get stuck, that's the course's fault, not yours. I won't help unless you're
stuck for over a minute."

## What to have them do (≈45 min)
1. Lesson 1 "What is an LLM?", whole lesson, then its Quick check. (10 min)
2. Lesson 3 "Context & Memory": the playground at the end. (5 min)
3. Lesson 9 "Get Set Up": actually set up and run `python check_setup.py`. (15 min, the hardest part)
4. Lesson 10 "Basic API Call": step through it, then press "💻 Run it yourself" and run the program. (10 min)
5. One agent lesson (19 "Simple Agent") and one team lesson (29 "Writer & Critic"): step through and take the Quick check. (10 min)

## What to watch for (tick when you see it)
| Signal | Where | Note |
|---|---|---|
| Reads the explanation, then looks at the animation? (or only one of them) | | |
| Pauses > 10 s on a step / re-reads it | | |
| Clicks Prev to go back | | |
| Says "what is ___?" (a word we didn't explain) | | |
| Uses Play, or only Next? Too fast / too slow? | | |
| Gets a quiz question wrong: which one, and why? | | |
| Setup: where exactly did they get stuck? | | |
| Looks bored / starts skimming (which lesson, which step)? | | |
| Smiles, says "oh!", an aha moment (keep these!) | | |

## After (5 min): ask
1. In your own words, what does an AI agent do?
2. Which part was the most confusing?
3. Which part was the most fun?
4. Was anything too slow or too fast?
5. Would you run the code yourself at home?

## Afterwards
Write down each problem as: lesson + step number + what happened + a quote. Paste the list to Claude and ask it to fix them.
