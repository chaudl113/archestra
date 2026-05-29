# Windmill MCP Apps Server for Archestra

An MCP server that provides interactive Windmill workflow management as MCP Apps in Archestra.

## Features

- **List Flows**: View all Windmill workflows in an interactive table
- **Edit Flows**: Visual flow editor with step-by-step nodes
- **Run Flows**: Execute workflows with one click
- **Job Monitoring**: Track execution status with live updates

## Prerequisites

- Node.js >= 18.0.0
- Windmill instance running (local or remote)
- Windmill API token (for authenticated access)

## Installation

```bash
cd platform/dev/windmill-mcp-server
npm install
```

## Configuration

Set environment variables:

```bash
export WINDMILL_BASE_URL=http://localhost:8000  # Your Windmill instance URL
export WINDMILL_API_TOKEN=your-api-token         # Your Windmill API token
export WINDMILL_WORKSPACE=admins                  # Your Windmill workspace
```

## Usage with Archestra

### Option 1: Local MCP Server

Add to your Archestra MCP server configuration:

```json
{
  "name": "windmill",
  "serverType": "local",
  "localConfig": {
    "command": "node",
    "arguments": ["/path/to/windmill-mcp-server/index.js"],
    "environment": [
      { "key": "WINDMILL_BASE_URL", "value": "http://localhost:8000" },
      { "key": "WINDMILL_API_TOKEN", "value": "your-api-token" },
      { "key": "WINDMILL_WORKSPACE", "value": "admins" }
    ]
  }
}
```

### Option 2: Docker Compose

Use the provided `docker-compose-windmill.yml` in `platform/dev/`:

```bash
cd platform/dev
docker-compose -f docker-compose-windmill.yml up
```

This starts:
- Windmill server (port 8000)
- Windmill worker
- Windmill LSP (port 3001)
- Windmill database
- Archestra platform

## Available Tools

### `list_flows`
List all Windmill flows in the workspace. Returns an interactive HTML table with:
- Flow name and description
- Status indicators
- Edit and Run buttons

### `get_flow`
Get details of a specific flow. Returns an interactive flow editor with:
- Flow metadata
- Visual step-by-step nodes
- Edit, delete, and add step buttons

### `create_flow`
Create a new Windmill flow.

**Parameters:**
- `path` (required): The path for the new flow
- `summary`: A short summary
- `description`: A detailed description
- `modules`: Array of flow modules/steps

### `update_flow`
Update an existing flow.

**Parameters:**
- `path` (required): The path of the flow to update
- `summary`: Updated summary
- `description`: Updated description
- `modules`: Updated array of flow modules

### `run_flow`
Run a Windmill flow.

**Parameters:**
- `path` (required): The path of the flow to run
- `args`: Arguments to pass to the flow

### `get_job_status`
Get the status of a running job.

**Parameters:**
- `jobId` (required): The ID of the job to check

## MCP Apps UI

The server returns interactive HTML that renders as MCP Apps in Archestra chat:

1. **Flow List**: Table view with edit/run actions
2. **Flow Editor**: Visual node editor for flow steps
3. **Run Result**: Job execution status with log access

All UI elements communicate with Archestra via `postMessage` for seamless integration.

## Example Workflow

1. User asks: "Show me my Windmill workflows"
2. Agent calls `list_flows` tool
3. Archestra renders interactive flow table in chat
4. User clicks "Edit" on a flow
5. Agent calls `get_flow` with the flow path
6. Archestra renders visual flow editor
7. User modifies steps and clicks "Save"
8. Agent calls `update_flow` with changes
9. User clicks "Run" to execute
10. Agent calls `run_flow` and shows execution status

## License

Apache 2.0
