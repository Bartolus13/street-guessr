"use client";

import { useRouter } from "next/navigation";

export default function MainMenu() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-sky-950">
      <div className="grid grid-cols-3 gap-4 w-full p-40">
        <button
          className="col-span-3 rounded bg-white px-4 py-2 text-black transition hover:bg-gray-200 w-full h-30 text-5xl"
          onClick={() => router.push("/game")}
        >
          CAŁA WARSZAWA
        </button>
        <button
          className=" rounded bg-white px-4 py-2 text-black transition hover:bg-gray-200 w-full h-30"
          onClick={() => router.push("/game")}
        >
          BEMOWO
        </button>
        <button
          className=" rounded bg-white px-4 py-2 text-black transition hover:bg-gray-200 w-full h-30"
          onClick={() => router.push("/game")}
        >
          MOKOTÓW
        </button>
        <button
          className=" rounded bg-white px-4 py-2 text-black transition hover:bg-gray-200 w-full h-30"
          onClick={() => router.push("/game")}
        >
          ŚRÓDMIEŚCIE
        </button>
      </div>
    </main>
  );
}