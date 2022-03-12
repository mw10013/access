import type { ActionFunction, LoaderFunction } from "remix";
import { useLoaderData, redirect } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserSession } from "~/utils/session.server";
import { Header, Main, SettingsForm } from "~/components/lib";

export const handle = {
  breadcrumb: "Add Points",
};

type LoaderData = {
  accessUser: Prisma.AccessUserGetPayload<{
    include: { accessPoints: true };
  }>;
  accessPoints: Prisma.AccessPointGetPayload<{
    include: { accessHub: true };
  }>[];
};

export const loader: LoaderFunction = async ({
  request,
  params: { accessUserId: id },
}): Promise<LoaderData> => {
  const { userId } = await requireUserSession(request, "customer");
  const accessUser = await db.accessUser.findFirst({
    where: { id: Number(id), user: { id: userId } },
    include: { accessPoints: true },
    rejectOnNotFound: true,
  });
  const notIn = accessUser.accessPoints.map((el) => el.id);
  const accessPoints = await db.accessPoint.findMany({
    where: { id: { notIn }, accessHub: { user: { id: userId } } },
    orderBy: [{ accessHub: { name: "asc" } }, { name: "asc" }],
    include: { accessHub: true },
  });
  return { accessUser, accessPoints };
};

export const action: ActionFunction = async ({
  request,
  params: { accessUserId },
}) => {
  const formData = await request.formData();
  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(formData);

  let ids = [];
  for (let idx = 0; fieldValues[`accessPoint-${idx}-id`]; ++idx) {
    if (fieldValues[`accessPoint-${idx}`]) {
      ids.push(Number(fieldValues[`accessPoint-${idx}-id`]));
    }
  }
  if (ids.length > 0) {
    // TODO: validate ids of access points belong to user.
    const { userId } = await requireUserSession(request, "customer");
    const accessUser = await db.accessUser.findFirst({
      where: { id: Number(accessUserId), user: { id: userId } },
      rejectOnNotFound: true,
    });

    await db.accessUser.update({
      where: { id: accessUser.id },
      data: { accessPoints: { connect: ids.map((id) => ({ id })) } },
    });
  }
  return redirect(`/access/users/${accessUserId}`);
};

export default function RouteComponent() {
  const { accessUser, accessPoints } = useLoaderData<LoaderData>();
  return (
    <>
      <Header />
      <Main>
        <SettingsForm replace method="post" title="Add Points" submitText="Add">
          <div className="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200">
            {accessPoints.map((ap, apIdx) => (
              <div key={ap.id} className="relative flex items-start py-4">
                <div className="min-w-0 flex-1 text-sm">
                  <label
                    htmlFor={`accessPoint-${apIdx}`}
                    className="select-none font-medium text-gray-700"
                  >
                    {`${ap.accessHub.name}: ${ap.name}`}
                  </label>
                </div>
                <div className="ml-3 flex h-5 items-center">
                  <input
                    id={`accessPoint-${apIdx}`}
                    name={`accessPoint-${apIdx}`}
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <input
                    id={`accessPoint-${apIdx}-id`}
                    name={`accessPoint-${apIdx}-id`}
                    type="hidden"
                    value={ap.id}
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
