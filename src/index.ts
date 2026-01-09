#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { client } from "./client.js";
import { config } from "./config.js";

const server = new Server(
  { name: "device42", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

// Tool definitions
const readTools = [
  {
    name: "list_devices",
    description: "List devices from Device42 with optional filtering",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", default: 100 },
        offset: { type: "number", default: 0 },
        device_type: { type: "string", description: "Filter by device type" },
        service_level: { type: "string", description: "Filter by service level" },
        in_service: { type: "boolean", description: "Filter by in-service status" },
        tags: { type: "string", description: "Filter by tags" },
        hardware: { type: "string", description: "Filter by hardware model" },
        building: { type: "string", description: "Filter by building" },
        room: { type: "string", description: "Filter by room" },
        rack: { type: "string", description: "Filter by rack" },
        os: { type: "string", description: "Filter by OS" },
        manufacturer: { type: "string", description: "Filter by manufacturer" },
      },
    },
  },
  {
    name: "get_device",
    description: "Get detailed information about a device by ID",
    inputSchema: {
      type: "object" as const,
      properties: { device_id: { type: "number" } },
      required: ["device_id"],
    },
  },
  {
    name: "get_device_by_name",
    description: "Get a device by hostname",
    inputSchema: {
      type: "object" as const,
      properties: { name: { type: "string" } },
      required: ["name"],
    },
  },
  {
    name: "search_devices",
    description: "Search devices by name pattern",
    inputSchema: {
      type: "object" as const,
      properties: { query: { type: "string" } },
      required: ["query"],
    },
  },
  {
    name: "list_ips",
    description: "List IP addresses with optional filtering",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", default: 100 },
        offset: { type: "number", default: 0 },
        subnet: { type: "string" },
        available: { type: "boolean" },
      },
    },
  },
  {
    name: "get_ip",
    description: "Get details for a specific IP address",
    inputSchema: {
      type: "object" as const,
      properties: { ip_address: { type: "string" } },
      required: ["ip_address"],
    },
  },
  {
    name: "search_ips_by_device",
    description: "Find all IPs assigned to a device",
    inputSchema: {
      type: "object" as const,
      properties: { device_name: { type: "string" } },
      required: ["device_name"],
    },
  },
  {
    name: "list_subnets",
    description: "List subnets",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", default: 100 },
        offset: { type: "number", default: 0 },
        vlan_id: { type: "number" },
      },
    },
  },
  {
    name: "get_subnet",
    description: "Get subnet details by ID",
    inputSchema: {
      type: "object" as const,
      properties: { subnet_id: { type: "number" } },
      required: ["subnet_id"],
    },
  },
  {
    name: "list_racks",
    description: "List data center racks",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", default: 100 },
        offset: { type: "number", default: 0 },
        room: { type: "string" },
      },
    },
  },
  {
    name: "get_rack",
    description: "Get rack details including devices",
    inputSchema: {
      type: "object" as const,
      properties: { rack_id: { type: "number" } },
      required: ["rack_id"],
    },
  },
  {
    name: "list_rooms",
    description: "List data center rooms",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", default: 100 },
        offset: { type: "number", default: 0 },
        building: { type: "string" },
      },
    },
  },
  {
    name: "get_room",
    description: "Get room details",
    inputSchema: {
      type: "object" as const,
      properties: { room_id: { type: "number" } },
      required: ["room_id"],
    },
  },
  {
    name: "list_buildings",
    description: "List buildings/sites",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", default: 100 },
        offset: { type: "number", default: 0 },
      },
    },
  },
  {
    name: "get_building",
    description: "Get building details",
    inputSchema: {
      type: "object" as const,
      properties: { building_id: { type: "number" } },
      required: ["building_id"],
    },
  },
  {
    name: "list_vlans",
    description: "List VLANs",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", default: 100 },
        offset: { type: "number", default: 0 },
      },
    },
  },
  {
    name: "get_vlan",
    description: "Get VLAN details",
    inputSchema: {
      type: "object" as const,
      properties: { vlan_id: { type: "number" } },
      required: ["vlan_id"],
    },
  },
  {
    name: "list_software",
    description: "List software inventory",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", default: 100 },
        offset: { type: "number", default: 0 },
        device: { type: "string" },
        name: { type: "string" },
      },
    },
  },
  {
    name: "get_software",
    description: "Get software details",
    inputSchema: {
      type: "object" as const,
      properties: { software_id: { type: "number" } },
      required: ["software_id"],
    },
  },
  {
    name: "list_business_apps",
    description: "List business applications",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", default: 100 },
        offset: { type: "number", default: 0 },
      },
    },
  },
  {
    name: "get_business_app",
    description: "Get business application details",
    inputSchema: {
      type: "object" as const,
      properties: { app_id: { type: "number" } },
      required: ["app_id"],
    },
  },
  {
    name: "list_app_components",
    description: "List application components",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", default: 100 },
        offset: { type: "number", default: 0 },
        device: { type: "string" },
      },
    },
  },
  {
    name: "get_app_component",
    description: "Get application component details",
    inputSchema: {
      type: "object" as const,
      properties: { component_id: { type: "number" } },
      required: ["component_id"],
    },
  },
  {
    name: "list_hardware_models",
    description: "List hardware models",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", default: 100 },
        offset: { type: "number", default: 0 },
      },
    },
  },
  {
    name: "list_operating_systems",
    description: "List operating systems",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", default: 100 },
        offset: { type: "number", default: 0 },
      },
    },
  },
  {
    name: "list_vendors",
    description: "List vendors",
    inputSchema: {
      type: "object" as const,
      properties: {
        limit: { type: "number", default: 100 },
        offset: { type: "number", default: 0 },
      },
    },
  },
  {
    name: "doql_query",
    description: "Execute a DOQL query for complex data retrieval",
    inputSchema: {
      type: "object" as const,
      properties: { query: { type: "string", description: "DOQL query string" } },
      required: ["query"],
    },
  },
];

