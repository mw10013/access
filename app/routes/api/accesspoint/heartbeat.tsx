import type { ActionFunction } from "remix";
import { json } from "remix";
import { db } from "~/utils/db.server";

function isCodesMalformed(codes: any) {
  if (Array.isArray(codes)) {
    return codes.some(
      (el) =>
        typeof el !== "string" ||
        el.length < 3 ||
        el.length > 8 ||
        !/^\d+$/.test(el)
    );
  }
  return true;
}

export const action: ActionFunction = async ({ request }) => {
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
};
