import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFile } from "node:fs/promises";
import path from "node:path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function mapFruta(fruta: Record<string, unknown>) {
  const o = fruta as Record<string, Record<string, unknown>>;
  return {
    nombre: fruta.nombre as string,
    nombreCientifico: fruta.nombre_cientifico as string,
    familiaBotanica: (fruta.familia_botanica as string) ?? null,
    otrosNombres: (fruta.otros_nombres as string[]) ?? [],
    descripcion: fruta.descripcion as string,
    categoria: fruta.categoria as string,
    sabor: (fruta.sabor as string) ?? null,
    origenPais: (o.origen?.pais as string) ?? null,
    origenRegion: (o.origen?.region as string) ?? null,
    temporada: (fruta.temporada as string[]) ?? [],
    colores: (fruta.colores as string[]) ?? [],
    usosCulinarios: (fruta.usos_culinarios as string[]) ?? [],
    beneficios: (fruta.beneficios as string[]) ?? [],
    alergias: (fruta.alergias as string[]) ?? [],
    curiosidades: (fruta.curiosidades as string[]) ?? [],
    imagenes: (fruta.imagenes as string[]) ?? [],
    porcionG: (o.nutricion?.porcion_g as number) ?? 100,
    caloriasKcal: (o.nutricion?.calorias_kcal as number) ?? null,
    carbohidratosG: (o.nutricion?.carbohidratos_g as number) ?? null,
    azucaresG: (o.nutricion?.azucares_g as number) ?? null,
    fibraG: (o.nutricion?.fibra_g as number) ?? null,
    proteinasG: (o.nutricion?.proteinas_g as number) ?? null,
    grasasG: (o.nutricion?.grasas_g as number) ?? null,
    vitaminaCMg: (o.nutricion?.vitaminas as Record<string, unknown>)?.vitamina_C_mg as number ?? null,
    vitaminaAUg: (o.nutricion?.vitaminas as Record<string, unknown>)?.vitamina_A_ug as number ?? null,
    vitaminaKUg: (o.nutricion?.vitaminas as Record<string, unknown>)?.vitamina_K_ug as number ?? null,
    potasioMg: (o.nutricion?.minerales as Record<string, unknown>)?.potasio_mg as number ?? null,
    calcioMg: (o.nutricion?.minerales as Record<string, unknown>)?.calcio_mg as number ?? null,
    hierroMg: (o.nutricion?.minerales as Record<string, unknown>)?.hierro_mg as number ?? null,
    conservacionMetodo: (o.conservacion?.metodo as string) ?? null,
    conservacionDuracionDias: (o.conservacion?.duracion_dias as number) ?? null,
  };
}

async function main() {
  const filePath = path.join(process.cwd(), "prisma", "data", "frutas.json");
  const data = await readFile(filePath, "utf-8");
  const seedData = JSON.parse(data);

  console.log(`Sembrando ${seedData.frutas.length} frutas...`);

  await prisma.fruta.deleteMany();
  console.log("Base de datos limpiada.");

  for (const fruta of seedData.frutas) {
    await prisma.fruta.create({ data: mapFruta(fruta) });
  }

  const total = await prisma.fruta.count();
  console.log(`Total frutas en base de datos: ${total}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
