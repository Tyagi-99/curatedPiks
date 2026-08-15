"use client";

import { useState } from "react";

type Props = {
  name: string;
  label: string;
  defaultValue?: string;
  hint: string;
};

export function ImageField({ name, label, defaultValue = "", hint }: Props) {
  const [url, setUrl] = useState(defaultValue);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setStatus("Uploading…");
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        setStatus(data.error || "Upload failed.");
        return;
      }
      setUrl(data.url);
      setStatus("Uploaded. Save the product to keep this image.");
    } catch {
      setStatus("Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <fieldset className="space-y-2 rounded-2xl border border-line p-4">
      <legend className="px-1 text-sm font-medium">{label}</legend>
      <p className="text-sm leading-relaxed text-muted">{hint}</p>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-36 w-28 rounded-xl border border-line object-cover" />
      ) : null}
      <label className="block text-sm">
        Paste image URL
        <input
          name={name}
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            setStatus("");
          }}
          placeholder="https://… or upload a file below"
          className="mt-1 w-full rounded-xl border border-line px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Or upload a file
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={busy}
          onChange={(event) => {
            void onFile(event.target.files?.[0]);
            event.target.value = "";
          }}
          className="mt-1 block w-full text-sm"
        />
      </label>
      {status ? <p className="text-sm text-muted">{status}</p> : null}
    </fieldset>
  );
}
