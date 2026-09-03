export function resolveAdminSeed(input: {
  existingTargetEmail: boolean;
  anyAdminExists: boolean;
  hasPassword: boolean;
  production: boolean;
}): "skip" | "create" | "error" {
  if (input.existingTargetEmail) return "skip";
  if (input.hasPassword) return "create";
  if (input.anyAdminExists) return "skip";
  if (input.production) return "error";
  return "create";
}
