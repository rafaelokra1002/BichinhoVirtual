import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { usuarios } from "@/lib/db/schema";
import { verificarPin } from "@/lib/auth/pin";
import { criarSessao } from "@/lib/auth/session";
import { normalizarNomeDeUsuario } from "@/lib/auth/validacao";

const MAX_TENTATIVAS = 5;
const BLOQUEIO_MS = 5 * 60_000;
const MENSAGEM_GENERICA = "Usuário ou PIN incorretos.";

export async function POST(request: NextRequest) {
  const corpo = await request.json().catch(() => null);
  if (!corpo || typeof corpo.nomeDeUsuario !== "string" || typeof corpo.pin !== "string") {
    return NextResponse.json({ erro: "Dados inválidos." }, { status: 400 });
  }

  const nomeDeUsuario = normalizarNomeDeUsuario(corpo.nomeDeUsuario);

  const [usuario] = await db.select().from(usuarios).where(eq(usuarios.nomeDeUsuario, nomeDeUsuario)).limit(1);
  if (!usuario) {
    return NextResponse.json({ erro: MENSAGEM_GENERICA }, { status: 401 });
  }

  if (usuario.bloqueadoAte && usuario.bloqueadoAte.getTime() > Date.now()) {
    return NextResponse.json({ erro: "Muitas tentativas erradas. Tente de novo em alguns minutos." }, { status: 429 });
  }

  const pinCorreto = verificarPin(corpo.pin, usuario.pinHash);
  if (!pinCorreto) {
    const tentativas = usuario.tentativasFalhas + 1;
    const bloqueadoAte = tentativas >= MAX_TENTATIVAS ? new Date(Date.now() + BLOQUEIO_MS) : null;
    await db.update(usuarios).set({ tentativasFalhas: tentativas, bloqueadoAte }).where(eq(usuarios.id, usuario.id));
    return NextResponse.json({ erro: MENSAGEM_GENERICA }, { status: 401 });
  }

  await db.update(usuarios).set({ tentativasFalhas: 0, bloqueadoAte: null }).where(eq(usuarios.id, usuario.id));
  await criarSessao(usuario.id);

  return NextResponse.json({ ok: true, nomeDeUsuario: usuario.nomeDeUsuario });
}
