
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

async function callGroqChat(prompt: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not set in environment");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("Groq API error response:", errorBody);
    throw new Error(
      `Groq API error: ${res.status} ${res.statusText} - ${errorBody}`
    );
  }

  const completion = await res.json();
  const content = completion.choices?.[0]?.message?.content;
  if (!content) return null;
  return content;
}

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  const prompt = `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `;

  try {
    const questionsText = await callGroqChat(prompt);
    if (!questionsText) throw new Error("No content returned from Groq");

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions: JSON.parse(questionsText),
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
