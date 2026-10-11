import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { authenticateCoach, coachConfig } from "@/lib/coach/auth";
import { createCoachServer } from "@/lib/coach/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  let config;
  try { config = coachConfig(); } catch {
    return Response.json({error:"Connexion RPM non configurée"},{status:503});
  }
  const origin = request.headers.get("origin");
  const allowedOrigins = new Set([new URL(config.resource).origin, ...(process.env.RPM_COACH_ALLOWED_ORIGINS || "").split(",").filter(Boolean)]);
  if (origin && !allowedOrigins.has(origin)) return Response.json({error:"Origine refusée"},{status:403});
  if (Number(request.headers.get("content-length") || 0) > 65536) return Response.json({error:"Requête trop volumineuse"},{status:413});
  let identity;
  try { identity = await authenticateCoach(request, config); } catch {
    const metadata = new URL("/.well-known/oauth-protected-resource/api/mcp",config.resource).href;
    return Response.json({error:"Authentification requise"},{status:401,headers:{"WWW-Authenticate":`Bearer resource_metadata="${metadata}"`,"Cache-Control":"no-store"}});
  }
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = []; let size = 0;
  if (reader) {
    while (true) {
      const {done,value} = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 65536) { await reader.cancel(); return Response.json({error:"Requête trop volumineuse"},{status:413}); }
      chunks.push(value);
    }
  }
  const boundedRequest = new Request(request.url,{method:"POST",headers:request.headers,body:Buffer.concat(chunks)});
  // Import DB only after authentication. Disabled endpoints need no database credentials.
  const {coachStore} = await import("@/lib/coach/store");
  const server = createCoachServer(coachStore,identity);
  const transport = new WebStandardStreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});
  await server.connect(transport);
  try { return await transport.handleRequest(boundedRequest); } finally { await server.close(); }
}
export function GET() { return new Response(null,{status:405,headers:{Allow:"POST"}}); }
export function DELETE() { return new Response(null,{status:405,headers:{Allow:"POST"}}); }
