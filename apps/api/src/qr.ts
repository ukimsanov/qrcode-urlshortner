import { config } from "./config.js";

type QrResponse = { image?: string; mime?: string; url?: string };

export type QrContentType = "url" | "vcard" | "wifi" | "email" | "sms";

export type QrCustomization = {
  colors?: {
    foreground?: string;
    background?: string;
  };
  errorCorrection?: "L" | "M" | "Q" | "H";
  size?: number;
};

export type QrContentData = {
  // URL
  url?: string;
  // vCard
  name?: string;
  phone?: string;
  email?: string;
  organization?: string;
  // WiFi
  ssid?: string;
  password?: string;
  encryption?: "WPA" | "WEP" | "nopass";
  // Email
  to?: string;
  subject?: string;
  body?: string;
  // SMS
  number?: string;
  message?: string;
};

export async function generateQr(params: {
  contentType: QrContentType;
  data: QrContentData;
  customization?: QrCustomization;
}): Promise<{ status: "ready" | "failed"; qrUrl: string | null }> {
  if (!config.qrServiceUrl) {
    return { status: "failed", qrUrl: null };
  }

  try {
    const res = await fetch(`${config.qrServiceUrl}/qr`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contentType: params.contentType,
        data: params.data,
        customization: params.customization ?? {
          errorCorrection: "M",
          size: 300
        }
      })
    });

    if (!res.ok) {
      return { status: "failed", qrUrl: null };
    }

    const body = (await res.json()) as QrResponse;
    const qrUrl = body.url ?? null;
    return { status: qrUrl ? "ready" : "failed", qrUrl };
  } catch {
    return { status: "failed", qrUrl: null };
  }
}
