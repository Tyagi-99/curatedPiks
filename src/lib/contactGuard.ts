const HTML_TAG = /<\/?[a-z][\s\S]*>/i;
const SHORTENER = /\b(?:bit\.ly|tinyurl\.com|t\.co|goo\.gl|ow\.ly|is\.gd|cutt\.ly)\b/i;

export function isHoneypotTriggered(value: string): boolean {
  return value.trim().length > 0;
}

export function contactSpamReason(input: { name: string; email: string; body: string }): "html" | "shortener" | null {
  const blob = `${input.name}\n${input.email}\n${input.body}`;
  if (HTML_TAG.test(blob)) return "html";
  if (SHORTENER.test(blob)) return "shortener";
  return null;
}
