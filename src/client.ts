import { config } from "./config.js";
import { Agent, setGlobalDispatcher } from "undici";

// Configure SSL verification globally for fetch
if (!config.verifySsl) {
  setGlobalDispatcher(
    new Agent({
      connect: {
        rejectUnauthorized: false,
      },
    })
  );
}

export class Device42Error extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "Device42Error";
  }
}

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

interface RequestOptions {
  method: RequestMethod;
  endpoint: string;
  params?: Record<string, string | number | boolean>;
  data?: Record<string, unknown>;
}

const authHeader = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString("base64")}`;

async function request<T = Record<string, unknown>>({
  method,
  endpoint,
  params,
  data,
}: RequestOptions): Promise<T> {
  const url = new URL(endpoint, config.url);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = {
    Authorization: authHeader,
    Accept: "application/json",
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (data) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined && v !== null) {
        params.set(k, String(v));
      }
    }
    fetchOptions.body = params.toString();
  }

  const response = await fetch(url.toString(), fetchOptions as RequestInit);

  if (!response.ok) {
    const text = await response.text();
    throw new Device42Error(
      `API error: ${response.status} - ${text}`,
      response.status
    );
  }

  return response.json() as Promise<T>;
}

export const client = {
  // Devices
  async listDevices(opts: {
    limit?: number;
    offset?: number;
    type?: string;
    service_level?: string;
    in_service?: boolean;
    tags?: string;
    hardware?: string;
    building?: string;
    room?: string;
    rack?: string;
    os?: string;
    manufacturer?: string;
  } = {}) {
    const params: Record<string, string | number | boolean> = {
      limit: opts.limit ?? 100,
      offset: opts.offset ?? 0,
    };
    if (opts.type) params.type = opts.type;
    if (opts.service_level) params.service_level = opts.service_level;
    if (opts.in_service !== undefined) params.in_service = opts.in_service ? "yes" : "no";
    if (opts.tags) params.tags = opts.tags;
    if (opts.hardware) params.hardware = opts.hardware;
    if (opts.building) params.building = opts.building;
    if (opts.room) params.room = opts.room;
    if (opts.rack) params.rack = opts.rack;
    if (opts.os) params.os = opts.os;
    if (opts.manufacturer) params.manufacturer = opts.manufacturer;
    return request({ method: "GET", endpoint: "/api/1.0/devices/", params });
  },

  async getDevice(deviceId: number) {
    return request({ method: "GET", endpoint: `/api/1.0/devices/${deviceId}/` });
  },

  async getDeviceByName(name: string) {
    return request({ method: "GET", endpoint: "/api/1.0/devices/name/", params: { name } });
  },

  async searchDevices(query: string) {
    return request({ method: "GET", endpoint: "/api/1.0/devices/", params: { name: query } });
  },

  // IPs
  async listIps(opts: { limit?: number; offset?: number; subnet?: string; available?: boolean } = {}) {
    const params: Record<string, string | number | boolean> = {
      limit: opts.limit ?? 100,
      offset: opts.offset ?? 0,
    };
    if (opts.subnet) params.subnet = opts.subnet;
    if (opts.available !== undefined) params.available = opts.available ? "yes" : "no";
    return request({ method: "GET", endpoint: "/api/1.0/ips/", params });
  },

  async getIp(ipAddress: string) {
    return request({ method: "GET", endpoint: `/api/1.0/ips/${ipAddress}/` });
  },

  async searchIpsByDevice(device: string) {
    return request({ method: "GET", endpoint: "/api/1.0/ips/", params: { device } });
  },

  // Subnets
  async listSubnets(opts: { limit?: number; offset?: number; vlan_id?: number } = {}) {
    const params: Record<string, string | number> = {
      limit: opts.limit ?? 100,
      offset: opts.offset ?? 0,
    };
    if (opts.vlan_id) params.vlan_id = opts.vlan_id;
    return request({ method: "GET", endpoint: "/api/1.0/subnets/", params });
  },

  async getSubnet(subnetId: number) {
    return request({ method: "GET", endpoint: `/api/1.0/subnets/${subnetId}/` });
  },

  // Racks
  async listRacks(opts: { limit?: number; offset?: number; room?: string } = {}) {
    const params: Record<string, string | number> = {
      limit: opts.limit ?? 100,
      offset: opts.offset ?? 0,
    };
    if (opts.room) params.room = opts.room;
    return request({ method: "GET", endpoint: "/api/1.0/racks/", params });
  },

  async getRack(rackId: number) {
    return request({ method: "GET", endpoint: `/api/1.0/racks/${rackId}/` });
  },

  // Rooms
  async listRooms(opts: { limit?: number; offset?: number; building?: string } = {}) {
    const params: Record<string, string | number> = {
      limit: opts.limit ?? 100,
      offset: opts.offset ?? 0,
    };
    if (opts.building) params.building = opts.building;
    return request({ method: "GET", endpoint: "/api/1.0/rooms/", params });
  },

  async getRoom(roomId: number) {
    return request({ method: "GET", endpoint: `/api/1.0/rooms/${roomId}/` });
  },

  // Buildings
  async listBuildings(opts: { limit?: number; offset?: number } = {}) {
    return request({
      method: "GET",
      endpoint: "/api/1.0/buildings/",
      params: { limit: opts.limit ?? 100, offset: opts.offset ?? 0 },
    });
  },

  async getBuilding(buildingId: number) {
    return request({ method: "GET", endpoint: `/api/1.0/buildings/${buildingId}/` });
  },

  // VLANs
  async listVlans(opts: { limit?: number; offset?: number } = {}) {
    return request({
      method: "GET",
      endpoint: "/api/1.0/vlans/",
      params: { limit: opts.limit ?? 100, offset: opts.offset ?? 0 },
    });
  },

  async getVlan(vlanId: number) {
    return request({ method: "GET", endpoint: `/api/1.0/vlans/${vlanId}/` });
  },

  // Software
  async listSoftware(opts: { limit?: number; offset?: number; device?: string; name?: string } = {}) {
    const params: Record<string, string | number> = {
      limit: opts.limit ?? 100,
      offset: opts.offset ?? 0,
    };
    if (opts.device) params.device = opts.device;
    if (opts.name) params.name = opts.name;
    return request({ method: "GET", endpoint: "/api/1.0/software/", params });
  },

  async getSoftware(softwareId: number) {
    return request({ method: "GET", endpoint: `/api/1.0/software/${softwareId}/` });
  },

  // Business Apps
  async listBusinessApps(opts: { limit?: number; offset?: number } = {}) {
    return request({
      method: "GET",
      endpoint: "/api/1.0/businessapplications/",
      params: { limit: opts.limit ?? 100, offset: opts.offset ?? 0 },
    });
  },

  async getBusinessApp(appId: number) {
    return request({ method: "GET", endpoint: `/api/1.0/businessapplications/${appId}/` });
  },

  // App Components
  async listAppComponents(opts: { limit?: number; offset?: number; device?: string } = {}) {
    const params: Record<string, string | number> = {
      limit: opts.limit ?? 100,
      offset: opts.offset ?? 0,
    };
    if (opts.device) params.device = opts.device;
    return request({ method: "GET", endpoint: "/api/1.0/appcomps/", params });
  },

  async getAppComponent(componentId: number) {
    return request({ method: "GET", endpoint: `/api/1.0/appcomps/${componentId}/` });
  },

  // Hardware Models
  async listHardwareModels(opts: { limit?: number; offset?: number } = {}) {
    return request({
      method: "GET",
      endpoint: "/api/1.0/hardwares/",
      params: { limit: opts.limit ?? 100, offset: opts.offset ?? 0 },
    });
  },

  // Operating Systems
  async listOperatingSystems(opts: { limit?: number; offset?: number } = {}) {
    return request({
      method: "GET",
      endpoint: "/api/1.0/operatingsystems/",
      params: { limit: opts.limit ?? 100, offset: opts.offset ?? 0 },
    });
  },

  // Vendors
  async listVendors(opts: { limit?: number; offset?: number } = {}) {
    return request({
      method: "GET",
      endpoint: "/api/1.0/vendors/",
      params: { limit: opts.limit ?? 100, offset: opts.offset ?? 0 },
    });
  },

  // DOQL
  async doqlQuery(query: string) {
    const response = await fetch(`${config.url}/services/data/v1.0/query/`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({ query, output_type: "json" }).toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Device42Error(`DOQL error: ${response.status} - ${text}`, response.status);
    }

    const result = await response.json();
    if (Array.isArray(result)) {
      return { rows: result, count: result.length };
    }
    return result;
  },

  // Write operations
  async createDevice(data: {
    name: string;
    type?: string;
    service_level?: string;
    in_service?: boolean;
    hardware?: string;
    os?: string;
    osver?: string;
    memory?: number;
    cpucount?: number;
    cpucore?: number;
    notes?: string;
    tags?: string;
  }) {
    const payload: Record<string, unknown> = { name: data.name };
    if (data.type) payload.type = data.type;
    if (data.service_level) payload.service_level = data.service_level;
    if (data.in_service !== undefined) payload.in_service = data.in_service ? "yes" : "no";
    if (data.hardware) payload.hardware = data.hardware;
    if (data.os) payload.os = data.os;
    if (data.osver) payload.osver = data.osver;
    if (data.memory !== undefined) payload.memory = data.memory;
    if (data.cpucount !== undefined) payload.cpucount = data.cpucount;
    if (data.cpucore !== undefined) payload.cpucore = data.cpucore;
    if (data.notes) payload.notes = data.notes;
    if (data.tags) payload.tags = data.tags;
    return request({ method: "POST", endpoint: "/api/1.0/devices/", data: payload });
  },

  async updateDevice(data: {
    device_id?: number;
    name?: string;
    new_name?: string;
    type?: string;
    service_level?: string;
    in_service?: boolean;
    hardware?: string;
    os?: string;
    osver?: string;
    memory?: number;
    cpucount?: number;
    cpucore?: number;
    notes?: string;
    tags?: string;
    tags_remove?: string;
  }) {
    if (!data.device_id && !data.name) {
      throw new Device42Error("Must provide either device_id or name");
    }
    const payload: Record<string, unknown> = {};
    if (data.device_id) payload.device_id = data.device_id;
    if (data.name) payload.name = data.name;
    if (data.new_name) payload.new_name = data.new_name;
    if (data.type) payload.type = data.type;
    if (data.service_level) payload.service_level = data.service_level;
    if (data.in_service !== undefined) payload.in_service = data.in_service ? "yes" : "no";
    if (data.hardware) payload.hardware = data.hardware;
    if (data.os) payload.os = data.os;
    if (data.osver) payload.osver = data.osver;
    if (data.memory !== undefined) payload.memory = data.memory;
    if (data.cpucount !== undefined) payload.cpucount = data.cpucount;
    if (data.cpucore !== undefined) payload.cpucore = data.cpucore;
    if (data.notes) payload.notes = data.notes;
    if (data.tags) payload.tags = data.tags;
    if (data.tags_remove) payload.tags_remove = data.tags_remove;
    return request({ method: "POST", endpoint: "/api/1.0/devices/", data: payload });
  },

  async assignIpToDevice(data: {
    ipaddress: string;
    device?: string;
    macaddress?: string;
    label?: string;
    notes?: string;
    subnet?: string;
  }) {
    return request({ method: "POST", endpoint: "/api/1.0/ips/", data });
  },

  async releaseIp(ipaddress: string) {
    return request({
      method: "POST",
      endpoint: "/api/1.0/ips/",
      data: { ipaddress, available: "yes", clear_all: "yes" },
    });
  },

  async createSubnet(data: {
    network: string;
    mask_bits: number;
    name?: string;
    description?: string;
    vlan_id?: number;
    gateway?: string;
    notes?: string;
  }) {
    return request({ method: "POST", endpoint: "/api/1.0/subnets/", data });
  },

  async createRack(data: {
    name: string;
    size?: number;
    room?: string;
    building?: string;
    row?: string;
    notes?: string;
  }) {
    return request({ method: "POST", endpoint: "/api/1.0/racks/", data });
  },

  async createRoom(data: { name: string; building?: string; notes?: string }) {
    return request({ method: "POST", endpoint: "/api/1.0/rooms/", data });
  },

  async createBuilding(data: { name: string; address?: string; notes?: string }) {
    return request({ method: "POST", endpoint: "/api/1.0/buildings/", data });
  },
};
