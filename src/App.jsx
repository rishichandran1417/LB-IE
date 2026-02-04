import { useEffect, useState } from "react";
import logo from "./assets/logo.png";

/**
 * CSV format:
 * TEAM,FIRST,SECOND,THIRD,POINTS
 */
const GOOGLE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSZmxQNxuNJ_BO8MAgz5gApbtE6R-SLZFbWgoaVPKB9-fv_RUBQ5jPzcXkDV8rEUsA8HpNO3hugpcy7/pub?output=csv";

/**
 * FULL REPORT LINK
 * (Google Sheet / Drive / PDF / Dashboard etc.)
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
      const res = await fetch(GOOGLE_SHEET_URL);
      if (!res.ok) throw new Error("Fetch failed");

      const csvText = await res.text();
      const parsedData = parseCSV(csvText);

      // Sort by POINTS (descending)
      parsedData.sort((a, b) => b.score - a.score);

      // Assign ranks + LIMIT TO 4 TEAMS
      const ranked = parsedData
        .map((item, index) => ({
          ...item,
          rank: index + 1
        }))
        .slice(0, 4); // 👈 IMPORTANT FIX

      setLeaderboardItems(ranked);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to load leaderboard data.");
    } finally {
      setIsLoading(false);
    }
  }

  function parseCSV(text) {
    const lines = text.split("\n");
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      const cols = line.split(",");

      data.push({
        id: i,
        team: cols[0]?.trim(),
        score: Number(cols[4]) || 0
      });
    }

    return data;
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col items-center">

      {/* HEADER */}
      <header className="w-full max-w-lg flex justify-between items-center py-8 px-6 border-b border-red-900/40">
        <img
          src={logo}
          alt="Company Logo"
          className="h-20 md:h-24 object-contain drop-shadow-[0_0_30px_rgba(255,0,0,0.6)]"
        />

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
          Performance Leaderboard
        </h1>
        <p className="text-center text-slate-400 mb-10">
          Top Performers
        </p>

        {errorMessage && (
          <div className="bg-red-950 border border-red-800 text-red-400 p-4 rounded-lg mb-6">
            {errorMessage}
          </div>
        )}

        <div className="space-y-4">
          {leaderboardItems.map(item => (
            <div
              key={item.id}
              className="bg-[#0B0B0B] border border-red-900/40 rounded-xl p-5 flex justify-between items-center shadow hover:shadow-red-900/40 transition"
            >
              <div>
                <div className="font-semibold text-lg tracking-wide">
                  {item.team}
                </div>
                <div className="text-xs text-slate-500 tracking-widest">
                  RANK #{item.rank}
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

        {/* VIEW FULL REPORT LINK */}
        <a
          href="https://docs.google.com/spreadsheets/d/1dJ1PkIXQvKohio091Tthsj6IBPaP_TjTDX-ld326BpI/edit?gid=0#gid=0"
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
