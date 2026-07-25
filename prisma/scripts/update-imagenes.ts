import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const RANGO_INICIO = 20; // índice de array (0-based) => fruta #21
const RANGO_FIN = 40; // exclusivo => fruta #40 incluida
const ID_MIN_ESPERADO = 21;
const ID_MAX_ESPERADO = 40;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function arraysIguales(a: string[], b: string[]) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

async function main() {
  const filePath = path.join(process.cwd(), "prisma", "data", "frutas.json");
  const raw = await readFile(filePath, "utf-8");
  const seedData = JSON.parse(raw);
  const primeras: Array<{ nombre: string; imagenes?: string[] }> =
    seedData.frutas.slice(RANGO_INICIO, RANGO_FIN);

  const nombres = primeras.map((f) => f.nombre);
  if (new Set(nombres).size !== nombres.length) {
    throw new Error(
      "Los nombres de las frutas del rango no son únicos; abortando por seguridad (no hay identificador estable confiable)."
    );
  }

  const existentes = await prisma.fruta.findMany({
    where: { nombre: { in: nombres } },
    select: { id: true, nombre: true, imagenes: true },
  });

  const fueraDeRango = existentes.filter(
    (f) => f.id < ID_MIN_ESPERADO || f.id > ID_MAX_ESPERADO
  );
  if (fueraDeRango.length > 0) {
    throw new Error(
      `Abortando por seguridad: se encontraron coincidencias por nombre fuera del rango de ID esperado (${ID_MIN_ESPERADO}-${ID_MAX_ESPERADO}): ` +
        fueraDeRango.map((f) => `${f.nombre}(id=${f.id})`).join(", ")
    );
  }

  const backupDir = path.join(process.cwd(), "prisma", "backups");
  await mkdir(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `imagenes-backup-${Date.now()}.json`);
  await writeFile(
    backupPath,
    JSON.stringify(
      existentes.map((f) => ({ id: f.id, nombre: f.nombre, imagenes: f.imagenes })),
      null,
      2
    )
  );
  console.log(`Backup guardado en ${backupPath} (${existentes.length} registros)`);

  const porNombre = new Map(existentes.map((f) => [f.nombre, f]));

  let actualizadas = 0;
  let omitidas = 0;
  const noEncontradas: string[] = [];
  const operaciones: { id: number; nombre: string; imagenes: string[] }[] = [];

  for (const fruta of primeras) {
    const nuevasImagenes = fruta.imagenes ?? [];
    const existente = porNombre.get(fruta.nombre);

    if (!existente) {
      noEncontradas.push(fruta.nombre);
      continue;
    }

    if (arraysIguales(existente.imagenes, nuevasImagenes)) {
      omitidas++;
      continue;
    }

    operaciones.push({ id: existente.id, nombre: fruta.nombre, imagenes: nuevasImagenes });
  }

  if (operaciones.length > 0) {
    await prisma.$transaction(
      operaciones.map((op) =>
        prisma.fruta.update({
          where: { id: op.id },
          data: { imagenes: op.imagenes },
        })
      )
    );
    actualizadas = operaciones.length;
  }

  console.log("--- Resumen ---");
  console.log(`Procesadas (rango ${ID_MIN_ESPERADO}-${ID_MAX_ESPERADO} del JSON): ${primeras.length}`);
  console.log(`Encontradas en la base de datos: ${existentes.length}`);
  console.log(`Actualizadas: ${actualizadas}`);
  if (operaciones.length > 0) {
    console.log(`  -> ${operaciones.map((o) => o.nombre).join(", ")}`);
  }
  console.log(`Omitidas (ya tenían la imagen correcta): ${omitidas}`);
  console.log(`No encontradas en la base de datos: ${noEncontradas.length}`);
  if (noEncontradas.length > 0) {
    console.log(`  -> ${noEncontradas.join(", ")}`);
  }
}

main()
  .catch((error) => {
    console.error("Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
