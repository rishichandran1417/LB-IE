import { useEffect, useState } from "react";

/**
 * CSV format:
 * TEAM,FIRST,SECOND,THIRD,POINTS
 */
const GOOGLE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQQwjrHezjqI6w1i7M5mtosuA-HcKMn7WAwY3C3izt4odtcXg1EiYa0aPkNmYgM7uxJa97hZy2c-Wlr/pub?output=csv";

/**
 * FULL REPORT LINK
 */
const FULL_REPORT_URL =
  "https://docs.google.com/spreadsheets/d/1dJ1PkIXQvKohio091Tthsj6IBPaP_TjTDX-ld326BpI/edit";

export default function App() {
  const [leaderboardItems, setLeaderboardItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    loadDataFromSheet();
  }, []);

  async function loadDataFromSheet() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`${GOOGLE_SHEET_URL}&t=${Date.now()}`);

      if (!res.ok) throw new Error("Fetch failed");

      const csvText = await res.text();
      const parsedData = parseCSV(csvText);

      parsedData.sort((a, b) => b.score - a.score);

      const ranked = parsedData
        .map((item, index) => ({
          ...item,
          rank: index + 1
        }))
        .slice(0, 4);

      setLeaderboardItems(ranked);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to load leaderboard data.");
    } finally {
      setIsLoading(false);
    }
  }

  function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",");

      if (!cols[0]) continue;

      data.push({
        team: cols[0].trim(),
        score: Number(cols[4]?.replace("\r", "")) || 0
      });
    }

    return data;
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col items-center">

      {/* HEADER */}
      <header className="w-full max-w-lg flex justify-between items-center py-8 px-6 border-b border-red-900/40">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="Company Logo"
            className="h-20 md:h-24 object-contain drop-shadow-[0_0_30px_rgba(255,0,0,0.6)]"
          />
<div className="flex text-5xl font-spartan font-black tracking-[-0.04em]">
  <span className="px-3 py-1 border-2 border-red-600 bg-black
                   shadow-[0_0_18px_rgba(255,0,0,0.8)]
                   text-white">
    IE
  </span>

  <span className="px-3 py-1 border-2 border-white bg-black -ml-[3px]
                   shadow-[0_0_14px_rgba(255,255,255,0.55)]
                   text-white">
    CUP
  </span>
</div>


        </div>

        <div className="flex items-center gap-3">
          {isLoading && (
            <span className="text-xs text-red-400 animate-pulse">
              Syncing…
            </span>
          )}
          <button
            onClick={loadDataFromSheet}
            className="border border-red-800 text-red-300 px-3 py-1 rounded-full hover:bg-red-900/40 transition"
          >
            Refresh
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="w-full max-w-lg px-4 mt-10">
        <h1 className="text-3xl font-bold text-center tracking-wide">
          Leaderboard
        </h1>

        {errorMessage && (
          <div className="bg-red-950 border border-red-800 text-red-400 p-4 rounded-lg my-6">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4 mt-6">
          {leaderboardItems.map(item => (
            <div
              key={item.team}
              className="bg-[#0B0B0B] border border-red-900/40 rounded-xl p-5 flex justify-between items-center shadow hover:shadow-red-900/40 transition"
            >
              <div>
                <div className="font-semibold text-lg tracking-wide">
                   {item.team}
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-black text-red-500">
                  {item.score}
                </div>
                <div className="text-[10px] text-slate-400 tracking-widest">
                  POINTS
                </div>
              </div>
            </div>
          ))}
        </div>

        <a
          href={FULL_REPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-12 w-full block bg-red-700 hover:bg-red-600 text-black font-bold py-4 rounded-xl text-center transition shadow-lg shadow-red-900/40"
        >
          View Full Report →
        </a>
      </main>

      {/* FOOTER */}
      <footer className="mt-auto py-8 text-xs text-slate-500">
        © 2026 • Industrial Engineering
      </footer>
    </div>
  );
}
