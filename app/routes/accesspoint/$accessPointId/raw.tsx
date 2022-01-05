import * as React from "react";
import type { LoaderFunction } from "remix";
import { useLoaderData, useNavigate } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = {
  accessPoint: Prisma.AccessPointGetPayload<{
    include: { accessUsers: true; cachedConfig: true };
  }>;
};

export const loader: LoaderFunction = async ({
  params: { accessPointId: id },
}) => {
  const accessPoint = await db.accessPoint.findUnique({
    where: { id: Number(id) },
    include: { accessUsers: { orderBy: { name: "asc" } }, cachedConfig: true },
  });
  if (!accessPoint) {
    throw new Response("Access point not found.", {
      status: 404,
    });
  }
  const data: LoaderData = { accessPoint };
  return data;
};

export default function RawRoute() {
  const data = useLoaderData<LoaderData>();
  const [poll, setPoll] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (poll) {
      const intervalId = setInterval(
        () => navigate(".", { replace: true }),
        5000
      );
      return () => clearInterval(intervalId);
    }
  }, [navigate, poll]);

  return (
    <div className="p-8">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold leading-7 text-gray-900">Raw</h1>
        <div className="relative flex items-start">
          <div className="flex items-center h-5">
            <input
              id="poll"
              aria-describedby="comments-description"
              name="poll"
              type="checkbox"
              checked={poll}
              onChange={() => setPoll(!poll)}
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="poll" className="font-medium text-gray-700">
              Poll
            </label>
          </div>
        </div>
      </div>

      <pre className="mt-4">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
