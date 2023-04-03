import type { RequestHandler } from "@builder.io/qwik-city";

export const onPost: RequestHandler = async ({ request, json }) => {
  const { token } = (await request.json()) as Awaited<{ token: string }>;

  if (!token) {
    throw json(401, {
      error: true,
      message: "No ID token furnished",
    });
  }

  json(200, {
    token: "__FAKE_ACCESS_TOKEN__",
  });
};
