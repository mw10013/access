import type { ActionFunction } from "remix";
import { json } from "remix";
import { db } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {
  const { id, config } = await request.json();
  const accessPoint =
    typeof id === "number" &&
    (await db.accessPoint.findUnique({
      where: { id },
    }));
  console.log({ accessPoint });
  if (!accessPoint) {
    throw new Response("Access point not found.", {
      status: 404,
    });
  }

  const { code, accessCheckPolicy } = config;
  console.log({ code, type: typeof code });
  if (
    typeof code !== "string" ||
    (code.length > 0 &&
      (code.length < 3 || code.length > 8 || !/^\d+$/.test(code)))
  ) {
    throw new Response(
      `Malformed code. Code must be a string containing 3 to 8 digits or empty string.`,
      { status: 400 }
    );
  }

  if (
    accessCheckPolicy !== "manager-only" &&
    accessCheckPolicy !== "manager-first" &&
    accessCheckPolicy !== "point-only"
  ) {
    throw new Response(
      `accessCheckPolicy must be "manager-only" | "manager-first" | "point-only".`,
      { status: 400 }
    );
  }

  const updatedAccessPoint = await db.accessPoint.update({
    where: { id: accessPoint.id },
    data: { heartbeatAt: new Date() },
  });

  const cachedConfig = await db.accessPointCachedConfig.upsert({
    where: { accessPointId: accessPoint.id },
    update: { code, accessCheckPolicy },
    create: { accessPointId: accessPoint.id, code, accessCheckPolicy },
  });

  return json(
    {
      config: {
        code: updatedAccessPoint.code,
        accessCheckPolicy: updatedAccessPoint.accessCheckPolicy,
      },
    },
    200
  );
};
