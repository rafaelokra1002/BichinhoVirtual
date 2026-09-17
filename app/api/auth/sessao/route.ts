import { NextResponse } from "next/server";
import { getUsuarioAtual } from "@/lib/auth/session";

export async function GET() {
  const usuario = await getUsuarioAtual();
  return NextResponse.json({ usuario });
}
