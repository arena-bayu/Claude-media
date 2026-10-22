import { NextResponse } from "next/server";
import { readLog } from "@/lib/store";

export const dynamic = "force-dynamic";
export const GET = () => NextResponse.json(readLog().reverse().slice(0, 30));
