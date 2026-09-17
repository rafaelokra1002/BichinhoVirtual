import { pgTable, serial, integer, text, boolean, doublePrecision, bigint, timestamp, jsonb } from "drizzle-orm/pg-core";

export const usuarios = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  nomeDeUsuario: text("nome_de_usuario").notNull().unique(),
  pinHash: text("pin_hash").notNull(),
  tentativasFalhas: integer("tentativas_falhas").notNull().default(0),
  bloqueadoAte: timestamp("bloqueado_ate", { withTimezone: true }),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
});

export const sessoes = pgTable("sessoes", {
  token: text("token").primaryKey(),
  usuarioId: integer("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  expiraEm: timestamp("expira_em", { withTimezone: true }).notNull(),
  criadoEm: timestamp("criado_em", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Um pet por usuário. Os campos espelham `PetState` (types/pet.ts) quase 1:1 —
 * timestamps continuam em epoch-ms (bigint) para não precisar converter de/para
 * `Date` no caminho cliente → API → banco.
 */
export const pets = pgTable("pets", {
  usuarioId: integer("usuario_id")
    .primaryKey()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  nome: text("nome").notNull(),
  especie: text("especie").notNull(),
  fome: doublePrecision("fome").notNull(),
  felicidade: doublePrecision("felicidade").notNull(),
  energia: doublePrecision("energia").notNull(),
  higiene: doublePrecision("higiene").notNull(),
  saude: doublePrecision("saude").notNull(),
  xp: doublePrecision("xp").notNull(),
  nivel: integer("nivel").notNull(),
  moedas: integer("moedas").notNull(),
  gemas: integer("gemas").notNull(),
  dormindo: boolean("dormindo").notNull(),
  vivo: boolean("vivo").notNull(),
  itensComprados: jsonb("itens_comprados").notNull().$type<string[]>(),
  acessorioEquipadoId: text("acessorio_equipado_id"),
  conquistasDesbloqueadas: jsonb("conquistas_desbloqueadas").notNull().$type<string[]>(),
  minigamesJogados: integer("minigames_jogados").notNull(),
  totalAlimentado: integer("total_alimentado").notNull(),
  ultimoLoginData: text("ultimo_login_data"),
  sequenciaDeDias: integer("sequencia_de_dias").notNull(),
  cocos: integer("cocos").notNull(),
  proximoCocoEm: bigint("proximo_coco_em", { mode: "number" }).notNull(),
  totalCocosLimpos: integer("total_cocos_limpos").notNull(),
  criadoEm: bigint("criado_em", { mode: "number" }).notNull(),
  atualizadoEm: bigint("atualizado_em", { mode: "number" }).notNull(),
});
