import { LoaderFunction, useFormAction } from "remix";
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
  PaperClipIcon,
  PencilIcon,
} from "@heroicons/react/solid";
import { Fragment } from "react";
import {
  Breadcrumbs,
  Button,
  Table,
  TdProminent,
  Td,
  Th,
  ThSr,
  TdLink,
} from "~/components/lib";

const attachments = [
  { name: "resume_front_end_developer.pdf", href: "#" },
  { name: "coverletter_front_end_developer.pdf", href: "#" },
];

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
  const { accessPoint } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const submit = useSubmit();
  const removeFormActionBase = useFormAction("users");
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
            <span className="hidden sm:block">
              <Button variant="white" onClick={() => navigate("raw")}>
                <CheckIcon
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                Raw
              </Button>
            </span>
            <span className="hidden sm:block ml-3">
              <Button variant="white" onClick={() => navigate("activity")}>
                <LinkIcon
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                Activity
              </Button>
            </span>
            <span className="sm:ml-3">
              <Button onClick={() => navigate("edit")}>
                <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Edit
              </Button>
            </span>

            {/* Dropdown */}
            <Menu as="span" className="ml-3 relative sm:hidden">
              <Menu.Button as={Fragment}>
                <Button variant="white">
                  More
                  <ChevronDownIcon
                    className="-mr-1 ml-2 h-5 w-5 text-gray-500"
                    aria-hidden="true"
                  />
                </Button>
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

      <main className="max-w-7xl mx-auto sm:px-8 space-y-6 pb-8">
        {/* <div className="max-w-3xl mx-auto grid grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3"> */}
        <div className="max-w-3xl mx-auto grid grid-cols-1 gap-6 sm:px-6 ">
          {/* <div className="space-y-6 lg:col-start-1 lg:col-span-2"> */}
          <div className="space-y-6 ">
            {/* Description list*/}
            <section aria-labelledby="access-point-details">
              <div className="bg-white shadow sm:rounded-lg">
                <div className="border-t border-gray-200 px-6 py-5">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Manager
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {accessPoint.accessManager.name}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">ID</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {accessPoint.id}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Position
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {accessPoint.position}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Heartbeat
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {accessPoint.heartbeatAt
                          ? new Date(accessPoint.heartbeatAt).toLocaleString()
                          : null}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">
                        Description
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {accessPoint.description}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </section>
          </div>
        </div>
        <section>
          <div className="bg-white pt-6 shadow sm:rounded-md sm:overflow-hidden">
            <div className="px-4 sm:px-6 flex items-center justify-between">
              <h2
                id="access-points-heading"
                className="text-lg leading-6 font-medium text-gray-900"
              >
                Users with Access
              </h2>
              <Button onClick={() => navigate("users/add")}>Add</Button>
            </div>
            <div className="mt-6">
              <Table
                headers={
                  <>
                    <Th>Name</Th>
                    <Th>Description</Th>
                    <Th>Code</Th>
                    <ThSr>View</ThSr>
                  </>
                }
              >
                {accessPoint.accessUsers.map((i) => (
                  <tr key={i.id}>
                    <TdProminent>{i.name}</TdProminent>
                    <Td>{i.description}</Td>
                    <Td>{i.code}</Td>
                    <TdLink
                      to="#"
                      onClick={(e) => {
                        e.preventDefault();
                        submit(null, {
                          method: "post",
                          action: `${removeFormActionBase}/${i.id}/remove`,
                        });
                      }}
                    >
                      Remove
                    </TdLink>
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
