import { coachConfig } from "@/lib/coach/auth";
export const dynamic = "force-dynamic";
export function GET() {
  try {
    const config = coachConfig();
    return Response.json({resource:config.resource,authorization_servers:[config.issuer],scopes_supported:["rpm:read","rpm:write"],bearer_methods_supported:["header"]},{headers:{"Cache-Control":"no-store"}});
  } catch { return Response.json({error:"Connexion non configurée"},{status:503}); }
}
