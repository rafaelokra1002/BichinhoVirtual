"use client";

import { useState } from "react";
import { ResultadoAuth } from "@/services/apiClient";

interface TelaDeLoginProps {
  onAutenticar: (modo: "entrar" | "registrar", nomeDeUsuario: string, pin: string) => Promise<ResultadoAuth>;
}

export function TelaDeLogin({ onAutenticar }: TelaDeLoginProps) {
  const [modo, setModo] = useState<"entrar" | "registrar">("entrar");
  const [nomeDeUsuario, setNomeDeUsuario] = useState("");
  const [pin, setPin] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setErro(null);

    if (nomeDeUsuario.trim().length < 3) {
      setErro("O nome de usuário precisa ter pelo menos 3 letras.");
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      setErro("O PIN precisa ter 4 números.");
      return;
    }

    setEnviando(true);
    const resultado = await onAutenticar(modo, nomeDeUsuario, pin);
    setEnviando(false);

    if (!resultado.ok) {
      setErro(resultado.erro ?? "Não deu certo. Tente de novo.");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-5 p-6">
      <div className="text-center">
        <p className="text-4xl">🐾</p>
        <h1 className="mt-1 text-xl font-extrabold text-stone-800 dark:text-stone-100">Bichinho Virtual</h1>
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
          {modo === "entrar" ? "Entre com sua conta" : "Crie sua conta"}
        </p>
      </div>

      <div className="flex rounded-full bg-purple-100 p-1 dark:bg-stone-800">
        <button
          type="button"
          onClick={() => setModo("entrar")}
          className={`flex-1 rounded-full py-2 text-sm font-bold transition-colors ${
            modo === "entrar"
              ? "bg-white text-purple-700 shadow-sm dark:bg-stone-700 dark:text-stone-100"
              : "text-purple-400 dark:text-stone-500"
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setModo("registrar")}
          className={`flex-1 rounded-full py-2 text-sm font-bold transition-colors ${
            modo === "registrar"
              ? "bg-white text-purple-700 shadow-sm dark:bg-stone-700 dark:text-stone-100"
              : "text-purple-400 dark:text-stone-500"
          }`}
        >
          Criar conta
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="usuario" className="text-sm font-medium text-stone-600 dark:text-stone-300">
            Nome de usuário
          </label>
          <input
            id="usuario"
            type="text"
            value={nomeDeUsuario}
            onChange={(e) => setNomeDeUsuario(e.target.value)}
            placeholder="ex: joaozinho"
            autoComplete="username"
            maxLength={20}
            className="rounded-2xl border-2 border-stone-200 px-4 py-2.5 text-base font-medium outline-none focus:border-purple-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="pin" className="text-sm font-medium text-stone-600 dark:text-stone-300">
            PIN de 4 números
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            pattern="\d{4}"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="••••"
            autoComplete={modo === "registrar" ? "new-password" : "current-password"}
            className="rounded-2xl border-2 border-stone-200 px-4 py-2.5 text-center text-2xl tracking-[0.5em] outline-none focus:border-purple-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
          />
        </div>

        {erro && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-center text-sm font-semibold text-red-500 dark:bg-red-950/30">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="mt-1 w-full rounded-full bg-gradient-to-b from-purple-500 to-purple-600 py-3 text-base font-extrabold text-white shadow-[0_4px_0_0_#6d28d9] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_1px_0_0_#6d28d9] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {enviando ? "Um instante..." : modo === "entrar" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      {modo === "registrar" && (
        <p className="text-center text-xs text-stone-400 dark:text-stone-500">
          Combine com um adulto pra não esquecer o PIN!
        </p>
      )}
    </div>
  );
}