const writeTools = [
  {
    name: "create_device",
    description: "Create a new device",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: { type: "string" },
        device_type: { type: "string" },
        service_level: { type: "string" },
        in_service: { type: "boolean" },
        hardware: { type: "string" },
        os: { type: "string" },
        osver: { type: "string" },
        memory: { type: "number" },
        cpucount: { type: "number" },
        cpucore: { type: "number" },
        notes: { type: "string" },
        tags: { type: "string" },
      },
      required: ["name"],
    },
  },
  {
    name: "update_device",
    description: "Update an existing device",
    inputSchema: {
      type: "object" as const,
      properties: {
        device_id: { type: "number" },
        name: { type: "string" },
        new_name: { type: "string" },
        device_type: { type: "string" },
        service_level: { type: "string" },
        in_service: { type: "boolean" },
        hardware: { type: "string" },
        os: { type: "string" },
        osver: { type: "string" },
        memory: { type: "number" },
        cpucount: { type: "number" },
        cpucore: { type: "number" },
        notes: { type: "string" },
        tags: { type: "string" },
        tags_remove: { type: "string" },
      },
    },
  },
  {
    name: "assign_ip_to_device",
    description: "Assign an IP to a device",
    inputSchema: {
      type: "object" as const,
      properties: {
        ip_address: { type: "string" },
        device_name: { type: "string" },
        mac_address: { type: "string" },
        label: { type: "string" },
        notes: { type: "string" },
        subnet: { type: "string" },
      },
      required: ["ip_address"],
    },
  },
  {
    name: "release_ip",
    description: "Release an IP address",
    inputSchema: {
      type: "object" as const,
      properties: { ip_address: { type: "string" } },
      required: ["ip_address"],
    },
  },
  {
    name: "create_subnet",
    description: "Create a new subnet",
    inputSchema: {
      type: "object" as const,
      properties: {
        network: { type: "string" },
        mask_bits: { type: "number" },
        name: { type: "string" },
        description: { type: "string" },
        vlan_id: { type: "number" },
        gateway: { type: "string" },
        notes: { type: "string" },
      },
      required: ["network", "mask_bits"],
    },
  },
  {
    name: "create_rack",
    description: "Create a new rack",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: { type: "string" },
        size: { type: "number" },
        room: { type: "string" },
        building: { type: "string" },
        row: { type: "string" },
        notes: { type: "string" },
      },
      required: ["name"],
    },
  },
  {
    name: "create_room",
    description: "Create a new room",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: { type: "string" },
        building: { type: "string" },
        notes: { type: "string" },
      },
      required: ["name"],
    },
  },
  {
    name: "create_building",
    description: "Create a new building",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: { type: "string" },
        address: { type: "string" },
        notes: { type: "string" },
      },
      required: ["name"],
    },
  },
];

