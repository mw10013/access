import * as React from "react";
import type { ActionFunction, LoaderFunction } from "remix";
import { useActionData, useLoaderData, Form, json, redirect } from "remix";
import type { AccessPointCode } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";

type LoaderData = {
  accessPoint: Prisma.AccessPointGetPayload<{
    include: { codes: true };
  }>;
  code: AccessPointCode;
};

export const loader: LoaderFunction = async ({
  params: { accessPointId: accessPointIdParam, codeId },
}) => {
  const accessPointId = Number(accessPointIdParam);
  const accessPoint = await db.accessPoint.findUnique({
    where: { id: Number(accessPointId) },
    include: { codes: { where: { accessPointId, id: Number(codeId) } } },
  });
  if (!accessPoint) {
    throw new Response("Access point not found.", {
      status: 404,
    });
  }
  if (!accessPoint.codes[0]) {
    throw new Response("Code not found.", { status: 404 });
  }
  const data: LoaderData = { accessPoint, code: accessPoint.codes[0] };
  console.log({ fn: "loader" });
  return data;
};

function validateCode(code: string) {
  if (code.length > 0) {
    if (!/^\d+$/.test(code)) {
      return "Code must contain only digits.";
    }
    if (code.length < 3) {
      return "Code must have at least 3 digits";
    }
    if (code.length > 8) {
      return "Code must have no more than 8 digits.";
    }
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name?: string | undefined;
    code?: string | undefined;
    enabled?: string | undefined;
  };
  fieldValues?: any;
};

export const action: ActionFunction = async ({
  request,
  params: { accessPointId, codeId },
}): Promise<Response | ActionData> => {
  const formData = await request.formData();
  const rawCode = formData.get("code");
  console.log({
    fn: "action",
    hasCode: formData.has("code"),
    hasName: formData.has("name"),
    rawCode: formData.get("code"),
    rawCodeAll: formData.getAll("code"),
    rawName: formData.get("name"),
    rawNameAll: formData.getAll("name"),
    rawHidden1: formData.get("hidden1"),
    rawHidden2: formData.get("hidden2"),
    rawHidden2All: formData.getAll("hidden2"),
    keys: [...formData.keys()],
    values: [...formData.values()],
    entries: [...formData.entries()],
    fromEntries: Object.fromEntries(formData),
  });
  const code = formData.get("code") ?? "";
  if (typeof code !== "string") {
    return { formError: `Form not submitted correctly.` };
  }
  /*
  const fieldErrors = {
    code: validateCode(code),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    const actionData: ActionData = {
      fieldErrors,
      formData: Object.fromEntries(formData),
    };
    return actionData;
  }
*/
  /*
  const accessPoint = await db.accessPoint.findUnique({
    where:, codeId: Number(id) },
  });
  if (!accessPoint) {
    throw new Response("Access point not found.", {
      status: 404,
    });
  }
*/
  //   await db.accessPoint.update({
  //     where: { id: accessPoint.id },
  //     data: { code },
  //   });
  //   return redirect("..");

  //   return null;
  const actionData: ActionData = { fieldValues: Object.fromEntries(formData) };
  console.log({
    fn: "action: return",
    actionData,
  });
  return actionData;
};

export default function EditCodeRoute() {
  const { code } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  console.log({
    fn: "EditCodeRoute",
    code,
    actionData,
  });
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold leading-7 text-gray-900">Edit Code</h1>
      <Form
        reloadDocument
        replace
        method="post"
        className="space-y-8 divide-y divide-gray-200"
      >
        <input type="hidden" name="hidden1" value="hidden1-value" />
        <input type="hidden" name="hidden2" value="hidden2-value1" />
        <input type="hidden" name="hidden2" value="hidden2-value2" />
        <div className="space-y-8 divide-y divide-gray-200">
          <div>
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
                      actionData ? actionData?.fieldValues?.name : code.name
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
                      actionData ? actionData?.fieldValues?.code : code.code
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
                      actionData
                        ? actionData?.fieldValues?.enabled
                        : code.enabled
                    }
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="enabled"
                    className="font-medium text-gray-700"
                  >
                    Enabled
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div></div>

          {/* <div className="pt-8">
            <div className="mt-6-">
              <fieldset className="mt-6-">
                <div>
                  <legend className="text-base font-medium text-gray-900">
                    Access Check Policy
                  </legend>
                  <p className="text-sm text-gray-500"></p>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center">
                    <input
                      id="acpCloudFirst"
                      name="accessCheckPolicy"
                      value="cloud-first"
                      type="radio"
                      defaultChecked={
                        accessPoint.accessCheckPolicy === "cloud-first"
                      }
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <label
                      htmlFor="acpCloudFirst"
                      className="ml-3 block text-sm font-medium text-gray-700"
                    >
                      Cloud First
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="acpCloudOnly"
                      name="accessCheckPolicy"
                      value="cloud-only"
                      type="radio"
                      defaultChecked={
                        accessPoint.accessCheckPolicy === "cloud-only"
                      }
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <label
                      htmlFor="acpCloudOnly"
                      className="ml-3 block text-sm font-medium text-gray-700"
                    >
                      Cloud Only
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="acpPointOnly"
                      name="accessCheckPolicy"
                      value="point-only"
                      type="radio"
                      defaultChecked={
                        accessPoint.accessCheckPolicy === "point-only"
                      }
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <label
                      htmlFor="acpPointOnly"
                      className="ml-3 block text-sm font-medium text-gray-700"
                    >
                      Point Only
                    </label>
                  </div>
                </div>
              </fieldset>
            </div>
          </div> */}
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            {/* <button
              type="button"
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button> */}
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}
