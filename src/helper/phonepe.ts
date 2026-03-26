import axios from "axios";

type PhonePeTokenCache = {
  token: string;
  expiresAt: number;
  configKey: string;
};

export type PhonePeAmountUnit = "PAISE" | "RUPEES";
export type PhonePeClientConfigOverrides = Partial<{
  clientId: string | null;
  clientSecret: string | null;
  clientVersion: string | number | null;
}>;

let phonePeTokenCache: PhonePeTokenCache | null = null;

const DEFAULT_PHONEPE_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";
const DEFAULT_PHONEPE_AMOUNT_UNIT: PhonePeAmountUnit = "RUPEES";

const logPhonePeDebug = (...args: any[]) => {
  if (process.env.PHONEPE_DEBUG === "true") {
    console.log("[PhonePe]", ...args);
  }
};

const normalizeConfigValue = (value?: unknown): string | undefined => {
  if (value === null || value === undefined) return undefined;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : undefined;
};

const maskValue = (value?: string) => {
  if (!value) return value;
  const trimmed = value.trim();
  if (trimmed.length <= 6) return `${trimmed.slice(0, 2)}***`;
  return `${trimmed.slice(0, 3)}***${trimmed.slice(-3)}`;
};

const normalizePhonePeAmountUnit = (unit?: string | null): PhonePeAmountUnit | undefined => {
  if (!unit) return undefined;
  const normalized = unit.trim().toUpperCase();

  if (normalized === "PAISE" || normalized === "PAISA") return "PAISE";
  if (normalized === "RUPEES" || normalized === "RUPEE" || normalized === "INR") return "RUPEES";

  return undefined;
};

export const resolvePhonePeAmountUnit = (requestUnit?: string | null): PhonePeAmountUnit => {
  const normalizedRequestUnit = normalizePhonePeAmountUnit(requestUnit);
  if (normalizedRequestUnit) return normalizedRequestUnit;

  const envUnit = normalizePhonePeAmountUnit(process.env.PHONEPE_AMOUNT_UNIT);
  if (envUnit) return envUnit;

  if (process.env.PHONEPE_AMOUNT_UNIT) {
    logPhonePeDebug("Unknown PHONEPE_AMOUNT_UNIT, falling back to default", process.env.PHONEPE_AMOUNT_UNIT);
  }

  return DEFAULT_PHONEPE_AMOUNT_UNIT;
};

export const normalizePhonePeAmount = (amount: number, unit: PhonePeAmountUnit) => {
  if (!Number.isFinite(amount)) {
    throw new Error("Amount must be a valid number");
  }
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  if (unit === "PAISE") {
    if (!Number.isInteger(amount)) {
      throw new Error("Amount must be an integer when amountUnit is PAISE");
    }
    return amount;
  }

  const paise = Math.round((amount + Number.EPSILON) * 100);
  const normalized = paise / 100;
  if (Math.abs(normalized - amount) > 1e-6) {
    throw new Error("Amount can have at most 2 decimal places when amountUnit is RUPEES");
  }

  return paise;
};

const normalizePhonePeBaseUrl = (baseUrl: string) => {
  const trimmed = baseUrl.trim().replace(/\/$/, "");
  if (!trimmed) return trimmed;

  if (trimmed.includes("/apis/pg-sandbox") || trimmed.includes("/apis/pg")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.includes("preprod")) {
      return `${trimmed}/apis/pg-sandbox`;
    }
    if (parsed.hostname.includes("phonepe.com")) {
      return `${trimmed}/apis/pg`;
    }
  } catch {

  }

  return trimmed;
};

export const getPhonePeBaseUrl = () => {
  const rawBaseUrl = process.env.PHONEPE_BASE_URL;
  const baseUrl = rawBaseUrl ? normalizePhonePeBaseUrl(rawBaseUrl) : DEFAULT_PHONEPE_BASE_URL;

  if (rawBaseUrl && rawBaseUrl.trim() !== baseUrl) {
    logPhonePeDebug("Normalized base URL", { rawBaseUrl, baseUrl });
  }

  return baseUrl;
};

