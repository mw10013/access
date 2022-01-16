import type { ActionFunction } from "remix";
import { json } from "remix";
import { db } from "~/utils/db.server";
import * as _ from "lodash";
import { z } from "zod";

const AccessConfigData = z.object({
  accessUsers: z.array(
    z
      .object({
        id: z.number().int(),
        code: z.string().nonempty(),
      })
      .strict()
  ),
});

type AccessConfigData = z.infer<typeof AccessConfigData>;

const HeartbeatRequestData = z
  .object({
    accessManager: z
      .object({
        id: z.number().int(),
        accessPoints: z.array(
          z
            .object({
              id: z.number().int(),
              config: AccessConfigData,
              activity: z
                .object({
                  since: z.string().nonempty(),
                  accessEvents: z.array(
                    z
                      .object({
                        at: z.string().nonempty(), // JSON date
                        access: z.literal("grant").or(z.literal("deny")),
                        code: z.string().nonempty(),
                        accessUserId: z.number().int().optional(),
                      })
                      .strict()
                  ),
                })
                .strict()
                .optional(),
            })
            .strict()
        ),
      })
      .strict(),
  })
  .strict();

type HeartbeatRequestData = z.infer<typeof HeartbeatRequestData>;

type HeartbeatResponseData = {
  accessManager: {
    id: number;
    accessPoints: {
      id: number;
      config: AccessConfigData;
      activity: {
        since: string; // JSON date
      };
    }[];
  };
};

export const action: ActionFunction = async ({ request }) => {
  const data = HeartbeatRequestData.parse(await request.json());

  const accessManager = await db.accessManager.findUnique({
    where: { id: data.accessManager.id },
    include: {
      accessPoints: {
        orderBy: { position: "asc" },
        include: {
          accessUsers: true,
          accessEvents: { distinct: "accessPointId", orderBy: { at: "desc" } },
        },
      },
    },
  });
  if (!accessManager) {
    return json(
      {
        error: {
          name: "NotFoundError",
          message: `Access manager ${data.accessManager.id} not found.`,
        },
      },
      { status: 404 }
    );
  }

  if (
    !_.isEqual(
      new Set(accessManager.accessPoints.map((i) => i.id)),
      new Set(data.accessManager.accessPoints.map((i) => i.id))
    )
  ) {
    return json(
      {
        error: {
          name: "BadRequestError",
          message: `Dreadful access point id's.`,
        },
      },
      { status: 404 }
    );
  }

  // TODO: check that since matches and events later than since.

  const updatedAccessManager = await db.accessManager.update({
    where: { id: accessManager.id },
    data: {
      accessPoints: {
        update: data.accessManager.accessPoints.map((i) => {
          const accessUsersAsJson = JSON.stringify(
            i.config.accessUsers.map((u) => ({ id: u.id, code: u.code }))
          );
          return {
            where: { id: i.id },
            data: {
              heartbeatAt: new Date(),
              cachedConfig: {
                upsert: {
                  update: { accessUsers: accessUsersAsJson },
                  create: { accessUsers: accessUsersAsJson },
                },
              },
              accessEvents: {
                create: i.activity
                  ? i.activity.accessEvents.map((e) => ({
                      at: e.at,
                      access: e.access,
                      code: e.code,
                      accessUserId: e.accessUserId,
                    }))
                  : [],
              },
            },
          };
        }),
      },
    },
  });

  const responseData: HeartbeatResponseData = {
    accessManager: {
      id: accessManager.id,
      accessPoints: accessManager.accessPoints.map((i) => ({
        id: i.id,
        config: {
          accessUsers: i.accessUsers.map((u) => ({
            id: u.id,
            code: u.code,
          })),
        },
        activity: {
          since: (i.accessEvents.length === 0
            ? new Date(0)
            : i.accessEvents[0].at
          ).toJSON(),
        },
      })),
    },
  };

  return json(responseData, 200);
};
