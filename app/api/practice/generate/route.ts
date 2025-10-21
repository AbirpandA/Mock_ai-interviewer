import { NextResponse } from "next/server";
import { generatePracticePlan } from "@/lib/actions/practice.action";
import { getCurrentUser } from "@/lib/actions/auth.action";

export async function POST() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );

  const res = await generatePracticePlan(user.id);

  if (!res.success)
    return NextResponse.json({ success: false }, { status: 500 });

  return NextResponse.json({ success: true, plan: res.plan });
}
