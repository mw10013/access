import type { ActionFunction } from "remix";
import { json } from "remix";
import { db } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {
  const { key, config } = await request.json();
  const accessPoint =
    typeof key === "string" &&
    (await db.accessPoint.findUnique({
      where: { key },
    }));
  if (!accessPoint) {
    throw new Response("Key not found.", {
      status: 404,
    });
  }

  const { code } = config;
  if (
    typeof code !== "string" ||
    (code.length > 0 &&
      (code.length < 3 || code.length > 8 || !/^\d+$/.test(code)))
  ) {
    throw new Response("Malformed code", { status: 400 });
  }

  const updatedAccessPoint = await db.accessPoint.update({
    where: { id: accessPoint.id },
    data: { heartbeatAt: new Date(), heartbeats: { increment: 1 } },
  });

  const cachedConfig = await db.accessPointCachedConfig.upsert({
    where: { accessPointId: accessPoint.id },
    update: { code },
    create: { accessPointId: accessPoint.id, code },
  });

  return json({ accessPoint: updatedAccessPoint, cachedConfig }, 200);
};
