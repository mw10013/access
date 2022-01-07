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
    db.accessLocation.create({
      data: {
        name: "Brooklyn BnB",
        accessHubs: {
          create: [
            {
              accessPoints: {
                create: [
                  {
                    name: "Front Door",
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
                  {
                    name: "Back Door",
                    accessUsers: {
                      connect: [
                        { id: masterId },
                        { id: guest1Id },
                        { id: guest2Id },
                        { id: staffId },
                        { id: repairId },
                      ],
                    },
                  },
                  {
                    name: "Basement Outside",
                    description: "Guests are not allowed.",
                    accessUsers: {
                      connect: [
                        { id: masterId },
                        { id: staffId },
                        { id: repairId },
                      ],
                    },
                  },
                  {
                    name: "Basement Inside",
                    description: "Guests are not allowed.",
                    accessUsers: {
                      connect: [
                        { id: masterId },
                        { id: staffId },
                        { id: repairId },
                      ],
                    },
                  },
                ],
              },
            },
            {
              accessPoints: {
                create: [
                  {
                    name: "2nd Floor Front",
                    accessUsers: {
                      connect: [
                        { id: masterId },
                        { id: guest1Id },
                        { id: staffId },
                        { id: repairId },
                      ],
                    },
                  },
                  {
                    name: "2nd Floor Back",
                    accessUsers: {
                      connect: [
                        { id: masterId },
                        { id: guest1Id },
                        { id: staffId },
                        { id: repairId },
                      ],
                    },
                  },
                  {
                    name: "3rd Floor Front",
                    accessUsers: {
                      connect: [
                        { id: masterId },
                        { id: guest2Id },
                        { id: staffId },
                        { id: repairId },
                      ],
                    },
                  },
                  {
                    name: "3rd Floor Back",
                    accessUsers: {
                      connect: [
                        { id: masterId },
                        { id: guest2Id },
                        { id: staffId },
                        { id: repairId },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    }),
    db.accessLocation.create({
      data: {
        name: "SI BnB",
        accessHubs: {
          create: [
            {
              accessPoints: {
                create: [
                  {
                    name: "Front Door",
                    accessUsers: {
                      connect: [{ id: masterId }],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    }),
  ]);
}

seed();
