#!/usr/bin/env node

/**
 * Windmill MCP Server for Archestra
 * 
 * Provides Windmill workflow management tools as MCP Apps.
 * Supports: list flows, create flows, edit flows, run flows, get flow details.
 * Returns interactive HTML UI for MCP Apps rendering in Archestra chat.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const WINDMILL_BASE_URL = process.env.WINDMILL_BASE_URL || "http://localhost:8000";
const WINDMILL_API_TOKEN = process.env.WINDMILL_API_TOKEN || "";
const WINDMILL_WORKSPACE = process.env.WINDMILL_WORKSPACE || "admins";

/**
 * Make a request to Windmill API
 */
async function windmillRequest(path, options = {}) {
  const url = `${WINDMILL_BASE_URL}/api${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(WINDMILL_API_TOKEN ? { Authorization: `Bearer ${WINDMILL_API_TOKEN}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Windmill API error: ${response.status} - ${error}`);
  }

  return response.json();
}

/**
 * Generate interactive HTML for MCP Apps display
 */
function generateFlowListHTML(flows) {
  const flowRows = flows
    .map(
      (flow) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
        <strong>${flow.path || flow.summary || "Unnamed"}</strong>
        <br><small style="color: #6b7280;">${flow.description || "No description"}</small>
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
        <span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
          ${flow.archived ? "Archived" : "Active"}
        </span>
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
        <button onclick="editFlow('${flow.path}')" style="background: #3b82f6; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer; margin-right: 4px;">Edit</button>
        <button onclick="runFlow('${flow.path}')" style="background: #10b981; color: white; border: none; padding: 4px 12px; border-radius: 4px; cursor: pointer;">Run</button>
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 16px; background: #f9fafb; }
    h2 { color: #111827; margin: 0 0 16px 0; }
    table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    th { background: #f3f4f6; padding: 12px 8px; text-align: left; font-weight: 600; color: #374151; }
    .actions { margin-top: 16px; }
    .btn { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .btn:hover { background: #2563eb; }
  </style>
</head>
<body>
  <h2>🌬️ Windmill Workflows</h2>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      ${flowRows}
    </tbody>
  </table>
  <div class="actions">
    <button class="btn" onclick="createFlow()">+ Create New Flow</button>
  </div>
  <script>
    function editFlow(path) {
      window.parent.postMessage({ type: 'mcp-app-action', action: 'edit_flow', path }, '*');
    }
    function runFlow(path) {
      window.parent.postMessage({ type: 'mcp-app-action', action: 'run_flow', path }, '*');
    }
    function createFlow() {
      window.parent.postMessage({ type: 'mcp-app-action', action: 'create_flow' }, '*');
    }
  </script>
</body>
</html>`;
}

/**
 * Generate flow editor HTML
 */
