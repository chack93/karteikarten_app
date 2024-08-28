import ReconnectingWebSocket from "reconnecting-websocket";
import { RestBodyClient } from "./client";
import { baseUrl } from "./helper";
import { RestBodySession } from "./session";
import { getStorage } from "./localstorage";
import { debounce } from "lodash";
import { useAppStore } from "../components/app_store";
import { useKarteikartenStore } from "../components/karteikarten/store";

let connection: ReconnectingWebSocket = undefined;

export type WsMsg = {
  head: WsHead;
  body: WsMsgBodyUpdate;
};

export interface WsEventMsg extends WsMsg {
  detail: WsMsg;
}

export type WsHead = {
  action: string;
  clientId: string;
  groupId: string;
};

export type WsMsgBodyUpdate = {
  client: RestBodyClient;
  session: RestBodySession;
  clientList?: Array<RestBodyClient>;
};

export function Send(msg: WsMsg) {
  if (!connection) {
    Connect(msg.head.clientId, msg.head.groupId);
  }
  connection.send(JSON.stringify(msg));
}

export function Close() {
  if (connection) {
    connection.close();
  }
  connection = undefined;
}

export function Connect(clientId: string, groupId: string) {
  const apiUrl = new URL(baseUrl());
  const protocol = apiUrl.href.indexOf("https") !== -1 ? "wss://" : "ws://";
  const url = `${protocol}${apiUrl.host}/api/ws/${clientId}/${groupId}`;
  connection = new ReconnectingWebSocket(url);

  connection.addEventListener("message", (event) => {
    window.dispatchEvent(
      new CustomEvent(`websocket-event`, {
        bubbles: true,
        detail: JSON.parse(event.data),
      })
    );
  });
}

export async function CleanupWS() {
  window.removeEventListener(`websocket-event`, wsEventHandler.bind(this));
}
export async function InitWS() {
  const sessionId = getStorage("sessionId");
  const clientId = getStorage("clientId");
  Connect(clientId, sessionId);
  window.addEventListener(`websocket-event`, wsEventHandler.bind(this));
}

export function wsEventHandler(event: WsEventMsg) {
  if (event.detail.head.action !== "update") {
    return;
  }

  useAppStore.setState({
    client: event.detail.body.client,
    session: event.detail.body.session,
  });
  useKarteikartenStore.getState().setCsv(event.detail.body.session.csv);
}

export const sendStateToServer = debounce(function (
  session: RestBodySession = useAppStore.getState().session,
  client: RestBodyClient = useAppStore.getState().client
) {
  const sessionId = getStorage("sessionId");
  const clientId = getStorage("clientId");
  Send({
    head: {
      action: "update",
      clientId,
      groupId: sessionId,
    },
    body: {
      client,
      session,
    },
  });
},
300);
