"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface DayData { total: number; complete: number; blockers: number; }
interface CalendarResponse { year: number; month: number; days: Record<string, DayData>; }

const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function pad(n: number) { return String(n).padStart(2, "0"); }
function dateKey(y: number, m: number, d: number) { return `${y}-${pad(m)}-${pad(d)}`; }

function DayCell({ day, year, month, data, isToday, isPast }: {
  day: number; year: number; month: number;
  data?: DayData; isToday: boolean; isPast: boolean;
}) {
  const key = dateKey(year, month, day);
  const hasData = data && data.total > 0;
  const pct = hasData ? Math.round((data!.complete / data!.total) * 100) : 0;
  const hasBlocker = data?.blockers && data.blockers > 0;

  let cellCls = "rounded-xl border p-2.5 min-h-[80px] flex flex-col gap-1.5 transition-all ";
  if (isToday)
    cellCls += "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200 ";
  else if (hasBlocker)
    cellCls += "bg-red-50 border-red-200 hover:border-red-300 hover:shadow-sm cursor-pointer ";
  else if (hasData)
    cellCls += "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm cursor-pointer ";
  else if (isPast)
    cellCls += "bg-white border-slate-100 hover:border-slate-200 cursor-pointer ";
  else
    cellCls += "bg-slate-50 border-slate-100 opacity-40 pointer-events-none ";

  const inner = (
    <div className={cellCls}>
      <span className={`text-xs font-bold leading-none
        ${isToday ? "text-indigo-700"
          : isPast ? "text-slate-600"
          : "text-slate-300"}`}>
        {day}
      </span>
      {hasData && (
        <div className="mt-auto space-y-1">
          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all
              ${pct === 100 ? "bg-emerald-500" : "bg-indigo-400"}`}
                 style={{ width: `${pct}%` }}/>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-medium text-slate-400">
              {data!.complete}/{data!.total}
            </span>
            {hasBlocker && (
              <span className="text-[9px] font-bold text-red-600 bg-red-100
                               border border-red-200 px-1 rounded-full leading-tight">
                ⚠ {data!.blockers}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (isPast || isToday) && hasData ? (
    <Link href={`/dashboard?date=${key}`} aria-label={
      `${MONTHS[month-1]} ${day}, ${year}${hasBlocker ? ` – ${data!.blockers} blocker(s)` : ""}`
    }>
      {inner}
    </Link>
  ) : <div>{inner}</div>;
}

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear]     = useState(now.getFullYear());
  const [month, setMonth]   = useState(now.getMonth() + 1);
  const [data, setData]     = useState<CalendarResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const r = await fetch(`/api/dashboard/calendar?year=${year}&month=${month}`);
      if (!r.ok) throw new Error("Failed to load.");
      setData(await r.json());
    } catch(e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally { setLoading(false); }
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  function prev() { month === 1 ? (setYear(y=>y-1), setMonth(12)) : setMonth(m=>m-1); }
  function next() { month === 12 ? (setYear(y=>y+1), setMonth(1)) : setMonth(m=>m+1); }

  const daysInMonth  = new Date(year, month, 0).getDate();
  const firstDayOfWk = new Date(year, month - 1, 1).getDay();
  const todayKey     = dateKey(now.getFullYear(), now.getMonth()+1, now.getDate());

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Calendar</h1>
          <p className="text-sm text-slate-500 mt-1">Monthly standup activity overview</p>
        </div>

        {/* Month nav */}
        <div className="flex items-center gap-2 bg-white border border-slate-200
                        rounded-xl shadow-sm px-1 py-1">
          <button onClick={prev}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900
                             hover:bg-slate-100 transition-colors"
                  aria-label="Previous month">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <span className="text-sm font-semibold text-slate-800 min-w-[130px] text-center px-1">
            {MONTHS[month-1]} {year}
          </span>
          <button onClick={next}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900
                             hover:bg-slate-100 transition-colors"
                  aria-label="Next month">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-5 text-xs text-slate-500">
        {[
          { dot: "bg-emerald-500", label: "All submitted" },
          { dot: "bg-indigo-400",  label: "Partial" },
          { dot: "bg-red-400",     label: "Blocker flagged" },
          { dot: "bg-indigo-300 ring-2 ring-indigo-200", label: "Today" },
        ].map(l => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full inline-block ${l.dot}`}/>
            {l.label}
          </span>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl
                        px-4 py-3 text-sm">{error}</div>
      )}

      {/* Calendar card */}
      <div className={`bg-white border border-slate-200 rounded-2xl shadow-sm p-5
                       transition-opacity ${loading ? "opacity-60" : "opacity-100"}`}
           aria-busy={loading}>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {DAYS.map(d => (
            <div key={d}
                 className="text-center text-[10px] font-bold text-slate-400
                            uppercase tracking-widest py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayOfWk }).map((_, i) => (
            <div key={`e${i}`} className="min-h-[80px]"/>
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const k = dateKey(year, month, day);
            const isToday = k === todayKey;
            const isPast  = new Date(year, month-1, day)
                            <= new Date(now.getFullYear(), now.getMonth(), now.getDate());
            return (
              <DayCell key={day} day={day} year={year} month={month}
                       data={data?.days[k]} isToday={isToday} isPast={isPast}/>
            );
          })}
        </div>
      </div>

      {/* Summary row */}
      {data && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Days with activity",
              value: Object.keys(data.days).length, color: "text-indigo-700" },
            { label: "Total submissions",
              value: Object.values(data.days).reduce((s,d)=>s+d.complete,0), color: "text-emerald-700" },
            { label: "Blocker days",
              value: Object.values(data.days).filter(d=>d.blockers>0).length, color: "text-red-700" },
          ].map(s => (
            <div key={s.label}
                 className="bg-white border border-slate-200 rounded-2xl
                            shadow-sm px-5 py-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
