import crypto from "crypto";

export type RazorpayAmountUnit = "PAISE" | "RUPEES";
export type RazorpayClientConfigOverrides = Partial<{keyId: string | null;keySecret: string | null;}>;

const DEFAULT_RAZORPAY_BASE_URL = "https://api.razorpay.com/v1";
const DEFAULT_RAZORPAY_AMOUNT_UNIT: RazorpayAmountUnit = "RUPEES";

const logRazorpayDebug = (...args: any[]) => {
  if (process.env.RAZORPAY_DEBUG === "true") {
    console.log("[Razorpay]", ...args);
  }
};

const normalizeRazorpayBaseUrl = (baseUrl: string) => {
  return baseUrl.trim().replace(/\/$/, "");
};

const normalizeRazorpayAmountUnit = (unit?: string | null): RazorpayAmountUnit | undefined => {
  if (!unit) return undefined;
  const normalized = unit.trim().toUpperCase();

  if (normalized === "PAISE" || normalized === "PAISA") return "PAISE";
  if (normalized === "RUPEES" || normalized === "RUPEE" || normalized === "INR") return "RUPEES";

  return undefined;
};

const normalizeConfigValue = (value?: unknown): string | undefined => {
  if (value === null || value === undefined) return undefined;
  const trimmed = String(value).trim();
  return trimmed ? trimmed : undefined;
};

export const resolveRazorpayAmountUnit = (requestUnit?: string | null): RazorpayAmountUnit => {
  const normalizedRequestUnit = normalizeRazorpayAmountUnit(requestUnit);
  if (normalizedRequestUnit) return normalizedRequestUnit;

  const envUnit = normalizeRazorpayAmountUnit(process.env.RAZORPAY_AMOUNT_UNIT);
  if (envUnit) return envUnit;

  if (process.env.RAZORPAY_AMOUNT_UNIT) {
    logRazorpayDebug("Unknown RAZORPAY_AMOUNT_UNIT, falling back to default", process.env.RAZORPAY_AMOUNT_UNIT);
  }

  return DEFAULT_RAZORPAY_AMOUNT_UNIT;
};

export const normalizeRazorpayAmount = (amount: number, unit: RazorpayAmountUnit) => {
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

export const getRazorpayBaseUrl = () => {
  const rawBaseUrl = process.env.RAZORPAY_BASE_URL;
  const baseUrl = rawBaseUrl ? normalizeRazorpayBaseUrl(rawBaseUrl) : DEFAULT_RAZORPAY_BASE_URL;

  if (rawBaseUrl && rawBaseUrl.trim() !== baseUrl) {
    logRazorpayDebug("Normalized base URL", { rawBaseUrl, baseUrl });
  }

  return baseUrl;
};

export const getRazorpayUrl = (path: string) => {
  const baseUrl = getRazorpayBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;

  logRazorpayDebug("Request URL", url);

  return url;
};

export const getRazorpayClientConfig = (overrides?: RazorpayClientConfigOverrides) => {
  const overrideKeyId = normalizeConfigValue(overrides?.keyId);
  const overrideKeySecret = normalizeConfigValue(overrides?.keySecret);
  const envKeyId = normalizeConfigValue(
    process.env.RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_API_KEY ||
      process.env.RAZORPAY_KEY
  );
  const envKeySecret = normalizeConfigValue(
    process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_API_SECRET ||
      process.env.RAZORPAY_SECRET
  );
  const keyId = overrideKeyId || envKeyId;
  const keySecret = overrideKeySecret || envKeySecret;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay client credentials are missing in env or settings");
  }

  return { keyId, keySecret };
};

export const getRazorpayAuthHeader = (overrides?: RazorpayClientConfigOverrides) => {
  const { keyId, keySecret } = getRazorpayClientConfig(overrides);
  const token = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  return `Basic ${token}`;
};

export const verifyRazorpaySignature = (orderId: string,paymentId: string,signature: string,overrides?: RazorpayClientConfigOverrides) => {
  const { keySecret } = getRazorpayClientConfig(overrides);
  const payload = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac("sha256", keySecret).update(payload).digest("hex");
  return expected === signature;
};
