import axios from "axios";

type PhonePeTokenCache = {
  token: string;
  expiresAt: number;
};

let phonePeTokenCache: PhonePeTokenCache | null = null;

const DEFAULT_PHONEPE_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox";

const logPhonePeDebug = (...args: any[]) => {
  if (process.env.PHONEPE_DEBUG === "true") {
    console.log("[PhonePe]", ...args);
  }
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
    // If URL parsing fails, return as-is so caller can surface an error from PhonePe.
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

export const getPhonePeClientConfig = () => {
  const clientId = process.env.PHONEPE_CLIENT_ID;
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
  const clientVersion = process.env.PHONEPE_CLIENT_VERSION;

  if (!clientId || !clientSecret || !clientVersion) {
    throw new Error("PhonePe client credentials are missing in env");
  }

  return { clientId, clientSecret, clientVersion };
};

export const getPhonePeRedirectUrls = () => {
  const backendUrl = process.env.BACKEND_URL?.replace(/\/$/, "") || "";
  const redirectUrl = process.env.PHONEPE_REDIRECT_URL || (backendUrl ? `${backendUrl}/phonepe/redirect` : "");
  const callbackUrl = process.env.PHONEPE_CALLBACK_URL || (backendUrl ? `${backendUrl}/phonepe/callback` : "");

  return { redirectUrl, callbackUrl };
};

export const getPhonePeAccessToken = async () => {
  const now = Date.now();
  if (phonePeTokenCache && phonePeTokenCache.expiresAt > now + 30_000) {
    return phonePeTokenCache.token;
  }

  const { clientId, clientSecret, clientVersion } = getPhonePeClientConfig();
  const url = getPhonePeUrl("/v1/oauth/token");

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
  phonePeTokenCache = { token, expiresAt: now + expiresIn * 1000 };

  return token;
};
