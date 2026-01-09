export interface Config {
  url: string;
  username: string;
  password: string;
  verifySsl: boolean;
  readonly: boolean;
}

function getEnv(key: string, required = true): string {
  const value = process.env[key];
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ?? "";
}

function getBoolEnv(key: string, defaultValue: boolean): boolean {
  const value = process.env[key]?.toLowerCase();
  if (!value) return defaultValue;
  return value === "true" || value === "1" || value === "yes";
}

export const config: Config = {
  url: getEnv("D42_URL").replace(/\/$/, ""),
  username: getEnv("D42_USERNAME"),
  password: getEnv("D42_PASSWORD"),
  verifySsl: getBoolEnv("D42_VERIFY_SSL", true),
  readonly: getBoolEnv("D42_READONLY", true),
};
