import type { ActionFunction, LoaderFunction } from "remix";
import { useActionData, useLoaderData, Form, useSubmit, redirect } from "remix";
import type { AccessUser } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

type LoaderData = { accessUser: AccessUser };

export const loader: LoaderFunction = async ({
  request,
  params: { accessUserId },
}): Promise<LoaderData> => {
  const userId = await requireUserId(request);
  const accessUser = await db.accessUser.findFirst({
    where: { id: Number(accessUserId), user: { id: Number(userId) } },
    rejectOnNotFound: true,
  });
  return { accessUser };
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

function validateCode(code: string) {
  if (code.length === 0) {
    return "Code is required.";
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name?: string | undefined;
    description?: string | undefined;
    code?: string | undefined;
    // enabled?: string | undefined;
  };
  fieldValues?: any;
};

export const action: ActionFunction = async ({
  request,
  params: { accessUserId },
}): Promise<Response | ActionData> => {
  const userId = await requireUserId(request);
  const accessUser = await db.accessUser.findFirst({
    where: { id: Number(accessUserId), user: { id: Number(userId) } },
    rejectOnNotFound: true,
  });
  if (request.method === "DELETE") {
    await db.accessUser.update({
      where: { id: accessUser.id },
      data: {
        deletedAt: new Date(),
        accessPoints: {
          set: [],
        },
      },
    });
    return redirect("/access/users");
  }

  const formData = await request.formData();
  // Node FormData get() seems to return null for empty string value.
  // Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(formData);
  const { name, description, code, enabled } = fieldValues;
  if (
    typeof name !== "string" ||
    typeof description !== "string" ||
    typeof code !== "string"
  ) {
    return { formError: `Form not submitted correctly.` };
  }

  const fieldErrors = {
    name: validateName(name),
    description: validateDescription(description),
    code: validateCode(code),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return { fieldErrors, fieldValues };
  }

  await db.accessUser.update({
    where: { id: accessUser.id },
    data: { name, description, code, enabled: !!enabled },
  });

  return redirect(`/access/users/${accessUserId}`);
};

export default function Edit() {
  const { accessUser } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const submit = useSubmit();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold leading-7 text-gray-900">Edit User</h1>
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
                    : accessUser.name
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
                    : accessUser.description
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

        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700"
            >
              Code
            </label>

            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                name="code"
                id="code"
                defaultValue={
                  actionData?.fieldValues
                    ? actionData.fieldValues.code
                    : accessUser.code
                }
                className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
              />
            </div>
            {actionData?.fieldErrors?.code ? (
              <p
                className="mt-2 text-sm text-red-600"
                role="alert"
                id="code-error"
              >
                {actionData.fieldErrors.code}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="relative flex items-start">
            <div className="flex items-center h-5">
              <input
                id="enabled"
                name="enabled"
                type="checkbox"
                defaultChecked={
                  actionData?.fieldValues
                    ? actionData.fieldValues.enabled
                    : accessUser.enabled
                }
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="enabled" className="font-medium text-gray-700">
                Enabled
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <button
            type="button"
            onClick={(e) => submit(e.currentTarget.form, { method: "delete" })}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            Delete
          </button>

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
