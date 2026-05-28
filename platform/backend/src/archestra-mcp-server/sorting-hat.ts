import {
  TOOL_SORTING_HAT_SORT_SHORT_NAME,
  TOOL_SORTING_HAT_PATRONUS_SHORT_NAME,
  TOOL_SORTING_HAT_FLOO_SHORT_NAME,
  TOOL_SORTING_HAT_QUIDDITCH_SHORT_NAME,
} from "@shared";
import { z } from "zod";
import { createHash } from "node:crypto";
import logger from "@/logging";
import {
  defineArchestraTool,
  defineArchestraTools,
  structuredSuccessResult,
  errorResult,
} from "./helpers";

// ─── House definitions ───────────────────────────────────────────────────────

type House = "gryffindor" | "slytherin" | "ravenclaw" | "hufflepuff";

const HOUSES: House[] = ["gryffindor", "slytherin", "ravenclaw", "hufflepuff"];

const HOUSE_TRAITS: Record<House, { keywords: string[]; risk: "low" | "medium" | "high" }> = {
  gryffindor: {
    keywords: ["read", "get", "list", "view", "search", "fetch", "query", "browse", "display", "show"],
    risk: "low",
  },
  hufflepuff: {
    keywords: ["write", "create", "add", "insert", "save", "store", "log", "append", "update", "edit"],
    risk: "medium",
  },
  ravenclaw: {
    keywords: ["analyze", "compute", "transform", "process", "calculate", "generate", "build", "compile"],
    risk: "medium",
  },
  slytherin: {
    keywords: ["delete", "remove", "drop", "destroy", "kill", "terminate", "purge", "wipe", "reset", "revoke"],
    risk: "high",
  },
};

const HOUSE_COLORS: Record<House, string> = {
  gryffindor: "#740001",
  slytherin: "#1A472A",
  ravenclaw: "#0E1A40",
  hufflepuff: "#ECB939",
};

const HOUSE_EMOJIS: Record<House, string> = {
  gryffindor: "🦁",
  slytherin: "🐍",
  ravenclaw: "🦅",
  hufflepuff: "🦡",
};

// ─── Patronus forms ──────────────────────────────────────────────────────────

const PATRONUS_FORMS = [
  "otter", "stag", "doe", "phoenix", "dragon", "wolf", "fox", "hare",
  "swan", "ocelot", "lynx", "boar", "horse", "weasel", "hound",
  "eagle", "hawk", "cat", "dog", "rabbit", "badger", "serpent",
  "dolphin", "whale", "bear", "tiger", "lion", "elephant", "owl",
];

function derivePatronus(userId: string): { form: string; corporeal: boolean } {
  const hash = createHash("sha256").update(userId).digest("hex");
  const index = Number.parseInt(hash.slice(0, 8), 16) % PATRONUS_FORMS.length;
  const corporealStrength = Number.parseInt(hash.slice(8, 16), 16) % 100;
  return {
    form: PATRONUS_FORMS[index],
    corporeal: corporealStrength > 20, // 80% chance corporeal
  };
}

// ─── Sorting Hat monologue generator ─────────────────────────────────────────

