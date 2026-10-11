import { createRemoteJWKSet, jwtVerify, type JWTPayload, type JWTVerifyGetKey } from "jose";

export type CoachIdentity = { subject: string; scopes: Set<string> };
export type CoachConfig = { resource: string; issuer: string; jwks: string; subject: string };
function httpsUrl(value: string | undefined): string {
  if (!value || new URL(value).protocol !== "https:") throw new Error("Configuration OAuth manquante");
  return value;
}
export function coachConfig(): CoachConfig {
  if (process.env.RPM_COACH_ENABLED !== "true") throw new Error("Connexion désactivée");
  const resource = httpsUrl(process.env.RPM_COACH_RESOURCE_URL);
  const issuer = httpsUrl(process.env.RPM_COACH_OAUTH_ISSUER);
  const jwks = httpsUrl(process.env.RPM_COACH_OAUTH_JWKS_URL);
  const subject = process.env.RPM_COACH_OWNER_SUB;
  if (!subject) throw new Error("Propriétaire non configuré");
  return { resource, issuer, jwks, subject };
}
export function identityFromPayload(payload: JWTPayload, config: CoachConfig): CoachIdentity {
  if (payload.sub !== config.subject || !payload.exp) throw new Error("Accès refusé");
  const scope = typeof payload.scope === "string" ? payload.scope : "";
  const scopes = new Set(scope.split(/\s+/).filter(Boolean));
  if (!scopes.has("rpm:read")) throw new Error("Portée de lecture requise");
  return { subject: payload.sub, scopes };
}
const keySets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();
export async function authenticateCoach(request: Request, config: CoachConfig): Promise<CoachIdentity> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) throw new Error("Authentification requise");
  let keys = keySets.get(config.jwks);
  if (!keys) { keys = createRemoteJWKSet(new URL(config.jwks)); keySets.set(config.jwks, keys); }
  return verifyCoachToken(header.slice(7), config, keys);
}
export async function verifyCoachToken(token: string, config: CoachConfig, keys: JWTVerifyGetKey): Promise<CoachIdentity> {
  const { payload } = await jwtVerify(token, keys, {
    issuer: config.issuer, audience: config.resource, algorithms: ["RS256", "ES256"],
    requiredClaims: ["exp", "sub", "iat"],
  });
  return identityFromPayload(payload, config);
}
export function requireWrite(identity: CoachIdentity) {
  if (!identity.scopes.has("rpm:write")) throw new Error("Portée d’écriture requise");
}
