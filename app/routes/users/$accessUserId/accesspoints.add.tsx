import type { ActionFunction, LoaderFunction } from "remix";
import { useLoaderData, Form, useNavigate, redirect } from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = {
  accessUser: Prisma.AccessUserGetPayload<{
    include: { accessPoints: true };
  }>;
  accessPoints: Prisma.AccessPointGetPayload<{
    include: { accessHub: { include: { accessLocation: true } } };
  }>[];
};

export const loader: LoaderFunction = async ({
  params: { accessUserId: id },
}): Promise<LoaderData> => {
  const accessUser = await db.accessUser.findUnique({
    where: { id: Number(id) },
    include: { accessPoints: true },
    rejectOnNotFound: true,
  });
  const notIn = accessUser.accessPoints.map((el) => el.id);
  const accessPoints = await db.accessPoint.findMany({
    where: { id: { notIn } },
    orderBy: [
      { accessHub: { accessLocation: { name: "asc" } } },
      { name: "asc" },
    ],
    include: { accessHub: { include: { accessLocation: true } } },
  });
  return { accessUser, accessPoints };
};

export const action: ActionFunction = async ({
  request,
  params: { accessUserId },
}) => {
  const formData = await request.formData();
  // Node FormData get() seems to return null for empty string value.
  // Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(formData);

  let ids = [];
  for (let idx = 0; fieldValues[`accessPoint-${idx}-id`]; ++idx) {
    if (fieldValues[`accessPoint-${idx}`]) {
      ids.push(Number(fieldValues[`accessPoint-${idx}-id`]));
    }
  }
  if (ids.length > 0) {
    await db.accessUser.update({
      where: { id: Number(accessUserId) },
      data: { accessPoints: { connect: ids.map((id) => ({ id })) } },
    });
  }
  return redirect(`/users/${accessUserId}`);
};

export default function Add() {
  const { accessUser, accessPoints } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold leading-7 text-gray-900">
        Add Access Points{accessUser.name ? ` to ${accessUser.name}` : null}
      </h1>
      <Form method="post" className="mt-4">
        <fieldset>
          <legend className="text-lg font-medium text-gray-900">
            Available Access Points
          </legend>
          <div className="mt-4 border-t border-b border-gray-200 divide-y divide-gray-200">
            {accessPoints.map((ap, apIdx) => (
              <div key={ap.id} className="relative flex items-start py-4">
                <div className="min-w-0 flex-1 text-sm">
                  <label
                    htmlFor={`accessPoint-${apIdx}`}
                    className="font-medium text-gray-700 select-none"
                  >
                    {`${ap.accessHub.accessLocation.name}: ${ap.name}`}
                  </label>
                </div>
                <div className="ml-3 flex items-center h-5">
                  <input
                    id={`accessPoint-${apIdx}`}
                    name={`accessPoint-${apIdx}`}
                    type="checkbox"
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
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
  );
}
