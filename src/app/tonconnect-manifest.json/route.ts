import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  const cleanOrigin = origin.replace(/\/$/, '');
  const manifestUrl = `${cleanOrigin}/`;

  console.log('🚀 TON CONNECT MANIFEST REQUEST');
  console.log('   Origin:', cleanOrigin);

  const manifest = {
    url: manifestUrl,
    name: "Subora",
    iconUrl: "https://tonconnect.org/mainconf.png"
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store'
    },
  });
}
