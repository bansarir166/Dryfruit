import { NextRequest, NextResponse } from "next/server";
import { sendFollowupToLead, sendFollowupToAllPending } from "@/lib/lead-tracker";

export async function POST(request: NextRequest) {
  try {
    let body: { email?: string; id?: string; all?: boolean } = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    if (body.all) {
      const summary = await sendFollowupToAllPending();
      return NextResponse.json({ ok: true, summary });
    }

    const target = body.id || body.email;
    if (!target) {
      return NextResponse.json(
        { ok: false, error: "Please provide an email, id, or { all: true }." },
        { status: 400 }
      );
    }

    const result = await sendFollowupToLead(target);
    return NextResponse.json({ ok: result.success, message: result.message, lead: result.lead });
  } catch (error) {
    console.error("Error in lead follow-up route:", error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