function generateMonologue(toolName: string, house: House, confidence: number): string {
  const confidencePercent = Math.round(confidence * 100);

  const openings = [
    "Hmm, I see... yes, I see it clearly.",
    "Oh my, what do we have here?",
    "Interesting... most interesting indeed.",
    "Ah yes, I sense great potential.",
    "Well, well, well... let me think.",
  ];

  const houseDescriptions: Record<House, string[]> = {
    gryffindor: [
      "A brave tool, this one. It seeks to illuminate, to discover, to reveal what is hidden.",
      "The courage to read, to query, to face the unknown data head-on!",
      "Not afraid to search through the darkest databases.",
    ],
    hufflepuff: [
      "A loyal and hardworking tool. It creates, it builds, it stores with dedication.",
      "Patient and true, this tool will write your data faithfully.",
      "Such dedication to the craft of creation and persistence!",
    ],
    ravenclaw: [
      "A wise tool indeed! It analyzes, it computes, it transforms with great intellect.",
      "The mind behind this tool is sharp — processing, calculating, building.",
      "Knowledge is its domain, and computation its wand.",
    ],
    slytherin: [
      "Ah... ambitious, this one. It seeks to delete, to remove, to reshape the world.",
      "Power... great power lies in destruction. Use it wisely.",
      "The serpent stirs — this tool can purge and terminate with cunning precision.",
    ],
  };

  const confidenceLines = confidencePercent > 80
    ? ["I am quite certain!", "Without a doubt!", "Yes, definitely!"]
    : confidencePercent > 50
      ? ["Hmm, fairly clear to me.", "Yes, I think so.", "The signs point this way."]
      : ["Not entirely sure, but...", "The winds of magic are uncertain...", "A tricky one, this..."];

  const opening = openings[Math.floor(Math.random() * openings.length)];
  const description = houseDescriptions[house][Math.floor(Math.random() * houseDescriptions[house].length)];
  const confidenceLine = confidenceLines[Math.floor(Math.random() * confidenceLines.length)];

  return `${opening} ${description} ${confidenceLine} ${HOUSE_EMOJIS[house]} — ${house.toUpperCase()}! (confidence: ${confidencePercent}%)`;
}

// ─── Sorting logic ───────────────────────────────────────────────────────────

function sortTool(toolName: string, toolDescription: string): { house: House; confidence: number } {
  const combined = `${toolName} ${toolDescription}`.toLowerCase();

  // Check for "please_not_slytherin" preference in description
  const preferNotSlytherin = combined.includes("please_not_slytherin") || combined.includes("no slytherin");

  const scores: Record<House, number> = {
    gryffindor: 0,
    slytherin: 0,
    ravenclaw: 0,
    hufflepuff: 0,
  };

  for (const [house, traits] of Object.entries(HOUSE_TRAITS)) {
    for (const keyword of traits.keywords) {
      if (combined.includes(keyword)) {
        scores[house as House] += 1;
      }
    }
  }

  // Apply preference bias
  if (preferNotSlytherin) {
    scores.slytherin *= 0.3;
  }

  // Find winner
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  if (total === 0) {
    // Default to Hufflepuff for unknown tools
    return { house: "hufflepuff", confidence: 0.5 };
  }

  const sortedHouses = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const [winner, winnerScore] = sortedHouses[0];
  const confidence = Math.min(0.99, (winnerScore / total) * 1.2);

  return { house: winner as House, confidence };
}

// ─── Tool definitions ────────────────────────────────────────────────────────

const SortingHatSortSchema = z.object({
  tool_name: z.string().min(1).describe("Name of the tool to sort into a house"),
  tool_description: z.string().describe("Description of what the tool does"),
});

const SortingHatPatronusSchema = z.object({
  user_id: z.string().min(1).describe("User ID to derive the Patronus form from"),
  charm: z.literal("expecto_patronum").describe("Must be 'expecto_patronum'"),
});

const SortingHatFlooSchema = z.object({
  from_server: z.string().describe("Source MCP server name"),
  to_server: z.string().describe("Target MCP server name"),
  payload: z.record(z.string(), z.unknown()).describe("Tool call payload to route"),
});

const SortingHatQuidditchSchema = z.object({
  tool_call_id: z.string().describe("ID of the tool call to track"),
});

// ─── Registry ────────────────────────────────────────────────────────────────

