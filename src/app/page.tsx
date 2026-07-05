"use client";

import { useRouter } from "next/navigation";

export default function MainMenu() {
  const router = useRouter();

  return (
    <main className="flex flex-col min-h-screen items-center justify-center bg-sky-950">
      <h1 className="text-6xl font-bold text-white mb-10">STREET GUESSR</h1>
      <div className="grid grid-cols-3 gap-4 w-full p-40">
        <button
          className="col-span-3 rounded bg-white px-4 py-2 text-black transition hover:bg-gray-200 w-full h-30 text-5xl"
          onClick={() => router.push("/game?area=warsaw")}
        >
          CAŁA WARSZAWA
        </button>
        <button
          className=" rounded bg-white px-4 py-2 text-black transition hover:bg-gray-200 w-full h-30"
          onClick={() => router.push("/game?area=wlochy")}
        >
          WŁOCHY
        </button>
        <button
          className=" rounded bg-white px-4 py-2 text-black transition hover:bg-gray-200 w-full h-30"
          onClick={() => router.push("/game?area=ursynow")}
        >
          URSYNÓW
        </button>
        <button
          className=" rounded bg-white px-4 py-2 text-black transition hover:bg-gray-200 w-full h-30"
          onClick={() => router.push("/game?area=mokotow")}
        >
          MOKOTÓW
        </button>
      </div>
    </main>
  );
}