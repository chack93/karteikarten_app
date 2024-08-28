import { RestResponse, request } from "./helper";

export type RestBodyClient = {
  createdAt: string;
  deletedAt: string;
  id: string;
  updatedAt: string;
  connected: boolean;
  name: string;
  sessionId: string;
};
export interface RestResponseClient extends RestResponse {
  body: RestBodyClient;
}

export async function requestClientFetch(
  clientId: string
): Promise<RestResponseClient> {
  return (await request("GET", `/client/${clientId}`)) as RestResponseClient;
}
export async function requestClientCreate(
  name: string,
  sessionId: string = ""
): Promise<RestResponseClient> {
  return (await request("POST", `/client`, {
    name,
    sessionId,
  })) as RestResponseClient;
}
export async function requestClientUpdate(
  clientId: string,
  name: string,
  sessionId: string = ""
): Promise<RestResponseClient> {
  return (await request("PUT", `/client/${clientId}`, {
    name,
    sessionId,
  })) as RestResponseClient;
}
