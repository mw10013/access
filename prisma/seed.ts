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
  const { id: brooklynGuest1Id } = await db.accessUser.create({
    data: {
      name: "Brooklyn BnB Guest 1",
      description: "Second floor of Brooklyn BnB.",
      code: "111",
      enabled: true,
    },
  });
  const { id: brooklynGuest2Id } = await db.accessUser.create({
    data: {
      name: "Brooklyn BnB Guest 2",
      description: "Third floor of Brooklyn BnB.",
      code: "222",
      enabled: false,
    },
  });
  const { id: siGuestId } = await db.accessUser.create({
    data: {
      name: "Staten Island BnB Guest 1",
      code: "13795",
      enabled: true,
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

  await db.accessLocation.create({
    data: {
      name: "Brooklyn BnB",
      accessManagers: {
        create: [
          {
            accessPoints: {
              create: [
                {
                  name: "Front Door",
                  position: 1,
                  accessUsers: {
                    connect: [
                      { id: masterId },
                      { id: brooklynGuest1Id },
                      { id: brooklynGuest2Id },
                      { id: staffId },
                      { id: repairId },
                    ],
                  },
                  heartbeatAt: new Date(),
                  cachedConfig: {
                    create: {
                      accessUsers: `[{"id": ${masterId}, "code": "555"}]`,
                    },
                  },
                  accessEvents: {
                    create: [
                      {
                        at: new Date(),
                        access: "deny",
                        code: "5555555",
                      },
                      {
                        at: new Date(),
                        access: "grant",
                        code: "666666",
                        accessUserId: masterId,
                      },
                      {
                        at: new Date(),
                        access: "grant",
                        code: "999999",
                        accessUserId: 1500,
                      },
                    ],
                  },
                },
                {
                  name: "Back Door",
                  position: 2,
                  accessUsers: {
                    connect: [
                      { id: masterId },
                      { id: brooklynGuest1Id },
                      { id: brooklynGuest2Id },
                      { id: staffId },
                      { id: repairId },
                    ],
                  },
                },
                {
                  name: "Basement Outside",
                  description: "Guests are not allowed.",
                  position: 3,
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
                  position: 4,
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
                  position: 1,
                  accessUsers: {
                    connect: [
                      { id: masterId },
                      { id: brooklynGuest1Id },
                      { id: staffId },
                      { id: repairId },
                    ],
                  },
                },
                {
                  name: "2nd Floor Back",
                  position: 2,
                  accessUsers: {
                    connect: [
                      { id: masterId },
                      { id: brooklynGuest1Id },
                      { id: staffId },
                      { id: repairId },
                    ],
                  },
                },
                {
                  name: "3rd Floor Front",
                  position: 3,
                  accessUsers: {
                    connect: [
                      { id: masterId },
                      { id: brooklynGuest2Id },
                      { id: staffId },
                      { id: repairId },
                    ],
                  },
                },
                {
                  name: "3rd Floor Back",
                  position: 4,
                  accessUsers: {
                    connect: [
                      { id: masterId },
                      { id: brooklynGuest2Id },
                      { id: staffId },
                      { id: repairId },
                    ],
                  },
                },
                {
                  name: "Unused",
                  position: 5,
                },
                {
                  name: "Unused",
                  position: 6,
                },
              ],
            },
          },
        ],
      },
    },
  });
  await db.accessLocation.create({
    data: {
      name: "Staten Island BnB",
      accessManagers: {
        create: [
          {
            accessPoints: {
              create: [
                {
                  name: "Front Door",
                  position: 1,
                  accessUsers: {
                    connect: [{ id: masterId }, { id: siGuestId }],
                  },
                },
                {
                  name: "Unused",
                  position: 2,
                },
                {
                  name: "Unused",
                  position: 3,
                },
                {
                  name: "Unused",
                  position: 4,
                },
              ],
            },
          },
        ],
      },
    },
  });
}

seed();
