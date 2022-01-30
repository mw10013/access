import { LoaderFunction, useFormAction } from "remix";
import { useLoaderData, Link, useNavigate, useSubmit } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserSession } from "~/utils/session.server";
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
  Header,
  Main,
  DlCard,
  DlCardDtDd,
  Card,
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
  const { userId } = await requireUserSession(request, "customer");
  const accessPoint = await db.accessPoint.findFirst({
    where: {
      id: Number(accessPointId),
      accessManager: { user: { id: userId } },
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
      <Header
        title={accessPoint.name}
        meta={
          accessPoint.description ? (
            <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <LocationMarkerIcon
                  className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                  aria-hidden="true"
                />
                {accessPoint.description}
              </div>
            </div>
          ) : null
        }
        side={
          <>
            <span className="hidden sm:block">
              <Button variant="white" onClick={() => navigate("raw")}>
                <CheckIcon
                  className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                  aria-hidden="true"
                />
                Raw
              </Button>
            </span>
            <span className="ml-3 hidden sm:block">
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
            <Menu as="span" className="relative ml-3 sm:hidden">
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
                <Menu.Items className="absolute right-0 mt-2 -mr-1 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
          </>
        }
      />
      <Main>
        <DlCard>
          <DlCardDtDd
            term="Manager"
            description={accessPoint.accessManager.name}
          />
          <DlCardDtDd term="ID" description={accessPoint.id.toString()} />
          <DlCardDtDd
            term="Position"
            description={accessPoint.position.toString()}
          />
          <DlCardDtDd
            term="Heartbeat"
            description={
              accessPoint.heartbeatAt
                ? new Date(accessPoint.heartbeatAt).toLocaleString()
                : ""
            }
          />
          <DlCardDtDd
            wide={true}
            term="Description"
            description={accessPoint.description}
          />
        </DlCard>
        <Card
          title="Users With Access"
          side={<Button onClick={() => navigate("users/add")}>Add</Button>}
        >
          <Table
            decor="edge"
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
        </Card>
      </Main>
    </>
  );
}
