import * as React from "react";
import type { LoaderFunction } from "remix";
import { useLoaderData, useNavigate } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = {
  accessPoint: Prisma.AccessPointGetPayload<{
    include: { cachedConfig: true };
  }>;
};

export const loader: LoaderFunction = async ({ params: { id } }) => {
  const accessPoint = await db.accessPoint.findUnique({
    where: { id: Number(id) },
    include: { cachedConfig: true },
  });
  if (!accessPoint) {
    throw new Response("Access point not found.", {
      status: 404,
    });
  }
  const data: LoaderData = { accessPoint };
  return data;
};

export default function RawlRoute() {
  const data = useLoaderData<LoaderData>();
  const navigate = useNavigate();

  React.useEffect(() => {
    const intervalId = setInterval(
      () => navigate(".", { replace: true }),
      5000
    );
    return () => clearInterval(intervalId);
  }, [navigate]);

  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
