import { ImageResponse } from "next/og";

// Shared social-share image (1200×630), used for both Open Graph and Twitter.
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";
export const OG_ALT = "SenayCreatives — Digital agency in Addis Ababa";

export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#15140f",
          color: "#f4f3ee",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: 4,
            color: "#1f4dff",
            fontWeight: 700,
          }}
        >
          DIGITAL AGENCY · ADDIS ABABA
        </div>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700, lineHeight: 1.05, maxWidth: 1000 }}>
          We solve problems through digital means.
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 600 }}>
          SenayCreatives
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