function generateFlowEditorHTML(flow) {
  const modules = flow.value?.modules || [];
  const moduleNodes = modules
    .map(
      (mod, i) => `
    <div style="background: white; border: 2px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 8px 0; position: relative;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong>Step ${i + 1}: ${mod.id || "Unnamed"}</strong>
        <span style="background: #fef3c7; color: #92400e; padding: 2px 8px; border-radius: 12px; font-size: 12px;">
          ${mod.value?.type || "script"}
        </span>
      </div>
      <div style="margin-top: 8px; color: #6b7280; font-size: 14px;">
        ${mod.value?.path || mod.value?.content || "No configuration"}
      </div>
      <div style="margin-top: 8px;">
        <button onclick="editModule(${i})" style="background: #8b5cf6; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">Edit</button>
        <button onclick="deleteModule(${i})" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-left: 4px;">Delete</button>
      </div>
      ${i < modules.length - 1 ? '<div style="text-align: center; color: #9ca3af; margin: 4px 0;">↓</div>' : ""}
    </div>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 16px; background: #f9fafb; }
    h2 { color: #111827; margin: 0 0 16px 0; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .flow-info { background: white; border-radius: 8px; padding: 16px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .btn { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .btn:hover { background: #2563eb; }
    .btn-success { background: #10b981; }
    .btn-success:hover { background: #059669; }
    .nodes { background: #f3f4f6; border-radius: 8px; padding: 16px; }
  </style>
</head>
<body>
  <div class="header">
    <h2>✏️ Edit Flow: ${flow.path}</h2>
    <div>
      <button class="btn" onclick="saveFlow()">💾 Save</button>
      <button class="btn btn-success" onclick="runFlow()" style="margin-left: 8px;">▶️ Run</button>
    </div>
  </div>
  <div class="flow-info">
    <p><strong>Path:</strong> ${flow.path}</p>
    <p><strong>Description:</strong> ${flow.description || "No description"}</p>
    <p><strong>Steps:</strong> ${modules.length}</p>
  </div>
  <div class="nodes">
    <h3>Flow Steps</h3>
    ${moduleNodes || "<p>No steps defined. Add a step to get started.</p>"}
    <button class="btn" onclick="addModule()" style="margin-top: 8px;">+ Add Step</button>
  </div>
  <script>
    function editModule(index) {
      window.parent.postMessage({ type: 'mcp-app-action', action: 'edit_module', index }, '*');
    }
    function deleteModule(index) {
      window.parent.postMessage({ type: 'mcp-app-action', action: 'delete_module', index }, '*');
    }
    function addModule() {
      window.parent.postMessage({ type: 'mcp-app-action', action: 'add_module' }, '*');
    }
    function saveFlow() {
      window.parent.postMessage({ type: 'mcp-app-action', action: 'save_flow', path: '${flow.path}' }, '*');
    }
    function runFlow() {
      window.parent.postMessage({ type: 'mcp-app-action', action: 'run_flow', path: '${flow.path}' }, '*');
    }
  </script>
</body>
</html>`;
}

/**
 * Generate run result HTML
 */
function generateRunResultHTML(jobId, flowPath, status) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 16px; background: #f9fafb; }
    .result { background: white; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }
    .success { color: #059669; }
    .pending { color: #d97706; }
    .error { color: #dc2626; }
    .btn { background: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="result">
    <h2 class="${status === "success" ? "success" : status === "running" ? "pending" : "error"}">
      ${status === "success" ? "✅" : status === "running" ? "⏳" : "❌"} Flow Execution ${status === "success" ? "Complete" : status === "running" ? "In Progress" : "Failed"}
    </h2>
    <p><strong>Flow:</strong> ${flowPath}</p>
    <p><strong>Job ID:</strong> ${jobId}</p>
    <p><strong>Status:</strong> ${status}</p>
    <button class="btn" onclick="viewLogs()">View Logs</button>
    <button class="btn" onclick="backToList()" style="margin-left: 8px;">Back to Flows</button>
  </div>
  <script>
    function viewLogs() {
      window.parent.postMessage({ type: 'mcp-app-action', action: 'view_logs', jobId: '${jobId}' }, '*');
    }
    function backToList() {
      window.parent.postMessage({ type: 'mcp-app-action', action: 'list_flows' }, '*');
    }
  </script>
</body>
</html>`;
}

// Define tools
const TOOLS = [
  {
    name: "list_flows",
    description: "List all Windmill flows in the workspace. Returns an interactive HTML UI showing all flows with edit and run buttons.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_flow",
    description: "Get details of a specific Windmill flow. Returns an interactive HTML editor UI.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "The path of the flow to get",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "create_flow",
    description: "Create a new Windmill flow. Returns the created flow details.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "The path for the new flow",
        },
        summary: {
          type: "string",
          description: "A short summary of the flow",
        },
        description: {
          type: "string",
          description: "A detailed description of the flow",
        },
        modules: {
          type: "array",
          description: "Array of flow modules/steps",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { type: "string", enum: ["script", "rawscript", "flow", "forloopflow", "branchone", "branchall"] },
              path: { type: "string" },
              content: { type: "string" },
            },
          },
        },
      },
      required: ["path"],
    },
  },
  {
    name: "update_flow",
    description: "Update an existing Windmill flow. Returns the updated flow details.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "The path of the flow to update",
        },
        summary: {
          type: "string",
          description: "A short summary of the flow",
        },
        description: {
          type: "string",
          description: "A detailed description of the flow",
        },
        modules: {
          type: "array",
          description: "Array of flow modules/steps",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { type: "string" },
              path: { type: "string" },
              content: { type: "string" },
            },
          },
        },
      },
      required: ["path"],
    },
  },
  {
    name: "run_flow",
    description: "Run a Windmill flow. Returns the job ID and status.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "The path of the flow to run",
        },
        args: {
          type: "object",
          description: "Arguments to pass to the flow",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "get_job_status",
    description: "Get the status of a Windmill job. Returns an interactive HTML UI showing the job status.",
    inputSchema: {
      type: "object",
      properties: {
        jobId: {
          type: "string",
          description: "The ID of the job to check",
        },
      },
      required: ["jobId"],
    },
  },
];

// Create MCP server
const server = new Server(
  {
    name: "windmill-mcp-apps",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "list_flows": {
        const flows = await windmillRequest(
          `/w/${WINDMILL_WORKSPACE}/flows/list`
        );
        const html = generateFlowListHTML(flows);
        return {
          content: [
            {
              type: "text",
              text: `Found ${flows.length} flows in workspace ${WINDMILL_WORKSPACE}`,
            },
            {
              type: "resource",
              resource: {
                uri: `mcp-app://windmill/flows/list`,
                mimeType: "text/html;profile=mcp-app",
                text: html,
              },
            },
          ],
        };
      }

      case "get_flow": {
        const flow = await windmillRequest(
          `/w/${WINDMILL_WORKSPACE}/flows/get/${args.path}`
        );
        const html = generateFlowEditorHTML(flow);
        return {
          content: [
            {
              type: "text",
              text: `Flow: ${flow.path}\nDescription: ${flow.description || "No description"}\nSteps: ${flow.value?.modules?.length || 0}`,
            },
            {
              type: "resource",
              resource: {
                uri: `mcp-app://windmill/flows/get/${args.path}`,
                mimeType: "text/html;profile=mcp-app",
                text: html,
              },
            },
          ],
        };
      }

      case "create_flow": {
        const flowData = {
          path: args.path,
          summary: args.summary || "",
          description: args.description || "",
          value: {
            modules: args.modules || [],
          },
        };
        const result = await windmillRequest(
          `/w/${WINDMILL_WORKSPACE}/flows/create`,
          {
            method: "POST",
            body: JSON.stringify(flowData),
          }
        );
        return {
          content: [
            {
              type: "text",
              text: `Created flow: ${result.path}\nSummary: ${result.summary || "No summary"}`,
            },
          ],
        };
      }

      case "update_flow": {
        const flowData = {
          summary: args.summary,
          description: args.description,
          value: {
            modules: args.modules,
          },
        };
        const result = await windmillRequest(
          `/w/${WINDMILL_WORKSPACE}/flows/update/${args.path}`,
          {
            method: "POST",
            body: JSON.stringify(flowData),
          }
        );
        return {
          content: [
            {
              type: "text",
              text: `Updated flow: ${args.path}`,
            },
          ],
        };
      }

      case "run_flow": {
        const result = await windmillRequest(
          `/w/${WINDMILL_WORKSPACE}/jobs/run/f/${args.path}`,
          {
            method: "POST",
            body: JSON.stringify(args.args || {}),
          }
        );
        const html = generateRunResultHTML(result, args.path, "running");
        return {
          content: [
            {
              type: "text",
              text: `Started flow: ${args.path}\nJob ID: ${result}`,
            },
            {
              type: "resource",
              resource: {
                uri: `mcp-app://windmill/jobs/${result}`,
                mimeType: "text/html;profile=mcp-app",
                text: html,
              },
            },
          ],
        };
      }

      case "get_job_status": {
        const job = await windmillRequest(
          `/w/${WINDMILL_WORKSPACE}/jobs/get/${args.jobId}`
        );
        const status = job.type === "CompletedJob" ? "success" : "running";
        const html = generateRunResultHTML(args.jobId, job.script_path || "unknown", status);
        return {
          content: [
            {
              type: "text",
              text: `Job ${args.jobId}: ${status}`,
            },
            {
              type: "resource",
              resource: {
                uri: `mcp-app://windmill/jobs/${args.jobId}`,
                mimeType: "text/html;profile=mcp-app",
                text: html,
              },
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Windmill MCP Apps server started");
}

main().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