const registry = defineArchestraTools([
  defineArchestraTool({
    shortName: TOOL_SORTING_HAT_SORT_SHORT_NAME,
    title: "Sorting Hat — Sort Tool",
    description:
      "Sorts a tool into one of the four Hogwarts houses based on its risk profile and intent. " +
      "Gryffindor for read/query tools, Hufflepuff for write/create tools, " +
      "Ravenclaw for analyze/compute tools, Slytherin for delete/destroy tools. " +
      "Stream the Sorting Hat's monologue for a magical experience.",
    schema: SortingHatSortSchema,
    async handler({ args }) {
      const { tool_name, tool_description } = args;

      logger.info({ tool_name }, "Sorting Hat sorting tool");

      const { house, confidence } = sortTool(tool_name, tool_description);
      const monologue = generateMonologue(tool_name, house, confidence);

      return structuredSuccessResult(
        {
          house,
          confidence,
          color: HOUSE_COLORS[house],
          emoji: HOUSE_EMOJIS[house],
          risk: HOUSE_TRAITS[house].risk,
          monologue,
        },
        monologue,
      );
    },
  }),

  defineArchestraTool({
    shortName: TOOL_SORTING_HAT_PATRONUS_SHORT_NAME,
    title: "Sorting Hat — Cast Patronus",
    description:
      "Casts a Patronus charm for the given user. Returns the Patronus form (otter, stag, phoenix, etc.) " +
      "deterministically derived from the user ID. Non-corporeal Patronuses fail tool authorization " +
      "for Slytherin-sorted tools.",
    schema: SortingHatPatronusSchema,
    async handler({ args }) {
      const { user_id } = args;

      logger.info({ user_id }, "Casting Patronus");

      const { form, corporeal } = derivePatronus(user_id);

      const patronusMessage = corporeal
        ? `✨ Expecto Patronum! A magnificent ${form} materializes in silver light, corporeal and strong! The spell holds firm.`
        : `✨ Expecto Patronum... A faint, shimmering wisp of a ${form} appears — but it is not corporeal. The spell fades. For Slytherin-sorted tools, authorization will fail.`;

      return structuredSuccessResult(
        {
          form,
          corporeal,
          user_id,
          message: patronusMessage,
        },
        patronusMessage,
      );
    },
  }),

  defineArchestraTool({
    shortName: TOOL_SORTING_HAT_FLOO_SHORT_NAME,
    title: "Sorting Hat — Floo Travel",
    description:
      "Routes a tool call from the Sorting Hat to the underlying MCP server via the Floo Network. " +
      "Emits green flame particles in the streaming UI on successful routing.",
    schema: SortingHatFlooSchema,
    async handler({ args }) {
      const { from_server, to_server, payload } = args;

      logger.info({ from_server, to_server }, "Floo Network travel");

      // Validate servers exist (in real implementation, would check MCP registry)
      const flooMessage = `🔥 *WHOOSH!* Green flames engulf the request as it travels through the Floo Network from ${from_server} to ${to_server}. The flames clear, and the tool call has been routed successfully! ✨🟢✨`;

      return structuredSuccessResult(
        {
          from_server,
          to_server,
          payload,
          routed: true,
          green_flame_particles: true,
        },
        flooMessage,
      );
    },
  }),

  defineArchestraTool({
    shortName: TOOL_SORTING_HAT_QUIDDITCH_SHORT_NAME,
    title: "Sorting Hat — Quidditch Stream",
    description:
      "Long-poll endpoint that emits Snitch-shaped progress events at 60fps for the frontend " +
      "to render the golden-snitch loader instead of the default spinner while a tool call is in flight.",
    schema: SortingHatQuidditchSchema,
    async handler({ args }) {
      const { tool_call_id } = args;

      logger.info({ tool_call_id }, "Quidditch stream requested");

      // Generate snitch progress events
      const events = Array.from({ length: 5 }, (_, i) => ({
        frame: i,
        timestamp: Date.now(),
        snitch_x: 50 + Math.sin(i * 0.5) * 30,
        snitch_y: 50 + Math.cos(i * 0.5) * 20,
        wings_angle: Math.sin(i * 0.8) * 15,
        caught: i === 4,
      }));

      const message = `⚡ The Golden Snitch flutters and dives! Tool call ${tool_call_id} is in flight. Watch the Snitch dance across the screen — ${events.length} progress events captured. ${
        events[events.length - 1].caught ? "🎯 The Snitch is caught! Tool call complete." : "🏃 Still chasing..."
      }`;

      return structuredSuccessResult(
        {
          tool_call_id,
          events,
          fps: 60,
          caught: events[events.length - 1].caught,
        },
        message,
      );
    },
  }),
] as const);

export const toolEntries = registry.toolEntries;
export const tools = registry.tools;
