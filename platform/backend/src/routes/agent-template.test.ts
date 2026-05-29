import type { FastifyInstanceWithZod } from "@/server";
import { createFastifyInstance } from "@/server";
import { afterEach, beforeEach, describe, expect, test } from "@/test";
import type { User } from "@/types";

describe("agent template routes", () => {
  let app: FastifyInstanceWithZod;
  let user: User;
  let organizationId: string;

  beforeEach(async ({ makeOrganization, makeUser }) => {
    user = await makeUser();
    const organization = await makeOrganization();
    organizationId = organization.id;

    app = createFastifyInstance();
    app.addHook("onRequest", async (request) => {
      (request as typeof request & { user: unknown }).user = user;
      (
        request as typeof request & {
          organizationId: string;
        }
      ).organizationId = organizationId;
    });

    const { default: agentTemplateRoutes } = await import(
      "./agent-template"
    );
    await app.register(agentTemplateRoutes);
  });

  afterEach(async () => {
    await app.close();
  });

  describe("GET /api/agent-templates", () => {
    test("returns all templates", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/agent-templates",
      });

      expect(response.statusCode).toBe(200);
      const templates = response.json();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });

    test("returns templates with required fields", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/agent-templates",
      });

      const templates = response.json();
      for (const template of templates) {
        expect(template.id).toBeTruthy();
        expect(template.name).toBeTruthy();
        expect(template.description).toBeTruthy();
        expect(template.icon).toBeTruthy();
        expect(template.category).toBeTruthy();
        expect(template.systemPrompt).toBeTruthy();
        expect(Array.isArray(template.suggestedMcpServers)).toBe(true);
        expect(Array.isArray(template.tags)).toBe(true);
      }
    });
  });

  describe("POST /api/agent-templates/:templateId/create", () => {
    test("creates agent from template with default name", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/agent-templates/code-reviewer/create",
        payload: {},
      });

      expect(response.statusCode).toBe(201);
      const agent = response.json();
      expect(agent.name).toBe("Code Reviewer");
      expect(agent.description).toBeTruthy();
      expect(agent.icon).toBeTruthy();
      expect(agent.systemPrompt).toBeTruthy();
      expect(agent.organizationId).toBe(organizationId);
    });

    test("creates agent from template with custom name", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/agent-templates/code-reviewer/create",
        payload: { name: "My Custom Reviewer" },
      });

      expect(response.statusCode).toBe(201);
      const agent = response.json();
      expect(agent.name).toBe("My Custom Reviewer");
    });

    test("creates agent from template with custom scope", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/agent-templates/code-reviewer/create",
        payload: { scope: "team" },
      });

      expect(response.statusCode).toBe(201);
      const agent = response.json();
      expect(agent.scope).toBe("team");
    });

    test("returns 404 for nonexistent template", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/agent-templates/nonexistent-template/create",
        payload: {},
      });

      expect(response.statusCode).toBe(404);
      const body = response.json();
      expect(body.error).toBeTruthy();
    });
  });
});
