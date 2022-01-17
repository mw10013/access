import type { ActionFunction, LoaderFunction } from "remix";
import { useActionData, useLoaderData, Form, useSubmit, redirect } from "remix";
import type { AccessUser } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import type { ZodError } from "zod";
import { z } from "zod";

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

const FieldValues = z
  .object({
    name: z.string().min(1).max(50),
    description: z.string().max(100),
    code: z.string().min(3).max(100),
    activateCodeAt: z.string(),
    activateCodeAtHidden: z.string(),
  })
  .strict();
type FieldValues = z.infer<typeof FieldValues>;

type ActionData = {
  formErrors?: ZodError["formErrors"];
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

  // Node FormData get() seems to return null for empty string value.
  // Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(await request.formData());
  const parseResult = FieldValues.safeParse(fieldValues);
  if (!parseResult.success) {
    return { formErrors: parseResult.error.formErrors, fieldValues };
  }

  const { name, description, code, activateCodeAtHidden } = parseResult.data;
  await db.accessUser.update({
    where: { id: accessUser.id },
    data: {
      name,
      description,
      code,
      activateCodeAt: activateCodeAtHidden
        ? new Date(activateCodeAtHidden)
        : null,
    },
  });
  return redirect(`/access/users/${accessUserId}`);
};

function formatDatetimeLocal(dt: Date) {
  return `${dt.getFullYear()}-${(dt.getMonth() + 1).toLocaleString("en", {
    minimumIntegerDigits: 2,
  })}-${dt.getDate().toLocaleString("en", {
    minimumIntegerDigits: 2,
  })}T${dt.getHours().toLocaleString("en", {
    minimumIntegerDigits: 2,
  })}:${dt.getMinutes().toLocaleString("en", {
    minimumIntegerDigits: 2,
  })}`;
}

export default function RouteComponent() {
  const { accessUser } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const submit = useSubmit();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold leading-7 text-gray-900">Edit User</h1>
      <Form replace method="post">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {actionData?.formErrors?.formErrors.join(". ")}
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
            {actionData?.formErrors?.fieldErrors.name ? (
              <p
                className="mt-2 text-sm text-red-600"
                role="alert"
                id="code-error"
              >
                {actionData.formErrors.fieldErrors.name.join(". ")}
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
            {actionData?.formErrors?.fieldErrors?.description ? (
              <p
                className="mt-2 text-sm text-red-600"
                role="alert"
                id="code-error"
              >
                {actionData.formErrors.fieldErrors.description.join(". ")}
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
            {actionData?.formErrors?.fieldErrors.code ? (
              <p
                className="mt-2 text-sm text-red-600"
                role="alert"
                id="code-error"
              >
                {actionData?.formErrors?.fieldErrors.code.join(". ")}
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-4">
            <label
              htmlFor="activateCodeAt"
              className="block text-sm font-medium text-gray-700"
            >
              Activate Code At
            </label>

            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="datetime-local"
                name="activateCodeAt"
                id="activateCodeAt"
                // defaultValue={formatDatetimeLocal(new Date())}
                defaultValue={
                  actionData?.fieldValues
                    ? actionData.fieldValues.activatedCodeAt
                    : accessUser.activateCodeAt
                    ? formatDatetimeLocal(new Date(accessUser.activateCodeAt))
                    : ""
                }
                className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
              />
            </div>
            {actionData?.formErrors?.fieldErrors.activateCodeAt ? (
              <p
                className="mt-2 text-sm text-red-600"
                role="alert"
                id="code-error"
              >
                {actionData.formErrors.fieldErrors.activateCodeAt.join(". ")}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            onClick={(e) => submit(e.currentTarget.form, { method: "delete" })}
          >
            Delete
          </button>
          <input
            type="hidden"
            name="activateCodeAtHidden"
            id="activateCodeAtHidden"
          />
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={(e) => {
              const activateCodeAt =
                e.currentTarget.form?.elements.namedItem("activateCodeAt");
              const activateCodeAtHidden =
                e.currentTarget.form?.elements.namedItem(
                  "activateCodeAtHidden"
                );
              if (
                activateCodeAt &&
                activateCodeAt instanceof HTMLInputElement &&
                activateCodeAtHidden &&
                activateCodeAtHidden instanceof HTMLInputElement
              ) {
                // input datetime-local does not have timezone so
                // convert to local time on the client since the server
                // will not know the correct timezone.
                activateCodeAtHidden.value = activateCodeAt.value
                  ? new Date(activateCodeAt.value).toJSON()
                  : "";
              }
            }}
          >
            Save
          </button>
        </div>
      </Form>
    </div>
  );
}
