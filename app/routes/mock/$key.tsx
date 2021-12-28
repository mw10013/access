import type { LoaderFunction } from "remix";
import { useLoaderData } from "remix";
import type { AccessPoint } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = { accessPoint: AccessPoint };

export const loader: LoaderFunction = async ({ params: { key } }) => {
  const accessPoint = await db.accessPoint.findUnique({
    where: { key },
  });
  if (!accessPoint) {
    throw new Response("Key not found.", {
      status: 404,
    });
  }
  const data: LoaderData = { accessPoint };
  return data;
};

export default function MockRoute() {
  const { accessPoint } = useLoaderData<LoaderData>();
  return <div>{accessPoint.key}</div>;
}
