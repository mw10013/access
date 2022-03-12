import type { LoaderFunction } from "remix";
import {
  useLoaderData,
  useNavigate,
  useSubmit,
  useFormAction,
} from "remix";
import { Prisma } from "@prisma/client";
import { db } from "~/utils/db.server";
import { requireUserSession } from "~/utils/session.server";
import {
  Button,
  Card,
  DlCard,
  DlCardDtDd,
  Header,
  Main,
  Table,
  Td,
  TdLink,
  TdProminent,
  Th,
  ThSr,
} from "~/components/lib";
import { PencilIcon } from "@heroicons/react/solid";

type LoaderData = {
  accessUser: Prisma.AccessUserGetPayload<{
    include: {
      accessPoints: {
        include: { accessHub: true };
      };
    };
  }>;
};

export const loader: LoaderFunction = async ({
  request,
  params: { accessUserId },
}): Promise<LoaderData> => {
  const { userId } = await requireUserSession(request, "customer");
  const accessUser = await db.accessUser.findFirst({
    where: {
      id: Number(accessUserId),
      deletedAt: new Date(0),
      user: { id: userId },
    },
    include: {
      accessPoints: {
        orderBy: [{ accessHub: { name: "asc" } }, { name: "asc" }],
        include: { accessHub: true },
      },
    },
    rejectOnNotFound: true,
  });

  return { accessUser };
};

function codeActivateExpireStatus(accessUser: LoaderData["accessUser"]) {
  // JSON serializes dates as strings. The dates in LoaderData will come out as strings on the client.
  const activateCodeAt = accessUser.activateCodeAt
    ? new Date(accessUser.activateCodeAt)
    : null;
  const expireCodeAt = accessUser.expireCodeAt
    ? new Date(accessUser.expireCodeAt)
    : null;
  const now = Date.now();

  const codeStatus =
    expireCodeAt && now > expireCodeAt.getTime()
      ? "EXPIRED"
      : activateCodeAt && now < activateCodeAt.getTime()
      ? "PENDING"
      : "ACTIVE";

  const activateExpireStatus =
    codeStatus === "ACTIVE"
      ? expireCodeAt
        ? `Will expire at ${expireCodeAt.toLocaleString()}`
        : ``
      : codeStatus === "PENDING"
      ? expireCodeAt
        ? `Will activate at ${activateCodeAt?.toLocaleString()} until ${expireCodeAt.toLocaleString()}.`
        : `Will activate at ${activateCodeAt?.toLocaleString()}`
      : ``;

  return { codeStatus, activateExpireStatus };
}

export default function RouteComponent() {
  const navigate = useNavigate();
  const submit = useSubmit();
  const removeFormActionBase = useFormAction("points");
  const { accessUser } = useLoaderData<LoaderData>();
  const { codeStatus, activateExpireStatus } =
    codeActivateExpireStatus(accessUser);
  return (
    <>
      <Header
        title={accessUser.name}
        side={
          <Button onClick={() => navigate("edit")}>
            <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Edit
          </Button>
        }
      />
      <Main>
        <DlCard>
          <DlCardDtDd term="Code" description={accessUser.code} />
          <DlCardDtDd term="Code Status" description={codeStatus} />
          <DlCardDtDd term="ID" description={accessUser.id.toString()} />
          <DlCardDtDd
            term="Activate Expire Status"
            description={activateExpireStatus}
          />
          <DlCardDtDd
            wide={true}
            term="Description"
            description={accessUser.description}
          />
        </DlCard>
        <Card
          title="Accessible Points"
          side={<Button onClick={() => navigate("points/add")}>Add</Button>}
        >
          <Table
            decor="edge"
            headers={
              <>
                <Th>Name</Th>
                <Th>Hub</Th>
                <Th>Description</Th>
                <ThSr>View</ThSr>
              </>
            }
          >
            {accessUser.accessPoints.map((i) => (
              <tr key={i.id}>
                <TdProminent>{i.name}</TdProminent>
                <Td>{i.accessHub.name}</Td>
                <Td>{i.description}</Td>
                <TdLink
                  to="#"
                  onClick={(e) => {
                    e.preventDefault();
                    submit(null, {
                      method: "post",
                      action: `${removeFormActionBase}/${i.id}/remove`,
                    });
                  }}
                >
                  Remove
                </TdLink>
              </tr>
            ))}
          </Table>
        </Card>
      </Main>
    </>
  );
}
