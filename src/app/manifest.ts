import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DealDuniya",
    short_name: "DealDuniya",
    description: "Practical product research and recommendations to help you buy smarter.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f6f3",
    theme_color: "#a8842b",
    icons: [
      { src: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