const allTools = config.readonly ? readTools : [...readTools, ...writeTools];

// Register handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: allTools,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: unknown;

    switch (name) {
      // Read operations
      case "list_devices":
        result = await client.listDevices({
          limit: args?.limit as number,
          offset: args?.offset as number,
          type: args?.device_type as string,
          service_level: args?.service_level as string,
          in_service: args?.in_service as boolean,
          tags: args?.tags as string,
          hardware: args?.hardware as string,
          building: args?.building as string,
          room: args?.room as string,
          rack: args?.rack as string,
          os: args?.os as string,
          manufacturer: args?.manufacturer as string,
        });
        break;
      case "get_device":
        result = await client.getDevice(args?.device_id as number);
        break;
      case "get_device_by_name":
        result = await client.getDeviceByName(args?.name as string);
        break;
      case "search_devices":
        result = await client.searchDevices(args?.query as string);
        break;
      case "list_ips":
        result = await client.listIps({
          limit: args?.limit as number,
          offset: args?.offset as number,
          subnet: args?.subnet as string,
          available: args?.available as boolean,
        });
        break;
      case "get_ip":
        result = await client.getIp(args?.ip_address as string);
        break;
      case "search_ips_by_device":
        result = await client.searchIpsByDevice(args?.device_name as string);
        break;
      case "list_subnets":
        result = await client.listSubnets({
          limit: args?.limit as number,
          offset: args?.offset as number,
          vlan_id: args?.vlan_id as number,
        });
        break;
      case "get_subnet":
        result = await client.getSubnet(args?.subnet_id as number);
        break;
      case "list_racks":
        result = await client.listRacks({
          limit: args?.limit as number,
          offset: args?.offset as number,
          room: args?.room as string,
        });
        break;
      case "get_rack":
        result = await client.getRack(args?.rack_id as number);
        break;
      case "list_rooms":
        result = await client.listRooms({
          limit: args?.limit as number,
          offset: args?.offset as number,
          building: args?.building as string,
        });
        break;
      case "get_room":
        result = await client.getRoom(args?.room_id as number);
        break;
      case "list_buildings":
        result = await client.listBuildings({
          limit: args?.limit as number,
          offset: args?.offset as number,
        });
        break;
      case "get_building":
        result = await client.getBuilding(args?.building_id as number);
        break;
      case "list_vlans":
        result = await client.listVlans({
          limit: args?.limit as number,
          offset: args?.offset as number,
        });
        break;
      case "get_vlan":
        result = await client.getVlan(args?.vlan_id as number);
        break;
      case "list_software":
        result = await client.listSoftware({
          limit: args?.limit as number,
          offset: args?.offset as number,
          device: args?.device as string,
          name: args?.name as string,
        });
        break;
      case "get_software":
        result = await client.getSoftware(args?.software_id as number);
        break;
      case "list_business_apps":
        result = await client.listBusinessApps({
          limit: args?.limit as number,
          offset: args?.offset as number,
        });
        break;
      case "get_business_app":
        result = await client.getBusinessApp(args?.app_id as number);
        break;
      case "list_app_components":
        result = await client.listAppComponents({
          limit: args?.limit as number,
          offset: args?.offset as number,
          device: args?.device as string,
        });
        break;
      case "get_app_component":
        result = await client.getAppComponent(args?.component_id as number);
        break;
      case "list_hardware_models":
        result = await client.listHardwareModels({
          limit: args?.limit as number,
          offset: args?.offset as number,
        });
        break;
      case "list_operating_systems":
        result = await client.listOperatingSystems({
          limit: args?.limit as number,
          offset: args?.offset as number,
        });
        break;
      case "list_vendors":
        result = await client.listVendors({
          limit: args?.limit as number,
          offset: args?.offset as number,
        });
        break;
      case "doql_query":
        result = await client.doqlQuery(args?.query as string);
        break;

      // Write operations
      case "create_device":
        if (config.readonly) throw new Error("Write operations disabled");
        result = await client.createDevice({
          name: args?.name as string,
          type: args?.device_type as string,
          service_level: args?.service_level as string,
          in_service: args?.in_service as boolean,
          hardware: args?.hardware as string,
          os: args?.os as string,
          osver: args?.osver as string,
          memory: args?.memory as number,
          cpucount: args?.cpucount as number,
          cpucore: args?.cpucore as number,
          notes: args?.notes as string,
          tags: args?.tags as string,
        });
        break;
      case "update_device":
        if (config.readonly) throw new Error("Write operations disabled");
        result = await client.updateDevice({
          device_id: args?.device_id as number,
          name: args?.name as string,
          new_name: args?.new_name as string,
          type: args?.device_type as string,
          service_level: args?.service_level as string,
          in_service: args?.in_service as boolean,
          hardware: args?.hardware as string,
          os: args?.os as string,
          osver: args?.osver as string,
          memory: args?.memory as number,
          cpucount: args?.cpucount as number,
          cpucore: args?.cpucore as number,
          notes: args?.notes as string,
          tags: args?.tags as string,
          tags_remove: args?.tags_remove as string,
        });
        break;
      case "assign_ip_to_device":
        if (config.readonly) throw new Error("Write operations disabled");
        result = await client.assignIpToDevice({
          ipaddress: args?.ip_address as string,
          device: args?.device_name as string,
          macaddress: args?.mac_address as string,
          label: args?.label as string,
          notes: args?.notes as string,
          subnet: args?.subnet as string,
        });
        break;
      case "release_ip":
        if (config.readonly) throw new Error("Write operations disabled");
        result = await client.releaseIp(args?.ip_address as string);
        break;
      case "create_subnet":
        if (config.readonly) throw new Error("Write operations disabled");
        result = await client.createSubnet({
          network: args?.network as string,
          mask_bits: args?.mask_bits as number,
          name: args?.name as string,
          description: args?.description as string,
          vlan_id: args?.vlan_id as number,
          gateway: args?.gateway as string,
          notes: args?.notes as string,
        });
        break;
      case "create_rack":
        if (config.readonly) throw new Error("Write operations disabled");
        result = await client.createRack({
          name: args?.name as string,
          size: args?.size as number,
          room: args?.room as string,
          building: args?.building as string,
          row: args?.row as string,
          notes: args?.notes as string,
        });
        break;
      case "create_room":
        if (config.readonly) throw new Error("Write operations disabled");
        result = await client.createRoom({
          name: args?.name as string,
          building: args?.building as string,
          notes: args?.notes as string,
        });
        break;
      case "create_building":
        if (config.readonly) throw new Error("Write operations disabled");
        result = await client.createBuilding({
          name: args?.name as string,
          address: args?.address as string,
          notes: args?.notes as string,
        });
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Error: ${message}` }],
      isError: true,
    };
  }
});

async function main() {
  const mode = config.readonly ? "read-only" : "read-write";
  console.error(`Starting Device42 MCP server in ${mode} mode...`);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
