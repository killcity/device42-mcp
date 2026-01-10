# Device42 MCP Server

[![npm version](https://img.shields.io/npm/v/device42-mcp.svg)](https://www.npmjs.com/package/device42-mcp)

MCP server for Device42 IT asset management - Node.js/TypeScript implementation.

## Features

- **Zero install**: Run directly with `npx device42-mcp`
- **Fast**: Uses native `fetch` (Node 18+), no heavy HTTP libs
- **Type-safe**: Full TypeScript
- **Minimal deps**: Only `@modelcontextprotocol/sdk` and `zod`
- **Read/Write modes**: Set `D42_READONLY=false` to enable write operations

## Quick Start

No installation required. Just add to your MCP client config:

### Cursor

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

### Claude Desktop

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

### Docker

```bash
docker build -t device42-mcp:latest .

docker run -i --rm \
  -e D42_URL="https://your-device42.com" \
  -e D42_USERNAME="user" \
  -e D42_PASSWORD="pass" \
  device42-mcp:latest
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
- `doql_query` - Execute raw DOQL queries

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
