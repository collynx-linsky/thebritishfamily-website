import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { shareImageSize } from "./seo";
import { company, sectors } from "./site";

// Brand colours (ImageResponse cannot read the CSS theme tokens).
const NAVY = "#1E3A6E";
const NAVY_DEEP = "#14274D";
const GOLD = "#F7A529";
const ON_NAVY = "#D9E1F0";

const logoSrc = `data:image/png;base64,${await readFile(
  join(process.cwd(), "public", company.logo.src),
  "base64",
)}`;

/** Branded 1200x630 share image used for Open Graph and Twitter cards. */
export function renderShareImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: `linear-gradient(110deg, ${NAVY_DEEP} 0%, ${NAVY} 100%)`,
          color: "white",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -190,
            top: 150,
            width: 420,
            height: 420,
            borderRadius: 9999,
            border: `44px solid ${GOLD}`,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img */}
          <img src={logoSrc} width={122} height={100} alt="" />
          <div style={{ display: "flex", flexDirection: "column", fontSize: 34, fontWeight: 700, lineHeight: 1.1 }}>
            <span>{company.wordmark[0]}</span>
            <span>{company.wordmark[1]}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 780 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 80,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -1,
            }}
          >
            <span>Four sectors.</span>
            <span style={{ color: GOLD }}>One trusted partner.</span>
          </div>
          <div style={{ display: "flex", fontSize: 28, color: ON_NAVY, lineHeight: 1.4, maxWidth: 700 }}>
            {sectors.map((s) => s.shortName).join(" · ")}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: GOLD, letterSpacing: 3, textTransform: "uppercase" }}>
          Established {company.established} · {company.headquarters}
        </div>
      </div>
    ),
    shareImageSize,
  );
}
