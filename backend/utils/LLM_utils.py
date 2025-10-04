from config.config import groq_client, tooltips

def generate_mission_summary(mission_data):
    """
    Use Groq to create a concise, semantically rich summary of a mission.
    """
    prompt = f"""
    Summarize the following mission details into a concise paragraph suitable for vector similarity search.
    Include type, phase, objective, context, and additionalContext if available:

    {mission_data}

    These are the field descriptions to help you understand the context:
    {tooltips}

    Don't add any disclaimers or commentary. Return only the summary text.
    """

    response_summary = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
    content = response_summary.choices[0].message.content.strip()
    return content
