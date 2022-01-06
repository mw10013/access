import type { ActionFunction, LoaderFunction } from "remix";
import { useActionData, useLoaderData, Form, useSubmit, redirect } from "remix";
import type { AccessPoint } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = { accessPoint: AccessPoint };

export const loader: LoaderFunction = async ({
  params: { accessPointId },
}): Promise<LoaderData> => {
  const accessPoint = await db.accessPoint.findUnique({
    where: { id: Number(accessPointId) },
    rejectOnNotFound: true,
  });
  return { accessPoint };
};

function validateName(name: string) {
  if (name.length === 0) {
    return "Name is required.";
  }
  if (name.length > 100) {
    return "Name is too long.";
  }
}

function validateDescription(description: string) {
  if (description.length > 500) {
    return "Description is too long.";
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name?: string | undefined;
    description?: string | undefined;
  };
  fieldValues?: any;
};

export const action: ActionFunction = async ({
  request,
  params: { accessPointId },
}): Promise<Response | ActionData> => {
  /*    
  if (request.method === "DELETE") {
    await db.accessPoint.delete({
      where: { id: Number(accessPointId) },
    });
    return redirect("/users");
  }
*/
  const formData = await request.formData();
  // Node FormData get() seems to return null for empty string value.
  // Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(formData);
  const { name, description } = fieldValues;
  if (typeof name !== "string" || typeof description !== "string") {
    return { formError: `Form not submitted correctly.` };
  }

  const fieldErrors = {
    name: validateName(name),
    description: validateDescription(description),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return { fieldErrors, fieldValues };
  }

  await db.accessPoint.update({
    where: { id: Number(accessPointId) },
    data: { name, description },
  });

  return redirect(`/accesspoints/${accessPointId}`);
};

export default function Edit() {
  const { accessPoint } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const submit = useSubmit();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold leading-7 text-gray-900">
        Edit Access Point
      </h1>
      <Form replace method="post">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {actionData?.formError}
          </h3>
          <p className="mt-1 text-sm text-gray-500"></p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>

            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="name"
                id="name"
                defaultValue={
                  actionData?.fieldValues
                    ? actionData.fieldValues.name
                    : accessPoint.name
                }
                className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
              />
            </div>
            {actionData?.fieldErrors?.name ? (
              <p
                className="mt-2 text-sm text-red-600"
                role="alert"
                id="code-error"
              >
                {actionData.fieldErrors.name}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="description"
                id="description"
                defaultValue={
                  actionData?.fieldValues
                    ? actionData.fieldValues.description
                    : accessPoint.description
                }
                className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
              />
            </div>
            {actionData?.fieldErrors?.description ? (
              <p
                className="mt-2 text-sm text-red-600"
                role="alert"
                id="code-error"
              >
                {actionData.fieldErrors.description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save
          </button>
        </div>
      </Form>
    </div>
  );
}
