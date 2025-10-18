// app/api/genkeys/route.ts
import { NextResponse } from "next/server";
import { generateKeys } from "@/app/lib/crypto-server";

export async function GET() {
  try {
    const { privateKey, publicKey } = generateKeys();
    return NextResponse.json({ privateKey, publicKey });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
