import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
  await Promise.all([
    db.accessPoint.create({
      data: {
        key: "key1",
        code: "13795",
        codes: {
          create: [
            { name: "guest1", code: "111", enabled: true },
            { name: "guest2", code: "111", enabled: false },
            { name: "staff", code: "333", enabled: true },
            { name: "master", code: "444", enabled: true },
          ],
        },
        accessCheckPolicy: "cloud-first",
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
