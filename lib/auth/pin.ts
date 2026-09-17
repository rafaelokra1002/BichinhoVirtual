import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/** Gera um hash salgado do PIN (formato `salt:hash`, ambos em hex). */
export function hashPin(pin: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(pin, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/** Compara o PIN informado com o hash salvo, em tempo constante. */
export function verificarPin(pin: string, hashArmazenado: string): boolean {
  const [salt, hash] = hashArmazenado.split(":");
  if (!salt || !hash) return false;

  const hashCalculado = scryptSync(pin, salt, 64);
  const hashOriginal = Buffer.from(hash, "hex");
  if (hashCalculado.length !== hashOriginal.length) return false;

  return timingSafeEqual(hashCalculado, hashOriginal);
}
