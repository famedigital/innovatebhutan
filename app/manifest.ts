import type { MetadataRoute } from "next";

const ICON =
  "https://res.cloudinary.com/dr9a371tx/image/upload/q_auto/f_auto/c_fit,w_512,h_512/v1776705871/weblogo_os6cni.png";

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
    background_color: "#FFFFFF",
    theme_color: "#0A5F4E",
    categories: ["business", "productivity"],
    icons: [
      {
        src: ICON,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: ICON,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: ICON,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
