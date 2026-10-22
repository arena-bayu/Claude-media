import { NextResponse } from "next/server";
import { hasClaude, MODEL } from "@/lib/claude";
import { agentStates, getSettings, listPosts, recentLogs } from "@/lib/db";
import { officeRunning } from "@/lib/office";
import { currentUser } from "@/lib/session";
import { TIMEZONE } from "@/lib/time";

export const dynamic = "force-dynamic";

/** Seluruh state dashboard dalam satu request (dipoll oleh UI). */
export async function GET() {
  return NextResponse.json({
    user: await currentUser(),
    posts: listPosts(),
    agents: agentStates(),
    logs: recentLogs(),
    settings: getSettings(),
    officeRunning: officeRunning(),
    demo: !hasClaude(),
    model: MODEL,
    timezone: TIMEZONE,
  });
}
