import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
  await Promise.all([
    db.accessPoint.create({ data: { key: "key1", code: "13795" } }),
    db.accessPoint.create({ data: { key: "key2", code: "97315" } }),
  ]);
}

seed();
