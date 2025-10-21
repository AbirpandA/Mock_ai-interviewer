import OpenAI from "openai";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});
type ResponseShape = {
  output_text?: string;
  output?: Array<{
    content?: Array<{ text?: string } | string>;
  }>;
};
type ContentItem = { text?: string } | string;

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  try {
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

    const resp = await client.responses.create({
      model: "openai/gpt-oss-20b",
      input: prompt,
    });

    const r = resp as unknown as ResponseShape;
    let questionsText = "";
    if (typeof r.output_text === "string") {
      questionsText = r.output_text;
    } else if (Array.isArray(r.output) && r.output.length) {
      const first = r.output[0];
      if (first && typeof first === "object") {
        const content = first.content;
        if (Array.isArray(content) && content.length) {
          const textItem = content.find(
            (c: ContentItem) =>
              typeof c !== "string" && typeof c.text === "string"
          ) as { text: string } | undefined;
          if (textItem && typeof textItem.text === "string") {
            questionsText = textItem.text;
          } else if (typeof content[0] === "string") {
            questionsText = content[0] as string;
          }
        }
      }
    }

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
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
