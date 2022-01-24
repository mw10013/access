import { ActionFunction, Link, LoaderFunction, useNavigate } from "remix";
import { useActionData, useLoaderData, Form, useSubmit, redirect } from "remix";
import type { AccessManager } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import type { ZodError } from "zod";
import { z } from "zod";
import { ChevronRightIcon, PlusIcon } from "@heroicons/react/solid";
import { Breadcrumbs, Button } from "~/components/lib";

export const handle = {
  breadcrumb: "Edit",
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type LoaderData = { accessManager: AccessManager };

export const loader: LoaderFunction = async ({
  request,
  params: { accessManagerId },
}): Promise<LoaderData> => {
  const userId = await requireUserId(request);

  const accessManager = await db.accessManager.findFirst({
    where: { id: Number(accessManagerId), user: { id: Number(userId) } },
    rejectOnNotFound: true,
  });
  return { accessManager };
};

const FieldValues = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(100),
});
type FieldValues = z.infer<typeof FieldValues>;

type ActionData = {
  formErrors?: ZodError["formErrors"];
  fieldValues?: any;
};

export const action: ActionFunction = async ({
  request,
  params: { accessManagerId },
}): Promise<Response | ActionData> => {
  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(await request.formData());
  const parseResult = FieldValues.safeParse(fieldValues);
  if (!parseResult.success) {
    return { formErrors: parseResult.error.formErrors, fieldValues };
  }

  const userId = await requireUserId(request);
  await db.accessManager.findFirst({
    where: { id: Number(accessManagerId), user: { id: Number(userId) } },
    rejectOnNotFound: true,
  });
  const { name, description } = parseResult.data;
  await db.accessManager.update({
    where: { id: Number(accessManagerId) },
    data: { name, description },
  });

  return redirect(`/access/managers/${accessManagerId}`);
};

export default function RouteComponent() {
  const { accessManager } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();
  return (
    <>
      <header className="p-8">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="flex-1 min-w-0">
            <Breadcrumbs />
            {/* <h2 className="mt-2 text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {accessManager.name}
            </h2> */}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto pb-10 lg:px-8">
        <Form replace method="post">
          <div className="shadow sm:rounded-md sm:overflow-hidden">
            <div className="bg-white py-6 px-4 sm:p-6 space-y-6">
              <div>
                <h1 className="text-lg leading-6 font-medium text-gray-900">
                  Access Manager Settings
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {actionData?.formErrors?.formErrors.join(". ")}
                </p>
              </div>

              <div className="">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
                    defaultValue={
                      actionData?.fieldValues
                        ? actionData.fieldValues.name
                        : accessManager.name
                    }
                  />
                </div>
                {actionData?.formErrors?.fieldErrors?.name ? (
                  <p
                    className="mt-2 text-sm text-red-600"
                    role="alert"
                    id="name-error"
                  >
                    {actionData.formErrors.fieldErrors.name.join(". ")}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                    defaultValue={
                      actionData?.fieldValues
                        ? actionData.fieldValues.description
                        : accessManager.description
                    }
                  />
                </div>
                {actionData?.formErrors?.fieldErrors?.description ? (
                  <p
                    className="mt-2 text-sm text-red-600"
                    role="alert"
                    id="description-error"
                  >
                    {actionData.formErrors.fieldErrors.description.join(". ")}
                  </p>
                ) : null}
              </div>

              <div className="flex justify-end">
                <Button variant="white" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit" className="ml-3">
                  Save
                </Button>
              </div>
            </div>
          </div>
        </Form>
      </main>
    </>
  );
}
