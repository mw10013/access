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
            {/* <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <BriefcaseIcon
                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                Full-time
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <LocationMarkerIcon
                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                Remote
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <CurrencyDollarIcon
                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                $120k &ndash; $140k
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <CalendarIcon
                  className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
                Closing on January 9, 2020
              </div>
            </div>  */}
          </div>

          {/* <div className="mt-5 flex lg:mt-0 lg:ml-4"> */}
          {/* <span className="hidden sm:block">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PencilIcon
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                Edit
              </button>
            </span>
            <span className="hidden sm:block ml-3">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LinkIcon
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                View
              </button>
            </span>
            <span className="sm:ml-3">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <CheckIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Publish
              </button>
            </span> */}

          {/* Dropdown */}
          {/* <Menu as="span" className="ml-3 relative sm:hidden">
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
                      <a
                        href="#"
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "block px-4 py-2 text-sm text-gray-700"
                        )}
                      >
                        Edit
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "block px-4 py-2 text-sm text-gray-700"
                        )}
                      >
                        View
                      </a>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu> */}
          {/* </div> */}
        </div>
      </header>

      <main className="">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
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
