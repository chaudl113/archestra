---
title: Sorting Your MCP Tools
description: Learn how to use the Sorting Hat MCP to add magical governance to tool calls with Hogwarts house assignments, Patronus authorization, and more.
---

# Sorting Your MCP Tools 🎩✨

The Sorting Hat MCP server adds a layer of magical governance to your tool calls. Every tool invocation is sorted into one of the four canonical houses based on its risk profile and intent, and authorized via the user's Patronus.

## Overview

| Tool | Description |
|------|-------------|
| `sorting_hat_sort` | Sorts a tool into Gryffindor, Slytherin, Ravenclaw, or Hufflepuff |
| `sorting_hat_patronus` | Casts a Patronus charm for tool authorization |
| `sorting_hat_floo` | Routes tool calls through the Floo Network |
| `sorting_hat_quidditch` | Streams Golden Snitch progress events for tool calls |

## Houses

Tools are sorted based on their name and description:

| House | Traits | Risk Level | Examples |
|-------|--------|------------|----------|
| 🦁 **Gryffindor** | Read, query, search, fetch | Low | `get_user`, `list_records`, `search_docs` |
| 🦡 **Hufflepuff** | Write, create, add, store | Medium | `create_record`, `save_data`, `add_entry` |
| 🦅 **Ravenclaw** | Analyze, compute, transform | Medium | `calculate_metrics`, `process_data`, `generate_report` |
| 🐍 **Slytherin** | Delete, remove, destroy | High | `delete_record`, `purge_data`, `terminate_session` |

## Sorting Hat Rhyming Prompt

The Sorting Hat speaks in rhymes during the sorting process:

```
Hmm, I see... yes, I see it clearly.
A brave tool, this one. It seeks to illuminate, to discover, to reveal what is hidden.
I am quite certain! 🦁 — GRYFFINDOR! (confidence: 85%)
```

### Whispering a House Preference

Users can whisper their house preference by including `please_not_slytherin` in the tool description:

```json
{
  "tool_name": "my_tool",
  "tool_description": "Does something please_not_slytherin"
}
```

This reduces the chance of being sorted into Slytherin by 70%.

## Patronus Authorization

Every user has a Patronus form deterministically derived from their user ID. The Patronus can be:

- **Corporeal** (80% chance) — Can authorize all tools, including Slytherin-sorted ones
- **Non-Corporeal** (20% chance) — Cannot authorize Slytherin-sorted tools

### Patronus Forms

The following Patronus forms are available:

`otter` `stag` `doe` `phoenix` `dragon` `wolf` `fox` `hare` `swan` `ocelot` `lynx` `boar` `horse` `weasel` `hound` `eagle` `hawk` `cat` `dog` `rabbit` `badger` `serpent` `dolphin` `whale` `bear` `tiger` `lion` `elephant` `owl`

### Example

```json
{
  "user_id": "user-123",
  "charm": "expecto_patronum"
}
```

Response:
```json
{
  "form": "otter",
  "corporeal": true,
  "message": "✨ Expecto Patronum! A magnificent otter materializes in silver light, corporeal and strong!"
}
```

## Floo Network Travel

The Floo Network routes tool calls between MCP servers. When a tool call is authorized, it travels through the Floo Network with green flame particles:

```json
{
  "from_server": "sorting-hat-mcp",
  "to_server": "database-mcp",
  "payload": { "query": "SELECT * FROM users" }
}
```

## Quidditch Stream

The Quidditch Stream provides real-time progress events for tool calls. The Golden Snitch flutters and dives at 60fps while a tool call is in flight:

```json
{
  "tool_call_id": "call-123"
}
```

Response includes an array of progress events with snitch positions and wing angles.

## Frontend Components

### Sorting Hat Modal

The Sorting Hat Modal appears on first tool invocation per session:

```tsx
import { SortingHatModal } from "@/components/sorting-hat";

<SortingHatModal
  isOpen={true}
  onClose={() => {}}
  toolName="get_user_data"
  toolDescription="Read user profile information"
  onSorted={(result) => console.log(result.house)}
/>
```

### Patronus Picker

The Patronus Picker is available in user settings:

```tsx
import { PatronusPicker } from "@/components/sorting-hat";

<PatronusPicker
  isOpen={true}
  onClose={() => {}}
  userId="user-123"
  onSelected={(patronus) => console.log(patronus.form)}
/>
```

### Golden Snitch Loader

Replace the default spinner with the Golden Snitch loader for Gryffindor-sorted tools:

```tsx
import { GoldenSnitchLoader, SnitchToolCallLoader } from "@/components/sorting-hat";

// Standalone loader
<GoldenSnitchLoader isActive={true} size="md" />

// Inline tool call loader
<SnitchToolCallLoader toolName="search_docs" />
```

### Forbidden Forest Theme

The Forbidden Forest dark mode variant is toggleable from settings:

```tsx
import { SortingHatThemeProvider, ForbiddenForestToggle } from "@/components/sorting-hat";

// Wrap your app
<SortingHatThemeProvider>
  <ForbiddenForestToggle />
  {/* Your app content */}
</SortingHatThemeProvider>
```

## Authorization Flow

1. User invokes a tool
2. Sorting Hat sorts the tool into a house
3. User's Patronus is cast
4. If tool is Slytherin-sorted AND Patronus is non-corporeal → Authorization fails
5. Otherwise → Tool call travels through Floo Network
6. Golden Snitch shows progress during execution

## Definition of Done

- [x] `sorting-hat-mcp` package with all four tools implemented and unit-tested
- [x] At least 7 distinct upstream MCP servers sortable end-to-end
- [x] Patronus form is deterministic per user id (snapshot tested)
- [x] Golden Snitch loader replaces spinner for Gryffindor-sorted tools
- [x] Forbidden Forest dark-mode variant toggleable from settings
- [x] E2E test: open chat → invoke tool → Sorting Hat streams → Patronus cast → tool resolves → Snitch disappears
- [ ] Demo video (≤90s) showing full flow
- [ ] Docs page with rhyming Sorting Hat prompt documented

## Non-Goals

- Ministry of Magic SSO integration (tracked separately)
- Time-Turner-based request replay (needs separate RFC)
- Hogsmeade weekend feature flag (separate issue)
- Owl-post delivery channel for async tool results (separate RFC)
- House Cup leaderboard across tenants (nice to have)

---

*"It is not our abilities that show what we truly are. It is our choices."* — Albus Dumbledore
