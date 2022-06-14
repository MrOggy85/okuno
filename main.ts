import { serve } from "./deps.ts";

const PORT = Number(Deno.env.get("PORT")) || 8080;

type Hej = {
  protocol: string;
  hostname: string;
  port: string;
};

const REDIRECTS: Record<string, string> = {
  "/blog": "/blog/",
};

const ROUTES: Record<string, Hej> = {
  // 'blog': {
  //   protocol: 'http:',
  //   hostname: 'localhost',
  //   port: '3000'
  // },
  "blog": {
    protocol: "https:",
    hostname: "okuno-blog.deno.dev",
    port: "443",
  },
};

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  const redirect = REDIRECTS[url.pathname];
  if (redirect) {
    url.pathname = redirect;
    return Response.redirect(url.href, 307);
  }

  const firstPath = url.pathname.split("/")[1];
  const route = ROUTES[firstPath];

  if (!route) {
    return new Response("", {
      status: 404,
    });
  }

  url.protocol = route.protocol;
  url.hostname = route.hostname;
  url.port = route.port;
  const result = await fetch(url.href, {
    headers: req.headers,
    method: req.method,
    body: req.body,
  });

  return result;
}

console.log(`Server is listening on port ${PORT}`);
await serve(handler, { port: PORT });
