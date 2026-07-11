import { z } from "zod";

const stringOrArray = z.union([z.string(), z.array(z.string())]);

export const FrutaInputSchema = z.object({
  nombre: z.string().min(1, "nombre es requerido"),
  nombreCientifico: z.string().min(1, "nombreCientifico es requerido"),
  familiaBotanica: z.string().nullable().optional(),
  otrosNombres: z.array(z.string()).optional().default([]),
  descripcion: z.string().min(1, "descripcion es requerida"),
  categoria: z.string().min(1, "categoria es requerida"),
  sabor: z.string().nullable().optional(),
  origenPais: z.string().nullable().optional(),
  origenRegion: z.string().nullable().optional(),
  temporada: z.array(z.string()).optional().default([]),
  colores: z.array(z.string()).optional().default([]),
  usosCulinarios: z.array(z.string()).optional().default([]),
  beneficios: z.array(z.string()).optional().default([]),
  alergias: z.array(z.string()).optional().default([]),
  curiosidades: z.array(z.string()).optional().default([]),
  imagenes: z.array(z.string()).optional().default([]),
  porcionG: z.number().int().positive().optional().default(100),
  caloriasKcal: z.number().nullable().optional(),
  carbohidratosG: z.number().nullable().optional(),
  azucaresG: z.number().nullable().optional(),
  fibraG: z.number().nullable().optional(),
  proteinasG: z.number().nullable().optional(),
  grasasG: z.number().nullable().optional(),
  vitaminaCMg: z.number().nullable().optional(),
  vitaminaAUg: z.number().nullable().optional(),
  vitaminaKUg: z.number().nullable().optional(),
  potasioMg: z.number().nullable().optional(),
  calcioMg: z.number().nullable().optional(),
  hierroMg: z.number().nullable().optional(),
  conservacionMetodo: z.string().nullable().optional(),
  conservacionDuracionDias: z.number().int().nullable().optional(),
});

export const FrutaUpdateSchema = FrutaInputSchema.partial();

export const QueryParamsSchema = z.object({
  pagina: z.coerce.number().int().positive().optional().default(1),
  por_pagina: z.coerce.number().int().min(1).max(100).optional().default(10),
  categoria: z.string().optional(),
  temporada: z.string().optional(),
  color: z.string().optional(),
});

export type FrutaInput = z.infer<typeof FrutaInputSchema>;
export type FrutaUpdate = z.infer<typeof FrutaUpdateSchema>;
export type QueryParams = z.infer<typeof QueryParamsSchema>;
