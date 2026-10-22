import { NextResponse } from "next/server";
import { readPosts } from "@/lib/store";

export const dynamic = "force-dynamic";

export const GET = () => NextResponse.json(readPosts());