export const getPhonePeUrl = (path: string) => {
  const baseUrl = getPhonePeBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;

  logPhonePeDebug("Request URL", url);

  return url;
};

export const getPhonePeAuthUrl = () => {
  const envAuthUrl = process.env.PHONEPE_AUTH_URL;
  if (envAuthUrl) {
    logPhonePeDebug("Auth URL (env)", envAuthUrl);
    return envAuthUrl;
  }

  const baseUrl = getPhonePeBaseUrl();
  const url = `${baseUrl}/v1/oauth/token`;
  logPhonePeDebug("Auth URL (derived)", { baseUrl, url });
  return url;
};

export const getPhonePeCreatePaymentUrl = () => {
  const envCreateUrl = process.env.PHONEPE_CREATE_PAYMENT_URL;
  if (envCreateUrl) {
    logPhonePeDebug("Create payment URL (env)", envCreateUrl);
    return envCreateUrl;
  }

  const baseUrl = getPhonePeBaseUrl();
  const url = `${baseUrl}/checkout/v2/pay`;
  logPhonePeDebug("Create payment URL (derived)", { baseUrl, url });
  return url;
};

export const getPhonePeClientConfig = (overrides?: PhonePeClientConfigOverrides) => {
  const overrideClientId = normalizeConfigValue(overrides?.clientId);
  const overrideClientSecret = normalizeConfigValue(overrides?.clientSecret);
  const overrideClientVersion = normalizeConfigValue(overrides?.clientVersion);

  const envClientId = normalizeConfigValue(process.env.PHONEPE_CLIENT_ID);
  const envClientSecret = normalizeConfigValue(process.env.PHONEPE_CLIENT_SECRET);
  const envClientVersion = normalizeConfigValue(process.env.PHONEPE_CLIENT_VERSION);

  const clientId = overrideClientId || envClientId;
  const clientSecret = overrideClientSecret || envClientSecret;
  const clientVersion = overrideClientVersion || envClientVersion;
  const source = overrideClientId || overrideClientSecret || overrideClientVersion ? "settings" : "env";

  logPhonePeDebug("Resolved client config", {
    source,
    clientId: maskValue(clientId),
    clientVersion,
    hasClientSecret: Boolean(clientSecret),
  });

  if (!clientId || !clientSecret || !clientVersion) {
    throw new Error("PhonePe client credentials are missing in env or settings");
  }

  return { clientId, clientSecret, clientVersion };
};

export const getPhonePeRedirectUrls = () => {
  const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, "") || "";
  const redirectUrl = process.env.PHONEPE_REDIRECT_URL || (backendUrl ? `${backendUrl}/phonepe/redirect` : "");
  const callbackUrl = process.env.PHONEPE_CALLBACK_URL || (backendUrl ? `${backendUrl}/phonepe/callback` : "");

  return { redirectUrl, callbackUrl };
};

export const getPhonePeAccessToken = async (overrides?: PhonePeClientConfigOverrides) => {
  const { clientId, clientSecret, clientVersion } = getPhonePeClientConfig(overrides);
  const configKey = `${clientId}:${clientSecret}:${clientVersion}`;
  const now = Date.now();
  if (phonePeTokenCache && phonePeTokenCache.expiresAt > now + 30_000 && phonePeTokenCache.configKey === configKey) {
    return phonePeTokenCache.token;
  }

  const url = getPhonePeAuthUrl();

  const body = new URLSearchParams({
    client_id: clientId,
    client_version: clientVersion,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const response = await axios.post(url, body.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const token =
    response.data?.access_token ||
    response.data?.accessToken ||
    response.data?.data?.access_token ||
    response.data?.data?.accessToken;

  if (!token) {
    throw new Error("PhonePe access token missing in response");
  }

  const expiresInRaw =
    response.data?.expires_in ||
    response.data?.data?.expires_in ||
    response.data?.expiresIn ||
    response.data?.data?.expiresIn ||
    3600;

  const expiresIn = Number(expiresInRaw) || 3600;
  phonePeTokenCache = { token, expiresAt: now + expiresIn * 1000, configKey };

  return token;
};
