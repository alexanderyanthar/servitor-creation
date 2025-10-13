"use client";

import React, { useState } from "react";

const CelestialWheel = () => {
  const [inputName, setInputName] = useState("Solara");
  const [showLetters, setShowLetters] = useState(true);

  const letters = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];

  const totalLetters = letters.length;
  const outerRadius = 180;
  const innerRadius = 110;
  const centerX = 250;
  const centerY = 250;

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
    return getPosition(
      index,
      totalLetters,
      useInner ? innerRadius : outerRadius,
      useInner ? 0.5 : 0
    );
  };

  const getLetterUsage = () => {
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

  const generatePath = () => {
    const positions = getLetterUsage();
    if (positions.length === 0) return "";

    let pathData = "";
    for (let i = 0; i < positions.length; i++) {
      const pos = getLetterPosition(positions[i].letter, positions[i].useInner);
      if (pos) {
        if (i === 0) {
          pathData += `M ${pos.x} ${pos.y}`;
        } else {
          pathData += ` L ${pos.x} ${pos.y}`;
        }
      }
    }
    return pathData;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="mb-4 flex flex-col items-center gap-3">
        <input
          type="text"
          value={inputName}
          onChange={(e) => setInputName(e.target.value)}
          placeholder="Enter a name"
          className="px-4 py-2 text-lg text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showLetters}
            onChange={(e) => setShowLetters(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <span className="text-gray-700">Show letters</span>
        </label>
      </div>

      <svg
        width="500"
        height="500"
        viewBox="0 0 500 500"
        className="bg-white rounded-lg shadow-lg"
      >
        <circle
          cx={centerX}
          cy={centerY}
          r="220"
          fill="none"
          stroke="black"
          strokeWidth="3"
        />
        <circle
          cx={centerX}
          cy={centerY}
          r="140"
          fill="none"
          stroke="black"
          strokeWidth="3"
        />
        <circle cx={centerX} cy={centerY} r="5" fill="black" />

        {letters.map((letter, index) => {
          const angle = ((index * 360) / totalLetters - 90) * (Math.PI / 180);

          const x1 = centerX + 140 * Math.cos(angle);
          const y1 = centerY + 140 * Math.sin(angle);
          const x2 = centerX + 220 * Math.cos(angle);
          const y2 = centerY + 220 * Math.sin(angle);

          const outerPos = getPosition(index, totalLetters, outerRadius, 0);
          const innerPos = getPosition(index, totalLetters, innerRadius, 0.5);

          return (
            <g key={`outer-${index}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="black"
                strokeWidth="2"
              />
              {showLetters && (
                <>
                  <text
                    x={outerPos.x}
                    y={outerPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="24"
                    fontWeight="bold"
                    fontFamily="Arial"
                  >
                    {letter}
                  </text>
                  <text
                    x={innerPos.x}
                    y={innerPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="20"
                    fontWeight="bold"
                    fontFamily="Arial"
                    fill="#666"
                  >
                    {letter}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {inputName && (
          <path
            d={generatePath()}
            fill="none"
            stroke="red"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {getLetterUsage().map((item, i) => {
          const pos = getLetterPosition(item.letter, item.useInner);
          if (!pos) return null;
          return (
            <circle key={`point-${i}`} cx={pos.x} cy={pos.y} r="4" fill="red" />
          );
        })}
      </svg>

      <div className="mt-4 text-gray-700 text-center">
        <p className="text-sm">
          Repeating letters alternate between outer and inner wheel
        </p>
        <p className="text-xs text-gray-500 mt-1">
          1st occurrence: outer (black), 2nd: inner (gray), 3rd: outer, etc.
        </p>
      </div>
    </div>
  );
};

export default CelestialWheel;
