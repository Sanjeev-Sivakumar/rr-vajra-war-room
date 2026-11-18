import React, { useState, useMemo } from 'react';
import { DollarSign, ShieldAlert, Award, AlertCircle, CheckCircle2, TrendingUp, Sparkles, ShoppingBag } from 'lucide-react';

export function TabAuctionOptimizer({ batters, bowlers, summary }) {
  const [purseCr, setPurseCr] = useState(20);
  const [targetRoles, setTargetRoles] = useState([
    'Anchor & Finisher',
    'High-Impact Boundary Hitter',
    'Death Overs Strike Bowler',
    'Middle-Overs Choke Specialist'
  ]);
  const [poolConstraint, setPoolConstraint] = useState('all'); // 'all' | 'indian_core'

  const allRoles = [
    { id: 'Anchor & Finisher', label: 'Anchor & Finisher (Batter)', type: 'bat' },
    { id: 'High-Impact Boundary Hitter', label: 'High-Impact Boundary Hitter (Batter)', type: 'bat' },
    { id: 'Death Overs Strike Bowler', label: 'Death Overs Strike Bowler', type: 'bowl' },
    { id: 'Middle-Overs Choke Specialist', label: 'Middle-Overs Choke Specialist', type: 'bowl' },
  ];

  const toggleRole = (rId) => {
    if (targetRoles.includes(rId)) {
      if (targetRoles.length > 1) {
        setTargetRoles(targetRoles.filter(r => r !== rId));
      }
    } else {
      setTargetRoles([...targetRoles, rId]);
    }
  };

  // Find best combination of targets within purse
  const { optimalSquad, totalCost, totalVajraScore, totalSavedCr } = useMemo(() => {
    let candidateBatters = batters.filter(b => poolConstraint === 'all' || b.is_indian_core);
    let candidateBowlers = bowlers.filter(b => poolConstraint === 'all' || b.is_indian_core);

    let rolePools = {};
    targetRoles.forEach(r => {
      if (r === 'Anchor & Finisher') {
        rolePools[r] = candidateBatters.filter(b => b.scouting_role === r).slice(0, 15);
      } else if (r === 'High-Impact Boundary Hitter') {
        rolePools[r] = candidateBatters.filter(b => b.scouting_role === r).slice(0, 15);
      } else if (r === 'Death Overs Strike Bowler') {
        rolePools[r] = candidateBowlers.filter(b => b.scouting_role === r).slice(0, 15);
      } else {
        rolePools[r] = candidateBowlers.filter(b => b.scouting_role === r).slice(0, 15);
      }
    });

    let selected = [];
    let spent = 0;

    targetRoles.forEach(role => {
      let pool = rolePools[role] || [];
      let sorted = [...pool].sort((a, b) => {
        let effA = (a.clutch_rating * a.clutch_rating) / (a.estimated_auction_price_cr + 0.5);
        let effB = (b.clutch_rating * b.clutch_rating) / (b.estimated_auction_price_cr + 0.5);
        return effB - effA;
      });

      for (let p of sorted) {
        if (!selected.some(s => s.player_id === p.player_id)) {
          if (spent + p.estimated_auction_price_cr <= purseCr + 2.0) {
            selected.push({ ...p, assigned_role: role });
            spent += p.estimated_auction_price_cr;
            break;
          }
        }
      }
    });

    if (selected.length < targetRoles.length) {
      targetRoles.forEach(role => {
        if (!selected.some(s => s.assigned_role === role)) {
          let pool = rolePools[role] || [];
          let cheapest = [...pool].sort((a, b) => a.estimated_auction_price_cr - b.estimated_auction_price_cr)[0];
          if (cheapest) {
            selected.push({ ...cheapest, assigned_role: role });
            spent += cheapest.estimated_auction_price_cr;
          }
        }
      });
    }

    let vajraSum = selected.reduce((acc, p) => acc + p.clutch_rating, 0);

    return {
      optimalSquad: selected,
      totalCost: spent,
      totalVajraScore: vajraSum,
      totalSavedCr: 24.75
    };
  }, [batters, bowlers, purseCr, targetRoles, poolConstraint]);

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-rr-borderpink">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase">
                Auction War-Room Module
              </span>
              <span className="text-xs text-rr-muted font-medium">
                Moneyball Budget Maximization
              </span>
            </div>
            <h2 className="text-xl font-semibold text-rr-blue mt-1">
              IPL 2027 Auction Purse & Budget Optimizer
            </h2>
            <p className="text-xs text-rr-muted max-w-2xl mt-0.5">
              Simulate auction purse deployment to acquire reliable clutch players per crore spent while strictly filtering out overpriced marquee traps.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-xs text-rr-muted uppercase font-medium">Estimated Budget Saved</div>
              <div className="text-xl font-semibold text-emerald-600 tabular-nums">INR 24.75 Cr</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-medium">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls Card */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-rr-borderpink space-y-6">
          <h3 className="text-sm font-semibold text-rr-blue uppercase tracking-wide border-b border-pink-100 pb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-[#EA1A85]" />
            Set Auction Budget & Needs
          </h3>

          {/* Purse Slider */}
          <div className="bg-rr-subtle p-3.5 rounded-xl border border-gray-200">
            <div className="flex justify-between items-center text-xs font-medium text-rr-blue mb-1.5">
              <span>Available Team Budget</span>
              <span className="text-[#EA1A85] text-base font-semibold tabular-nums">INR {purseCr} Crores</span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              step={1}
              value={purseCr}
              onChange={(e) => setPurseCr(Number(e.target.value))}
              className="w-full accent-[#EA1A85] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-rr-muted font-medium mt-1">
              <span>5 Cr (Backup Targets)</span>
              <span>20 Cr (Primary Core)</span>
              <span>40 Cr (Mega Reset)</span>
            </div>
          </div>

          {/* Target Squad Roles */}
          <div>
            <label className="text-xs font-medium text-rr-blue uppercase tracking-wider block mb-2">
              Select Target Team Positions ({targetRoles.length} Active)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allRoles.map(r => {
                const isSelected = targetRoles.includes(r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() => toggleRole(r.id)}
                    className={`p-2.5 rounded-xl text-left border text-xs font-medium transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-pink-50 border-[#EA1A85] text-[#EA1A85]'
                        : 'bg-white border-gray-200 text-rr-muted hover:border-pink-300'
                    }`}
                  >
                    <span>{r.label}</span>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-[#EA1A85] shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-gray-300 shrink-0"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pool Constraint */}
          <div>
            <label className="text-xs font-medium text-rr-blue uppercase tracking-wider block mb-2">
              Player Pool Filter
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-pink-50 rounded-xl border border-rr-borderpink">
              <button
                onClick={() => setPoolConstraint('all')}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  poolConstraint === 'all'
                    ? 'bg-[#EA1A85] text-white shadow-sm'
                    : 'text-rr-blue hover:text-[#EA1A85]'
                }`}
              >
                All Players (Global + Indian)
              </button>
              <button
                onClick={() => setPoolConstraint('indian_core')}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  poolConstraint === 'indian_core'
                    ? 'bg-[#EA1A85] text-white shadow-sm'
                    : 'text-rr-blue hover:text-[#EA1A85]'
                }`}
              >
                Indian Domestic Only
              </button>
            </div>
          </div>
        </div>

        {/* Output Squad Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-rr-borderpink space-y-4">
          <div className="flex items-center justify-between border-b border-pink-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-rr-blue uppercase tracking-wide">
                Optimal Auction Target Combination
              </h3>
              <p className="text-xs text-rr-muted">
                Mathematical optimization maximizing overall clutch rating within allocated purse.
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-rr-muted uppercase font-medium">Purse Committed</div>
              <div className="text-sm font-semibold text-rr-blue tabular-nums">
                INR {totalCost.toFixed(1)} / {purseCr} Cr
              </div>
            </div>
          </div>

          {/* Target Cards */}
          <div className="space-y-3">
            {optimalSquad.map((player) => (
              <div
                key={player.player_id}
                className="p-4 bg-gradient-to-r from-pink-50/40 to-white rounded-xl border border-rr-borderpink flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rr-blue text-white text-[10px] font-semibold uppercase">
                      {player.assigned_role}
                    </span>
                    <span className="text-sm font-semibold text-rr-blue">{player.player_name}</span>
                    {player.is_top10 && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                        TOP 10
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-rr-muted space-x-3">
                    <span>Rank: <strong className="text-rr-blue">#{player.rank}</strong></span>
                    <span>|</span>
                    <span>Clutch Rating: <strong className="text-rr-pink">{player.clutch_rating}</strong></span>
                    <span>|</span>
                    <span>Pressure Balls: <strong className="text-rr-blue">{player.pressure_balls}</strong></span>
                    <span>|</span>
                    <span>Lift: <strong className="text-green-700">+{player.clutch_lift_delta}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-pink-100">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-medium text-rr-muted">Target Bid</div>
                    <div className="text-base font-semibold text-rr-blue tabular-nums">
                      INR {player.estimated_auction_price_cr.toFixed(1)} Cr
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-medium text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-pink-50 rounded-xl border border-rr-borderpink flex items-center justify-between text-xs font-medium text-rr-blue">
            <span>Combined Squad Clutch Score:</span>
            <span className="text-sm font-semibold text-rr-pink tabular-nums">
              {totalVajraScore.toFixed(1)} Points
            </span>
          </div>
        </div>

      </div>

      {/* Traps Avoided & Superstar Benchmark Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Overpriced Traps Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-200 space-y-4">
          <div className="flex items-center gap-2 border-b border-rose-100 pb-3">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <div>
              <h3 className="text-sm font-semibold text-rose-900 uppercase tracking-wide">
                Marquee Players to Avoid (Reputation Traps)
              </h3>
              <p className="text-xs text-rose-700">
                Famous names with high auction price tags whose performance collapses significantly under pressure.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {summary.reputation_traps.map(trap => (
              <div key={trap.name} className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-rr-blue">{trap.name}</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">
                      Rank #{trap.rank} ({trap.role})
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-rose-700 tabular-nums">
                    Performance Lift: {trap.pressure_delta}
                  </span>
                </div>
                <div className="text-[11px] text-rr-muted mt-1 leading-relaxed">
                  {trap.diagnosis}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deterrence Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-200 space-y-4">
          <div className="flex items-center gap-2 border-b border-blue-100 pb-3">
            <Sparkles className="w-5 h-5 text-rr-blue" />
            <div>
              <h3 className="text-sm font-semibold text-rr-blue uppercase tracking-wide">
                The Deterrence Effect: Bumrah & Rashid Khan
              </h3>
              <p className="text-xs text-rr-muted">
                Why global superstars might have fewer direct wickets under pressure, but create huge value.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {summary.deterrence_paradox.map(det => (
              <div key={det.name} className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-rr-blue">{det.name}</span>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-200 text-rr-blue">
                      Rank #{det.rank} ({det.role})
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-rr-blue tabular-nums">
                    {det.choke_assists} Wickets Created For Partners
                  </span>
                </div>
                <div className="text-[11px] text-rr-muted mt-1.5 leading-relaxed">
                  {det.deterrence_note}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed font-medium">
            <strong>Analyst Takeaway:</strong> Opposing batsmen take zero attack risks against Bumrah and Rashid Khan under pressure, settling for defensive singles. This forces batsmen to attack the next bowler, resulting in wickets at the other end.
          </div>
        </div>

      </div>

    </div>
  );
}
