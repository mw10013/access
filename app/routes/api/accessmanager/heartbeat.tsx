import type { ActionFunction } from "remix";
import { json } from "remix";
import { db } from "~/utils/db.server";

export type ActionData = {
  accessManager: {
    id: number;
    accessPoints: {
      id: number;
      config: {
        users: { id: number; code: string }[];
      };
    }[];
  };
};

function isActionData(data: any): data is ActionData {
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
      !Array.isArray(accessPoint.config.users)
    ) {
      return false;
    }
    for (const user of accessPoint.config.users) {
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
  console.log({ fn: "action", data });
  if (!isActionData(data)) {
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

  const returnData: ActionData = {
    accessManager: {
      id: accessManager.id,
      accessPoints: accessManager.accessPoints.map((i) => ({
        id: i.id,
        config: {
          users: i.accessUsers.map((u) => ({
            id: u.id,
            code: u.code,
          })),
        },
      })),
    },
  };

  return json(returnData, 200);

  /*
  const { id, config } = await request.json();
  const accessPoint =
    typeof id === "number" &&
    (await db.accessPoint.findUnique({
      where: { id },
      include: {
        accessUsers: {
          where: { code: { not: "" }, enabled: true },
          orderBy: { code: "asc" },
        },
      },
    }));
  if (!accessPoint) {
    return json(
      {
        error: {
          name: "NotFoundError",
          message: `Access point ${id} not found.`,
        },
      },
      { status: 404 }
    );
  }
  if (!config) {
    return json(
      {
        error: {
          name: "BadRequestError",
          message: `Config required.`,
        },
      },
      { status: 400 }
    );
  }

  const { codes } = config;
  if (isCodesMalformed(codes)) {
    return json(
      {
        error: {
          name: "BadRequestError",
          message: `Malformed codes. Must be an array of strings containing 3 to 8 digits.`,
        },
      },
      { status: 400 }
    );
  }

  const updatedAccessPoint = await db.accessPoint.update({
    where: { id: accessPoint.id },
    data: { heartbeatAt: new Date() },
  });

  const codesAsJson = JSON.stringify([...new Set(codes)].sort());
  await db.accessPointCachedConfig.upsert({
    where: { accessPointId: accessPoint.id },
    update: { codes: codesAsJson },
    create: {
      accessPointId: accessPoint.id,
      codes: codesAsJson,
    },
  });

  return json(
    {
      config: {
        codes: accessPoint.accessUsers.map((el) => el.code),
      },
    },
    200
  );
  */
};
