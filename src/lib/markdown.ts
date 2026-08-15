function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeHref(raw: string): string | null {
  const href = raw.trim();
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  if (isSafeHttpUrl(href)) return href;
  return null;
}

function inline(text: string): string {
  let html = escapeHtml(text);
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_match, alt, url) => {
    const href = safeHref(url);
    if (!href) return escapeHtml(alt);
    return `<img src="${href}" alt="${alt}" />`;
  });
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, url) => {
    const href = safeHref(url);
    if (!href) return label;
    const external = href.startsWith("http");
    const rel = external ? ' rel="noopener noreferrer" target="_blank"' : "";
    return `<a href="${href}"${rel}>${label}</a>`;
  });
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  return html;
}

export function renderMarkdown(source: string): string {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let list: string[] = [];

  const flushList = () => {
    if (list.length === 0) return;
    out.push(`<ul>${list.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`);
    list = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }
    const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      list.push(listMatch[1]);
      continue;
    }
    flushList();
    if (trimmed.startsWith("### ")) {
      out.push(`<h3>${inline(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      out.push(`<h2>${inline(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith("# ")) {
      out.push(`<h2>${inline(trimmed.slice(2))}</h2>`);
      continue;
    }
    out.push(`<p>${inline(trimmed)}</p>`);
  }
  flushList();
  return out.join("");
}
