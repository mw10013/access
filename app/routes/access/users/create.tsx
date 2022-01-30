import type { ActionFunction } from "remix";
import { useActionData, redirect } from "remix";
import { z, ZodError } from "zod";
import {
  Header,
  Main,
  SettingsForm,
  SettingsFormField,
} from "~/components/lib";
import { db } from "~/utils/db.server";
import { requireUserSession } from "~/utils/session.server";

export const handle = {
  breadcrumb: "Create",
};

const FieldValues = z
  .object({
    name: z.string().min(1).max(50),
    description: z.string().max(100),
    code: z.string().min(1).max(50),
  })
  .strict();
type FieldValues = z.infer<typeof FieldValues>;

type ActionData = {
  formErrors?: ZodError["formErrors"];
  fieldValues?: any;
};

export const action: ActionFunction = async ({
  request,
}): Promise<Response | ActionData> => {
  // WARNING: Object.fromEntries(formData): if formData.entries() has 2 entries with the same key, only 1 is taken.
  const fieldValues = Object.fromEntries(await request.formData());
  const parseResult = FieldValues.safeParse(fieldValues);
  console.log({ fieldValues, parseResult });
  if (!parseResult.success) {
    return { formErrors: parseResult.error.formErrors, fieldValues };
  }

  const { name, description, code } = parseResult.data;
  const { userId } = await requireUserSession(request, "customer");
  const accessUser = await db.accessUser.create({
    data: {
      name,
      description,
      code,
      userId: userId,
    },
  });

  return redirect(`/access/users/${accessUser.id}`);
};

export default function RouteComponent() {
  const actionData = useActionData<ActionData>();
  return (
    <>
      <Header />
      <Main>
        <SettingsForm
          replace
          method="post"
          title="Create Access User"
          submitText="Create"
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
                actionData?.fieldValues ? actionData.fieldValues.name : ""
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
                  : ""
              }
            />
          </SettingsFormField>
          <SettingsFormField
            id="code"
            label="Code"
            errors={actionData?.formErrors?.fieldErrors?.code}
          >
            <input
              type="text"
              name="code"
              id="code"
              defaultValue={
                actionData?.fieldValues ? actionData.fieldValues.code : ""
              }
            />
          </SettingsFormField>
        </SettingsForm>
      </Main>
    </>
  );
}
