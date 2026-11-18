import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { Film, Activity, AlertTriangle, ChevronRight, Eye } from 'lucide-react';

export function TabForensics({ matches }) {
  const [selectedMatchId, setSelectedMatchId] = useState(14159);
  const [windowRange, setWindowRange] = useState([1, 20]);
  const [selectedInning, setSelectedInning] = useState(2);

  const activeMatch = useMemo(() => {
    return matches.find(m => m.match_id === selectedMatchId) || matches[0];
  }, [matches, selectedMatchId]);

  const telemetryData = useMemo(() => {
    if (!activeMatch) return [];
    return activeMatch.deliveries
      .filter(d => d.innings === selectedInning && d.over >= windowRange[0] && d.over <= windowRange[1])
      .map((d, index) => ({
        index: index + 1,
        over_ball: `${d.over}.${d.over_ball}`,
        wp: d.wp,
        psi_d: d.psi_d,
        striker: d.striker,
        bowler: d.bowler,
        runs: d.runs,
        is_wicket: d.is_wicket,
        stroke: d.stroke,
        delivery_style: d.delivery_style,
        bowl_speed: d.bowl_speed,
        is_peak: d.is_peak
      }));
  }, [activeMatch, selectedInning, windowRange]);

  const peakDeliveries = useMemo(() => {
    if (!activeMatch) return [];
    return activeMatch.deliveries
      .filter(d => d.is_peak)
      .slice(0, 10);
  }, [activeMatch]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-xl shadow-lg border border-rr-borderpink text-xs space-y-1 z-50">
          <div className="font-medium text-rr-blue border-b border-pink-100 pb-1 flex items-center justify-between gap-3">
            <span>Over {data.over_ball} (Innings {selectedInning})</span>
            {data.is_wicket ? (
              <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold">
                WICKET
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-pink-50 text-rr-pink font-semibold">
                {data.runs} Runs Scored
              </span>
            )}
          </div>
          <div className="text-rr-muted">
            Batsman on Strike: <strong className="text-rr-blue">{data.striker}</strong>
          </div>
          <div className="text-rr-muted">
            Bowler: <strong className="text-rr-blue">{data.bowler}</strong>
          </div>
          <div className="text-rr-muted">
            Shot Attempted: <strong className="text-rr-blue">{data.stroke}</strong>
          </div>
          <div className="text-rr-muted">
            Ball Pitch: <strong className="text-rr-blue">{data.delivery_style} ({data.bowl_speed} km/h)</strong>
          </div>
          <div className="pt-1 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px] font-medium">
            <span className="text-rr-blue">Win Probability: {(data.wp * 100).toFixed(1)}%</span>
            <span className="text-rr-pink">Pressure Index: {data.psi_d.toFixed(4)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-rr-borderpink">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-rr-darkpink text-xs font-semibold uppercase">
                Match Telemetry Cinema
              </span>
              <span className="text-xs font-semibold text-rr-muted">
                Over-by-Over Replay
              </span>
            </div>
            <h2 className="text-xl font-semibold text-rr-blue mt-1">
              Ball-by-Ball Match Replay & Pressure Trajectory
            </h2>
            <p className="text-xs text-rr-muted max-w-2xl mt-0.5">
              Inspect how Win Probability shifted with every single ball, shot type, and release speed in 15 of the closest thriller finishes.
            </p>
          </div>

          {/* Match Selector Dropdown */}
          <div className="flex flex-col gap-1 w-full md:w-auto shrink-0">
            <label className="text-[10px] font-medium uppercase text-rr-muted">Choose Close Finish Match</label>
            <select
              value={selectedMatchId}
              onChange={(e) => setSelectedMatchId(Number(e.target.value))}
              className="px-4 py-2.5 bg-pink-50 border border-rr-borderpink rounded-xl text-xs font-medium text-rr-blue focus:outline-none focus:ring-2 focus:ring-[#EA1A85]"
            >
              {matches.map(m => (
                <option key={m.match_id} value={m.match_id}>
                  Match {m.match_id}: {m.home_team} vs {m.away_team} ({m.result})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Replay Controls */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-rr-borderpink">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Innings Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-rr-blue uppercase">Select Innings:</span>
            <div className="inline-flex rounded-xl bg-pink-50 p-1 border border-rr-borderpink">
              <button
                onClick={() => setSelectedInning(1)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedInning === 1
                    ? 'bg-[#EA1A85] text-white shadow-sm'
                    : 'text-rr-blue hover:text-[#EA1A85]'
                }`}
              >
                1st Innings (Setting Target)
              </button>
              <button
                onClick={() => setSelectedInning(2)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedInning === 2
                    ? 'bg-[#EA1A85] text-white shadow-sm'
                    : 'text-rr-blue hover:text-[#EA1A85]'
                }`}
              >
                2nd Innings (Target Chase)
              </button>
            </div>
          </div>

          {/* Over Window Slider */}
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <span className="text-xs font-medium text-rr-blue uppercase whitespace-nowrap">
              Overs Window: {windowRange[0]} to {windowRange[1]}
            </span>
            <div className="flex items-center gap-2 w-full">
              <input
                type="range"
                min={1}
                max={15}
                value={windowRange[0]}
                onChange={(e) => setWindowRange([Number(e.target.value), Math.max(Number(e.target.value) + 5, windowRange[1])])}
                className="w-full accent-[#EA1A85] cursor-pointer"
              />
              <input
                type="range"
                min={windowRange[0] + 1}
                max={20}
                value={windowRange[1]}
                onChange={(e) => setWindowRange([windowRange[0], Number(e.target.value)])}
                className="w-full accent-[#EA1A85] cursor-pointer"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Trajectory Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-rr-borderpink space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-pink-100 pb-3 gap-2">
          <div>
            <h3 className="text-sm font-semibold text-rr-blue uppercase tracking-wide">
              Ball-by-Ball Trajectory: Win Probability vs Pressure Index
            </h3>
            <p className="text-xs text-rr-muted">
              Hover over any point to see exact shot, pitch location, bowler speed, and delivery result.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-rr-blue">
              <span className="w-3 h-1 bg-rr-blue rounded-full"></span>
              Win Probability (0% to 100%)
            </div>
            <div className="flex items-center gap-1.5 text-[#EA1A85]">
              <span className="w-3 h-1 bg-[#EA1A85] rounded-full"></span>
              Match Pressure
            </div>
            <div className="flex items-center gap-1.5 text-rose-600">
              <span className="w-3 h-0.5 bg-rose-500 border-dashed"></span>
              High-Pressure Cutoff
            </div>
          </div>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={telemetryData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <XAxis dataKey="over_ball" stroke="#071E54" tick={{ fontSize: 10, fontWeight: 'bold' }} />
              <YAxis yAxisId="left" domain={[0, 1]} stroke="#071E54" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 0.3]} stroke="#EA1A85" tick={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine yAxisId="right" y={0.1371} stroke="#E11D48" strokeDasharray="3 3" />
              <Area yAxisId="right" type="monotone" dataKey="psi_d" fill="#FDF2F8" stroke="#EA1A85" strokeWidth={2} />
              <Line yAxisId="left" type="monotone" dataKey="wp" stroke="#071E54" strokeWidth={2.5} dot={{ r: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-rr-borderpink space-y-4">
        <div className="flex items-center justify-between border-b border-pink-100 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-rr-blue uppercase tracking-wide">
              Top Decisive Deliveries in Selected Match
            </h3>
            <p className="text-xs text-rr-muted">
              Moments where the match hung in the balance.
            </p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-rose-100 text-rose-800">
            {peakDeliveries.length} Critical Balls
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-pink-50/50 border-b border-pink-100 text-[11px] font-medium text-rr-blue uppercase whitespace-nowrap">
                <th className="py-2.5 px-3">Over.Ball</th>
                <th className="py-2.5 px-3">Innings</th>
                <th className="py-2.5 px-3">Batsman</th>
                <th className="py-2.5 px-3">Bowler</th>
                <th className="py-2.5 px-3">Shot Played</th>
                <th className="py-2.5 px-3">Delivery Pitch & Length</th>
                <th className="py-2.5 px-3 text-right">Speed</th>
                <th className="py-2.5 px-3 text-right">Result</th>
                <th className="py-2.5 px-3 text-right">Pressure Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {peakDeliveries.map((d, i) => (
                <tr key={i} className="hover:bg-pink-50/30 transition-colors">
                  <td className="py-2.5 px-3 font-medium tabular-nums text-rr-blue">
                    {d.over}.{d.over_ball}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-rr-muted">
                    Inn {d.innings}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-rr-blue">
                    {d.striker}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-rr-muted">
                    {d.bowler}
                  </td>
                  <td className="py-2.5 px-3 text-rr-blue">
                    <span className="px-2 py-0.5 rounded bg-pink-50 border border-pink-100 text-[11px] font-semibold">
                      {d.stroke}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-rr-muted">
                    {d.delivery_style}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-rr-muted">
                    {d.bowl_speed} km/h
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-medium">
                    {d.is_wicket ? (
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[11px]">
                        WICKET
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[11px]">
                        +{d.runs} Runs
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-[#EA1A85]">
                    {d.psi_d.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
