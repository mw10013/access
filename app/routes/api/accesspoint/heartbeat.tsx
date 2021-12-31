import type { ActionFunction } from "remix";
import { json } from "remix";
import { db } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {
  const { key, config } = await request.json();
  console.dir({ key, config });
  const accessPoint =
    key &&
    (await db.accessPoint.findUnique({
      where: { key },
    }));
  if (!accessPoint) {
    throw new Response("Key not found.", {
      status: 404,
    });
  }

  const updatedAccessPoint = await db.accessPoint.update({
    where: { id: accessPoint.id },
    data: { heartbeatAt: new Date(), heartbeats: { increment: 1 } },
  });

  // const user = await prisma.user.upsert({
  //   where: { id: 1 },
  //   update: { email: 'alice@prisma.io' },
  //   create: { email: 'alice@prisma.io' },
  // })

  const cachedConfig = await db.accessPointCachedConfig.upsert({
    where: { accessPointId: accessPoint.id },
    update: { code: config.code },
    create: { accessPointId: accessPoint.id, code: config.code}
  })


  return json({ accessPoint: updatedAccessPoint, cachedConfig }, 200);
};
