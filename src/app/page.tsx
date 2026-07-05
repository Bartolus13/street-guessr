"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Difficulty } from "./game/page";

export default function MainMenu() {
  const router = useRouter();

  const areas = [
    { value: "warsaw", label: "CAŁA WARSZAWA", fullWidth: true },
    { value: "bemowo", label: "BEMOWO" },
    { value: "bialoleka", label: "BIAŁOŁĘKA" },
    { value: "bielany", label: "BIELANY" },
    { value: "mokotow", label: "MOKOTÓW" },
    { value: "ochota", label: "OCHOTA" },
    { value: "pragapolnoc", label: "PRAGA PÓŁNOC" },
    { value: "pragapoludnie", label: "PRAGA POŁUDNIE" },
    { value: "rembertow", label: "REMBERTÓW" },
    { value: "srodmiescie", label: "ŚRÓDMIEŚCIE" },
    { value: "targowek", label: "TARGÓWEK" },
    { value: "ursus", label: "URSUS" },
    { value: "ursynow", label: "URSYNÓW" },
    { value: "wawer", label: "WAWER" },
    { value: "wesola", label: "WESOŁA" },
    { value: "wilanow", label: "WILANÓW" },
    { value: "wlochy", label: "WŁOCHY" },
    { value: "wola", label: "WOLA" },
    { value: "zoliborz", label: "ŻOLIBORZ" },
  ];

  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-start overflow-y-auto bg-sky-950 px-6 py-10 sm:px-10 lg:px-20">
      <h1 className="mb-10 text-6xl font-bold text-white">STREET GUESSR</h1>
      <select
        className="bg-white text-black py-2 px-4 rounded mb-10 w-100 text-2xl text-center"
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value as Difficulty)}
      >
        <option value="easy">Łatwy</option>
        <option value="medium">Średni</option>
        <option value="hard">Trudny</option>
        <option value="all">Ekspert</option>
      </select>
      <div className="grid w-full grid-cols-3 gap-4">
        {areas.map((area) => (
          <button
            key={area.value}
            className={`rounded bg-white px-4 py-2 text-black transition hover:bg-gray-200 w-full h-30 ${area.fullWidth ? "col-span-3 text-5xl" : "text-2xl"}`}
            onClick={() => router.push(`/game?area=${area.value}&difficulty=${difficulty}`)}
          >
            {area.label}
          </button>
        ))}
      </div>
    </main>
  );
}