import type { LoaderFunction } from "remix";
import { json } from "remix";
import { db } from "~/utils/db.server";

export const loader: LoaderFunction = async ({ params: { key } }) => {
  const accessPoint = await db.accessPoint.findUnique({
    where: { key },
  });
  if (!accessPoint) {
    throw new Response("Key not found.", {
      status: 404,
    });
  }
  const updatedAccessPoint = await db.accessPoint.update({
    where: { id: accessPoint.id },
    data: { heartbeatAt: new Date() },
    include: { cachedConfig: true },
  });

  return json({ accessPoint: updatedAccessPoint }, 200);
};
