import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { sessoes, usuarios } from "@/lib/db/schema";

const NOME_DO_COOKIE = "bichinho_sessao";
const DURACAO_DA_SESSAO_MS = 90 * 24 * 60 * 60 * 1000; // 90 dias

export interface UsuarioAutenticado {
  id: number;
  nomeDeUsuario: string;
}

/** Cria uma sessão para o usuário e grava o cookie httpOnly no navegador. */
export async function criarSessao(usuarioId: number): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiraEm = new Date(Date.now() + DURACAO_DA_SESSAO_MS);

  await db.insert(sessoes).values({ token, usuarioId, expiraEm });

  const store = await cookies();
  store.set(NOME_DO_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiraEm,
  });
}

/** Lê o cookie de sessão e retorna o usuário autenticado, ou null. */
export async function getUsuarioAtual(): Promise<UsuarioAutenticado | null> {
  const store = await cookies();
  const token = store.get(NOME_DO_COOKIE)?.value;
  if (!token) return null;

  const linhas = await db
    .select({ id: usuarios.id, nomeDeUsuario: usuarios.nomeDeUsuario })
    .from(sessoes)
    .innerJoin(usuarios, eq(sessoes.usuarioId, usuarios.id))
    .where(and(eq(sessoes.token, token), gt(sessoes.expiraEm, new Date())))
    .limit(1);

  return linhas[0] ?? null;
}

/** Remove a sessão atual (banco + cookie). */
export async function destruirSessao(): Promise<void> {
  const store = await cookies();
  const token = store.get(NOME_DO_COOKIE)?.value;

  if (token) {
    await db.delete(sessoes).where(eq(sessoes.token, token));
  }
  store.delete(NOME_DO_COOKIE);
}
