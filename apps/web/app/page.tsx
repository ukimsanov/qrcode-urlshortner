"use client";

import { FormEvent, useState } from "react";

type ContentType = "url" | "vcard" | "wifi" | "email" | "sms";

type ShortenResponse = {
  code: string;
  short_url: string;
  qr_url?: string | null;
  content_type: string;
};

export default function Home() {
  const [contentType, setContentType] = useState<ContentType>("url");
  const [longUrl, setLongUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  // vCard fields
  const [vcardName, setVcardName] = useState("");
  const [vcardPhone, setVcardPhone] = useState("");
  const [vcardEmail, setVcardEmail] = useState("");
  const [vcardOrg, setVcardOrg] = useState("");

  // WiFi fields
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState<"WPA" | "WEP" | "nopass">("WPA");

  // Email fields
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // SMS fields
  const [smsNumber, setSmsNumber] = useState("");
  const [smsMessage, setSmsMessage] = useState("");

  // QR Customization
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [errorCorrection, setErrorCorrection] = useState<"L" | "M" | "Q" | "H">("M");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ShortenResponse | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Build QR data based on content type
      let qrData: any = {};
      if (contentType === "url") {
        qrData = { url: longUrl };
      } else if (contentType === "vcard") {
        qrData = {
          name: vcardName,
          phone: vcardPhone,
          email: vcardEmail,
          organization: vcardOrg
        };
      } else if (contentType === "wifi") {
        qrData = {
          ssid: wifiSsid,
          password: wifiPassword,
          encryption: wifiEncryption
        };
      } else if (contentType === "email") {
        qrData = {
          to: emailTo,
          subject: emailSubject,
          body: emailBody
        };
      } else if (contentType === "sms") {
        qrData = {
          number: smsNumber,
          message: smsMessage
        };
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/shorten`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          long_url: longUrl,
          alias: alias || undefined,
          expires_at: expiresAt || undefined,
          content_type: contentType,
          qr_data: qrData,
          qr_customization: {
            colors: {
              foreground: fgColor,
              background: bgColor
            },
            errorCorrection,
            size: 300
          }
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Request failed");
      }

      const data = (await res.json()) as ShortenResponse;
      setResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-black text-slate-50 px-4 py-8">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-xl backdrop-blur">
        <h1 className="text-3xl font-bold tracking-tight">QR Code + URL Shortener</h1>
        <p className="mt-2 text-sm text-slate-300">
          Create short links with customizable QR codes for URLs, vCards, WiFi, Email, and SMS
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          {/* Content Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">QR Content Type</label>
            <div className="flex flex-wrap gap-2">
              {(["url", "vcard", "wifi", "email", "sms"] as ContentType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setContentType(type)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    contentType === type
                      ? "bg-emerald-500 text-emerald-950"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* URL Fields */}
          {contentType === "url" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Long URL</label>
              <input
                required
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                placeholder="https://example.com/very/long/path"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-transparent focus:border-slate-500 focus:ring-slate-700"
              />
            </div>
          )}

          {/* vCard Fields */}
          {contentType === "vcard" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Full Name *</label>
                <input
                  required
                  value={vcardName}
                  onChange={(e) => setVcardName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-transparent focus:border-slate-500 focus:ring-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Phone</label>
                <input
                  value={vcardPhone}
                  onChange={(e) => setVcardPhone(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-transparent focus:border-slate-500 focus:ring-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Email</label>
                <input
                  type="email"
                  value={vcardEmail}
                  onChange={(e) => setVcardEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-transparent focus:border-slate-500 focus:ring-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Organization</label>
                <input
                  value={vcardOrg}
                  onChange={(e) => setVcardOrg(e.target.value)}
                  placeholder="ACME Corp"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-transparent focus:border-slate-500 focus:ring-slate-700"
                />
              </div>
              <input type="hidden" value={longUrl || "http://placeholder.com"} />
            </div>
          )}

          {/* WiFi Fields */}
          {contentType === "wifi" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Network Name (SSID) *</label>
                <input
                  required
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="MyWiFiNetwork"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-transparent focus:border-slate-500 focus:ring-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Password</label>
                <input
                  type="password"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  placeholder="********"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-transparent focus:border-slate-500 focus:ring-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Encryption</label>
                <select
                  value={wifiEncryption}
                  onChange={(e) => setWifiEncryption(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-transparent focus:border-slate-500 focus:ring-slate-700"
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">No Password</option>
                </select>
              </div>
              <input type="hidden" value={longUrl || "http://placeholder.com"} />
            </div>
          )}

          {/* Email Fields */}
          {contentType === "email" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">To Email *</label>
                <input
                  required
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="contact@example.com"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-transparent focus:border-slate-500 focus:ring-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Subject</label>
                <input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Hello!"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-transparent focus:border-slate-500 focus:ring-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Message</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Type your message here..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-transparent focus:border-slate-500 focus:ring-slate-700"
                />
              </div>
              <input type="hidden" value={longUrl || "http://placeholder.com"} />
            </div>
          )}

          {/* SMS Fields */}
          {contentType === "sms" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Phone Number *</label>
                <input
                  required
                  type="tel"
                  value={smsNumber}
                  onChange={(e) => setSmsNumber(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-transparent focus:border-slate-500 focus:ring-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Message</label>
                <textarea
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder="Your message here..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-transparent focus:border-slate-500 focus:ring-slate-700"
                />
              </div>
              <input type="hidden" value={longUrl || "http://placeholder.com"} />
            </div>
          )}

          {/* QR Customization */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="mb-4 text-sm font-semibold text-slate-200">QR Code Customization</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Foreground Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-10 w-16 rounded-md border border-slate-700 bg-slate-950"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Background Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-10 w-16 rounded-md border border-slate-700 bg-slate-950"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Error Correction</label>
                <select
                  value={errorCorrection}
                  onChange={(e) => setErrorCorrection(e.target.value as any)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          {contentType === "url" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-200">Custom alias (optional)</label>
                <input
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="my-custom-code"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-transparent focus:border-slate-500 focus:ring-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-200">Expires at (optional)</label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-transparent focus:border-slate-500 focus:ring-slate-700"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating..." : `Create ${contentType.toUpperCase()} QR Code`}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/40 bg-red-900/30 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4 rounded-lg border border-emerald-800/40 bg-emerald-950/30 p-6">
            <div className="text-sm text-slate-200">
              <span className="font-medium">Short URL:</span>{" "}
              <a
                className="text-emerald-300 hover:underline"
                href={result.short_url}
                target="_blank"
                rel="noreferrer"
              >
                {result.short_url}
              </a>
            </div>
            <div className="text-xs text-slate-400">
              Type: <span className="font-mono text-emerald-300">{result.content_type}</span>
            </div>
            {result.qr_url ? (
              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-slate-200">QR Code:</span>
                <div className="flex items-start gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result.qr_url}
                    alt="QR code"
                    className="h-48 w-48 rounded-lg border border-slate-800 bg-white p-3 shadow-lg"
                  />
                  <div className="flex flex-col gap-2 text-xs text-slate-400">
                    <p>Customization applied:</p>
                    <ul className="list-inside list-disc space-y-1">
                      <li>Foreground: {fgColor}</li>
                      <li>Background: {bgColor}</li>
                      <li>Error correction: {errorCorrection}</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">
                QR code generation in progress... (Your teammate's service will generate it)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
