import React, { useState, useMemo } from 'react';
import { RadialGauge } from './Common';
import { AlertTriangle, TrendingUp, ShieldAlert, Award, Zap, Crosshair, Users } from 'lucide-react';

export function TabCrisisSimulator({ batters, bowlers }) {
  const [scenario, setScenario] = useState('chase'); // 'chase' | 'collapse'
  const [oversRemaining, setOversRemaining] = useState(4);
  const [wicketsLost, setWicketsLost] = useState(5);
  const [rrrDeficit, setRrrDeficit] = useState(12.5);

  // Compute live Win Probability (WP) and Shannon Entropy Instability (Psi_d)
  const { wp, psi_d, leverage, entropy } = useMemo(() => {
    let p_win = 0.5;
    let balls_left = oversRemaining * 6;
    let w_in_hand = 10 - wicketsLost;

    if (scenario === 'chase') {
      let rrr_penalty = (rrrDeficit - 8.5) * 0.08;
      let w_bonus = (w_in_hand - 4) * 0.09;
      let late_overs_factor = (24 - balls_left) / 24 * 0.15;
      let raw_logit = 0.2 - rrr_penalty + w_bonus - (rrrDeficit > 12 ? late_overs_factor : 0);
      p_win = 1 / (1 + Math.exp(-raw_logit));
    } else {
      let collapse_rate = wicketsLost / Math.max(1, (20 - oversRemaining));
      let raw_logit = 0.5 - (collapse_rate * 0.8) + (w_in_hand * 0.07);
      p_win = 1 / (1 + Math.exp(-raw_logit));
    }

    p_win = Math.max(0.02, Math.min(0.98, p_win));

    let p1 = p_win;
    let p0 = 1 - p_win;
    let h_wp = -(p1 * Math.log2(p1) + p0 * Math.log2(p0));

    let delta_score = Math.abs(rrrDeficit - 9.0) / 10.0;
    let w_factor = (8 - wicketsLost) / 10.0;
    let l_d = Math.max(0.01, (1.0 / Math.max(6, balls_left)) * (1.0 + delta_score + Math.abs(w_factor)));

    let calculated_psi = h_wp * l_d * 1.25;

    return {
      wp: p_win,
      psi_d: calculated_psi,
      leverage: l_d,
      entropy: h_wp
    };
  }, [scenario, oversRemaining, wicketsLost, rrrDeficit]);

  // Rank top 3 batters for this situation
  const recommendedBatters = useMemo(() => {
    return [...batters]
      .sort((a, b) => {
        let scoreA = a.clutch_rating * 0.5 + a.partner_survival_pct * 0.3 - a.panic_shot_drift_pct * 1.5;
        let scoreB = b.clutch_rating * 0.5 + b.partner_survival_pct * 0.3 - b.panic_shot_drift_pct * 1.5;
        return scoreB - scoreA;
      })
      .slice(0, 3);
  }, [batters, psi_d, wicketsLost]);

  // Rank top 3 bowlers for this situation
  const recommendedBowlers = useMemo(() => {
    return [...bowlers]
      .sort((a, b) => {
        let scoreA = a.clutch_rating * 0.5 + a.line_and_length_discipline_score * 0.3 + a.partner_wickets_created * 0.5;
        let scoreB = b.clutch_rating * 0.5 + b.line_and_length_discipline_score * 0.3 + b.partner_wickets_created * 0.5;
        return scoreB - scoreA;
      })
      .slice(0, 3);
  }, [bowlers, psi_d, rrrDeficit]);

  const isPeakPressure = psi_d >= 0.1371;

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-rr-borderpink text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-rr-darkpink text-xs font-medium">
                Match Situation Tool
              </span>
              <span className="text-xs text-rr-muted font-medium">
                Live win probability and recommendations
              </span>
            </div>
            <h2 className="text-xl font-semibold text-rr-blue mt-1">
              Match Situation & Tactical Crisis Simulator
            </h2>
            <p className="text-xs text-rr-muted max-w-2xl mt-0.5 leading-relaxed">
              Adjust the match sliders below to simulate any match scenario (such as a 1st innings batting collapse or a tight 2nd innings chase) and see the best reliable players to deploy.
            </p>
          </div>

          <div className={`px-4 py-3 rounded-xl border flex items-center justify-center gap-3 shrink-0 ${
            isPeakPressure
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <AlertTriangle className={`w-5 h-5 ${isPeakPressure ? 'text-rose-600' : 'text-emerald-600'}`} />
            <div className="text-left">
              <div className="text-xs font-medium">
                {isPeakPressure ? 'Critical Match Pressure (Top 20%)' : 'Standard Match Pressure'}
              </div>
              <div className="text-[11px] opacity-80">
                Pressure Level: {psi_d.toFixed(4)} (Threshold: 0.1371)
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Sliders */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-rr-borderpink space-y-6">
          <div className="text-center pb-3 border-b border-pink-100">
            <h3 className="text-sm font-medium text-rr-blue flex items-center justify-center gap-2">
              <Crosshair className="w-4 h-4 text-[#EA1A85]" />
              Set Current Match State
            </h3>
            <p className="text-xs text-rr-muted mt-0.5">Customize innings, overs, wickets, and run rate</p>
          </div>

          {/* Scenario Toggle */}
          <div>
            <label className="text-xs font-medium text-rr-blue block mb-2 text-center">
              Match Situation Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-pink-50 rounded-xl border border-rr-borderpink">
              <button
                onClick={() => setScenario('chase')}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  scenario === 'chase'
                    ? 'bg-[#EA1A85] text-white shadow-sm'
                    : 'text-rr-blue hover:text-[#EA1A85]'
                }`}
              >
                2nd Innings Target Chase
              </button>
              <button
                onClick={() => setScenario('collapse')}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  scenario === 'collapse'
                    ? 'bg-[#EA1A85] text-white shadow-sm'
                    : 'text-rr-blue hover:text-[#EA1A85]'
                }`}
              >
                1st Innings Batting Collapse
              </button>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4">
            
            {/* Overs Remaining */}
            <div className="bg-rr-subtle p-3 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center text-xs font-medium text-rr-blue mb-1.5">
                <span>Overs Left in Innings</span>
                <span className="text-[#EA1A85] text-sm font-medium tabular-nums">{oversRemaining} Overs ({oversRemaining * 6} Balls)</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={oversRemaining}
                onChange={(e) => setOversRemaining(Number(e.target.value))}
                className="w-full accent-[#EA1A85] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-rr-muted font-medium mt-1">
                <span>1 Over (Final Over)</span>
                <span>5 Overs</span>
                <span>10 Overs (Halfway)</span>
              </div>
            </div>

            {/* Wickets Down */}
            <div className="bg-rr-subtle p-3 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center text-xs font-medium text-rr-blue mb-1.5">
                <span>Wickets Lost (Down)</span>
                <span className="text-[#EA1A85] text-sm font-medium tabular-nums">{wicketsLost} Wickets Lost ({10 - wicketsLost} in Hand)</span>
              </div>
              <input
                type="range"
                min={0}
                max={8}
                step={1}
                value={wicketsLost}
                onChange={(e) => setWicketsLost(Number(e.target.value))}
                className="w-full accent-[#EA1A85] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-rr-muted font-medium mt-1">
                <span>0 Wickets (Solid)</span>
                <span>4 Wickets Down</span>
                <span>8 Wickets (Tail Exposed)</span>
              </div>
            </div>

            {/* Required Run Rate */}
            <div className="bg-rr-subtle p-3 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center text-xs font-medium text-rr-blue mb-1.5">
                <span>{scenario === 'chase' ? 'Required Run Rate (RRR)' : 'Par Score Deficit'}</span>
                <span className="text-[#EA1A85] text-sm font-medium tabular-nums">{rrrDeficit.toFixed(1)} Runs/Over</span>
              </div>
              <input
                type="range"
                min={6.0}
                max={16.0}
                step={0.5}
                value={rrrDeficit}
                onChange={(e) => setRrrDeficit(Number(e.target.value))}
                className="w-full accent-[#EA1A85] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-rr-muted font-medium mt-1">
                <span>6.0 rpo (Comfortable)</span>
                <span>11.0 rpo (Par)</span>
                <span>16.0 rpo (Superhuman)</span>
              </div>
            </div>

          </div>

          <div className="p-3 bg-pink-50/60 rounded-xl border border-pink-100 text-xs text-rr-muted text-center leading-relaxed">
            <strong>Analyst Note:</strong> High required run rates combined with few remaining wickets drive up match leverage. Under these conditions, players with low panic shot rates and high partner survival rates outperform pure power hitters.
          </div>
        </div>

        {/* Right Column: Gauges & Tactical Recommendations */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Centered Gauges Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-rr-borderpink text-center">
            <h3 className="text-base font-medium text-rr-blue mb-1">
              Predicted Match State & Win Probability
            </h3>
            <p className="text-xs text-rr-muted mb-4">
              Real-time calculation based on match state inputs
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="bg-rr-subtle rounded-xl p-4 border border-gray-100 flex flex-col items-center justify-center text-center">
                <RadialGauge
                  value={psi_d}
                  max={0.25}
                  label="Pressure Index"
                  subtext={isPeakPressure ? "High-Leverage Match Situation" : "Standard Match Situation"}
                />
              </div>
              <div className="bg-rr-subtle rounded-xl p-4 border border-gray-100 flex flex-col items-center justify-center text-center">
                <RadialGauge
                  value={wp}
                  max={1.0}
                  label="Batting Win Probability"
                  subtext={wp > 0.5 ? "Batting Team in Advantage" : "Bowling Team in Advantage"}
                />
              </div>
            </div>
          </div>

          {/* Dynamic Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Top 3 Batters */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-rr-borderpink space-y-3">
              <div className="flex items-center justify-between border-b border-pink-100 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-rr-blue">
                  <Award className="w-4 h-4 text-[#EA1A85]" />
                  Recommended Batters to Deploy
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-pink-100 text-rr-darkpink">
                  Zero Panic Rate
                </span>
              </div>
              <div className="space-y-2.5">
                {recommendedBatters.map((b, i) => (
                  <div key={b.player_id} className="p-3 bg-rr-subtle hover:bg-pink-50/50 rounded-xl border border-gray-200 transition-all flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#EA1A85] text-white text-[11px] font-medium flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-xs font-medium text-rr-blue">{b.player_name}</span>
                      </div>
                      <div className="text-[11px] text-rr-muted mt-1 space-x-2">
                        <span>Pressure SR: <strong className="text-rr-blue">{b.pressure_strike_rate}</strong></span>
                        <span>|</span>
                        <span>Partner Surv: <strong className="text-rr-blue">{b.partner_survival_pct}%</strong></span>
                        <span>|</span>
                        <span>Panic Drift: <strong className={b.panic_shot_drift_pct <= 0 ? 'text-green-700' : 'text-rose-600'}>{b.panic_shot_drift_pct}%</strong></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-rr-blue tabular-nums">{b.clutch_rating}</div>
                      <div className="text-[10px] text-rr-muted font-medium">Clutch Rating</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 3 Bowlers */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-rr-borderpink space-y-3">
              <div className="flex items-center justify-between border-b border-pink-100 pb-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-rr-blue">
                  <Zap className="w-4 h-4 text-[#EA1A85]" />
                  Recommended Bowlers to Deploy
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-100 text-rr-blue">
                  Runs Choke Defense
                </span>
              </div>
              <div className="space-y-2.5">
                {recommendedBowlers.map((b, i) => (
                  <div key={b.player_id} className="p-3 bg-rr-subtle hover:bg-pink-50/50 rounded-xl border border-gray-200 transition-all flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-rr-blue text-white text-[11px] font-medium flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-xs font-medium text-rr-blue">{b.player_name}</span>
                      </div>
                      <div className="text-[11px] text-rr-muted mt-1 space-x-2">
                        <span>Pressure Econ: <strong className="text-rr-blue">{b.pressure_economy}</strong></span>
                        <span>|</span>
                        <span>Discipline: <strong className="text-green-700">+{b.line_and_length_discipline_score}</strong></span>
                        <span>|</span>
                        <span>Partner Wickets: <strong className="text-rr-blue">{b.partner_wickets_created}</strong></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-rr-blue tabular-nums">{b.clutch_rating}</div>
                      <div className="text-[10px] text-rr-muted font-medium">Clutch Rating</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
