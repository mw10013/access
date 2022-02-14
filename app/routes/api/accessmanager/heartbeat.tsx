import type { ActionFunction } from "remix";
import { json } from "remix";
import { db } from "~/utils/db.server";
import * as _ from "lodash";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const accessUserSelect = (accessManagerId: number) => {
  return Prisma.validator<Prisma.AccessUserArgs>()({
    select: {
      id: true,
      name: true,
      code: true,
      activateCodeAt: true,
      expireCodeAt: true,
      accessPoints: {
        select: { id: true, name: true },
        where: { accessManager: { id: accessManagerId } },
      },
    },
  });
};

type AccessUser = Prisma.AccessUserGetPayload<
  ReturnType<typeof accessUserSelect>
>;

const HeartbeatRequestData = z.object({
  accessManager: z
    .object({
      id: z.number().int(),
      cloudLastAccessEventAt: z // JSON date
        .string()
        .nullable()
        .refine((v) => !v || v.length === 0 || !Number.isNaN(Date.parse(v)), {
          message: "Invalid date time",
        })
        .transform((v) => (v && v.length > 0 ? new Date(v) : null)),
      accessEvents: z.array(
        z
          .object({
            at: z // JSON Date
              .string()
              .refine((v) => v.length === 0 || !Number.isNaN(Date.parse(v)), {
                message: "Invalid date time",
              })
              .transform((v) => new Date(v)),
            access: z.literal("grant").or(z.literal("deny")),
            code: z.string().min(1),
            accessUserId: z.number().int().optional(),
            accessPointId: z.number().int(),
          })
          .strict()
      ),
    })
    .strict(),
});
type HeartbeatRequestData = z.infer<typeof HeartbeatRequestData>;

type HeartbeatResponseData = {
  accessManager: {
    id: number;
    cloudLastAccessEventAt: string; // JSON date
    accessUsers: AccessUser[];
  };
};

export const action: ActionFunction = async ({ request }) => {
  const parseResult = HeartbeatRequestData.safeParse(await request.json());
  if (!parseResult.success) {
    return new Response(`${parseResult.error.toString()}`, { status: 400 });
  }
  const data = parseResult.data;

  const accessManager = await db.accessManager.findUnique({
    where: { id: data.accessManager.id },
  });
  if (!accessManager) {
    return new Response(`Access manager ${data.accessManager.id} not found.`, {
      status: 404,
    });
  }

  // TODO: check that cloudLastAccessEventAt not null and  matches and validate events:
  // later than cloudLastAccessEventAt, grants have user id, 
  // access user and point id's belong to user
  // Write events
  const updatedAccessManager = await db.accessManager.update({
    where: { id: accessManager.id },
    data: {
      heartbeatAt: new Date(),
    },
  });

  const lastAccessEvent = await db.accessEvent.findFirst({
    where: {
      accessPoint: { accessManager: { id: accessManager.id } },
    },
    orderBy: {
      at: "desc",
    },
  });

  // const updatedAccessManager = await db.accessManager.update({
  //   where: { id: accessManager.id },
  //   data: {
  //     accessPoints: {
  //       update: data.accessManager.accessPoints.map((i) => {
  //         return {
  //           where: { id: i.id },
  //           data: {
  //             heartbeatAt: new Date(),
  //             accessEvents: {
  //               create: i.activity
  //                 ? i.activity.accessEvents.map((e) => ({
  //                     at: e.at,
  //                     access: e.access,
  //                     code: e.code,
  //                     accessUserId: e.accessUserId,
  //                   }))
  //                 : [],
  //             },
  //           },
  //         };
  //       }),
  //     },
  //   },
  // });

  // const responseData: HeartbeatResponseData = {
  //   accessManager: {
  //     id: accessManager.id,
  //     accessPoints: accessManager.accessPoints.map((i) => ({
  //       id: i.id,
  //       config: {
  //         accessUsers: i.accessUsers.map((u) => ({
  //           id: u.id,
  //           code: u.code,
  //           activateCodeAt: u.activateCodeAt,
  //           expireCodeAt: u.expireCodeAt,
  //         })),
  //       },
  //       activity: {
  //         since: (i.accessEvents.length === 0
  //           ? new Date(0)
  //           : i.accessEvents[0].at
  //         ).toJSON(),
  //       },
  //     })),
  //   },
  // };

  const accessUsers = await db.accessUser.findMany({
    where: {
      deletedAt: new Date(0),
      OR: [{ expireCodeAt: null }, { expireCodeAt: { gt: new Date() } }],
      accessPoints: { some: { accessManager: { id: accessManager.id } } },
    },
    ...accessUserSelect(accessManager.id),
  });

  const responseData: HeartbeatResponseData = {
    accessManager: {
      id: accessManager.id,
      cloudLastAccessEventAt: (lastAccessEvent
        ? lastAccessEvent.at
        : new Date(0)
      ).toJSON(),
      accessUsers,
    },
  };
  return json(responseData, 200);
};
