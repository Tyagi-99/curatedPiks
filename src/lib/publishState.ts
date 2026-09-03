export function publishedForSave(
  role: string,
  checkboxOn: boolean,
  existingPublished?: boolean,
): boolean {
  if (role === "ADMIN") return checkboxOn;
  return existingPublished ?? false;
}

export function postStatusForSave(
  role: string,
  checkboxOn: boolean,
  existingStatus?: string | null,
): "PUBLISHED" | "DRAFT" {
  if (role === "ADMIN") return checkboxOn ? "PUBLISHED" : "DRAFT";
  return existingStatus === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
}
