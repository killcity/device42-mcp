# Device42 MCP Server

[![npm version](https://img.shields.io/npm/v/device42-mcp.svg)](https://www.npmjs.com/package/device42-mcp)
[![Docker Image](https://img.shields.io/docker/v/killcity/device42-mcp?label=docker)](https://hub.docker.com/r/killcity/device42-mcp)

MCP server for Device42 IT asset management - Node.js/TypeScript implementation.

## Features

- **Zero install**: Run directly with `npx device42-mcp`
- **Fast**: Uses native `fetch` (Node 18+), no heavy HTTP libs
- **Type-safe**: Full TypeScript
- **Minimal deps**: Only `@modelcontextprotocol/sdk` and `zod`
- **Read/Write modes**: Set `D42_READONLY=false` to enable write operations
- **DOQL Support**: Execute complex queries using Device42's powerful query language

## Example Questions

Once configured, you can ask your AI assistant questions like:

**Basic Queries**
- "List all devices in the NYC datacenter"
- "What's the IP address of server web-prod-01?"
- "Show me all devices running Ubuntu"
- "Which devices are in rack A-15?"
- "Find all devices tagged as 'production'"

**Network & IP Management**
- "What IPs are available in the 10.0.1.0/24 subnet?"
- "Show me all IPs assigned to the database servers"
- "List all VLANs in building HQ"
- "What subnet is 192.168.1.50 in?"

**Infrastructure Overview**
- "Give me a summary of all racks in the London datacenter"
- "How many devices do we have per operating system?"
- "List all buildings and their room counts"
- "What hardware models are we using?"

**DOQL Queries (Advanced)**

The server supports [DOQL (Device42 Object Query Language)](https://docs.device42.com/reports/device42-doql/), enabling complex cross-table queries:

- "Run a DOQL query to find all devices with more than 64GB RAM that were added in the last 30 days"
- "Use DOQL to get a report of devices grouped by department and service level"
- "Query for all virtual machines and their host relationships"
- "Find devices where the warranty expires in the next 90 days"

Example DOQL the AI might generate:
```sql
SELECT d.name, d.ram, d.first_added 
FROM view_device_v1 d 
WHERE d.ram > 65536 
AND d.first_added > NOW() - INTERVAL '30 days'
```

## Quick Start

No installation required. Just add to your MCP client config:

### Cursor (npx)

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "device42": {
      "command": "npx",
      "args": ["-y", "device42-mcp"],
      "env": {
        "D42_URL": "https://your-device42.com",
        "D42_USERNAME": "api-user",
        "D42_PASSWORD": "api-password",
        "D42_VERIFY_SSL": "true",
        "D42_READONLY": "true"
      }
    }
  }
}
```

### Cursor (Docker)

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "device42": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "D42_URL=https://your-device42.com",
        "-e", "D42_USERNAME=api-user",
        "-e", "D42_PASSWORD=api-password",
        "-e", "D42_VERIFY_SSL=true",
        "-e", "D42_READONLY=true",
        "killcity/device42-mcp:latest"
      ]
    }
  }
}
```

### Claude Desktop (npx)

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "device42": {
      "command": "npx",
      "args": ["-y", "device42-mcp"],
      "env": {
        "D42_URL": "https://your-device42.com",
        "D42_USERNAME": "api-user",
        "D42_PASSWORD": "api-password",
        "D42_VERIFY_SSL": "true",
        "D42_READONLY": "true"
      }
    }
  }
}
```

### Claude Desktop (Docker)

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "device42": {
      "command": "docker",
      "args": [
        "run", "-i", "--rm",
        "-e", "D42_URL=https://your-device42.com",
        "-e", "D42_USERNAME=api-user",
        "-e", "D42_PASSWORD=api-password",
        "-e", "D42_VERIFY_SSL=true",
        "-e", "D42_READONLY=true",
        "killcity/device42-mcp:latest"
      ]
    }
  }
}
```

## Alternative Installation Methods

### Global Install

```bash
npm install -g device42-mcp
device42-mcp
```

### From Source

```bash
git clone https://github.com/killcity/device42-mcp.git
cd device42-mcp
npm install
npm run build
node dist/index.js
```

### Docker (standalone)

```bash
docker pull killcity/device42-mcp:latest

docker run -i --rm \
  -e D42_URL="https://your-device42.com" \
  -e D42_USERNAME="user" \
  -e D42_PASSWORD="pass" \
  -e D42_VERIFY_SSL="true" \
  -e D42_READONLY="true" \
  killcity/device42-mcp:latest
```

Or build locally:

```bash
docker build -t device42-mcp:latest .
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `D42_URL` | Yes | - | Device42 instance URL |
| `D42_USERNAME` | Yes | - | API username |
| `D42_PASSWORD` | Yes | - | API password |
| `D42_VERIFY_SSL` | No | `true` | Verify SSL certificates |
| `D42_READONLY` | No | `true` | Only expose read operations |

## Available Tools

### Read Operations
- `list_devices`, `get_device`, `get_device_by_name`, `search_devices`
- `list_ips`, `get_ip`, `search_ips_by_device`
- `list_subnets`, `get_subnet`
- `list_racks`, `get_rack`
- `list_rooms`, `get_room`
- `list_buildings`, `get_building`
- `list_vlans`, `get_vlan`
- `list_software`, `get_software`
- `list_business_apps`, `get_business_app`
- `list_app_components`, `get_app_component`
- `list_hardware_models`, `list_operating_systems`, `list_vendors`
- `doql_query` - Execute raw DOQL queries for complex data retrieval

### Write Operations (when D42_READONLY=false)
- `create_device`, `update_device`
- `assign_ip_to_device`, `release_ip`
- `create_subnet`, `create_rack`, `create_room`, `create_building`

## Development

```bash
# Run in dev mode
npm run dev

# Build
npm run build

# Run built version
npm start
```

## License

MIT
