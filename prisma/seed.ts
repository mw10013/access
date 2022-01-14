import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

const DAY_MS = 24 * 60 * 60 * 1000;

async function seed() {
  const aunt = await db.user.create({
    data: {
      email: "aunt@genteelbnb.com",
      // this is a hashed version of "elegant"
      passwordHash:
        "$2a$10$ll1X9ln2B/jwu2465hUBbuRb7SK3KSdL3AhMVvJv7t.M4Zr39Wnka",
    },
  });
  const installer = await db.user.create({
    data: {
      email: "installer@install.com",
      // this is a hashed version of "twixrox"
      passwordHash:
        "$2a$10$uU.0Utt.Ne3q0Vl1Ocj0fuoiQ9Q2xcYrcWWMrzxX4o22pyLY3Fr5q",
    },
  });
  const { id: masterId } = await db.accessUser.create({
    data: {
      name: "Master",
      description: "Access to everything",
      code: "555",
      enabled: true,
      userId: aunt.id,
    },
  });
  const { id: brooklynGuest1Id } = await db.accessUser.create({
    data: {
      name: "Brooklyn BnB Guest 1",
      description: "Second floor of Brooklyn BnB.",
      code: "111",
      enabled: true,
      userId: aunt.id,
    },
  });
  const { id: brooklynGuest2Id } = await db.accessUser.create({
    data: {
      name: "Brooklyn BnB Guest 2",
      description: "Third floor of Brooklyn BnB.",
      code: "222",
      enabled: false,
      userId: aunt.id,
    },
  });
  const { id: siGuestId } = await db.accessUser.create({
    data: {
      name: "Staten Island BnB Guest 1",
      code: "13795",
      enabled: true,
      userId: aunt.id,
    },
  });
  const { id: staffId } = await db.accessUser.create({
    data: { name: "Staff", code: "333", enabled: true, userId: aunt.id },
  });
  const { id: repairId } = await db.accessUser.create({
    data: {
      name: "Repair",
      description: "For repairs as necessary.",
      code: "444",
      enabled: false,
      userId: aunt.id,
    },
  });
  const { id: testerId } = await db.accessUser.create({
    data: { name: "Test", code: "333", enabled: true, userId: installer.id },
  });

  await db.accessLocation.create({
    data: {
      name: "Brooklyn BnB",
      accessManagers: {
        create: [
          {
            name: "Brooklyn BnB",
            userId: aunt.id,
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
                        at: new Date(Date.now() - 30 * DAY_MS),
                        access: "deny",
                        code: "5555555",
                      },
                      {
                        at: new Date(Date.now() - 28 * DAY_MS),
                        access: "grant",
                        code: "666666",
                        accessUserId: masterId,
                      },
                      {
                        at: new Date(Date.now() - 25 * DAY_MS),
                        access: "grant",
                        code: "111",
                        accessUserId: brooklynGuest1Id,
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
                {
                  name: "2nd Floor Front",
                  position: 5,
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
                  position: 6,
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
                  position: 7,
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
                  position: 8,
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
                  position: 9,
                },
                {
                  name: "Unused",
                  position: 10,
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
            name: "Staten Island BnB",
            userId: aunt.id,
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
  await db.accessLocation.create({
    data: {
      name: "Installation Site",
      accessManagers: {
        create: {
          name: "Install Mgr",
          userId: installer.id,
          accessPoints: {
            create: [
              {
                name: "Front Door",
                position: 1,
                accessUsers: {
                  connect: { id: testerId },
                },
              },
              {
                name: "Back Door",
                position: 2,
                accessUsers: {
                  connect: { id: testerId },
                },
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
      },
    },
  });
}

seed();
