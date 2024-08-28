import { RestResponse, request } from "./helper";

export type RestBodySession = {
  createdAt: string;
  deletedAt: string;
  id: string;
  updatedAt: string;
  csv: string;
  description: string;
  joinCode: string;
};
export interface RestResponseSession extends RestResponse {
  body: RestBodySession;
}

export async function requestSessionFetch(
  sessionId: string
): Promise<RestResponseSession> {
  return (await request("GET", `/session/${sessionId}`)) as RestResponseSession;
}
export async function requestSessionJoinCodeFetch(
  joinCode: string
): Promise<RestResponseSession> {
  return (await request(
    "GET",
    `/session/join/${joinCode}`
  )) as RestResponseSession;
}
export async function requestSessionCreate(
  description: string = "",
  csv: string = ""
): Promise<RestResponseSession> {
  return (await request("POST", `/session`, {
    csv,
    description,
  })) as RestResponseSession;
}
