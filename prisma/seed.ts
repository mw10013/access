import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function seed() {
  const { id: masterId } = await db.accessUser.create({
    data: {
      name: "Master",
      description: "Access to everything",
      code: "555",
      enabled: true,
    },
  });
  const { id: guest1Id } = await db.accessUser.create({
    data: {
      name: "Guest 1",
      description: "For second floor.",
      code: "111",
      enabled: true,
    },
  });
  const { id: guest2Id } = await db.accessUser.create({
    data: {
      name: "Guest 2",
      description: "For third floor.",
      code: "222",
      enabled: false,
    },
  });
  const { id: staffId } = await db.accessUser.create({
    data: { name: "Staff", code: "333", enabled: true },
  });
  const { id: repairId } = await db.accessUser.create({
    data: {
      name: "Repair",
      description: "For repairs as necessary.",
      code: "444",
      enabled: false,
    },
  });

  await Promise.all([
    db.accessPoint.create({
      data: {
        name: "BnB-1 Front Door",
        accessUsers: {
          connect: [
            { id: masterId },
            { id: guest1Id },
            { id: guest2Id },
            { id: staffId },
            { id: repairId },
          ],
        },
        heartbeatAt: new Date(),
        cachedConfig: {
          create: { codes: '["111", "333"]' },
        },
      },
    }),
    db.accessPoint.create({
      data: {
        name: "BnB-1 2nd Floor",
        accessUsers: {
          connect: [
            { id: masterId },
            { id: guest1Id },
            { id: staffId },
            { id: repairId },
          ],
        },
      },
    }),
    db.accessPoint.create({
      data: {
        name: "BnB-1 3rd Floor",
        accessUsers: {
          connect: [
            { id: masterId },
            { id: guest2Id },
            { id: staffId },
            { id: repairId },
          ],
        },
      },
    }),
    db.accessPoint.create({
      data: {
        name: "BnB-1 Basement",
        description: "Guests are not allowed.",
        accessUsers: {
          connect: [{ id: masterId }, { id: staffId }, { id: repairId }],
        },
      },
    }),
  ]);
}

seed();
