import { ImageResponse } from "next/og";

export const alt = "Interloid: senior product engineering";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #020618 0%, #0f2a4d 60%, #1f5da0 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em" }}>Interloid</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.03em" }}>
            Senior product engineering.
          </div>
          <div style={{ marginTop: 28, fontSize: 32, color: "#9fd3e6" }}>
            Defined problems to deployed software, in your accounts, on your repos.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
