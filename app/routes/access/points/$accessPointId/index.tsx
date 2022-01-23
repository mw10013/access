import type { LoaderFunction } from "remix";
import { useLoaderData, Link, useNavigate, useSubmit } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import { Menu, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronDownIcon,
  LinkIcon,
  LocationMarkerIcon,
  PencilIcon,
} from "@heroicons/react/solid";
import { Fragment } from "react";
import { Breadcrumbs } from "~/components/lib";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type LoaderData = {
  accessPoint: Prisma.AccessPointGetPayload<{
    include: {
      accessUsers: true;
      accessManager: true;
    };
  }>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { accessPointId },
}): Promise<LoaderData> => {
  const userId = await requireUserId(request);
  const accessPoint = await db.accessPoint.findFirst({
    where: {
      id: Number(accessPointId),
      accessManager: { user: { id: Number(userId) } },
    },
    include: {
      accessUsers: { orderBy: { name: "asc" } },
      accessManager: true,
    },
    rejectOnNotFound: true,
  });
  return { accessPoint };
};

export default function RouteComponent() {
  const navigate = useNavigate();
  const submit = useSubmit();
  const { accessPoint } = useLoaderData<LoaderData>();
  return (
    <>
      <header className="p-8">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="flex-1 min-w-0">
            <Breadcrumbs />
            <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {accessPoint.name}
            </h2>
            {accessPoint.description ? (
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <LocationMarkerIcon
                    className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  {accessPoint.description}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-5 flex lg:mt-0 lg:ml-4">
            <span className="hidden sm:block ml-3">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => navigate("raw")}
              >
                <CheckIcon
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                Raw
              </button>
            </span>
            <span className="hidden sm:block ml-3">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => navigate("activity")}
              >
                <LinkIcon
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                Activity
              </button>
            </span>
            <span className="sm:ml-3">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => navigate("edit")}
              >
                <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Edit
              </button>
            </span>

            {/* Dropdown */}
            <Menu as="span" className="ml-3 relative sm:hidden">
              <Menu.Button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                More
                <ChevronDownIcon
                  className="-mr-1 ml-2 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="origin-top-right absolute right-0 mt-2 -mr-1 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="raw"
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "block px-4 py-2 text-sm text-gray-700"
                        )}
                      >
                        Raw
                      </Link>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <Link
                        to="activity"
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "block px-4 py-2 text-sm text-gray-700"
                        )}
                      >
                        Activity
                      </Link>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </header>
      <div className="p-8">
        <div className="flex justify-between">
          <h1 className="text-2xl font-bold leading-7 text-gray-900">
            Access Point
          </h1>
          <div className="flex space-x-2">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-purple-500"
              onClick={() => navigate("raw")}
            >
              Raw
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-purple-500"
              onClick={() => navigate("edit")}
            >
              Edit
            </button>
          </div>
        </div>
        <div className="flex mt-1 space-x-10 text-sm text-gray-500">
          <div className="text-gray-900">{accessPoint.name}</div>
          <div>ID: {accessPoint.id}</div>
          <div>
            Manager:{" "}
            <Link
              to={`../managers/${accessPoint.accessManagerId}`}
              className="text-indigo-600 hover:text-indigo-900"
            >
              {accessPoint.accessManager.name}
            </Link>
          </div>
          <div>Position: {accessPoint.position}</div>
          <div>{accessPoint.description}</div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Users With Access
            </h3>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-purple-500"
              onClick={() => navigate("users/add")}
            >
              Add
            </button>
          </div>
          <div className="max-w-7xl mx-auto">
            <table className="max-width-md divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Code
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accessPoint.accessUsers.map((i) => (
                  <tr key={i.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm  text-gray-500">
                      {i.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <Link
                        to={`../users/${i.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {i.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {i.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {i.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        to="#"
                        className="text-indigo-600 hover:text-indigo-900"
                        onClick={(e) => {
                          e.preventDefault();
                          submit(null, {
                            method: "post",
                            action: `/access/points/${accessPoint.id}/users/${i.id}/remove`,
                          });
                        }}
                      >
                        Remove
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
