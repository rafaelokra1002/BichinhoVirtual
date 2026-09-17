import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { usuarios } from "@/lib/db/schema";
import { hashPin } from "@/lib/auth/pin";
import { criarSessao } from "@/lib/auth/session";
import { normalizarNomeDeUsuario, validarNomeDeUsuario, validarPin } from "@/lib/auth/validacao";

export async function POST(request: NextRequest) {
  const corpo = await request.json().catch(() => null);
  if (!corpo || typeof corpo.nomeDeUsuario !== "string" || typeof corpo.pin !== "string") {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  const nomeDeUsuario = normalizarNomeDeUsuario(corpo.nomeDeUsuario);
  const validacaoNome = validarNomeDeUsuario(nomeDeUsuario);
  if (!validacaoNome.valido) {
    return NextResponse.json({ erro: validacaoNome.erro }, { status: 400 });
  }

  const validacaoPin = validarPin(corpo.pin);
  if (!validacaoPin.valido) {
    return NextResponse.json({ erro: validacaoPin.erro }, { status: 400 });
  }

  const existente = await db
    .select({ id: usuarios.id })
    .from(usuarios)
    .where(eq(usuarios.nomeDeUsuario, nomeDeUsuario))
    .limit(1);

  if (existente.length > 0) {
    return NextResponse.json({ erro: "Esse nome de usuário já existe. Escolha outro." }, { status: 409 });
  }

  const [usuario] = await db
    .insert(usuarios)
    .values({ nomeDeUsuario, pinHash: hashPin(corpo.pin) })
    .returning({ id: usuarios.id });

  await criarSessao(usuario.id);

  return NextResponse.json({ ok: true, nomeDeUsuario });
}
