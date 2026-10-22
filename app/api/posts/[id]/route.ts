import { NextResponse } from "next/server";
import { z } from "zod";
import { formatProblems } from "@/lib/claude";
import { getPost, log, updatePost } from "@/lib/db";
import { retryPost, scheduleApproved, startRevision } from "@/lib/office";
import { currentUser } from "@/lib/session";
import { assertCanApply, WorkflowError } from "@/lib/workflow";

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve"), scheduledAt: z.iso.datetime().optional() }),
  z.object({ action: z.literal("reject"), note: z.string().max(2000).default("") }),
  z.object({ action: z.literal("revise"), feedback: z.string().trim().min(3).max(2000) }),
  z.object({ action: z.literal("edit"), caption: z.string().max(5000), slides: z.array(z.string().max(1000)).max(10) }),
  z.object({ action: z.literal("unschedule") }),
  z.object({ action: z.literal("retry") }),
]);

// Semua aksi di sini adalah keputusan manusia; nama reviewer dicatat di log.
export async function PATCH(req: Request, ctx: RouteContext<"/api/posts/[id]">) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Belum login" }, { status: 401 });
  const { id } = await ctx.params;
  const post = getPost(id);
  if (!post) return NextResponse.json({ error: "Post tidak ditemukan" }, { status: 404 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid" }, { status: 400 });
  const body = parsed.data;

  try {
    assertCanApply(body.action, post.status);
    switch (body.action) {
      case "approve": {
        const problems = formatProblems(post.platform, post);
        if (problems.length) return NextResponse.json({ error: `Belum bisa di-approve: ${problems.join("; ")}` }, { status: 422 });
        if (body.scheduledAt && new Date(body.scheduledAt) <= new Date())
          return NextResponse.json({ error: "Waktu tayang harus di masa depan" }, { status: 422 });
        if (body.scheduledAt) {
          updatePost(id, { status: "scheduled", scheduledAt: body.scheduledAt, reviewedBy: user, error: null });
          log(user, `Approve & jadwalkan manual "${post.title}"`);
        } else {
          updatePost(id, { status: "approved", reviewedBy: user, error: null });
          log(user, `Approve "${post.title}"`);
          scheduleApproved();
        }
        break;
      }
      case "reject":
        updatePost(id, { status: "rejected", reviewedBy: user, reviewNote: body.note, scheduledAt: null });
        log(user, `Reject "${post.title}"${body.note ? `: ${body.note}` : ""}`);
        break;
      case "revise":
        startRevision(id, body.feedback, user);
        break;
      case "edit":
        updatePost(id, { caption: body.caption, slides: post.platform === "threads" ? [] : body.slides });
        log(user, `Mengedit "${post.title}"`);
        break;
      case "unschedule":
        updatePost(id, { status: "review", scheduledAt: null });
        log(user, `Menarik "${post.title}" dari jadwal, kembali ke review`);
        break;
      case "retry":
        retryPost(post, user);
        break;
    }
  } catch (e) {
    if (e instanceof WorkflowError) return NextResponse.json({ error: e.message }, { status: 409 });
    throw e;
  }
  return NextResponse.json(getPost(id));
}
