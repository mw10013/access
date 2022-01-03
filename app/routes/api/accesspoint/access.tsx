import type { ActionFunction } from "remix";
import { json } from "remix";
import { db } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {
  const { id, code } = await request.json();

  const accessPoint =
    typeof id === "number" &&
    (await db.accessPoint.findUnique({
      where: { id },
      include: {
        codes: {
          where: { code: { not: "" }, enabled: true },
        },
      },
    }));
  if (!accessPoint) {
    throw new Response("Access point not found.", {
      status: 404,
    });
  }
  return json(
    {
      access: accessPoint.codes.some((el) => el.code === code)
        ? "grant"
        : "deny",
    },
    200
  );
};
