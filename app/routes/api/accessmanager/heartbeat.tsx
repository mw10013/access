import type { ActionFunction } from "remix";
import { json } from "remix";
import { db } from "~/utils/db.server";
import * as _ from "lodash";
import { identity } from "lodash";

type HeartbeatData = {
  accessManager: {
    id: number;
    accessPoints: {
      id: number;
      config: {
        accessUsers: { id: number; code: string }[];
      };
    }[];
  };
};

type ReturnData = HeartbeatData;

function isHeartbeatData(data: any): data is HeartbeatData {
  if (!data || typeof data !== "object") {
    return false;
  }
  const { accessManager } = data;
  if (
    !accessManager ||
    typeof accessManager !== "object" ||
    typeof accessManager.id !== "number" ||
    !Array.isArray(accessManager.accessPoints)
  ) {
    return false;
  }
  for (const accessPoint of accessManager.accessPoints) {
    if (
      !accessPoint ||
      typeof accessPoint !== "object" ||
      typeof accessPoint.id !== "number" ||
      !accessPoint.config ||
      typeof accessPoint.config !== "object" ||
      !Array.isArray(accessPoint.config.accessUsers)
    ) {
      return false;
    }
    for (const user of accessPoint.config.accessUsers) {
      if (
        !user ||
        typeof user !== "object" ||
        typeof user.id !== "number" ||
        typeof user.code !== "string"
      ) {
        return false;
      }
    }
  }
  return true;
}

export const action: ActionFunction = async ({ request }) => {
  const data = await request.json();
  if (!isHeartbeatData(data)) {
    return json(
      {
        error: {
          name: "BadRequestError",
          message: `Malformed data.`,
        },
      },
      { status: 400 }
    );
  }

  const accessManager = await db.accessManager.findUnique({
    where: { id: data.accessManager.id },
    include: {
      accessPoints: {
        orderBy: { position: "asc" },
        include: { accessUsers: { where: { enabled: true } } },
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
            },
          };
        }),
      },
    },
  });

  const returnData: ReturnData = {
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
      })),
    },
  };

  return json(returnData, 200);
};
