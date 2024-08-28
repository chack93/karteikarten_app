export type RestResponse = {
  header: Map<string, string>;
  body: object;
};

export function baseUrl(): string {
  return joinUrl(process.env.NEXT_PUBLIC_API_BASE_URL, "/api");
}
export function joinUrl(...args: string[]): string {
  return args
    .map((el) => (el.startsWith("/") ? el.substring(1) : el))
    .map((el) => (el.endsWith("/") ? el.substring(0, el.length - 1) : el))
    .join("/");
}

export function request(
  method: string,
  path: string,
  body: object = undefined
): Promise<RestResponse> {
  return new Promise((resolve, reject) => {
    fetch(joinUrl(baseUrl(), path), {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body && JSON.stringify(body),
    })
      .then(async (response: Response) => {
        const header = new Map<string, string>();
        const headerEntries = response.headers.entries();
        for (let idx in headerEntries) {
          header[headerEntries[idx][0]] = headerEntries[idx][1];
        }
        response.body;
        if (response.status >= 200 && response.status < 300)
          return { body: await response.text(), header };
        else reject(Error(`${response.status} - ${response.statusText}`));
      })
      .then(({ body, header }) => {
        const bodyObject = body ? JSON.parse(body) : {};
        resolve({ body: bodyObject, header });
      })
      .catch((error) => {
        reject(error);
      });
  });
}
