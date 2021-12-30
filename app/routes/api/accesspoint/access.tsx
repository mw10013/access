import type { ActionFunction } from "remix";
import { json } from "remix";
import { db } from "~/utils/db.server";

export const action: ActionFunction = async ({ request, params }) => {
  const { key, code } = await request.json();

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
  return json({ access: accessPoint.code !== "" && code === accessPoint.code ? "grant" : "deny" }, 200);
};
