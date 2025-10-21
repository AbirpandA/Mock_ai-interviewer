"use server";

import OpenAI from "openai";

import { db } from "@/firebase/admin";

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

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const prompt = `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `;

    const resp = await client.responses.create({
      model: "openai/gpt-oss-20b",
      input: prompt,
    });

    // Try to extract structured result from response. Fallback to parsing text.
    const r = resp as unknown as ResponseShape;
    let outText = "";
    if (typeof r.output_text === "string") {
      outText = r.output_text;
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
            outText = textItem.text;
          } else if (typeof content[0] === "string") {
            outText = content[0] as string;
          }
        }
      }
    }

    // Expect the model to return JSON matching feedbackSchema; attempt to parse.
    type FeedbackObject = {
      totalScore?: number;
      categoryScores?: Record<string, number>;
      strengths?: string;
      areasForImprovement?: string;
      finalAssessment?: string;
    };
    let object: FeedbackObject = {};
    try {
      object = JSON.parse(outText) as FeedbackObject;
    } catch {
      // If parsing fails, put the raw text into finalAssessment
      object = {
        totalScore: 0,
        categoryScores: {},
        strengths: "",
        areasForImprovement: "",
        finalAssessment: outText,
      };
    }

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}
