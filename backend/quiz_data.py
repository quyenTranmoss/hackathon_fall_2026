"""16 Personalities style MBTI quiz data."""

# Each question maps to one of 4 dichotomies: EI, SN, TF, JP
# "A" answers push toward first letter (E, S, T, J), "B" toward second (I, N, F, P)
QUIZ_QUESTIONS = [
    # E vs I
    {"id": 1, "dim": "EI", "question": "At a social gathering, you feel most energized when...",
     "a": "Meeting many new people and joining lively conversations",
     "b": "Having deep one-on-one talks with a few close friends"},
    {"id": 2, "dim": "EI", "question": "After a long, demanding day you recharge best by...",
     "a": "Heading out with friends or being around others",
     "b": "Spending quiet time alone with a book, hobby, or thoughts"},
    {"id": 3, "dim": "EI", "question": "In a group project, you naturally tend to...",
     "a": "Think out loud and shape ideas by discussing them",
     "b": "Reflect internally first, then share a polished perspective"},

    # S vs N
    {"id": 4, "dim": "SN", "question": "When learning something new, you prefer...",
     "a": "Concrete examples, step-by-step instructions, and facts",
     "b": "Big-picture theories, patterns, and future possibilities"},
    {"id": 5, "dim": "SN", "question": "You are more drawn to conversations about...",
     "a": "Practical, real-world topics happening right now",
     "b": "Abstract ideas, metaphors, and what could be"},
    {"id": 6, "dim": "SN", "question": "When describing something to others, you rely more on...",
     "a": "Specific details and precise observations",
     "b": "Analogies, imagery, and connections between concepts"},

    # T vs F
    {"id": 7, "dim": "TF", "question": "When making an important decision, you first consider...",
     "a": "Logic, objective analysis, and consistent principles",
     "b": "Impact on people, values, and how everyone will feel"},
    {"id": 8, "dim": "TF", "question": "When a friend is upset, your instinct is to...",
     "a": "Help them troubleshoot the situation and find a solution",
     "b": "Sit with them emotionally and validate what they feel"},
    {"id": 9, "dim": "TF", "question": "You are more bothered by...",
     "a": "Illogical reasoning or inconsistent thinking",
     "b": "People being hurt, ignored, or treated unfairly"},

    # J vs P
    {"id": 10, "dim": "JP", "question": "Your ideal weekend looks like...",
     "a": "A planned schedule with clear activities and times",
     "b": "A wide-open day that unfolds spontaneously"},
    {"id": 11, "dim": "JP", "question": "When working on a project, you prefer to...",
     "a": "Finish tasks well before the deadline, methodically",
     "b": "Explore options and let things come together closer to the end"},
    {"id": 12, "dim": "JP", "question": "Your workspace tends to be...",
     "a": "Organized, tidy, with everything in its place",
     "b": "Creative and flexible, sometimes a productive mess"},
]


PERSONALITY_TYPES = {
    "INTJ": {"name": "Architect", "communication": "Direct, strategic, and future-focused. Prefers concise, logic-driven exchanges. Reach them with well-structured written messages and clear objectives."},
    "INTP": {"name": "Logician", "communication": "Analytical, curious, and precise. Values intellectual depth and questions assumptions. Message with clarity and let them think before replying."},
    "ENTJ": {"name": "Commander", "communication": "Confident, decisive, and results-oriented. Prefers directness and efficiency. Get to the point fast and be prepared to defend your reasoning."},
    "ENTP": {"name": "Debater", "communication": "Playful, inventive, and idea-hungry. Loves brainstorming and challenging perspectives. Engage them with open questions and possibilities."},
    "INFJ": {"name": "Advocate", "communication": "Warm but reserved, deeply thoughtful and values-driven. Prefers meaningful 1:1 chats over group noise. Show sincerity and give space to reflect."},
    "INFP": {"name": "Mediator", "communication": "Empathetic, imaginative, and sensitive to tone. Craves authenticity. Reach them gently and lead with genuine feelings, not pressure."},
    "ENFJ": {"name": "Protagonist", "communication": "Charismatic, encouraging, and people-focused. Great at group energy. Approach with warmth and share how a topic affects the team."},
    "ENFP": {"name": "Campaigner", "communication": "Enthusiastic, expressive, and idea-fueled. Loves creative sparks and connection. Message them with excitement and space for tangents."},
    "ISTJ": {"name": "Logistician", "communication": "Reliable, precise, and process-oriented. Prefers facts, dates, and clear expectations. Send structured, complete messages."},
    "ISFJ": {"name": "Defender", "communication": "Kind, attentive, and supportive. Values harmony and remembering details. Approach warmly and acknowledge their care."},
    "ESTJ": {"name": "Executive", "communication": "Organized, straightforward, and action-oriented. Respects clarity and hierarchy. Bring an agenda and specific asks."},
    "ESFJ": {"name": "Consul", "communication": "Warm, social, and community-minded. Values relationships and consideration. Start with a friendly note before diving in."},
    "ISTP": {"name": "Virtuoso", "communication": "Cool-headed, practical, and hands-on. Prefers short, specific messages. Skip small talk and share the actual problem."},
    "ISFP": {"name": "Adventurer", "communication": "Gentle, artistic, and present-focused. Values authenticity and freedom. Speak softly and avoid pressure or ultimatums."},
    "ESTP": {"name": "Entrepreneur", "communication": "Energetic, bold, and action-driven. Loves fast, punchy exchanges. Keep it concrete, exciting, and skip the fluff."},
    "ESFP": {"name": "Entertainer", "communication": "Fun, spontaneous, and expressive. Thrives on real-time energy. A quick call or lively message works better than a long email."},
}


def compute_type(answers: dict) -> str:
    """answers is dict mapping question id (int) -> 'A' or 'B'."""
    dims = {"EI": 0, "SN": 0, "TF": 0, "JP": 0}
    for q in QUIZ_QUESTIONS:
        ans = answers.get(q["id"]) or answers.get(str(q["id"]))
        if ans is None:
            continue
        if ans.upper() == "A":
            dims[q["dim"]] += 1
        else:
            dims[q["dim"]] -= 1
    result = ""
    result += "E" if dims["EI"] >= 0 else "I"
    result += "S" if dims["SN"] >= 0 else "N"
    result += "T" if dims["TF"] >= 0 else "F"
    result += "J" if dims["JP"] >= 0 else "P"
    return result
