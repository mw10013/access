import { Fragment } from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  LinkIcon,
  LocationMarkerIcon,
  PencilIcon,
} from "@heroicons/react/solid";
import { Menu, Transition } from "@headlessui/react";
import { LoaderFunction, useMatches } from "remix";
import { useLoaderData, Link, useNavigate } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import { Breadcrumbs, Button, Table, Th } from "~/components/lib";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type LoaderData = {
  accessManager: Prisma.AccessManagerGetPayload<{
    include: {
      accessPoints: true;
    };
  }>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { accessManagerId },
}): Promise<LoaderData> => {
  const userId = await requireUserId(request);
  const accessManager = await db.accessManager.findFirst({
    where: { id: Number(accessManagerId), user: { id: Number(userId) } },
    include: {
      accessPoints: {
        orderBy: { position: "asc" },
      },
    },
    rejectOnNotFound: true,
  });
  return { accessManager };
};

export default function RouteComponent() {
  const navigate = useNavigate();
  const { accessManager } = useLoaderData<LoaderData>();
  return (
    <>
      <header className="p-8">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="flex-1 min-w-0">
            <Breadcrumbs />
            <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {accessManager.name}
            </h2>
            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <LocationMarkerIcon
                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                {accessManager.description}
              </div>
            </div>
          </div>

          <div className="mt-5 flex lg:mt-0 lg:ml-4">
            <span className="hidden sm:block">
              <Button onClick={() => navigate("mock")}>
                <PencilIcon
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                Mock
              </Button>
            </span>

            <span className="hidden sm:block ml-3">
              <Button onClick={() => navigate("raw")}>
                <CheckIcon
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                Raw
              </Button>
            </span>
            <span className="hidden sm:block ml-3">
              <Button onClick={() => navigate("activity")}>
                <LinkIcon
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                Activity
              </Button>
            </span>
            <span className="sm:ml-3">
              <Button variant="primary" onClick={() => navigate("edit")}>
                <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Edit
              </Button>
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
                        to="mock"
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "block px-4 py-2 text-sm text-gray-700"
                        )}
                      >
                        Mock
                      </Link>
                    )}
                  </Menu.Item>
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
      <main className="max-w-7xl mx-auto sm:px-8 space-y-6 pb-8">
        <section>
          <div className="bg-white pt-6 shadow sm:rounded-md sm:overflow-hidden">
            <div className="px-4 sm:px-6">
              <h2
                id="access-points-heading"
                className="text-lg leading-6 font-medium text-gray-900"
              >
                Access Points
              </h2>
            </div>
            <div className="mt-6">
              <Table
                headers={
                  <>
                    <Th>Position</Th>
                    <Th>Name</Th>
                    <Th>Description</Th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">View</span>
                    </th>
                  </>
                }
              >
                {accessManager.accessPoints.map((i) => (
                  <tr key={i.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {i.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {i.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {i.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`../points/${i.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
