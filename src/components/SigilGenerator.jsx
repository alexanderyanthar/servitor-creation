// src/components/SigilGenerator.jsx
"use client";

import { useEffect, useRef } from "react";

export default function SigilGenerator({ name, onSigilGenerated }) {
  const canvasRef = useRef(null);

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const totalLetters = letters.length;
  const centerX = 250;
  const centerY = 250;
  const outerCircleRadius = 220; // Outer circle
  const innerCircleRadius = 140; // Inner circle
  const sigilOuterRadius = 100; // Sigil outer points (inside inner circle)
  const sigilInnerRadius = 70; // Sigil inner points (for repeated letters)

  const getPosition = (index, total, rad, offset = 0) => {
    const angle =
      (((index + 0.5 + offset) * 360) / total - 90) * (Math.PI / 180);
    return {
      x: centerX + rad * Math.cos(angle),
      y: centerY + rad * Math.sin(angle),
    };
  };

  const getLetterPosition = (letter, useInner = false) => {
    const upperLetter = letter.toUpperCase();
    const index = letters.indexOf(upperLetter);
    if (index === -1) return null;
    // Use sigilRadius for both, with slight offset for repeated letters
    const radius = useInner ? sigilInnerRadius : sigilOuterRadius;
    return getPosition(index, totalLetters, radius, useInner ? 0.5 : 0);
  };

  const getLetterUsage = (inputName) => {
    const cleanName = inputName.replace(/[^a-zA-Z]/g, "").toUpperCase();
    const usage = {};
    const positions = [];

    for (let i = 0; i < cleanName.length; i++) {
      const letter = cleanName[i];
      if (!usage[letter]) {
        usage[letter] = 0;
      }

      const useInner = usage[letter] % 2 === 1;
      positions.push({ letter, useInner });
      usage[letter]++;
    }

    return positions;
  };

  const generateSigil = (inputName) => {
    if (!inputName) return null;

    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");

    // Clear canvas with white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 500, 500);

    // Draw outer circle (220 radius)
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerCircleRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw inner circle (140 radius)
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerCircleRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Radial lines removed - clean circles only

    // Draw center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#000000";
    ctx.fill();

    // Add name once at top - curved text along the arc BETWEEN the circles
    const nameText = inputName.toUpperCase();
    ctx.font = "bold 18px serif";
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Position text between the circles (140-220 radius, so use 180)
    const arcRadius = 180;
    const anglePerLetter = (Math.PI * 2) / nameText.length; // Divide full circle by letter count
    const startAngle = -Math.PI / 2; // Start at top (12 o'clock)

    for (let i = 0; i < nameText.length; i++) {
      const angle = startAngle + i * anglePerLetter; // Each letter gets equal slice
      const x = centerX + arcRadius * Math.cos(angle);
      const y = centerY + arcRadius * Math.sin(angle);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2); // Rotate text to follow curve
      ctx.fillText(nameText[i], 0, 0);
      ctx.restore();
    }

    // Generate and draw the sigil path
    const positions = getLetterUsage(inputName);
    if (positions.length > 0) {
      ctx.beginPath();

      positions.forEach((item, i) => {
        const pos = getLetterPosition(item.letter, item.useInner);
        if (pos) {
          if (i === 0) {
            ctx.moveTo(pos.x, pos.y);
          } else {
            ctx.lineTo(pos.x, pos.y);
          }
        }
      });

      ctx.strokeStyle = "#ff0000"; // Red color for sigil
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      // Mark points on the path in red
      positions.forEach((item) => {
        const pos = getLetterPosition(item.letter, item.useInner);
        if (pos) {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = "#ff0000"; // Red color for points
          ctx.fill();
        }
      });
    }

    // Convert to data URL
    const dataUrl = canvas.toDataURL("image/png");
    return dataUrl;
  };

  useEffect(() => {
    if (name) {
      const sigil = generateSigil(name);
      if (onSigilGenerated) {
        onSigilGenerated(sigil);
      }
    }
  }, [name]);

  return <canvas ref={canvasRef} width={500} height={500} className="hidden" />;
}
