import { serve } from "./deps.ts";

const PORT = Number(Deno.env.get("PORT")) || 8080;

type Route = {
  protocol: string;
  hostname: string;
  port: string;
};

const REDIRECTS: Record<string, string> = {
  "/blog": "/blog/",
  "/cv": "/cv/",
  "/photo": "/photo/",
  "/album": "/album/",
};

const ROUTES: Record<string, Route> = {
  "blog": {
    protocol: "https:",
    hostname: "okuno-blog.deno.dev",
    port: "443",
  },
  "cv": {
    protocol: "https:",
    hostname: "resume-nine-self.vercel.app",
    port: "443",
  },
  "album": {
    protocol: "https:",
    hostname: "photo-blog.deno.dev",
    port: "443",
  },
  "photo": {
    protocol: "https:",
    hostname: "photo-stream.deno.dev",
    port: "443",
  },
};

async function handler(req: Request): Promise<Response> {
  console.log({
    url: req.url,
    referrer: req.referrer ?? req.headers.get("referer"),
    "user-agent": req.headers.get("user-agent"),
    "accept-language": req.headers.get("accept-language"),
  });
  const url = new URL(req.url);

  const redirect = REDIRECTS[url.pathname];
  if (redirect) {
    url.pathname = redirect;
    return Response.redirect(url.href, 307);
  }

  const firstPath = url.pathname.split("/")[1];
  const route = ROUTES[firstPath];

  if (url.pathname === "/" || url.pathname.startsWith("/static/") || !route) {
    url.protocol = "https:";
    url.hostname = "homepage-okuno.deno.dev";
    url.port = "443";

    return fetch(url.href, {
      headers: req.headers,
      method: req.method,
      body: req.body,
    });
  }

  url.protocol = route.protocol;
  url.hostname = route.hostname;
  url.port = route.port;
  const input = url.href.replace(`/${firstPath}/`, "/");

  return await fetch(input, {
    headers: req.headers,
    method: req.method,
    body: req.body,
  });
}

console.log("Server started", {
  port: PORT,
  DENO_REGION: Deno.env.get("DENO_REGION"),
});
await serve(handler, { port: PORT });
