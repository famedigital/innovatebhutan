import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Innovates Bhutan ERP",
    short_name: "Innovates ERP",
    description:
      "Staff ERP for AMC, support tickets, projects, invoices, and payroll. Mobile for daily work; desktop for detail.",
    start_url: "/login/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#F7F6F3",
    theme_color: "#0A5F4E",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
