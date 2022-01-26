import type { ActionFunction, LoaderFunction } from "remix";
import { useLoaderData, Form, useNavigate, redirect } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import { Header } from "~/components/lib";

export const handle = {
  breadcrumb: "Add Users",
};

type LoaderData = {
  accessPoint: Prisma.AccessPointGetPayload<{
    include: { accessUsers: true };
  }>;
  accessUsers: Prisma.AccessUserGetPayload<{}>[];
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
    include: { accessUsers: true },
    rejectOnNotFound: true,
  });
  const notIn = accessPoint.accessUsers.map((el) => el.id);
  const accessUsers = await db.accessUser.findMany({
    where: { id: { notIn }, deletedAt: null, user: { id: Number(userId) } },
  });
  return { accessPoint, accessUsers };
};

export const action: ActionFunction = async ({
  request,
  params: { accessPointId },
}) => {
  const formData = await request.formData();
  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(formData);

  let ids = [];
  for (let idx = 0; fieldValues[`accessUser-${idx}-id`]; ++idx) {
    if (fieldValues[`accessUser-${idx}`]) {
      ids.push(Number(fieldValues[`accessUser-${idx}-id`]));
    }
  }
  if (ids.length > 0) {
    const userId = await requireUserId(request);
    const accessPoint = await db.accessPoint.findFirst({
      where: {
        id: Number(accessPointId),
        accessManager: { user: { id: Number(userId) } },
      },
      rejectOnNotFound: true,
    });

    // TODO: validate the access user id's: that they belong to the user

    await db.accessPoint.update({
      where: { id: accessPoint.id },
      data: { accessUsers: { connect: ids.map((id) => ({ id })) } },
    });
  }
  return redirect(`/access/points/${accessPointId}`);
};

export default function RouteComponent() {
  const { accessPoint, accessUsers } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  return (
    <>
      <Header
        title={`Add Users${accessPoint.name ? ` to ${accessPoint.name}` : ""}`}
      />
      <div className="p-8">
        <Form method="post" className="mt-4">
          <fieldset>
            <legend className="text-lg font-medium text-gray-900">
              Available Users
            </legend>
            <div className="mt-4 border-t border-b border-gray-200 divide-y divide-gray-200">
              {accessUsers.map((au, auIdx) => (
                <div key={au.id} className="relative flex items-start py-4">
                  <div className="min-w-0 flex-1 text-sm">
                    <label
                      htmlFor={`accessUser-${auIdx}`}
                      className="font-medium text-gray-700 select-none"
                    >
                      {au.name}
                    </label>
                  </div>
                  <div className="ml-3 flex items-center h-5">
                    <input
                      id={`accessUser-${auIdx}`}
                      name={`accessUser-${auIdx}`}
                      type="checkbox"
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <input
                      id={`accessUser-${auIdx}-id`}
                      name={`accessUser-${auIdx}-id`}
                      type="hidden"
                      value={au.id}
                    />
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add
              </button>
            </div>
          </div>
        </Form>
      </div>
    </>
  );
}
