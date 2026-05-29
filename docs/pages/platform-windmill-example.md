---
title: Secure Agent with Windmill
category: Examples
order: 5
---

Windmill is an open-source developer platform for building internal tools, workflows, and UIs from scripts. It provides a self-hosted alternative to services like Retool, n8n, and Airflow, offering complete data control and extensive customization capabilities.

## Security Challenges with Autonomous Windmill Agents

While Windmill excels at executing pre-defined workflows with deterministic behavior, its flexibility in building fully autonomous AI agents introduces significant security risks. When Windmill workflows incorporate LLMs that can dynamically determine actions based on user input or external data, they become vulnerable to the [lethal trifecta](/docs/platform-lethal-trifecta):

1. **Access to Private Data**: Windmill workflows often connect to databases, APIs, and internal systems containing sensitive information
2. **Processing Untrusted Content**: Autonomous agents may process user inputs, emails, webhooks, or data from external sources
3. **External Communication**: Windmill scripts can send HTTP requests, write to databases, trigger other workflows, or interact with third-party services

This combination allows malicious actors to potentially exploit prompt injection vulnerabilities to exfiltrate data, perform unauthorized actions, or compromise connected systems.

## Securing Windmill with Archestra Platform

Archestra Platform provides a security layer that enables safe deployment of autonomous Windmill agents without sacrificing functionality. This instruction covers how to integrate Archestra with your Windmill workflows.

### 0. Running Windmill and Archestra Platform

We've prepared a docker-compose with local Windmill and Archestra:

```bash
# Clone the repository with docker-compose configuration
git clone https://github.com/archestra-ai/archestra
cd platform

# Start Windmill and Archestra Platform
docker-compose -f docker-compose-windmill.yml up

# Access Windmill at http://localhost:8000
# Archestra Platform runs at http://localhost:3000
```

### 1. Building Autonomous Agent with Windmill

Build a simple autonomous agent in Windmill using the MCP tools and OpenAI model.

1. Create a new flow in Windmill
2. Add an MCP Client step connected to your MCP server
3. Add an LLM step using OpenAI gpt-4o
4. Connect the steps to create an agent loop

### 2. Connecting Windmill to Archestra

Configure Windmill to use Archestra as an LLM proxy:

1. In Windmill, go to Settings → AI Providers
2. Set the base URL to: `http://localhost:9000/v1/openai`
3. Add your Archestra API key
4. Test the connection

### 3. Using MCP Apps for Interactive Workflow Management

With the Windmill MCP Apps server, you can manage workflows directly from Archestra chat:

```
User: Show me my Windmill workflows
Agent: [Displays interactive flow table with edit/run buttons]

User: Edit the "send-email" flow
Agent: [Opens visual flow editor with step-by-step nodes]

User: Add a new step to fetch data from Confluence
Agent: [Adds new module node to the flow]

User: Run the flow
Agent: [Executes flow and shows real-time status]
```

### 4. Security Features

Archestra provides several security features for Windmill workflows:

- **Tool Invocation Policies**: Control which tools can be called in different contexts
- **Context Trust Evaluation**: Automatically evaluate trustworthiness of data in context
- **Approval Workflows**: Require human approval for sensitive operations
- **Audit Logging**: Track all tool calls and workflow executions

### 5. MCP Apps UI

The Windmill MCP Apps server provides interactive HTML UI that renders directly in Archestra chat:

- **Flow List**: Table view with status indicators and action buttons
- **Flow Editor**: Visual node editor for workflow steps
- **Run Monitor**: Real-time execution status with log access

All UI elements communicate with Archestra via `postMessage` for seamless integration.

### 6. Example: Confluence to Email Workflow

Here's an example workflow that fetches data from Confluence and sends an email:

```javascript
// Flow: confluence-to-email
{
  path: "confluence-to-email",
  summary: "Fetch Confluence page and send email summary",
  description: "This workflow fetches a Confluence page, summarizes it using AI, and sends the summary via email.",
  value: {
    modules: [
      {
        id: "fetch-confluence",
        value: {
          type: "script",
          path: "hub/confluence/get_page"
        }
      },
      {
        id: "summarize",
        value: {
          type: "rawscript",
          content: `
            // Use Archestra LLM proxy for summarization
            const response = await fetch('http://localhost:9000/v1/openai/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + env.ARCHESTRA_API_KEY
              },
              body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                  { role: 'system', content: 'Summarize the following Confluence page.' },
                  { role: 'user', content: flow_input.confluence_content }
                ]
              })
            });
            return (await response.json()).choices[0].message.content;
          `
        }
      },
      {
        id: "send-email",
        value: {
          type: "script",
          path: "hub/email/send"
        }
      }
    ]
  }
}
```

### 7. Tracking Workflow Executions

Archestra tracks all Windmill workflow executions through the LLM proxy:

- **Execution IDs**: Each workflow run gets a unique ID
- **Cost Tracking**: Monitor LLM inference costs per workflow
- **Performance Metrics**: Track execution time and success rates

The built-in [GenAI Observability dashboard](https://github.com/archestra-ai/archestra/blob/main/platform/dev/grafana/dashboards/genai-observability.json) includes this in the main **Cost** section.

## Best Practices

1. **Use Archestra as LLM Proxy**: Route all LLM calls through Archestra for security and monitoring
2. **Define Clear Boundaries**: Use tool invocation policies to restrict dangerous operations
3. **Enable Approval Workflows**: Require human approval for sensitive data access
4. **Monitor Executions**: Use Archestra's observability features to track workflow performance
5. **Regular Audits**: Review tool call logs and execution history for anomalies
