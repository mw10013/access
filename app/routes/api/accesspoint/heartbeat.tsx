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
        codes: {
          where: { code: { not: "" }, enabled: true },
          orderBy: { code: "asc" },
        },
      },
    }));
  if (!accessPoint) {
    throw new Response("Access point not found.", {
      status: 404,
    });
  }
  if (!config) {
    throw (
      (new Response("Config required"),
      {
        status: 400,
      })
    );
  }

  const { codes, accessCheckPolicy } = config;
  if (isCodesMalformed(codes)) {
    throw new Response(
      `Malformed codes. Must be an array of strings containing 3 to 8 digits.`,
      { status: 400 }
    );
  }

  if (
    accessCheckPolicy !== "cloud-only" &&
    accessCheckPolicy !== "cloud-first" &&
    accessCheckPolicy !== "point-only"
  ) {
    throw new Response(
      `accessCheckPolicy must be "cloud-only" | "cloud-first" | "point-only".`,
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
    update: { accessCheckPolicy, codes: codesAsJson },
    create: {
      accessPointId: accessPoint.id,
      codes: codesAsJson,
      accessCheckPolicy,
    },
  });

  return json(
    {
      config: {
        accessCheckPolicy: updatedAccessPoint.accessCheckPolicy,
        codes: accessPoint.codes.map((el) => el.code),
      },
    },
    200
  );
};
