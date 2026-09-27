// Lesson 23 – Code: RAG with Embeddings (course kit file part3/rag_code.py; keep identical)
export const ragCode = String.raw`# part3/rag_code.py
from openai import OpenAI
client = OpenAI()
documents = [  # facts from a made-up school handbook
    "The library is open from 8 am to 4 pm on weekdays.",
    "Students can borrow up to 3 books for 2 weeks.",
    "The science fair is on 14 March in the school gym.",
    "Lunch is from 12:00 to 12:45 in the cafeteria.",
    "Lost-and-found items are kept at the front office.",
]

def embed(texts):  # each text -> a long list of numbers
    result = client.embeddings.create(
        model="text-embedding-3-small", input=texts)
    return [item.embedding for item in result.data]

def similarity(a, b):  # 1 = same direction; lower = less alike
    dot = sum(x * y for x, y in zip(a, b))
    length_a = sum(x * x for x in a) ** 0.5
    length_b = sum(x * x for x in b) ** 0.5
    return dot / (length_a * length_b)

doc_vectors = embed(documents)  # embed the handbook once
question = "How many books can I borrow?"
question_vector = embed([question])[0]

# 1. Retrieve: score every document, keep the top 2
scores = [similarity(question_vector, v) for v in doc_vectors]
ranked = sorted(zip(scores, documents), reverse=True)
for score, doc in ranked:
    print(round(score, 2), doc)
top_docs = [doc for score, doc in ranked[:2]]

# 2. Augment: put the top 2 into the prompt
context = "\n".join(top_docs)
system_prompt = """Answer using ONLY the context.
If the answer isn't there, say you don't know."""
user_message = f"Context:\n{context}\n\nQuestion: {question}"

# 3. Generate: the model answers from the context
messages = [{"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}]
response = client.chat.completions.create(
    model="gpt-4o-mini", messages=messages)
print("Answer:", response.choices[0].message.content)`;
