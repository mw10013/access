import { ActionFunction, LoaderFunction } from "remix";
import { useActionData, useLoaderData, redirect } from "remix";
import type { AccessHub } from "@prisma/client";
import { db } from "~/utils/db.server";
import type { ZodError } from "zod";
import { z } from "zod";
import {
  Header,
  Main,
  SettingsForm,
  SettingsFormField,
} from "~/components/lib";
import { requireUserSession } from "~/utils/session.server";

export const handle = {
  breadcrumb: "Edit",
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type LoaderData = { accessHub: AccessHub };

export const loader: LoaderFunction = async ({
  request,
  params: { accessHubId },
}): Promise<LoaderData> => {
  const { userId } = await requireUserSession(request, "customer");
  const accessHub = await db.accessHub.findFirst({
    where: { id: Number(accessHubId), user: { id: userId } },
    rejectOnNotFound: true,
  });
  return { accessHub };
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
  params: { accessHubId },
}): Promise<Response | ActionData> => {
  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(await request.formData());
  const parseResult = FieldValues.safeParse(fieldValues);
  if (!parseResult.success) {
    return { formErrors: parseResult.error.formErrors, fieldValues };
  }

  const { userId } = await requireUserSession(request, "customer");
  await db.accessHub.findFirst({
    where: { id: Number(accessHubId), user: { id: userId } },
    rejectOnNotFound: true,
  });
  const { name, description } = parseResult.data;
  await db.accessHub.update({
    where: { id: Number(accessHubId) },
    data: { name, description },
  });

  return redirect(`/access/Hubs/${accessHubId}`);
};

export default function RouteComponent() {
  const { accessHub } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  return (
    <>
      <Header />
      <Main>
        <SettingsForm
          replace
          method="post"
          title="Access Hub Settings"
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
                  : accessHub.name
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
                  : accessHub.description
              }
            />
          </SettingsFormField>
        </SettingsForm>
      </Main>
    </>
  );
}
