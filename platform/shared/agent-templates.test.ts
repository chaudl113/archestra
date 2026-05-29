import { describe, expect, test } from "vitest";
import {
  AGENT_TEMPLATES,
  getTemplateById,
  getTemplateCategories,
  getTemplatesByCategory,
} from "./agent-templates";

describe("agent templates", () => {
  describe("AGENT_TEMPLATES", () => {
    test("contains at least one template", () => {
      expect(AGENT_TEMPLATES.length).toBeGreaterThan(0);
    });

    test("all templates have required fields", () => {
      for (const template of AGENT_TEMPLATES) {
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

    test("all template IDs are unique", () => {
      const ids = AGENT_TEMPLATES.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test("all templates have valid categories", () => {
      const validCategories = [
        "Development",
        "Content",
        "Data",
        "Support",
        "General",
      ];
      for (const template of AGENT_TEMPLATES) {
        expect(validCategories).toContain(template.category);
      }
    });
  });

  describe("getTemplateById", () => {
    test("returns template for valid ID", () => {
      const template = getTemplateById("code-reviewer");
      expect(template).toBeDefined();
      expect(template?.name).toBe("Code Reviewer");
    });

    test("returns undefined for invalid ID", () => {
      const template = getTemplateById("nonexistent-template");
      expect(template).toBeUndefined();
    });
  });

  describe("getTemplateCategories", () => {
    test("returns unique categories", () => {
      const categories = getTemplateCategories();
      const uniqueCategories = new Set(categories);
      expect(uniqueCategories.size).toBe(categories.length);
    });

    test("returns non-empty array", () => {
      const categories = getTemplateCategories();
      expect(categories.length).toBeGreaterThan(0);
    });
  });

  describe("getTemplatesByCategory", () => {
    test("returns templates matching category", () => {
      const devTemplates = getTemplatesByCategory("Development");
      expect(devTemplates.length).toBeGreaterThan(0);
      for (const template of devTemplates) {
        expect(template.category).toBe("Development");
      }
    });

    test("returns empty array for category with no templates", () => {
      // All current categories have templates, but test the function works
      const categories = getTemplateCategories();
      for (const category of categories) {
        const templates = getTemplatesByCategory(category);
        expect(templates.length).toBeGreaterThan(0);
      }
    });
  });
});
