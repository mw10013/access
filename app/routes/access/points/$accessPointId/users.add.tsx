import type { ActionFunction, LoaderFunction } from "remix";
import { useLoaderData, Form, useNavigate, redirect } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import { Header, Main, SettingsForm } from "~/components/lib";

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
    where: { id: { notIn }, deletedAt: new Date(0), user: { id: Number(userId) } },
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
      <Header />
      <Main>
        <SettingsForm
          replace
          method="post"
          title={`Add Users`}
          submitText="Add"
        >
          <div className="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200">
            {accessUsers.map((au, auIdx) => (
              <div key={au.id} className="relative flex items-start py-4">
                <div className="min-w-0 flex-1 text-sm">
                  <label
                    htmlFor={`accessUser-${auIdx}`}
                    className="select-none font-medium text-gray-700"
                  >
                    {au.name}
                  </label>
                </div>
                <div className="ml-3 flex h-5 items-center">
                  <input
                    id={`accessUser-${auIdx}`}
                    name={`accessUser-${auIdx}`}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
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
        </SettingsForm>
      </Main>
    </>
  );
}
