import type { ActionFunction, LoaderFunction } from "remix";
import { useActionData, useLoaderData, Form, redirect } from "remix";
import type { AccessPoint } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserSession } from "~/utils/session.server";
import type { ZodError } from "zod";
import { z } from "zod";
import {
  Header,
  Main,
  SettingsForm,
  SettingsFormField,
} from "~/components/lib";

export const handle = {
  breadcrumb: "Edit",
};

type LoaderData = { accessPoint: AccessPoint };

export const loader: LoaderFunction = async ({
  request,
  params: { accessPointId },
}): Promise<LoaderData> => {
  const { userId } = await requireUserSession(request, "customer");
  const accessPoint = await db.accessPoint.findFirst({
    where: {
      id: Number(accessPointId),
      accessManager: { user: { id: userId } },
    },
    rejectOnNotFound: true,
  });
  return { accessPoint };
};

const FieldValues = z
  .object({
    name: z.string().nonempty().max(50),
    description: z.string().max(100),
  })
  .strict();
type FieldValues = z.infer<typeof FieldValues>;

type ActionData = {
  formErrors?: ZodError["formErrors"];
  fieldValues?: any;
};

export const action: ActionFunction = async ({
  request,
  params: { accessPointId },
}): Promise<Response | ActionData> => {
  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(await request.formData());
  const parseResult = FieldValues.safeParse(fieldValues);
  if (!parseResult.success) {
    return { formErrors: parseResult.error.formErrors, fieldValues };
  }

  const { userId } = await requireUserSession(request, "customer");
  await db.accessPoint.findFirst({
    where: {
      id: Number(accessPointId),
      accessManager: { user: { id: userId } },
    },
    rejectOnNotFound: true,
  });

  await db.accessPoint.update({
    where: { id: Number(accessPointId) },
    data: {
      name: parseResult.data.name,
      description: parseResult.data.description,
    },
  });

  return redirect(`/access/points/${accessPointId}`);
};

export default function RouteComponent() {
  const { accessPoint } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  return (
    <>
      <Header />
      <Main>
        <SettingsForm
          replace
          method="post"
          title="Access Point Settings"
          formErrors={actionData?.formErrors?.formErrors}
        >
          <SettingsFormField
            id="name"
            label="Name"
            errors={actionData?.formErrors?.fieldErrors?.name}
          >
            <input
              type="text"
              name="name"
              id="name"
              defaultValue={
                actionData?.fieldValues
                  ? actionData.fieldValues.name
                  : accessPoint.name
              }
            />
          </SettingsFormField>
          <SettingsFormField
            id="description"
            label="Description"
            errors={actionData?.formErrors?.fieldErrors?.description}
          >
            <textarea
              name="description"
              id="description"
              rows={3}
              defaultValue={
                actionData?.fieldValues
                  ? actionData.fieldValues.description
                  : accessPoint.description
              }
            />
          </SettingsFormField>
        </SettingsForm>
      </Main>
    </>
  );
}
