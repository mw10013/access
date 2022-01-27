import type { LoaderFunction } from "remix";
import {
  useLoaderData,
  Link,
  useNavigate,
  useSubmit,
  useFormAction,
} from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import { Button, DlCard, DlCardDtDd, Header, Main } from "~/components/lib";
import { PencilIcon } from "@heroicons/react/solid";

export const handle = {
  breadcrumb: "Access User",
};

type LoaderData = {
  accessUser: Prisma.AccessUserGetPayload<{
    include: {
      accessPoints: {
        include: { accessManager: true };
      };
    };
  }>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { accessUserId },
}): Promise<LoaderData> => {
  const userId = await requireUserId(request);
  const accessUser = await db.accessUser.findFirst({
    where: {
      id: Number(accessUserId),
      deletedAt: null,
      user: { id: Number(userId) },
    },
    include: {
      accessPoints: {
        orderBy: [{ accessManager: { name: "asc" } }, { name: "asc" }],
        include: { accessManager: true },
      },
    },
    rejectOnNotFound: true,
  });

  return { accessUser };
};

function codeActivateExpireStatus(accessUser: LoaderData["accessUser"]) {
  // JSON serializes dates as strings. The dates in LoaderData will come out as strings on the client.
  const activateCodeAt = accessUser.activateCodeAt
    ? new Date(accessUser.activateCodeAt)
    : null;
  const expireCodeAt = accessUser.expireCodeAt
    ? new Date(accessUser.expireCodeAt)
    : null;
  const now = Date.now();

  const codeStatus =
    expireCodeAt && now > expireCodeAt.getTime()
      ? "EXPIRED"
      : activateCodeAt && now < activateCodeAt.getTime()
      ? "PENDING"
      : "ACTIVE";

  const activateExpireStatus =
    codeStatus === "ACTIVE"
      ? expireCodeAt
        ? `Will expire at ${expireCodeAt.toLocaleString()}`
        : ``
      : codeStatus === "PENDING"
      ? expireCodeAt
        ? `Will activate at ${activateCodeAt?.toLocaleString()} until ${expireCodeAt.toLocaleString()}.`
        : `Will activate at ${activateCodeAt?.toLocaleString()}`
      : ``;

  return { codeStatus, activateExpireStatus };
}

export default function RouteComponent() {
  const navigate = useNavigate();
  const submit = useSubmit();
  const removeFormActionBase = useFormAction("points");
  const { accessUser } = useLoaderData<LoaderData>();
  const { codeStatus, activateExpireStatus } =
    codeActivateExpireStatus(accessUser);
  return (
    <>
      <Header
        title={accessUser.name}
        side={
          <Button onClick={() => navigate("edit")}>
            <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Edit
          </Button>
        }
      />
      <Main>
        <DlCard>
          <DlCardDtDd term="Code" description={accessUser.code} />
          <DlCardDtDd term="Code Status" description={codeStatus} />
          <DlCardDtDd term="ID" description={accessUser.id.toString()} />
          <DlCardDtDd
            term="Activate Expire Status"
            description={activateExpireStatus}
          />
          <DlCardDtDd
            wide={true}
            term="Description"
            description={accessUser.description}
          />
        </DlCard>
      </Main>

      <div className="mt-4">
        <div className="flex justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Access Points
          </h3>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-purple-500"
            onClick={() => navigate("points/add")}
          >
            Add
          </button>
        </div>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p></p>
        </div>
        <div className="max-w-7xl mx-auto">
          <table className="mt-4 max-width-md divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Manager
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
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accessUser.accessPoints.map((i) => (
                <tr key={i.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link
                      to={`../managers/${i.accessManager.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {i.accessManager.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium  text-gray-900">
                    {i.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {i.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      to="#"
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={(e) => {
                        e.preventDefault();
                        submit(null, {
                          method: "post",
                          action: `${removeFormActionBase}/${i.id}/remove`,
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
    </>
  );
}
