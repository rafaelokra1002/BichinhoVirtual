export interface ResultadoValidacao {
  valido: boolean;
  erro?: string;
}

/** Normaliza o nome de usuário: minúsculo, sem espaço nas pontas. */
export function normalizarNomeDeUsuario(valor: string): string {
  return valor.trim().toLowerCase();
}

export function validarNomeDeUsuario(nome: string): ResultadoValidacao {
  if (nome.length < 3 || nome.length > 20) {
    return { valido: false, erro: "O nome de usuário precisa ter de 3 a 20 caracteres." };
  }
  if (!/^[a-z0-9_]+$/.test(nome)) {
    return { valido: false, erro: "Use só letras, números ou _ no nome de usuário." };
  }
  return { valido: true };
}

export function validarPin(pin: string): ResultadoValidacao {
  if (!/^\d{4}$/.test(pin)) {
    return { valido: false, erro: "O PIN precisa ter exatamente 4 números." };
  }
  return { valido: true };
}
