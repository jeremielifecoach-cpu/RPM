import assert from "node:assert/strict";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { coachConfig, identityFromPayload, requireWrite } from "../src/lib/coach/auth";
import { createCoachServer, blockInput, reviewInput, type CoachStore } from "../src/lib/coach/server";

const config = {resource:"https://rpm.example/api/mcp",issuer:"https://auth.example/",jwks:"https://auth.example/jwks",subject:"owner"};
test("fails closed by default and checks owner/read/write scopes", () => {
  const before = process.env.RPM_COACH_ENABLED;
  delete process.env.RPM_COACH_ENABLED;
  assert.throws(()=>coachConfig());
  if (before !== undefined) process.env.RPM_COACH_ENABLED = before;
  assert.throws(()=>identityFromPayload({sub:"another",exp:9999999999,scope:"rpm:read rpm:write"},config));
  assert.throws(()=>identityFromPayload({sub:"owner",exp:9999999999,scope:"rpm:write"},config));
  assert.throws(()=>identityFromPayload({sub:"owner",scope:"rpm:read"},config));
  assert.throws(()=>requireWrite(identityFromPayload({sub:"owner",exp:9999999999,scope:"rpm:read"},config)));
});
test("validates deadlines and rejects empty goals", () => {
  const base = {id:"goal",result:"Test",purpose:"Progress",weekStart:"2026-10-12",deadline:"2026-10-18"};
  assert.equal(blockInput.safeParse(base).success,true);
  assert.equal(blockInput.safeParse({...base,result:"  "}).success,false);
  assert.equal(blockInput.safeParse({...base,deadline:"2026-02-30"}).success,false);
  assert.equal(reviewInput.safeParse({id:"r",date:"2026-13-01",wins:"a",lessons:"b",nextAction:"c"}).success,false);
});
function fixture() {
  const calls: string[] = [];
  const store: CoachStore = {
    async overview(){calls.push("read");return {blocks:[]};},
    async saveBlock(i){calls.push("block");return i;},
    async saveAction(i){calls.push("action");return i;},
    async setAction(i,c){calls.push("action-state");return {id:i,completed:c};},
    async setBlock(i,c){calls.push("block-state");return {id:i,completed:c};},
    async appendReview(i){calls.push("review");return i;},
  };
  return {store,calls};
}
test("real MCP client lists tools, reads, and read scope cannot mutate", async () => {
  const {store,calls}=fixture();
  const server=createCoachServer(store,{subject:"owner",scopes:new Set(["rpm:read"])});
  const client=new Client({name:"test",version:"1.0.0"});
  const [a,b]=InMemoryTransport.createLinkedPair();
  await server.connect(a);await client.connect(b);
  try {
    const {tools}=await client.listTools();assert.equal(tools.length,6);
    assert.equal(tools.some(t=>/delete/i.test(t.name)),false);
    await client.callTool({name:"rpm_read",arguments:{}});
    for (const [name,args] of [
      ["rpm_save_block",{id:"b",result:"r",purpose:"p",deadline:"2026-10-18",weekStart:"2026-10-12"}],
      ["rpm_save_action",{id:"a",blockId:"b",content:"test"}],
      ["rpm_set_action",{id:"a",completed:true}],
      ["rpm_set_block",{id:"b",completed:true}],
      ["rpm_append_review",{id:"r",date:"2026-10-11",wins:"w",lessons:"l",nextAction:"n"}],
    ] as const) {
      const result=await client.callTool({name,arguments:args});assert.equal(result.isError,true);
    }
    assert.deepEqual(calls,["read"]);
  } finally {await client.close();await server.close();}
});
test("write scope dispatches decisions; invalid inputs never reach storage", async () => {
  const {store,calls}=fixture();
  const server=createCoachServer(store,{subject:"owner",scopes:new Set(["rpm:read","rpm:write"])});
  const client=new Client({name:"test",version:"1.0.0"});
  const [a,b]=InMemoryTransport.createLinkedPair();await server.connect(a);await client.connect(b);
  try {
    const result=await client.callTool({name:"rpm_set_action",arguments:{id:"a",completed:true}});
    assert.notEqual(result.isError,true);assert.deepEqual(calls,["action-state"]);
    const bad=await client.callTool({name:"rpm_save_action",arguments:{id:"a",blockId:"b",content:"",minutes:-1}});
    assert.equal(bad.isError,true);assert.deepEqual(calls,["action-state"]);
  } finally {await client.close();await server.close();}
});

test("signed JWTs require valid signature, expiration, issuer, audience and owner", async () => {
  const {generateKeyPair,exportJWK,createLocalJWKSet,SignJWT}=await import("jose");
  const {verifyCoachToken}=await import("../src/lib/coach/auth");
  const {publicKey,privateKey}=await generateKeyPair("RS256");
  const keys=createLocalJWKSet({keys:[await exportJWK(publicKey)]});
  const mint=(overrides: Record<string,unknown>={}) => new SignJWT({sub:"owner",scope:"rpm:read rpm:write",iss:config.issuer,aud:config.resource,iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+60,...overrides}).setProtectedHeader({alg:"RS256"}).sign(privateKey);
  assert.equal((await verifyCoachToken(await mint(),config,keys)).subject,"owner");
  for (const overrides of [{exp:1},{aud:"elsewhere"},{iss:"https://other.example"},{sub:"other"},{scope:"rpm:write"}]) {
    await assert.rejects(verifyCoachToken(await mint(overrides),config,keys));
  }
  const wrong=await generateKeyPair("RS256");
  const forged=await new SignJWT({sub:"owner",scope:"rpm:read"}).setProtectedHeader({alg:"RS256"}).setIssuer(config.issuer).setAudience(config.resource).setIssuedAt().setExpirationTime("1m").sign(wrong.privateKey);
  await assert.rejects(verifyCoachToken(forged,config,keys));
});

test("stateless Web HTTP transport processes a real MCP initialize request", async () => {
  const {WebStandardStreamableHTTPServerTransport}=await import("@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js");
  const {store}=fixture();const server=createCoachServer(store,{subject:"owner",scopes:new Set(["rpm:read"])});
  const transport=new WebStandardStreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});
  await server.connect(transport);
  try {
    const response=await transport.handleRequest(new Request("https://rpm.example/api/mcp",{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json, text/event-stream"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"initialize",params:{protocolVersion:"2025-11-25",capabilities:{},clientInfo:{name:"test",version:"1.0.0"}}})}));
    assert.equal(response.status,200);const body=await response.json();assert.equal(body.result.serverInfo.name,"rpm-coach");
  } finally {await server.close();}
});
