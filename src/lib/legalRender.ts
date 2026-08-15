export function splitLegalBlocks(body: string): { type: "h2" | "p"; text: string }[] {
  const blocks: { type: "h2" | "p"; text: string }[] = [];
  for (const chunk of body.split(/\n\n+/)) {
    const lines = chunk.split("\n");
    if (lines[0]?.startsWith("## ")) {
      blocks.push({ type: "h2", text: lines[0].replace(/^## /, "").trim() });
      const rest = lines.slice(1).join("\n").trim();
      if (rest) blocks.push({ type: "p", text: rest });
    } else if (chunk.trim()) {
      blocks.push({ type: "p", text: chunk.trim() });
    }
  }
  return blocks;
}
