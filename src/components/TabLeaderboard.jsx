import React, { useState, useMemo } from 'react';
import { Search, Download, ArrowUpDown, ArrowUp, ArrowDown, Shield, Flame, Activity, Award, UserCheck, HelpCircle, FileSpreadsheet, ExternalLink } from 'lucide-react';

export function TabLeaderboard({ batters, bowlers }) {
  const [playerType, setPlayerType] = useState('batters'); // 'batters' | 'bowlers'
  const [viewMode, setViewMode] = useState('top50'); // 'top50' | 'top10' | 'indian_core' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [minPeakBalls, setMinPeakBalls] = useState(120);
  const [minPressureDelta, setMinPressureDelta] = useState(-50);
  const [sortField, setSortField] = useState('rank');
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedPlayerModal, setSelectedPlayerModal] = useState(null);

  const rawData = playerType === 'batters' ? batters : bowlers;

  const filteredData = useMemo(() => {
    let result = rawData.filter(p => {
      if (searchQuery.trim() && !p.player_name.toLowerCase().includes(searchQuery.toLowerCase().trim())) {
        return false;
      }
      if (p.pressure_balls < minPeakBalls) return false;
      if (p.clutch_lift_delta < minPressureDelta) return false;

      if (viewMode === 'top10') {
        return p.rank <= 10;
      } else if (viewMode === 'indian_core') {
        return p.is_indian_core && p.rank >= 11 && p.rank <= 35;
      } else if (viewMode === 'top50') {
        return p.rank <= 50;
      }
      return true; // 'all'
    });

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [rawData, searchQuery, minPeakBalls, minPressureDelta, viewMode, sortField, sortAsc]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(field === 'rank');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-gray-300 opacity-60 group-hover:opacity-100" />;
    }
    return sortAsc ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#EA1A85]" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#EA1A85]" />
    );
  };

  // Export full raw CSV with all analytical columns
  const exportFullCSV = () => {
    if (!filteredData.length) return;
    const headers = Object.keys(filteredData[0]).join(',');
    const rows = filteredData.map(obj => Object.values(obj).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rajasthan_royals_${playerType}_full_dataset_${viewMode}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Analytics Explanatory Banner */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-rr-borderpink text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-rr-darkpink text-xs font-medium">
                Analytics Team Guide
              </span>
              <span className="text-xs text-rr-muted font-medium">
                How to read these metrics
              </span>
            </div>
            <h2 className="text-xl font-semibold text-rr-blue mt-1">
              {playerType === 'batters' ? 'Batting Performance Under Pressure' : 'Bowling Performance Under Pressure'}
            </h2>
            <p className="text-xs text-rr-muted max-w-3xl mt-0.5 leading-relaxed">
              <strong>Clutch Rating</strong> evaluates how much a player's performance improves or collapses when the match is on the line compared to standard situations. 
              <strong> Clutch Lift</strong> measures whether the player scores faster or bowls tighter (+ positive) or drops in efficiency (- negative) under pressure.
            </p>
          </div>

          <button
            onClick={exportFullCSV}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EA1A85] hover:bg-[#C5116D] text-white rounded-xl text-xs font-medium shadow-sm transition-all shrink-0"
          >
            <Download className="w-4 h-4 text-white" />
            Download Full CSV ({filteredData.length} Players)
          </button>
        </div>
      </div>

      {/* Control Panel: Toggles, Filters & Search */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-rr-borderpink space-y-4">
        
        {/* Row 1: Batters vs Bowlers Toggle & View Mode Filters */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Batters vs Bowlers Toggle */}
          <div className="inline-flex rounded-xl bg-pink-50 p-1 border border-rr-borderpink shrink-0">
            <button
              onClick={() => { setPlayerType('batters'); setSortField('rank'); setSortAsc(true); }}
              className={`px-5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                playerType === 'batters'
                  ? 'bg-[#EA1A85] text-white shadow-sm'
                  : 'text-rr-blue hover:text-[#EA1A85]'
              }`}
            >
              Batters Dataset ({batters.length} Qualified)
            </button>
            <button
              onClick={() => { setPlayerType('bowlers'); setSortField('rank'); setSortAsc(true); }}
              className={`px-5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                playerType === 'bowlers'
                  ? 'bg-[#EA1A85] text-white shadow-sm'
                  : 'text-rr-blue hover:text-[#EA1A85]'
              }`}
            >
              Bowlers Dataset ({bowlers.length} Qualified)
            </button>
          </div>

          {/* Quick Pool View Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'top50', label: 'Top 50 War-Room Pool' },
              { id: 'top10', label: 'Official Top 10 Submission' },
              { id: 'indian_core', label: 'Indian Core Targets (Ranks 11-35)' },
              { id: 'all', label: 'All Qualified (120+ Balls)' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setViewMode(m.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  viewMode === m.id
                    ? 'bg-pink-100 border-[#EA1A85] text-[#EA1A85] font-medium shadow-xs'
                    : 'bg-white border-gray-200 text-rr-muted hover:border-pink-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

        </div>

        {/* Row 2: Search Input and Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-pink-100 items-center">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-rr-muted absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search player name (e.g. Tripathi, Bumrah, Klaasen)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-rr-subtle border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#EA1A85]"
            />
          </div>

          {/* Pressure Deliveries Filter */}
          <div className="bg-rr-subtle p-2.5 rounded-xl border border-gray-200">
            <div className="flex justify-between text-xs font-medium text-rr-blue mb-1">
              <span>Min Pressure Balls Faced/Bowled:</span>
              <span className="font-medium text-[#EA1A85] tabular-nums">{minPeakBalls} Balls</span>
            </div>
            <input
              type="range"
              min={120}
              max={300}
              step={10}
              value={minPeakBalls}
              onChange={(e) => setMinPeakBalls(Number(e.target.value))}
              className="w-full accent-[#EA1A85] cursor-pointer"
            />
          </div>

          {/* Clutch Lift Filter */}
          <div className="bg-rr-subtle p-2.5 rounded-xl border border-gray-200">
            <div className="flex justify-between text-xs font-medium text-rr-blue mb-1">
              <span>Min Clutch Lift Delta:</span>
              <span className="font-medium text-[#EA1A85] tabular-nums">{minPressureDelta}</span>
            </div>
            <input
              type="range"
              min={-55}
              max={25}
              step={5}
              value={minPressureDelta}
              onChange={(e) => setMinPressureDelta(Number(e.target.value))}
              className="w-full accent-[#EA1A85] cursor-pointer"
            />
          </div>

        </div>

      </div>

      {/* Main Enterprise-Grade Data Table */}
      <div className="bg-white rounded-2xl shadow-md border border-rr-borderpink overflow-hidden">
        
        {/* Table Header Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-pink-50/50 via-white to-pink-50/30 border-b border-pink-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <h3 className="text-base font-medium text-rr-blue flex items-center justify-center sm:justify-start gap-2">
              <FileSpreadsheet className="w-4 h-4 text-[#EA1A85]" />
              {playerType === 'batters' ? 'Batting Performance Metrics' : 'Bowling Performance Metrics'}
            </h3>
            <p className="text-xs text-rr-muted mt-0.5">
              Displaying {filteredData.length} players. Click any column header to sort.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 font-medium text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Official Top 10 Submission
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-900 border border-sky-300 font-medium text-[11px]">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              Indian Domestic Core
            </span>
          </div>
        </div>

        {/* Scrollable Container with Subtle Visual Elevation */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#FAF2F7] border-b-2 border-pink-200/80 text-rr-blue text-[11px] font-medium tracking-wide select-none">
                {/* Rank */}
                <th 
                  onClick={() => handleSort('rank')} 
                  className="py-3 px-3 w-16 text-center cursor-pointer hover:bg-pink-100/60 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Rank</span>
                    {getSortIcon('rank')}
                  </div>
                </th>

                {/* Player Name */}
                <th 
                  onClick={() => handleSort('player_name')} 
                  className="py-3 px-4 min-w-[210px] cursor-pointer hover:bg-pink-100/60 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Player Name</span>
                    {getSortIcon('player_name')}
                  </div>
                </th>

                {/* Clutch Rating */}
                <th 
                  onClick={() => handleSort('clutch_rating')} 
                  className="py-3 px-3 text-center cursor-pointer hover:bg-pink-100/60 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Clutch Rating</span>
                    {getSortIcon('clutch_rating')}
                  </div>
                </th>

                {/* Pressure Balls */}
                <th 
                  onClick={() => handleSort('pressure_balls')} 
                  className="py-3 px-3 text-center cursor-pointer hover:bg-pink-100/60 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Pressure Balls</span>
                    {getSortIcon('pressure_balls')}
                  </div>
                </th>

                {/* Pressure SR / Econ */}
                <th 
                  onClick={() => handleSort(playerType === 'batters' ? 'pressure_strike_rate' : 'pressure_economy')} 
                  className="py-3 px-3 text-center cursor-pointer hover:bg-pink-100/60 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>{playerType === 'batters' ? 'Pressure SR' : 'Pressure Econ'}</span>
                    {getSortIcon(playerType === 'batters' ? 'pressure_strike_rate' : 'pressure_economy')}
                  </div>
                </th>

                {/* Normal SR / Econ */}
                <th 
                  onClick={() => handleSort(playerType === 'batters' ? 'normal_strike_rate' : 'normal_economy')} 
                  className="py-3 px-3 text-center cursor-pointer hover:bg-pink-100/60 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>{playerType === 'batters' ? 'Normal SR' : 'Normal Econ'}</span>
                    {getSortIcon(playerType === 'batters' ? 'normal_strike_rate' : 'normal_economy')}
                  </div>
                </th>

                {/* Clutch Lift */}
                <th 
                  onClick={() => handleSort('clutch_lift_delta')} 
                  className="py-3 px-3 text-center cursor-pointer hover:bg-pink-100/60 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Clutch Lift</span>
                    {getSortIcon('clutch_lift_delta')}
                  </div>
                </th>

                {/* Panic Drift / Discipline */}
                <th 
                  onClick={() => handleSort(playerType === 'batters' ? 'panic_shot_drift_pct' : 'line_and_length_discipline_score')} 
                  className="py-3 px-3 text-center cursor-pointer hover:bg-pink-100/60 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>{playerType === 'batters' ? 'Panic Shot Drift' : 'Bowling Discipline'}</span>
                    {getSortIcon(playerType === 'batters' ? 'panic_shot_drift_pct' : 'line_and_length_discipline_score')}
                  </div>
                </th>

                {/* Partner Survival / Wickets */}
                <th 
                  onClick={() => handleSort(playerType === 'batters' ? 'partner_survival_pct' : 'partner_wickets_created')} 
                  className="py-3 px-3 text-center cursor-pointer hover:bg-pink-100/60 transition-colors group"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>{playerType === 'batters' ? 'Partner Survival' : 'Partner Wickets'}</span>
                    {getSortIcon(playerType === 'batters' ? 'partner_survival_pct' : 'partner_wickets_created')}
                  </div>
                </th>

                {/* Action Profile */}
                <th className="py-3 px-3 text-center w-20">
                  Profile
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-pink-100/70 text-xs font-medium">
              {filteredData.map((p, idx) => {
                const isTop10 = p.rank <= 10;
                const isIndianCore = p.is_indian_core && p.rank >= 11 && p.rank <= 35;
                const isPreviousTop10Border = idx > 0 && filteredData[idx - 1].rank <= 10 && p.rank > 10;

                return (
                  <React.Fragment key={p.player_id}>
                    {/* Visual Separator after Top 10 */}
                    {isPreviousTop10Border && (
                      <tr className="bg-gradient-to-r from-pink-100/80 via-purple-50 to-pink-100/80 border-y-2 border-dashed border-[#EA1A85]/40">
                        <td colSpan={10} className="py-2.5 px-4 text-center">
                          <span className="text-[11px] font-medium text-rr-darkpink tracking-wide">
                            Official Top 10 Submission Cutoff Above | Extended Scouting Pool Below
                          </span>
                        </td>
                      </tr>
                    )}

                    <tr className={`hover:bg-pink-50/50 transition-colors group ${
                      isTop10 
                        ? 'bg-amber-50/20' 
                        : isIndianCore 
                        ? 'bg-sky-50/20' 
                        : idx % 2 === 0 ? 'bg-white' : 'bg-[#FDF9FB]'
                    }`}>
                      
                      {/* Rank Badge */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-semibold tabular-nums shadow-2xs ${
                          isTop10
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                            : 'bg-gray-100 text-rr-blue border border-gray-200'
                        }`}>
                          {p.rank}
                        </span>
                      </td>

                      {/* Player Name & Tag */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 flex-nowrap">
                          <span className="text-sm font-semibold text-rr-blue whitespace-nowrap leading-tight">
                            {p.player_name}
                          </span>
                          {isTop10 && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#EA1A85] text-white shrink-0 shadow-2xs">
                              Top 10
                            </span>
                          )}
                          {isIndianCore && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 shrink-0">
                              Core
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-rr-muted font-normal mt-0.5 leading-snug">
                          {p.scouting_role} · <span className="font-semibold text-emerald-700">INR {p.estimated_auction_price_cr} Cr</span>
                        </div>
                      </td>

                      {/* Clutch Rating Badge */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-semibold tabular-nums shadow-2xs ${
                          p.clutch_rating >= 70
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : p.clutch_rating >= 60
                            ? 'bg-pink-100 text-rr-darkpink border border-pink-300'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {p.clutch_rating.toFixed(2)}
                        </span>
                      </td>

                      {/* Pressure Balls */}
                      <td className="py-3 px-3 text-center tabular-nums text-rr-muted">
                        <div className="font-medium text-rr-blue">{p.pressure_balls}</div>
                        <div className="text-[10px] text-rr-muted">
                          {Math.round((p.pressure_balls / p.total_balls) * 100)}% of total
                        </div>
                      </td>

                      {/* Pressure SR / Econ */}
                      <td className="py-3 px-3 text-center tabular-nums font-medium text-sm text-rr-blue">
                        {playerType === 'batters' ? p.pressure_strike_rate.toFixed(1) : p.pressure_economy.toFixed(2)}
                      </td>

                      {/* Normal SR / Econ */}
                      <td className="py-3 px-3 text-center tabular-nums text-xs text-rr-muted">
                        {playerType === 'batters' ? p.normal_strike_rate.toFixed(1) : p.normal_economy.toFixed(2)}
                      </td>

                      {/* Clutch Lift */}
                      <td className="py-3 px-3 text-center tabular-nums">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                          p.clutch_lift_delta >= 10
                            ? 'bg-emerald-100 text-emerald-900 font-semibold border border-emerald-200'
                            : p.clutch_lift_delta >= 0
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : p.clutch_lift_delta >= -20
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-900 font-semibold border border-rose-300'
                        }`}>
                          {p.clutch_lift_delta >= 0 ? `+${p.clutch_lift_delta.toFixed(2)}` : p.clutch_lift_delta.toFixed(2)}
                        </span>
                      </td>

                      {/* Panic Drift / Discipline */}
                      <td className="py-3 px-3 text-center tabular-nums font-semibold">
                        {playerType === 'batters' ? (
                          <span className={p.panic_shot_drift_pct <= 0 ? 'text-green-700 font-medium' : 'text-rose-600 font-medium'}>
                            {p.panic_shot_drift_pct > 0 ? `+${p.panic_shot_drift_pct.toFixed(1)}%` : `${p.panic_shot_drift_pct.toFixed(1)}%`}
                          </span>
                        ) : (
                          <span className={p.line_and_length_discipline_score >= 0 ? 'text-green-700 font-medium' : 'text-rose-600 font-medium'}>
                            {p.line_and_length_discipline_score >= 0 ? `+${p.line_and_length_discipline_score.toFixed(1)}` : p.line_and_length_discipline_score.toFixed(1)}
                          </span>
                        )}
                      </td>

                      {/* Partner Survival / Wickets Created */}
                      <td className="py-3 px-3 text-center tabular-nums font-medium text-rr-blue">
                        {playerType === 'batters' ? (
                          <span>{p.partner_survival_pct.toFixed(1)}%</span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-rr-blue border border-blue-200 text-[11px]">
                            {p.partner_wickets_created} Wkts
                          </span>
                        )}
                      </td>

                      {/* Action Profile Button */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setSelectedPlayerModal(p)}
                          className="px-2.5 py-1 rounded-lg bg-pink-50 hover:bg-[#EA1A85] hover:text-white text-rr-blue border border-rr-borderpink text-[11px] font-medium transition-all shadow-2xs"
                        >
                          Details
                        </button>
                      </td>

                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal: Full Deep Dive Card */}
      {selectedPlayerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-rr-borderpink space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-pink-100 pb-3">
              <div>
                <span className="text-[10px] font-medium text-rr-darkpink">
                  Full Analytics Dossier
                </span>
                <h3 className="text-xl font-semibold text-rr-blue">
                  #{selectedPlayerModal.rank} {selectedPlayerModal.player_name}
                </h3>
                <p className="text-xs text-rr-muted">{selectedPlayerModal.scouting_role}</p>
              </div>
              <button
                onClick={() => setSelectedPlayerModal(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-rr-blue font-medium flex items-center justify-center"
              >
                X
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-center">
              <div className="p-3 bg-pink-50 rounded-xl">
                <div className="text-[10px] font-medium text-rr-muted">Overall Clutch Rating</div>
                <div className="text-lg font-semibold text-rr-pink tabular-nums">{selectedPlayerModal.clutch_rating}</div>
              </div>
              <div className="p-3 bg-rr-subtle rounded-xl">
                <div className="text-[10px] font-medium text-rr-muted">Clutch Lift Delta</div>
                <div className="text-lg font-semibold text-rr-blue tabular-nums">{selectedPlayerModal.clutch_lift_delta}</div>
              </div>
              <div className="p-3 bg-rr-subtle rounded-xl">
                <div className="text-[10px] font-medium text-rr-muted">Est. Bid Price</div>
                <div className="text-lg font-semibold text-emerald-700 tabular-nums">INR {selectedPlayerModal.estimated_auction_price_cr} Cr</div>
              </div>
              <div className="p-3 bg-rr-subtle rounded-xl">
                <div className="text-[10px] font-medium text-rr-muted">Pressure Deliveries</div>
                <div className="text-base font-medium text-rr-blue tabular-nums">{selectedPlayerModal.pressure_balls} / {selectedPlayerModal.total_balls}</div>
              </div>
              <div className="p-3 bg-rr-subtle rounded-xl">
                <div className="text-[10px] font-medium text-rr-muted">
                  {playerType === 'batters' ? 'Strike Rate Shift' : 'Economy Shift'}
                </div>
                <div className="text-base font-medium text-rr-blue tabular-nums">
                  {playerType === 'batters' 
                    ? `${selectedPlayerModal.normal_strike_rate} -> ${selectedPlayerModal.pressure_strike_rate}`
                    : `${selectedPlayerModal.normal_economy} -> ${selectedPlayerModal.pressure_economy}`}
                </div>
              </div>
              <div className="p-3 bg-rr-subtle rounded-xl">
                <div className="text-[10px] font-medium text-rr-muted">
                  {playerType === 'batters' ? 'Partner Survival Rate' : 'Wickets Created for Partner'}
                </div>
                <div className="text-base font-medium text-rr-blue tabular-nums">
                  {playerType === 'batters' 
                    ? `${selectedPlayerModal.partner_survival_pct}%`
                    : `${selectedPlayerModal.partner_wickets_created} Wickets`}
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl text-xs text-rr-muted leading-relaxed text-center">
              <strong>Analytics Interpretation:</strong> This player has faced or bowled {selectedPlayerModal.pressure_balls} balls during match-deciding phases. Their performance shifts by {selectedPlayerModal.clutch_lift_delta} runs per 100 balls relative to their normal baseline, making them an ideal target for high-leverage overs.
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
