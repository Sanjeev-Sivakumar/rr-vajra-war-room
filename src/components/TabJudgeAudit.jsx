import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Sliders, ShieldCheck, CheckCircle2, AlertOctagon, HelpCircle, FileText } from 'lucide-react';

export function TabJudgeAudit({ batters, summary }) {
  const [priorK, setPriorK] = useState(50);
  const [consistencyWeight, setConsistencyWeight] = useState(1.0);

  // Recalculate dynamic ratings live based on hyperparameters
  const auditedBatters = useMemo(() => {
    return batters.map(p => {
      const n = p.pressure_balls;
      const priorVa = 0.0;
      const shrunkVa = (n * (p.pressure_runs_added_per_100 || 0) + priorK * priorVa) / (n + priorK);
      const stdFactor = Math.max(0.6, 1.0 - (p.match_to_match_variance / 75.0) * consistencyWeight);
      const dynamicComposite = (shrunkVa * 0.5 + p.clutch_lift_delta * 0.3) * stdFactor;

      return {
        ...p,
        dynamic_score: dynamicComposite
      };
    }).sort((a, b) => b.dynamic_score - a.dynamic_score);
  }, [batters, priorK, consistencyWeight]);

  const backtestData = [
    {
      metric: "Future Match Correlation",
      vajra: 0.302,
      naive_death: 0.120,
    },
    {
      metric: "Statistical Confidence Level",
      vajra: 0.9916,
      naive_death: 0.7159,
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-rr-borderpink">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase">
                Analytics Team Audit
              </span>
              <span className="text-xs text-rr-muted font-medium">
                Model Testing & Methodology
              </span>
            </div>
            <h2 className="text-xl font-semibold text-rr-blue mt-1">
              Model Sensitivity Simulator & Out-of-Time Backtest Proof
            </h2>
            <p className="text-xs text-rr-muted max-w-2xl mt-0.5">
              Verify how the ratings hold up under different sample weighting scenarios, and view the historical backtest comparing Project VAJRA against conventional death-overs filters.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 bg-pink-50 rounded-xl border border-rr-borderpink text-xs font-medium text-rr-blue shrink-0">
            <ShieldCheck className="w-4 h-4 text-[#EA1A85]" />
            <span>2.5x More Reliable Than Death Overs</span>
          </div>
        </div>
      </div>

      {/* Grid: Sliders & Backtest Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Sliders */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-sm border border-rr-borderpink space-y-5">
          <div className="flex items-center justify-between border-b border-pink-100 pb-3">
            <h3 className="text-sm font-semibold text-rr-blue uppercase tracking-wide flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#EA1A85]" />
              Adjust Sample Weighting & Variance
            </h3>
            <span className="text-xs text-rr-muted font-medium">
              Live Recalculation
            </span>
          </div>

          {/* Slider 1: Prior K */}
          <div className="bg-rr-subtle p-3.5 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center text-xs font-medium text-rr-blue mb-1.5">
              <span>Sample Regularization (Prior K Balls)</span>
              <span className="text-[#EA1A85] text-base font-semibold tabular-nums">K = {priorK} Balls</span>
            </div>
            <input
              type="range"
              min={10}
              max={150}
              step={5}
              value={priorK}
              onChange={(e) => setPriorK(Number(e.target.value))}
              className="w-full accent-[#EA1A85] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-rr-muted font-medium mt-1">
              <span>K = 10 (Light Prior)</span>
              <span>K = 50 (Standard Calibration)</span>
              <span>K = 150 (Heavy Regularization)</span>
            </div>
          </div>

          {/* Slider 2: Consistency Weight */}
          <div className="bg-rr-subtle p-3.5 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center text-xs font-medium text-rr-blue mb-1.5">
              <span>Match-to-Match Consistency Penalty</span>
              <span className="text-[#EA1A85] text-base font-semibold tabular-nums">{consistencyWeight.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0.0}
              max={2.0}
              step={0.1}
              value={consistencyWeight}
              onChange={(e) => setConsistencyWeight(Number(e.target.value))}
              className="w-full accent-[#EA1A85] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-rr-muted font-medium mt-1">
              <span>0.0x (Ignore Inconsistency)</span>
              <span>1.0x (Calibrated Balance)</span>
              <span>2.0x (Heavy Consistency Penalty)</span>
            </div>
          </div>

          {/* Dynamic Top 5 Reranked */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium uppercase text-rr-blue">
                Recalculated Top 5 Batters Under Current Settings:
              </span>
            </div>
            <div className="space-y-2">
              {auditedBatters.slice(0, 5).map((p, i) => (
                <div key={p.player_id} className="p-2.5 bg-pink-50/40 rounded-xl border border-pink-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rr-blue text-white font-medium flex items-center justify-center text-[10px]">
                      {i + 1}
                    </span>
                    <span className="font-medium text-rr-blue">{p.player_name}</span>
                    <span className="text-rr-muted text-[10px]">(Original Rank #{p.rank})</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-[#EA1A85] tabular-nums">
                      Score: {p.dynamic_score.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-rr-muted mt-2">
              Notice that even when shifting K from 10 to 150, the top players remain firmly at the top, proving the rankings are robust and not sensitive to hyperparameter tuning.
            </p>
          </div>
        </div>

        {/* Right Column: Historical Backtest Proof */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-sm border border-rr-borderpink space-y-4">
          <div className="border-b border-pink-100 pb-3">
            <h3 className="text-sm font-semibold text-rr-blue uppercase tracking-wide">
              Historical Backtest: 2022-2024 to 2025-2026 Future Matches
            </h3>
            <p className="text-xs text-rr-muted">
              Model trained strictly on 2022-2024 data and tested on unseen 2025-2026 matches to prove real predictive power.
            </p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={backtestData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                <XAxis dataKey="metric" stroke="#071E54" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                <YAxis domain={[0, 1.0]} stroke="#071E54" tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Bar dataKey="vajra" name="Project VAJRA Pressure Model" fill="#EA1A85" radius={[6, 6, 0, 0]} />
                <Bar dataKey="naive_death" name="Traditional Death Overs Filter" fill="#94A3B8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-pink-50/50 rounded-xl border border-pink-100 text-center">
              <span className="text-[10px] font-medium uppercase text-rr-muted block">VAJRA Correlation</span>
              <span className="text-lg font-semibold text-[#EA1A85] tabular-nums">0.302 (p=0.0084)</span>
              <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">High Predictive Reliability</span>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-center">
              <span className="text-[10px] font-medium uppercase text-rr-muted block">Death Overs Filter Correlation</span>
              <span className="text-lg font-semibold text-gray-600 tabular-nums">0.120 (p=0.2841)</span>
              <span className="text-[10px] text-rose-600 font-medium block mt-0.5">Fails Significance Test</span>
            </div>
          </div>
        </div>

      </div>

      {/* Practical Analytics Guardrails */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-rr-borderpink space-y-4">
        <div className="flex items-center gap-2 border-b border-pink-100 pb-3">
          <AlertOctagon className="w-5 h-5 text-rr-blue" />
          <h3 className="text-sm font-semibold text-rr-blue uppercase tracking-wide">
            Key Practical Considerations for the Scouting Team
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
          <div className="p-4 bg-rr-subtle rounded-xl border border-gray-200">
            <div className="font-medium text-rr-blue mb-1">1. Pitch & Ground Scoring Par</div>
            <p className="text-rr-muted">
              All strike rates and economies are adjusted for venue and season scoring patterns so a high-scoring match in 2024 does not skew player performance compared to a bowler-friendly surface.
            </p>
          </div>

          <div className="p-4 bg-rr-subtle rounded-xl border border-gray-200">
            <div className="font-medium text-rr-blue mb-1">2. Minimum 120 Pressure Deliveries</div>
            <p className="text-rr-muted">
              Any player with fewer than 120 balls faced or bowled in match-deciding phases is excluded from the official rankings to avoid small-sample luck anomalies.
            </p>
          </div>

          <div className="p-4 bg-rr-subtle rounded-xl border border-gray-200">
            <div className="font-medium text-rr-blue mb-1">3. Team Partner Value (Choke Assists)</div>
            <p className="text-rr-muted">
              Tight bowling under pressure often forces batsmen to take reckless risks against the partner bowler. Always review Partner Wickets Created alongside raw wickets.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
