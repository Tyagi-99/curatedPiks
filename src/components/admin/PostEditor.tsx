"use client";

import { useRef, useState } from "react";
import { ImageField } from "@/components/admin/ImageField";
import { renderMarkdown } from "@/lib/markdown";

export type PostEditorValues = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverImageUrl: string;
  metaTitle: string;
  metaDescription: string;
  published: boolean;
};

export function PostEditor({
  post,
  canPublish,
  action,
  deleteAction,
}: {
  post?: PostEditorValues;
  canPublish: boolean;
  action: (formData: FormData) => void | Promise<void>;
  deleteAction?: (formData: FormData) => void | Promise<void>;
}) {
  const [body, setBody] = useState(post?.body ?? "");
  const [showPreview, setShowPreview] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function wrap(before: string, after = before) {
    const el = textareaRef.current;
    if (!el) {
      setBody((value) => `${value}${before}${after}`);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = body.slice(start, end) || "text";
    const next = `${body.slice(0, start)}${before}${selected}${after}${body.slice(end)}`;
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + before.length + selected.length + after.length;
      el.setSelectionRange(cursor, cursor);
    });
  }

  function insertHeading() {
    const el = textareaRef.current;
    if (!el) {
      setBody((value) => `${value}\n## Heading\n`);
      return;
    }
    const start = el.selectionStart;
    const lineStart = body.lastIndexOf("\n", start - 1) + 1;
    const next = `${body.slice(0, lineStart)}## ${body.slice(lineStart) || "Heading"}`;
    setBody(next);
  }

  function insertLink() {
    const url = window.prompt("Link URL", "https://");
    if (!url) return;
    wrap("[", `](${url})`);
  }

  async function insertImage(file: File | undefined) {
    if (!file) return;
    const payload = new FormData();
    payload.set("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body: payload });
    const data = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !data.url) {
      window.alert(data.error || "Upload failed.");
      return;
    }
    wrap("![", `](${data.url})`);
  }

  return (
    <form action={action} className="max-w-3xl space-y-4">
      {post?.id ? <input type="hidden" name="id" value={post.id} /> : null}
      <label className="block text-sm font-medium">
        Title
        <input name="title" defaultValue={post?.title} required className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Slug (URL)
        <input name="slug" defaultValue={post?.slug} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <label className="block text-sm font-medium">
        Excerpt
        <textarea name="excerpt" rows={2} defaultValue={post?.excerpt} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
      </label>
      <ImageField
        key={`cover-${post?.id ?? "new"}`}
        name="coverImageUrl"
        label="Cover image"
        defaultValue={post?.coverImageUrl}
        hint="Paste a URL or upload. Best: 16:9 (1600 × 900 px), JPG or WebP, under 5 MB. Used on the blog list, article hero, and share previews."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          SEO title (optional)
          <input name="metaTitle" defaultValue={post?.metaTitle} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
          <span className="mt-1 block text-xs text-faint">Leave empty to use the post title.</span>
        </label>
        <label className="block text-sm font-medium">
          SEO description (optional)
          <textarea name="metaDescription" rows={2} defaultValue={post?.metaDescription} className="mt-1 w-full rounded-xl border border-line px-3 py-2" />
          <span className="mt-1 block text-xs text-faint">Leave empty to use the excerpt.</span>
        </label>
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Body</span>
          <button type="button" className="rounded-lg border border-line px-2 py-1 text-xs" onClick={insertHeading}>
            Heading
          </button>
          <button type="button" className="rounded-lg border border-line px-2 py-1 text-xs" onClick={() => wrap("**")}>
            Bold
          </button>
          <button type="button" className="rounded-lg border border-line px-2 py-1 text-xs" onClick={insertLink}>
            Link
          </button>
          <label className="rounded-lg border border-line px-2 py-1 text-xs">
            Image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                void insertImage(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
          <button
            type="button"
            className="rounded-lg border border-line px-2 py-1 text-xs"
            onClick={() => setShowPreview((value) => !value)}
          >
            {showPreview ? "Hide preview" : "Show preview"}
          </button>
        </div>
        <textarea
          ref={textareaRef}
          name="body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={16}
          className="mt-2 w-full rounded-xl border border-line px-3 py-2 font-mono text-sm"
        />
        {showPreview ? (
          <div className="prose-blog mt-3 rounded-2xl border border-line bg-surface p-4 text-sm">
            <p className="mb-3 text-xs uppercase tracking-wide text-faint">Preview</p>
            <div
              className="space-y-3 leading-relaxed [&_a]:text-accent [&_h2]:font-display [&_h2]:text-2xl [&_h3]:text-xl [&_img]:max-h-80 [&_img]:rounded-xl [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }}
            />
          </div>
        ) : null}
      </div>
      {canPublish ? (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={post?.published} />
          Publish (live on /blog)
        </label>
      ) : (
        <p className="text-sm text-muted">Only an admin can publish. Your save stays a draft.</p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button className="rounded-full bg-gray-900 px-4 py-2 text-white">Save</button>
        {post?.slug ? (
          <a href={`/blog/${post.slug}`} className="text-sm text-accent" target="_blank" rel="noreferrer">
            {post.published ? "View live" : "Preview draft (sign-in required)"}
          </a>
        ) : null}
      </div>
      {post?.id && deleteAction ? (
        <button formAction={deleteAction} name="id" value={post.id} className="text-sm text-danger">
          Delete post
        </button>
      ) : null}
    </form>
  );
}
