import React, { useState, useMemo } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { Scale, Users, AlertCircle, TrendingDown, CheckCircle2 } from 'lucide-react';

export function TabHeadToHead({ batters, bowlers }) {
  const [playerType, setPlayerType] = useState('batters'); // 'batters' | 'bowlers'
  const [selectedNames, setSelectedNames] = useState(['Rahul Tripathi', 'Suryakumar Yadav', 'Shivam Dube']);

  const handleTypeChange = (newType) => {
    setPlayerType(newType);
    if (newType === 'batters') {
      setSelectedNames(['Rahul Tripathi', 'Suryakumar Yadav', 'Shivam Dube']);
    } else {
      setSelectedNames(['Eshan Malinga', 'Umran Malik', 'Mitchell Starc']);
    }
  };

  const pool = playerType === 'batters' ? batters : bowlers;

  const togglePlayer = (name) => {
    if (selectedNames.includes(name)) {
      if (selectedNames.length > 1) {
        setSelectedNames(selectedNames.filter(n => n !== name));
      }
    } else {
      if (selectedNames.length < 4) {
        setSelectedNames([...selectedNames, name]);
      }
    }
  };

  const selectedPlayers = useMemo(() => {
    return selectedNames
      .map(name => pool.find(p => p.player_name === name))
      .filter(Boolean);
  }, [pool, selectedNames]);

  // Construct 5-Axis normalized Radar Data (0 - 100 scale)
  const radarData = useMemo(() => {
    const axes = [
      { key: 'peak_va', label: 'Pressure Run Rate' },
      { key: 'delta', label: 'Clutch Lift' },
      { key: 'composure', label: 'Shot Selection Composure' },
      { key: 'team_impact', label: playerType === 'batters' ? 'Partner Survival' : 'Wickets Created' },
      { key: 'consistency', label: 'Match Consistency' },
    ];

    return axes.map(axis => {
      let row = { axis: axis.label };
      selectedPlayers.forEach((p) => {
        let val = 50;
        if (axis.key === 'peak_va') {
          val = Math.max(0, Math.min(100, ((p.pressure_runs_added_per_100 || p.pressure_runs_saved_per_100 || 0) + 20) / 45 * 100));
        } else if (axis.key === 'delta') {
          val = Math.max(0, Math.min(100, ((p.clutch_lift_delta + 50) / 80) * 100));
        } else if (axis.key === 'composure') {
          if (playerType === 'batters') {
            val = Math.max(0, Math.min(100, 100 - ((p.panic_shot_drift_pct + 15) / 35) * 100));
          } else {
            val = Math.max(0, Math.min(100, ((p.line_and_length_discipline_score + 15) / 35) * 100));
          }
        } else if (axis.key === 'team_impact') {
          if (playerType === 'batters') {
            val = Math.max(0, Math.min(100, ((p.partner_survival_pct - 60) / 40) * 100));
          } else {
            val = Math.max(0, Math.min(100, (p.partner_wickets_created / 55) * 100));
          }
        } else if (axis.key === 'consistency') {
          val = Math.max(0, Math.min(100, 100 - (p.match_to_match_variance * 1.5)));
        }
        row[p.player_name] = Math.round(val);
      });
      return row;
    });
  }, [selectedPlayers, playerType]);

  const colors = ['#EA1A85', '#071E54', '#D4AF37', '#10B981'];

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-rr-borderpink">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-rr-darkpink text-xs font-semibold uppercase">
                Direct Scouting Comparison
              </span>
              <span className="text-xs text-rr-muted font-medium">
                Head-to-Head 5-Metric Analysis
              </span>
            </div>
            <h2 className="text-xl font-semibold text-rr-blue mt-1">
              Player Comparison Tool & Reputation Check
            </h2>
            <p className="text-xs text-rr-muted max-w-2xl mt-0.5">
              Select multiple players to directly compare their strike rates, economy, partner impact, and pressure degradation.
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-pink-50 p-1 border border-rr-borderpink shrink-0">
            <button
              onClick={() => handleTypeChange('batters')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                playerType === 'batters'
                  ? 'bg-[#EA1A85] text-white shadow-sm'
                  : 'text-rr-blue hover:text-[#EA1A85]'
              }`}
            >
              Compare Batters
            </button>
            <button
              onClick={() => handleTypeChange('bowlers')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                playerType === 'bowlers'
                  ? 'bg-[#EA1A85] text-white shadow-sm'
                  : 'text-rr-blue hover:text-[#EA1A85]'
              }`}
            >
              Compare Bowlers
            </button>
          </div>
        </div>
      </div>

      {/* Player Selector Buttons */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-rr-borderpink">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium uppercase text-rr-blue tracking-wide">
            Select 2 to 4 Players to Compare:
          </span>
          <span className="text-xs text-rr-muted font-semibold">
            Comparing {selectedPlayers.length} / 4 Players Selected
          </span>
        </div>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
          {pool.slice(0, 35).map(p => {
            const isSelected = selectedNames.includes(p.player_name);
            return (
              <button
                key={p.player_id}
                onClick={() => togglePlayer(p.player_name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                  isSelected
                    ? 'bg-[#EA1A85] text-white border-[#EA1A85] shadow-xs'
                    : 'bg-white text-rr-blue border-gray-200 hover:border-pink-300'
                }`}
              >
                #{p.rank} {p.player_name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radar Chart */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-sm border border-rr-borderpink flex flex-col items-center">
          <h3 className="text-sm font-semibold text-rr-blue uppercase tracking-wide self-start mb-1">
            5-Metric Radar Visualizer
          </h3>
          <p className="text-xs text-rr-muted self-start mb-4">
            Normalized scales (0 to 100). Larger shapes indicate stronger all-round clutch performance.
          </p>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#FCE4EC" />
                <PolarAngleAxis dataKey="axis" stroke="#071E54" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#F5B8D8" tick={{ fontSize: 9 }} />
                {selectedPlayers.map((p, idx) => (
                  <Radar
                    key={p.player_name}
                    name={p.player_name}
                    dataKey={p.player_name}
                    stroke={colors[idx % colors.length]}
                    fill={colors[idx % colors.length]}
                    fillOpacity={0.25}
                    strokeWidth={2.5}
                  />
                ))}
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontWeight: 'bold' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metric Comparison Table */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 shadow-sm border border-rr-borderpink space-y-4">
          <h3 className="text-sm font-semibold text-rr-blue uppercase tracking-wide border-b border-pink-100 pb-3">
            Metric by Metric Comparison
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-pink-100 bg-pink-50/50 text-[11px] font-medium text-rr-blue uppercase">
                  <th className="py-2.5 px-3">Performance Dimension</th>
                  {selectedPlayers.map((p, idx) => (
                    <th key={p.player_name} className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }}></span>
                        <span>{p.player_name.split(' ')[0]}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-rr-muted">Overall Rank</td>
                  {selectedPlayers.map(p => (
                    <td key={p.player_name} className="py-2.5 px-3 text-right font-semibold tabular-nums">
                      #{p.rank}
                    </td>
                  ))}
                </tr>
                <tr className="bg-pink-50/30">
                  <td className="py-2.5 px-3 font-medium text-rr-blue">Clutch Rating</td>
                  {selectedPlayers.map(p => (
                    <td key={p.player_name} className="py-2.5 px-3 text-right font-semibold text-[#EA1A85] tabular-nums">
                      {p.clutch_rating}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-rr-muted">Pressure Balls Faced/Bowled</td>
                  {selectedPlayers.map(p => (
                    <td key={p.player_name} className="py-2.5 px-3 text-right tabular-nums">
                      {p.pressure_balls}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-rr-muted">
                    {playerType === 'batters' ? 'Strike Rate Under Pressure' : 'Economy Under Pressure'}
                  </td>
                  {selectedPlayers.map(p => (
                    <td key={p.player_name} className="py-2.5 px-3 text-right font-medium tabular-nums text-rr-blue">
                      {playerType === 'batters' ? p.pressure_strike_rate : p.pressure_economy}
                    </td>
                  ))}
                </tr>
                <tr className="bg-pink-50/30">
                  <td className="py-2.5 px-3 font-medium text-rr-blue">Clutch Lift Delta</td>
                  {selectedPlayers.map(p => (
                    <td key={p.player_name} className="py-2.5 px-3 text-right font-semibold tabular-nums">
                      <span className={p.clutch_lift_delta >= 0 ? 'text-green-700' : 'text-rose-600'}>
                        {p.clutch_lift_delta >= 0 ? `+${p.clutch_lift_delta}` : p.clutch_lift_delta}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-rr-muted">
                    {playerType === 'batters' ? 'Panic Shot Drift %' : 'Bowling Discipline Score'}
                  </td>
                  {selectedPlayers.map(p => (
                    <td key={p.player_name} className="py-2.5 px-3 text-right font-medium tabular-nums">
                      {playerType === 'batters' ? (
                        <span className={p.panic_shot_drift_pct <= 0 ? 'text-green-700' : 'text-rose-600'}>
                          {p.panic_shot_drift_pct > 0 ? `+${p.panic_shot_drift_pct}%` : `${p.panic_shot_drift_pct}%`}
                        </span>
                      ) : (
                        <span className={p.line_and_length_discipline_score >= 0 ? 'text-green-700' : 'text-rose-600'}>
                          {p.line_and_length_discipline_score >= 0 ? `+${p.line_and_length_discipline_score}` : p.line_and_length_discipline_score}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-rr-muted">
                    {playerType === 'batters' ? 'Partner Survival Rate' : 'Wickets Created for Partner'}
                  </td>
                  {selectedPlayers.map(p => (
                    <td key={p.player_name} className="py-2.5 px-3 text-right font-medium tabular-nums text-rr-blue">
                      {playerType === 'batters' ? `${p.partner_survival_pct}%` : `${p.partner_wickets_created} Wkts`}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-pink-50 rounded-xl border border-rr-borderpink text-xs text-rr-muted leading-relaxed">
            <strong>Scouting Finding:</strong> High-reputation names often hold strong overall averages, but when comparing <strong>Clutch Lift Delta</strong>, specialized clutch performers show positive lift whereas marquee players with high panic rates drop sharply.
          </div>
        </div>

      </div>

    </div>
  );
}
