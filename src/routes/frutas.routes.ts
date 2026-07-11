import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import {
  FrutaInputSchema,
  FrutaUpdateSchema,
  QueryParamsSchema,
} from "../schemas/fruta.schema.js";

const router = Router();

/**
 * @swagger
 * /frutas:
 *   get:
 *     summary: Listar frutas con filtros y paginación
 *     tags: [Frutas]
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: por_pagina
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Elementos por página
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoría (búsqueda parcial)
 *         example: Baya
 *       - in: query
 *         name: temporada
 *         schema:
 *           type: string
 *         description: Filtrar por temporada
 *         example: Verano
 *       - in: query
 *         name: color
 *         schema:
 *           type: string
 *         description: Filtrar por color
 *         example: Rojo
 *     responses:
 *       200:
 *         description: Lista paginada de frutas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Fruta'
 *                 paginacion:
 *                   $ref: '#/components/schemas/Paginacion'
 */
router.get("/", async (req, res) => {
  const { pagina, por_pagina, categoria, temporada, color } =
    QueryParamsSchema.parse(req.query);

  const skip = (pagina - 1) * por_pagina;

  const where: Record<string, unknown> = {};
  if (categoria) where.categoria = { contains: categoria, mode: "insensitive" };
  if (temporada) where.temporada = { has: temporada };
  if (color) where.colores = { has: color };

  const [datos, total] = await Promise.all([
    prisma.fruta.findMany({ where, skip, take: por_pagina, orderBy: { id: "asc" } }),
    prisma.fruta.count({ where }),
  ]);

  res.json({
    datos,
    paginacion: {
      total,
      pagina,
      por_pagina,
      total_paginas: Math.ceil(total / por_pagina),
    },
  });
});

/**
 * @swagger
 * /frutas/{id}:
 *   get:
 *     summary: Obtener una fruta por ID
 *     tags: [Frutas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fruta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fruta'
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Fruta no encontrada
 */
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "ID debe ser un número" });
    return;
  }

  const fruta = await prisma.fruta.findUnique({ where: { id } });
  if (!fruta) {
    res.status(404).json({ error: "Fruta no encontrada" });
    return;
  }

  res.json(fruta);
});

/**
 * @swagger
 * /frutas:
 *   post:
 *     summary: Crear una nueva fruta
 *     tags: [Frutas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FrutaInput'
 *     responses:
 *       201:
 *         description: Fruta creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fruta'
 *       400:
 *         description: Error de validación
 */
router.post("/", async (req, res) => {
  const data = FrutaInputSchema.parse(req.body);
  const fruta = await prisma.fruta.create({ data });
  res.status(201).json(fruta);
});

/**
 * @swagger
 * /frutas/{id}:
 *   put:
 *     summary: Actualizar una fruta
 *     tags: [Frutas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FrutaInput'
 *     responses:
 *       200:
 *         description: Fruta actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Fruta'
 *       400:
 *         description: ID inválido o error de validación
 *       404:
 *         description: Fruta no encontrada
 */
router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "ID debe ser un número" });
    return;
  }

  const data = FrutaUpdateSchema.parse(req.body);
  const fruta = await prisma.fruta.update({ where: { id }, data });
  res.json(fruta);
});

/**
 * @swagger
 * /frutas/{id}:
 *   delete:
 *     summary: Eliminar una fruta
 *     tags: [Frutas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Fruta eliminada
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Fruta no encontrada
 */
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "ID debe ser un número" });
    return;
  }

  await prisma.fruta.delete({ where: { id } });
  res.status(204).send();
});

export default router;
