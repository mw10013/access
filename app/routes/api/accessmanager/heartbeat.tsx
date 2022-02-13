import type { ActionFunction } from "remix";
import { json } from "remix";
import { db } from "~/utils/db.server";
import * as _ from "lodash";
import { z } from "zod";
import { Prisma } from "@prisma/client";

// const accessUserSelect = Prisma.validator<Prisma.AccessUserArgs>()({
//   select: {
//     id: true,
//     name: true,
//     code: true,
//     activateCodeAt: true,
//     expireCodeAt: true,
//     accessPoints: {
//       select: { id: true, name: true },
//       where: { accessManager: {id: 1}}
//     },
//   },
// });
// type AccessUser = Prisma.AccessUserGetPayload<typeof accessUserSelect>;

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
      activity: z
        .object({
          since: z.string().min(1), // JSON date
          accessEvents: z.array(
            z
              .object({
                at: z.string().min(1), // JSON date
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
    .strict(),
});
type HeartbeatRequestData = z.infer<typeof HeartbeatRequestData>;

type HeartbeatResponseData = {
  accessManager: {
    id: number;
    accessUsers: AccessUser[];
    // activity: {
    //   since: string; // JSON date
    // };
  };
};

export const action: ActionFunction = async ({ request }) => {
  const parseResult = HeartbeatRequestData.safeParse(await request.json());
  if (!parseResult.success) {
    return new Response(`${parseResult.error.toString()}`, { status: 400 });
  }
  const data = parseResult.data;

  // accessEvents: { distinct: "accessPointId", orderBy: { at: "desc" } },
  const accessManager = await db.accessManager.findUnique({
    where: { id: data.accessManager.id },
  });
  if (!accessManager) {
    return new Response(`Access manager ${data.accessManager.id} not found.`, {
      status: 404,
    });
  }

  // TODO: check that since matches and events later than since.
  const updatedAccessManager = await db.accessManager.update({
    where: { id: accessManager.id },
    data: {
      heartbeatAt: new Date(),
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
    // ...accessUserSelect,
    // include: {
    //   accessPoints: {
    //     select: { id: true, name: true },
    //     where: { accessManager: { id: accessManager.id } },
    //   },
    // },
  });

  const responseData: HeartbeatResponseData = {
    accessManager: {
      id: accessManager.id,
      accessUsers,
    },
  };
  console.log({ accessUsers, point: accessUsers[0].accessPoints[0] });
  return json(responseData, 200);
};
