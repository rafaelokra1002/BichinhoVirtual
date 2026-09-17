import { PetState } from "@/types/pet";

export interface UsuarioAutenticado {
  id: number;
  nomeDeUsuario: string;
}

export interface ResultadoAuth {
  ok: boolean;
  erro?: string;
  nomeDeUsuario?: string;
}

async function postJson(url: string, corpo: unknown): Promise<ResultadoAuth> {
  try {
    const resposta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });
    const dados = await resposta.json().catch(() => ({}));
    if (!resposta.ok) {
      return { ok: false, erro: dados.erro ?? "Não foi possível completar a ação." };
    }
    return { ok: true, nomeDeUsuario: dados.nomeDeUsuario };
  } catch {
    return { ok: false, erro: "Falha de conexão. Tente de novo." };
  }
}

export function registrar(nomeDeUsuario: string, pin: string): Promise<ResultadoAuth> {
  return postJson("/api/auth/registrar", { nomeDeUsuario, pin });
}

export function entrar(nomeDeUsuario: string, pin: string): Promise<ResultadoAuth> {
  return postJson("/api/auth/entrar", { nomeDeUsuario, pin });
}

export async function sair(): Promise<void> {
  await fetch("/api/auth/sair", { method: "POST" }).catch(() => {});
}

export async function sessaoAtual(): Promise<UsuarioAutenticado | null> {
  try {
    const resposta = await fetch("/api/auth/sessao");
    if (!resposta.ok) return null;
    const dados = await resposta.json();
    return dados.usuario ?? null;
  } catch {
    return null;
  }
}

/** Busca o pet do usuário logado. `null` se ele ainda não escolheu uma espécie. */
export async function buscarPet(): Promise<PetState | null> {
  const resposta = await fetch("/api/pet");
  if (!resposta.ok) return null;

  const dados = await resposta.json();
  if (!dados.pet) return null;

  const pet = { ...dados.pet };
  delete pet.usuarioId;
  return pet as PetState;
}

/**
 * Salva o pet no servidor. `keepalive` deve ser usado ao salvar durante o
 * fechamento da aba (`visibilitychange`/`pagehide`), para o navegador manter
 * a requisição viva mesmo com a página sendo descartada.
 */
export async function salvarPetNoServidor(pet: PetState, keepalive = false): Promise<boolean> {
  try {
    const resposta = await fetch("/api/pet", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pet),
      keepalive,
    });
    return resposta.ok;
  } catch {
    return false;
  }
}
