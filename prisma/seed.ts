import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
  await db.accessPoint.create({
    data: {
      codes: {
        create: [
          { name: "guest1", code: "111", enabled: true },
          { name: "guest2", code: "222", enabled: false },
          { name: "staff", code: "333", enabled: true },
          { name: "master", code: "444", enabled: true },
        ],
      },
      accessCheckPolicy: "cloud-first",
      heartbeatAt: new Date(),
      cachedConfig: {
        create: { codes: '["111", "333"]', accessCheckPolicy: "point-only" },
      },
    },
  });
  await db.accessPoint.create({ data: {} });
}

seed();
