import { NextRequest, NextResponse } from "next/server";

function sanitizeFilename(input: string) {
  // Remove path separators and control characters; keep it conservative.
  return input
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[\\/:"*?<>|]+/g, "_")
    .trim()
    .slice(0, 180) || "download";
}

function contentDisposition(filename: string) {
  const safe = sanitizeFilename(filename);
  // RFC 5987
  const encoded = encodeURIComponent(safe);
  return `attachment; filename="${safe.replace(/"/g, '\\"')}"; filename*=UTF-8''${encoded}`;
}

// export const runtime = "nodejs";
export const runtime = 'edge';
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const filename = req.nextUrl.searchParams.get("filename") || "download";

  if (!url) {
    return NextResponse.json({ message: "Missing url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ message: "Invalid url" }, { status: 400 });
  }

  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return NextResponse.json({ message: "Unsupported protocol" }, { status: 400 });
  }

  const upstream = await fetch(target.toString(), {
    redirect: "follow",
    // Some CDNs block unknown UA; keep a minimal one.
    headers: {
      "user-agent": "instagram-downloader/1.0",
    },
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { message: `Upstream error: ${upstream.status}` },
      { status: 502 }
    );
  }

  const headers = new Headers();
  const ct = upstream.headers.get("content-type");
  if (ct) headers.set("content-type", ct);
  const cl = upstream.headers.get("content-length");
  if (cl) headers.set("content-length", cl);
  headers.set("content-disposition", contentDisposition(filename));
  headers.set("cache-control", "no-store");

  return new Response(upstream.body, { status: 200, headers });
}