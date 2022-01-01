import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
  await Promise.all([
    db.accessPoint.create({
      data: {
        key: "key1",
        code: "13795",
        accessCheckPolicy: "manager-first",
        heartbeatAt: new Date(),
        cachedConfig: {
          create: { code: "111", accessCheckPolicy: "point-only" },
        },
      },
    }),
    db.accessPoint.create({ data: { key: "key2" } }),
  ]);
}

seed();
