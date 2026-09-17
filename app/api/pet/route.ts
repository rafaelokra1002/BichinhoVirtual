import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { pets } from "@/lib/db/schema";
import { getUsuarioAtual } from "@/lib/auth/session";

/** Checagem mínima de forma — o mesmo espírito de `storageService`, agora do lado do servidor. */
function pareceEstadoDoPet(valor: unknown): valor is Record<string, unknown> {
  if (typeof valor !== "object" || valor === null) return false;
  const p = valor as Record<string, unknown>;
  return (
    typeof p.nome === "string" &&
    typeof p.especie === "string" &&
    typeof p.fome === "number" &&
    typeof p.felicidade === "number" &&
    typeof p.energia === "number" &&
    typeof p.higiene === "number" &&
    typeof p.saude === "number" &&
    typeof p.xp === "number" &&
    typeof p.nivel === "number" &&
    typeof p.moedas === "number" &&
    typeof p.gemas === "number" &&
    typeof p.dormindo === "boolean" &&
    typeof p.vivo === "boolean" &&
    Array.isArray(p.itensComprados) &&
    Array.isArray(p.conquistasDesbloqueadas) &&
    typeof p.minigamesJogados === "number" &&
    typeof p.totalAlimentado === "number" &&
    typeof p.sequenciaDeDias === "number" &&
    typeof p.cocos === "number" &&
    typeof p.proximoCocoEm === "number" &&
    typeof p.totalCocosLimpos === "number" &&
    typeof p.criadoEm === "number" &&
    typeof p.atualizadoEm === "number"
  );
}

export async function GET() {
  const usuario = await getUsuarioAtual();
  if (!usuario) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const [pet] = await db.select().from(pets).where(eq(pets.usuarioId, usuario.id)).limit(1);
  return NextResponse.json({ pet: pet ?? null });
}

export async function PUT(request: NextRequest) {
  const usuario = await getUsuarioAtual();
  if (!usuario) return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });

  const corpo = await request.json().catch(() => null);
  if (!pareceEstadoDoPet(corpo)) {
    return NextResponse.json({ erro: "Estado do pet inválido." }, { status: 400 });
  }

  const {
    nome,
    especie,
    fome,
    felicidade,
    energia,
    higiene,
    saude,
    xp,
    nivel,
    moedas,
    gemas,
    dormindo,
    vivo,
    itensComprados,
    acessorioEquipadoId,
    conquistasDesbloqueadas,
    minigamesJogados,
    totalAlimentado,
    ultimoLoginData,
    sequenciaDeDias,
    cocos,
    proximoCocoEm,
    totalCocosLimpos,
    criadoEm,
    atualizadoEm,
  } = corpo;

  const linha = {
    usuarioId: usuario.id,
    nome: String(nome),
    especie: String(especie),
    fome: Number(fome),
    felicidade: Number(felicidade),
    energia: Number(energia),
    higiene: Number(higiene),
    saude: Number(saude),
    xp: Number(xp),
    nivel: Number(nivel),
    moedas: Number(moedas),
    gemas: Number(gemas),
    dormindo: Boolean(dormindo),
    vivo: Boolean(vivo),
    itensComprados: itensComprados as string[],
    acessorioEquipadoId: acessorioEquipadoId === null ? null : String(acessorioEquipadoId),
    conquistasDesbloqueadas: conquistasDesbloqueadas as string[],
    minigamesJogados: Number(minigamesJogados),
    totalAlimentado: Number(totalAlimentado),
    ultimoLoginData: ultimoLoginData === null ? null : String(ultimoLoginData),
    sequenciaDeDias: Number(sequenciaDeDias),
    cocos: Number(cocos),
    proximoCocoEm: Number(proximoCocoEm),
    totalCocosLimpos: Number(totalCocosLimpos),
    criadoEm: Number(criadoEm),
    atualizadoEm: Number(atualizadoEm),
  };

  await db.insert(pets).values(linha).onConflictDoUpdate({ target: pets.usuarioId, set: linha });

  return NextResponse.json({ ok: true });
}
