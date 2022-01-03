import * as React from "react";
import type { LoaderFunction } from "remix";
import { Outlet, useParams, useLoaderData, Link, useNavigate } from "remix";
import type { AccessPoint } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

export default function IdRoute() {
  const { accessPointId: id } = useParams();
  return (
    <div className="min-h-[640px] flex">
      <div className="flex flex-col w-64 pt-5 pb-4 px-4">
        <div className="">Access Point</div>
        <div className="">ID: {id}</div>
        <nav className="mt-5 flex-1 space-y-1 flex flex-col">
          <Link to=".">Overview</Link>
          <Link to="edit/settings">Edit Settings</Link>
          <Link to="mock">Mock</Link>
          <Link to="raw">Raw</Link>
        </nav>
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
