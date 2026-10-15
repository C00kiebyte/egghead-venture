import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  tall?: boolean;
}

export default function Scene({ children, tall }: Props) {
  return (
    <div className={`scene ${tall ? "tall" : ""}`}>
      <div className="sun" aria-hidden />
      <div className="cloud c1" aria-hidden />
      <div className="cloud c2" aria-hidden />
      <div className="cloud c3" aria-hidden />
      <svg className="hills" viewBox="0 0 800 340" preserveAspectRatio="xMidYMax slice" aria-hidden>
        {/* Hill 1 */}
        <path d="M0 200 Q130 130 270 188 T540 170 T800 160 V340 H0Z" fill="#9bda72" />

        {/* Castle */}
        <g transform="translate(600 106)">
          <rect x="14" y="26" width="64" height="52" fill="#d9deef" stroke="#8d96b8" strokeWidth="2" />
          <rect x="0" y="10" width="20" height="68" fill="#cfd5ea" stroke="#8d96b8" strokeWidth="2" />
          <rect x="72" y="10" width="20" height="68" fill="#cfd5ea" stroke="#8d96b8" strokeWidth="2" />
          <polygon points="-4,10 10,-14 24,10" fill="#e8453c" stroke="#9c2a22" strokeWidth="2" />
          <polygon points="68,10 82,-14 96,10" fill="#e8453c" stroke="#9c2a22" strokeWidth="2" />
          <path d="M38 78 V58 Q46 46 54 58 V78Z" fill="#7a431a" />
          <rect x="25" y="38" width="8" height="12" fill="#7a8bc4" />
          <rect x="59" y="38" width="8" height="12" fill="#7a8bc4" />
        </g>

        {/* Hill 2 */}
        <path d="M0 250 Q150 200 330 238 T650 226 T800 214 V340 H0Z" fill="#64c04c" />

        {/* Trees */}
        <g>
          <rect x="146" y="206" width="8" height="26" fill="#7a431a" />
          <circle cx="150" cy="198" r="22" fill="#2f9d3f" />
          <circle cx="140" cy="206" r="14" fill="#3fb34d" />
          <rect x="730" y="196" width="8" height="26" fill="#7a431a" />
          <circle cx="735" cy="188" r="22" fill="#2f9d3f" />
          <circle cx="745" cy="196" r="14" fill="#3fb34d" />
        </g>

        {/* Field */}
        <rect y="284" width="800" height="60" fill="#4aa23f" />
        <path d="M0 284 H800" stroke="#7ad25e" strokeWidth="6" />
      </svg>

      <div className="scene-content">{children}</div>
    </div>
  );
}
