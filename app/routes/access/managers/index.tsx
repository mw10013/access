import { Fragment } from "react";
import {
  BriefcaseIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  LinkIcon,
  LocationMarkerIcon,
  PencilIcon,
} from "@heroicons/react/solid";
import { Menu, Transition } from "@headlessui/react";
import type { LoaderFunction } from "remix";
import { useLoaderData, Link } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import { Table, Th } from "~/components/lib";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type LoaderData = {
  accessManagers: Prisma.AccessManagerGetPayload<{}>[];
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData> => {
  const userId = await requireUserId(request);
  const accessManagers = await db.accessManager.findMany({
    where: {
      user: { id: Number(userId) },
    },
    orderBy: { name: "asc" },
  });
  return { accessManagers };
};

export default function RouteComponent() {
  const { accessManagers } = useLoaderData<LoaderData>();
  return (
    <>
      <header className="p-8">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="flex-1 min-w-0">
            <nav className="flex" aria-label="Breadcrumb">
              <ol role="list" className="flex items-center space-x-4">
                <li>
                  <div className="flex">
                    <Link
                      to="."
                      className="text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      Managers
                    </Link>
                  </div>
                </li>
                {/* <li>
                  <div className="flex items-center">
                    <ChevronRightIcon
                      className="flex-shrink-0 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <a
                      href="#"
                      className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      Engineering
                    </a>
                  </div>
                </li> */}
              </ol>
            </nav>
            <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Managers
            </h2>
          </div>
        </div>
      </header>

      <main className="">
        <div className="max-w-7xl mx-auto sm:px-8">
          <Table
            headers={
              <>
                <Th>Name</Th>
                <Th>Id</Th>
                <Th>Description</Th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </>
            }
          >
            {accessManagers.map((i) => (
              <tr key={i.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {i.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {i.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {i.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`${i.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View
                  </Link>{" "}
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </main>
    </>
  );
}
