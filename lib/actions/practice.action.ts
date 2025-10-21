"use server";

import { db } from "@/firebase/admin";

type FocusArea = {
  name: string;
  reason?: string;
  drills?: string[];
};

type PracticePlanDoc = {
  userId: string;
  generatedAt: string;
  plan: {
    focusAreas: FocusArea[];
    schedule: {
      timeframe: string;
      dailyMinutes: number;
      weeklyTargets: string[];
    };
    suggestedInterview?: string;
  };
};

export async function generatePracticePlan(userId: string) {
  try {
    const feedbackSnapshot = await db
      .collection("feedback")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    const feedbacks = feedbackSnapshot.docs.map((d) => d.data() as Feedback);

    const areaCounts: Record<string, number> = {};
    feedbacks.forEach((f) => {
      (f.areasForImprovement || []).forEach((a) => {
        const key = a.trim();
        areaCounts[key] = (areaCounts[key] || 0) + 1;
      });
    });

    const sortedAreas = Object.entries(areaCounts)
      .sort((a, b) => b[1] - a[1])
      .map((e) => e[0])
      .slice(0, 3);

    const drillTemplates = (area: string) => [
      `Review fundamentals of ${area} for 10 minutes and write down key takeaways.`,
      `Solve 2 practice questions focused on ${area} (5-10 minutes each).`,
      `Explain a concept from ${area} out loud as if interviewing (2-3 minutes).`,
    ];

    const focusAreas: FocusArea[] = sortedAreas.length
      ? sortedAreas.map((a) => ({
          name: a,
          reason: `Repeated feedback: ${a}`,
          drills: drillTemplates(a),
        }))
      : [
          {
            name: "Problem Solving",
            reason: "General improvement",
            drills: drillTemplates("Problem Solving"),
          },
        ];

    const planBody = {
      focusAreas,
      schedule: {
        timeframe: "2 weeks",
        dailyMinutes: 20,
        weeklyTargets: ["3 drills per week", "1 mock interview"],
      },
      suggestedInterview: focusAreas[0]?.name
        ? `Take a focused mock interview on ${focusAreas[0].name}`
        : "Take a mixed mock interview",
    };

    const plan: PracticePlanDoc = {
      userId,
      generatedAt: new Date().toISOString(),
      plan: planBody,
    };

    const planRef = db.collection("practice_plans").doc();
    await planRef.set(plan);

    return { success: true, planId: planRef.id, plan };
  } catch (error) {
    console.error("Error generating practice plan:", error);
    return { success: false };
  }
}

export async function getLatestPracticePlan(userId: string) {
  // Some Firestore combinations (where + orderBy on different fields) require a composite index.
  // To avoid requiring an index here, fetch the user's plans and pick the latest by generatedAt in code.
  const snapshot = await db
    .collection("practice_plans")
    .where("userId", "==", userId)
    .get();

  if (snapshot.empty) return null;

  const plans = snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as PracticePlanDoc),
  }));

  plans.sort((a, b) => (a.generatedAt < b.generatedAt ? 1 : -1));

  return plans[0] || null;
}
