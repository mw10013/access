import type { LoaderFunction } from "remix";
import { json } from "remix";

//https://remix.run/docs/en/v1.0.6/api/remix#json

export const loader: LoaderFunction = ({ params, request }) => {
  //   const accessPoint = upsertAccessPoint(
  //     params.id,
  //     (ap) => {
  //       return {
  //         ...ap,
  //         lastHeartbeat: new Date(),
  //         heartbeatCount: ap.heartbeatCount + 1,
  //       };
  //     },
  //     {
  //       id: params.id,
  //       lastHeartbeat: new Date(),
  //       heartbeatCount: 0,
  //       grantedCount: 0,
  //       deniedCount: 0,
  //       created: new Date(),
  //     }
  //   );
  return json({ id: params.id, success: true }, 200);
};
