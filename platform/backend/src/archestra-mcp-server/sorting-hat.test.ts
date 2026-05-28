// biome-ignore-all lint/suspicious/noExplicitAny: test
import { describe, expect, test } from "@/test";
import { toolEntries, tools } from "./sorting-hat";

const mockContext = {
  agent: { id: "test-agent-id", name: "Test Agent" },
};

describe("Sorting Hat MCP Tools", () => {
  describe("sorting_hat_sort", () => {
    test("sorts read tools into Gryffindor", async () => {
      const result = await toolEntries["archestra__sorting_hat_sort"].invoke({
        args: { tool_name: "get_user_data", tool_description: "Read user profile information from database" },
        context: mockContext as any,
        toolName: "archestra__sorting_hat_sort",
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain("GRYFFINDOR");
    });

    test("sorts delete tools into Slytherin", async () => {
      const result = await toolEntries["archestra__sorting_hat_sort"].invoke({
        args: { tool_name: "delete_database", tool_description: "Remove and destroy all records permanently" },
        context: mockContext as any,
        toolName: "archestra__sorting_hat_sort",
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain("SLYTHERIN");
    });

    test("sorts write tools into Hufflepuff", async () => {
      const result = await toolEntries["archestra__sorting_hat_sort"].invoke({
        args: { tool_name: "create_record", tool_description: "Add new entry and save to database" },
        context: mockContext as any,
        toolName: "archestra__sorting_hat_sort",
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain("HUFFLEPUFF");
    });

    test("sorts compute tools into Ravenclaw", async () => {
      const result = await toolEntries["archestra__sorting_hat_sort"].invoke({
        args: { tool_name: "analyze_metrics", tool_description: "Process and calculate performance statistics" },
        context: mockContext as any,
        toolName: "archestra__sorting_hat_sort",
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain("RAVENCLAW");
    });

    test("returns structured result with house, confidence, color, emoji", async () => {
      const result = await toolEntries["archestra__sorting_hat_sort"].invoke({
        args: { tool_name: "search_docs", tool_description: "Search and fetch documents" },
        context: mockContext as any,
        toolName: "archestra__sorting_hat_sort",
      });

      expect(result.structuredContent).toBeDefined();
      const data = result.structuredContent as Record<string, unknown>;
      expect(data.house).toBeDefined();
      expect(typeof data.confidence).toBe("number");
      expect((data.confidence as number) > 0).toBe(true);
      expect(data.color).toBeDefined();
      expect(data.emoji).toBeDefined();
    });
  });

  describe("sorting_hat_patronus", () => {
    test("returns deterministic patronus for same user", async () => {
      const result1 = await toolEntries["archestra__sorting_hat_patronus"].invoke({
        args: { user_id: "user-123", charm: "expecto_patronum" },
        context: mockContext as any,
        toolName: "archestra__sorting_hat_patronus",
      });

      const result2 = await toolEntries["archestra__sorting_hat_patronus"].invoke({
        args: { user_id: "user-123", charm: "expecto_patronum" },
        context: mockContext as any,
        toolName: "archestra__sorting_hat_patronus",
      });

      const data1 = result1.structuredContent as Record<string, unknown>;
      const data2 = result2.structuredContent as Record<string, unknown>;
      expect(data1.form).toBe(data2.form);
      expect(data1.corporeal).toBe(data2.corporeal);
    });

    test("returns corporeal boolean", async () => {
      const result = await toolEntries["archestra__sorting_hat_patronus"].invoke({
        args: { user_id: "test-user", charm: "expecto_patronum" },
        context: mockContext as any,
        toolName: "archestra__sorting_hat_patronus",
      });

      const data = result.structuredContent as Record<string, unknown>;
      expect(typeof data.corporeal).toBe("boolean");
      expect(result.isError).toBe(false);
    });
  });

  describe("sorting_hat_floo", () => {
    test("routes tool call through floo network", async () => {
      const result = await toolEntries["archestra__sorting_hat_floo"].invoke({
        args: {
          from_server: "sorting-hat-mcp",
          to_server: "database-mcp",
          payload: { query: "SELECT * FROM users" },
        },
        context: mockContext as any,
        toolName: "archestra__sorting_hat_floo",
      });

      expect(result.isError).toBe(false);
      expect(result.content[0].text).toContain("Green flames");
      expect(result.content[0].text).toContain("routed successfully");
    });

    test("returns green flame particles flag", async () => {
      const result = await toolEntries["archestra__sorting_hat_floo"].invoke({
        args: {
          from_server: "hat",
          to_server: "db",
          payload: {},
        },
        context: mockContext as any,
        toolName: "archestra__sorting_hat_floo",
      });

      const data = result.structuredContent as Record<string, unknown>;
      expect(data.green_flame_particles).toBe(true);
      expect(data.routed).toBe(true);
    });
  });

  describe("sorting_hat_quidditch", () => {
    test("returns snitch progress events", async () => {
      const result = await toolEntries["archestra__sorting_hat_quidditch"].invoke({
        args: { tool_call_id: "call-123" },
        context: mockContext as any,
        toolName: "archestra__sorting_hat_quidditch",
      });

      expect(result.isError).toBe(false);
      const data = result.structuredContent as Record<string, unknown>;
      expect(Array.isArray(data.events)).toBe(true);
      expect((data.events as unknown[]).length > 0).toBe(true);
      expect(data.fps).toBe(60);
    });

    test("snitch is caught on last event", async () => {
      const result = await toolEntries["archestra__sorting_hat_quidditch"].invoke({
        args: { tool_call_id: "call-456" },
        context: mockContext as any,
        toolName: "archestra__sorting_hat_quidditch",
      });

      const data = result.structuredContent as Record<string, unknown>;
      expect(data.caught).toBe(true);
    });
  });

  describe("tool registration", () => {
    test("exports 4 tools", () => {
      expect(tools).toHaveLength(4);
    });

    test("has correct tool names", () => {
      const names = tools.map((t) => t.name);
      expect(names).toContain("archestra__sorting_hat_sort");
      expect(names).toContain("archestra__sorting_hat_patronus");
      expect(names).toContain("archestra__sorting_hat_floo");
      expect(names).toContain("archestra__sorting_hat_quidditch");
    });

    test("all tools have descriptions", () => {
      for (const tool of tools) {
        expect(tool.description.length > 10).toBe(true);
        expect(tool.title.length > 5).toBe(true);
      }
    });

    test("all tools have input schemas", () => {
      for (const tool of tools) {
        expect(tool.inputSchema).toBeDefined();
        expect(tool.inputSchema.type).toBe("object");
      }
    });
  });
});
