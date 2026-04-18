"use client"

import { type ReactNode } from "react"

interface GlowingShadowButtonProps {
  children: ReactNode
}

export function GlowingShadow({ children }: GlowingShadowButtonProps) {
  return (
    <>
      <style jsx>{`
        @property --hue {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --rotate {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --bg-y {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --bg-x {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --glow-translate-y {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --bg-size {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --glow-opacity {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --glow-blur {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }
        @property --glow-scale {
          syntax: "<number>";
          inherits: true;
          initial-value: 2;
        }
        @property --glow-radius {
          syntax: "<number>";
          inherits: true;
          initial-value: 2;
        }
        @property --white-shadow {
          syntax: "<number>";
          inherits: true;
          initial-value: 0;
        }

        .glow-container {
          --card-color: rgba(255,255,255,0.85);
          --card-radius: 9999px;
          --card-width: 860px;
          --border-width: 2px;
          --bg-size: 1;
          --hue: 210;
          --hue-speed: 0.3;
          --rotate: 0;
          --animation-speed: 8s;
          --interaction-speed: 0.55s;
          --glow-scale: 1.5;
          --scale-factor: 1;
          --glow-blur: 4;
          --glow-opacity: 0.8;
          --glow-radius: 100;
          --glow-rotate-unit: 1deg;

          width: var(--card-width);
          max-width: 90vw;
          color: white;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          border-radius: var(--card-radius);
          cursor: default;
        }

        .glow-container:before,
        .glow-container:after {
          content: "";
          display: block;
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: var(--card-radius);
        }

        .glow-content {
          position: relative;
          width: 100%;
          background: var(--card-color);
          border-radius: var(--card-radius);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 28px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .glow-content:before {
          content: "";
          display: block;
          position: absolute;
          inset: calc(var(--border-width) * -1);
          border-radius: var(--card-radius);
          box-shadow: 0 0 20px rgba(0,133,255,0.1);
          mix-blend-mode: normal;
          z-index: -1;
          background: hsl(0deg 0% 96%) radial-gradient(
            30% 30% at calc(var(--bg-x) * 1%) calc(var(--bg-y) * 1%),
            hsl(calc(210 + var(--hue) * var(--hue-speed) * 1deg) 100% 75%) calc(0% * var(--bg-size)),
            hsl(calc(220 + var(--hue) * var(--hue-speed) * 1deg) 100% 65%) calc(20% * var(--bg-size)),
            hsl(calc(200 + var(--hue) * var(--hue-speed) * 1deg) 100% 55%) calc(40% * var(--bg-size)),
            transparent 100%
          );
          animation: hue-animation var(--animation-speed) linear infinite,
                     rotate-bg var(--animation-speed) linear infinite;
        }

        .glow {
          --glow-translate-y: 0;
          display: block;
          position: absolute;
          width: 80px;
          height: 80px;
          animation: rotate var(--animation-speed) linear infinite;
          transform: rotateZ(calc(var(--rotate) * var(--glow-rotate-unit)));
          transform-origin: center;
          border-radius: calc(var(--glow-radius) * 10vw);
        }

        .glow:after {
          content: "";
          display: block;
          z-index: -2;
          filter: blur(calc(var(--glow-blur) * 10px));
          width: 130%;
          height: 130%;
          left: -15%;
          top: -15%;
          background: hsl(calc(210 + var(--hue) * var(--hue-speed) * 1deg) 100% 60%);
          position: relative;
          border-radius: calc(var(--glow-radius) * 10vw);
          animation: hue-animation var(--animation-speed) linear infinite;
          transform: scaleY(calc(var(--glow-scale) * var(--scale-factor) / 1.1))
                     scaleX(calc(var(--glow-scale) * var(--scale-factor) * 1.2))
                     translateY(calc(var(--glow-translate-y) * 1%));
          opacity: var(--glow-opacity);
        }

        @keyframes rotate-bg {
          0% { --bg-x: 0; --bg-y: 0; }
          25% { --bg-x: 100; --bg-y: 0; }
          50% { --bg-x: 100; --bg-y: 100; }
          75% { --bg-x: 0; --bg-y: 100; }
          100% { --bg-x: 0; --bg-y: 0; }
        }

        @keyframes rotate {
          from { --rotate: -70; --glow-translate-y: -65; }
          to { --rotate: calc(360 - 70); --glow-translate-y: -65; }
        }

        @keyframes hue-animation {
          0% { --hue: 0; }
          100% { --hue: 360; }
        }
      `}</style>

      <div className="glow-container">
        <span className="glow"></span>
        <div className="glow-content">{children}</div>
      </div>
    </>
  )
}
