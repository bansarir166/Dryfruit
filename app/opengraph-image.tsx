import { ImageResponse } from "next/og";

export const alt = "NOURA — Nature, Refined. Premium Dry Fruits & Luxury Gift Boxes";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1A1715",
          color: "#FDFBF7",
          fontFamily: "serif",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        {/* Subtle decorative border */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            right: 24,
            bottom: 24,
            border: "1px solid rgba(226, 203, 165, 0.25)",
            display: "flex",
          }}
        />

        <p
          style={{
            fontSize: 14,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#E2CBA5",
            marginBottom: 20,
          }}
        >
          Artisanal Pantry & Atelier
        </p>

        <h1
          style={{
            fontSize: 84,
            fontWeight: 400,
            margin: 0,
            letterSpacing: "0.05em",
            color: "#FDFBF7",
          }}
        >
          NOURA
        </h1>

        <p
          style={{
            fontSize: 24,
            fontStyle: "italic",
            color: "#D4B483",
            marginTop: 16,
            marginBottom: 32,
          }}
        >
          Nature, Refined.
        </p>

        <p
          style={{
            fontSize: 18,
            color: "rgba(253, 251, 247, 0.75)",
            maxWidth: 680,
            textAlign: "center",
            lineHeight: 1.5,
            fontFamily: "sans-serif",
          }}
        >
          California Nonpareil Almonds • Konkan Cashews • Antep Pistachios • Medjool Dates • Luxury Gift Boxes
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
