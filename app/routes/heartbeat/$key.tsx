import type { LoaderFunction } from "remix";
import { json } from "remix";
import { db } from "~/utils/db.server";

export const loader: LoaderFunction = async ({ params }) => {
  const accessPoint = await db.accessPoint.findUnique({
    where: { key: params.key },
  });
  if (!accessPoint) {
    throw new Response("Key not found.", {
      status: 404,
    });
  }
  const updatedAccessPoint = await db.accessPoint.update({
    where: { id: accessPoint.id },
    data: { heartbeatAt: new Date(), heartbeats: { increment: 1 } },
  });

  return json({ accessPoint: updatedAccessPoint }, 200);
};
