import React, { useState } from 'react';
import { RRCrest, StatCard } from './components/Common';
import { TabLeaderboard } from './components/TabLeaderboard';
import { TabCrisisSimulator } from './components/TabCrisisSimulator';
import { TabAuctionOptimizer } from './components/TabAuctionOptimizer';
import { TabHeadToHead } from './components/TabHeadToHead';
import { TabForensics } from './components/TabForensics';
import { TabJudgeAudit } from './components/TabJudgeAudit';

// Load static JSON datasets
import battersData from './data/batters_vajra.json';
import bowlersData from './data/bowlers_vajra.json';
import forensicMatchesData from './data/forensic_matches.json';
import summaryData from './data/summary_metrics.json';

import {
  Trophy,
  Activity,
  DollarSign,
  Scale,
  Film,
  SlidersHorizontal,
  Database,
  TrendingUp
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('leaderboard');

  const navItems = [
    {
      id: 'leaderboard',
      title: 'Player Performance Database',
      subtitle: 'Complete batting and bowling metrics',
      icon: Trophy
    },
    {
      id: 'crisis',
      title: 'Match Situation Simulator',
      subtitle: 'Target chases and batting collapses',
      icon: Activity
    },
    {
      id: 'auction',
      title: 'Auction & Budget Planner',
      subtitle: 'Purse optimization and value picks',
      icon: DollarSign
    },
    {
      id: 'comparator',
      title: 'Player Comparison Tool',
      subtitle: 'Five-metric radar and head-to-head',
      icon: Scale
    },
    {
      id: 'forensics',
      title: 'Ball-by-Ball Match Replay',
      subtitle: 'Over-by-over pressure telemetry',
      icon: Film
    },
    {
      id: 'audit',
      title: 'Analytics Audit & Model Proof',
      subtitle: 'Validation tests and methodology',
      icon: SlidersHorizontal
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDF2F8] text-[#071E54] flex flex-col font-sans">
      {/* Top Rajasthan Royals Brand Banner */}
      <header className="bg-[#EA1A85] text-white shadow-md border-b-4 border-[#D4AF37]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            
            {/* Left: Official RR Crest and Team Title */}
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="p-1 bg-white rounded-2xl shadow-sm border border-pink-200 shrink-0">
                <RRCrest className="w-14 h-14" />
              </div>
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="text-[11px] font-medium tracking-normal bg-white/20 px-2.5 py-0.5 rounded-full text-white">
                    Rajasthan Royals Analytics Team
                  </span>
                  <span className="text-xs text-pink-100 font-medium">
                    SupeRR Selector Season 2
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mt-1">
                  Project Vajra: Match Pressure & Clutch Rating System
                </h1>
                <p className="text-xs text-pink-100 mt-0.5 max-w-2xl">
                  Evaluating player reliability in high-pressure match situations across IPL and ICC T20 matches (2022 to 2026)
                </p>
              </div>
            </div>

            {/* Right: Summary Performance Badges */}
            <div className="flex items-center justify-center gap-2.5 flex-wrap">
              <div className="bg-black/20 px-3.5 py-2 rounded-xl border border-white/20 text-center">
                <div className="text-[10px] font-medium text-pink-200">2nd Innings Accuracy</div>
                <div className="text-base font-semibold text-white tabular-nums">96.5% ROC-AUC</div>
              </div>
              <div className="bg-black/20 px-3.5 py-2 rounded-xl border border-white/20 text-center">
                <div className="text-[10px] font-medium text-pink-200">Dead Matches Filtered</div>
                <div className="text-base font-semibold text-white tabular-nums">99.9% Excluded</div>
              </div>
              <div className="bg-black/20 px-3.5 py-2 rounded-xl border border-white/20 text-center">
                <div className="text-[10px] font-medium text-pink-200">Future Reliability</div>
                <div className="text-base font-semibold text-amber-300 tabular-nums">2.5x Over Death Overs</div>
              </div>
            </div>

          </div>
        </div>

        {/* Centered Navigation Bar - Fully Padded & Symmetrical Rounded Active Tabs */}
        <div className="bg-[#C5116D] border-t border-white/15 px-6 sm:px-8 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-center flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all text-left shadow-2xs border ${
                    isActive
                      ? 'bg-white text-[#EA1A85] border-white shadow-md ring-2 ring-white/60 font-medium'
                      : 'bg-transparent border-transparent text-pink-100 hover:text-white hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#EA1A85]' : 'text-pink-200'}`} />
                  <div>
                    <div className="leading-tight">{item.title}</div>
                    <div className={`text-[10px] font-normal leading-tight hidden lg:block ${
                      isActive ? 'text-rr-muted' : 'text-pink-200/80'
                    }`}>
                      {item.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main War-Room Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Top Centered Dataset KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Deliveries Analyzed"
            value="199,029"
            subtext="Every ball classified by pressure level"
            icon={Database}
            badge="Parquet"
          />
          <StatCard
            label="Official T20 Matches"
            value="842"
            subtext="IPL and full-member T20Is"
            icon={Trophy}
            badge="Tier 1 & 2"
          />
          <StatCard
            label="High-Pressure Deliveries"
            value="39,806"
            subtext="Top 20% highest leverage moments"
            icon={Activity}
            badge="Leverage >= P80"
          />
          <StatCard
            label="Qualified Player Pool"
            value="205 Players"
            subtext="103 batters and 102 bowlers"
            icon={TrendingUp}
            badge="120+ Balls"
          />
        </div>

        {/* Dynamic Screen Rendering */}
        <div className="transition-opacity duration-200">
          {activeTab === 'leaderboard' && (
            <TabLeaderboard batters={battersData} bowlers={bowlersData} />
          )}

          {activeTab === 'crisis' && (
            <TabCrisisSimulator batters={battersData} bowlers={bowlersData} />
          )}

          {activeTab === 'auction' && (
            <TabAuctionOptimizer batters={battersData} bowlers={bowlersData} summary={summaryData} />
          )}

          {activeTab === 'comparator' && (
            <TabHeadToHead batters={battersData} bowlers={bowlersData} />
          )}

          {activeTab === 'forensics' && (
            <TabForensics matches={forensicMatchesData} />
          )}

          {activeTab === 'audit' && (
            <TabJudgeAudit batters={battersData} summary={summaryData} />
          )}
        </div>
      </main>

      {/* Clean Centered Footer */}
      <footer className="bg-white border-t border-rr-borderpink py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-rr-muted text-center sm:text-left">
          <div className="flex items-center justify-center gap-2.5">
            <RRCrest className="w-7 h-7" />
            <span className="font-medium text-rr-blue">
              Rajasthan Royals Analytics Department
            </span>
            <span>|</span>
            <span>SupeRR Selector Season 2 Submission</span>
          </div>
          <div className="font-medium text-rr-blue">
            Client-side interactive engine | All calculations verified against 199,029 deliveries
          </div>
        </div>
      </footer>
    </div>
  );
}
