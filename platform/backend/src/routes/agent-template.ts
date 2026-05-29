import { RouteId } from "@shared";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { AgentModel } from "@/models";
import { ApiError, constructResponseSchema, SelectAgentSchema } from "@/types";
import {
  AGENT_TEMPLATES,
  getTemplateById,
} from "@shared/agent-templates";

const AgentTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  category: z.string(),
  systemPrompt: z.string(),
  suggestedMcpServers: z.array(z.string()),
  tags: z.array(z.string()),
});

const agentTemplateRoutes: FastifyPluginAsyncZod = async (fastify) => {
  /**
   * GET /api/agent-templates
   * List all available agent templates
   */
  fastify.get(
    "/api/agent-templates",
    {
      schema: {
        operationId: RouteId.GetAgentTemplates,
        description: "List all available agent templates for quickstart",
        tags: ["Agent Templates"],
        response: {
          200: z.array(AgentTemplateSchema),
        },
      },
    },
    async (_request, reply) => {
      return reply.send(AGENT_TEMPLATES);
    }
  );

  /**
   * POST /api/agent-templates/:templateId/create
   * Create a new agent from a template
   */
  fastify.post(
    "/api/agent-templates/:templateId/create",
    {
      schema: {
        operationId: RouteId.CreateAgentFromTemplate,
        description: "Create a new agent from a template",
        tags: ["Agent Templates"],
        params: z.object({
          templateId: z.string().describe("The template ID to create from"),
        }),
        body: z
          .object({
            name: z
              .string()
              .optional()
              .describe("Custom name for the agent (defaults to template name)"),
            scope: z
              .enum(["personal", "team", "org"])
              .optional()
              .describe("Agent scope (defaults to personal)"),
          })
          .optional(),
        response: constructResponseSchema(SelectAgentSchema),
      },
    },
    async ({ params: { templateId }, body, user, organizationId }, reply) => {
      const template = getTemplateById(templateId);
      if (!template) {
        throw new ApiError(404, `No template found with ID: ${templateId}`);
      }

      const { name, scope } = body || {};

      // Create the agent from template
      const agent = await AgentModel.create(
        {
          organizationId,
          name: name || template.name,
          description: template.description,
          icon: template.icon,
          agentType: "agent",
          scope: scope || "personal",
          systemPrompt: template.systemPrompt,
          considerContextUntrusted: false,
          teams: [],
        },
        user.id
      );

      return reply.status(201).send(agent);
    }
  );
};

export default agentTemplateRoutes;
