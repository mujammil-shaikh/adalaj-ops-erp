import React, { useState } from 'react';
import {
  Megaphone,
  TrendingUp,
  Plus,
  DollarSign,
  Share2,
  Globe,
  Tag,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  AuthUser,
  AdvertisingCampaign,
  MarketplaceSettlement,
  AdPlatform,
} from '../../types';
import { db } from '../../lib/storage';
import { formatINR } from '../../lib/format';
import { RoleTodoAndReportBar } from './RoleTodoAndReportBar';

interface MarketingPortalProps {
  currentUser: AuthUser;
  onNavigateModule: (module: string) => void;
}

export const MarketingPortal: React.FC<MarketingPortalProps> = ({
  currentUser,
  onNavigateModule,
}) => {
  const [campaigns, setCampaigns] = useState<AdvertisingCampaign[]>(() => db.getCampaigns());
  const [settlements, setSettlements] = useState<MarketplaceSettlement[]>(() => db.getSettlements());

  // Modal
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form states - New Campaign
  const [campName, setCampName] = useState('Festive Quick Commerce Blinkit Push');
  const [campPlatform, setCampPlatform] = useState<AdPlatform>('blinkit_zepto');
  const [campBudgetRupees, setCampBudgetRupees] = useState(25000);
  const [campActualSpendRupees, setCampActualSpendRupees] = useState(18500);
  const [campVendor, setCampVendor] = useState('Blinkit Commerce Ads India Pvt Ltd');
  const [campProductLine, setCampProductLine] = useState<'line_a' | 'line_b' | 'shared'>('line_a');
  const [campChannel, setCampChannel] = useState('Quick Commerce App Ads');

  const refreshAll = () => {
    setCampaigns(db.getCampaigns());
    setSettlements(db.getSettlements());
  };

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetPaise = Math.round(Number(campBudgetRupees) * 100);
    const spendPaise = Math.round(Number(campActualSpendRupees) * 100);
    const gstPaise = Math.round((spendPaise * 18) / 100); // 18% GST ITC

    const newCamp: AdvertisingCampaign = {
      id: `camp_${Date.now()}`,
      name: campName,
      platform: campPlatform,
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      budgetPaise,
      actualSpendPaise: spendPaise,
      gstPaise,
      productLine: campProductLine,
      attributionChannel: campChannel,
      vendorName: campVendor,
      roas: 3.8,
      notes: 'Logged under OPEX Section 13.3 with 18% claimable Input Tax Credit (ITC).',
    };

    db.addCampaign(newCamp);
    refreshAll();
    setShowAddCampaignModal(false);
    showNotification(`Launched marketing campaign: ${campName}`);
  };

  const totalMarketingSpend = campaigns.reduce((acc, c) => acc + c.actualSpendPaise, 0);
  const totalMarketingITC = campaigns.reduce((acc, c) => acc + c.gstPaise, 0);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl border border-purple-900/10 dark:border-purple-500/20 bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-transparent backdrop-blur-sm shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Advertising, Marketing & Brand Growth Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Section 13.3 · Digital PPC, Physical Dealer Boards, Marketplace Fee Bridges & Claimable GST ITC
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddCampaignModal(true)}
          className="px-4 py-2 rounded-xl bg-[#9E1C23] hover:bg-[#83161C] text-white text-xs font-bold flex items-center gap-2 shadow cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Campaign</span>
        </button>
      </div>

      {/* 2. Pinned Universal Daily TO-DO Stack */}
      <RoleTodoAndReportBar
        currentRole="marketing"
        currentUserName={currentUser.name}
        onNavigateModule={onNavigateModule}
      />

      {/* 3. MARKETING OPEX & GST ITC METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Marketing Spend (OPEX)</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {formatINR(totalMarketingSpend)}
          </div>
          <p className="text-xs text-slate-500">
            Booked purely as Operating Expense (no price deduction)
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Claimable 18% GST ITC</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatINR(totalMarketingITC)}
          </div>
          <p className="text-xs text-slate-500">
            Offsets GST liability on domestic FMCG sales
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Brand Campaigns</span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {campaigns.filter((c) => c.status === 'active').length} Active
          </div>
          <p className="text-xs text-slate-500">
            Quick commerce, Meta ads & retail dealer signage
          </p>
        </div>
      </div>

      {/* 4. ACTIVE CAMPAIGNS REGISTER */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#9E1C23] dark:text-amber-400" />
            <span>Digital Ads & Physical Marketing Campaigns</span>
          </h3>
          <button
            onClick={() => onNavigateModule('advertising')}
            className="text-xs font-bold text-[#9E1C23] dark:text-amber-400 hover:underline"
          >
            Open Ads Module ➔
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 uppercase">
                  {camp.platform.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{camp.startDate}</span>
              </div>

              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {camp.name}
                </h4>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Vendor: <strong>{camp.vendorName}</strong>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Budget / Spend</span>
                  <strong>{formatINR(camp.actualSpendPaise)}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-600 block font-sans">18% GST ITC</span>
                  <strong className="text-emerald-600">{formatINR(camp.gstPaise)}</strong>
                </div>
                {camp.roas && (
                  <div>
                    <span className="text-[10px] text-purple-600 block font-sans">ROAS</span>
                    <strong className="text-purple-600">{camp.roas}x</strong>
                  </div>
                )}
              </div>

              {camp.notes && (
                <p className="text-[10px] text-slate-400 italic">
                  {camp.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: LAUNCH NEW MARKETING CAMPAIGN */}
      {showAddCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#9E1C23] dark:text-amber-400" />
                <h3 className="font-bold text-sm">Launch Brand Marketing Campaign</h3>
              </div>
              <button onClick={() => setShowAddCampaignModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Platform / Medium *</label>
                  <select
                    value={campPlatform}
                    onChange={(e) => setCampPlatform(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                  >
                    <option value="blinkit_zepto">Blinkit / Zepto Quick Commerce</option>
                    <option value="meta_ads">Meta Ads (Facebook & Instagram)</option>
                    <option value="google_ads">Google Search & Performance Max</option>
                    <option value="amazon_ads">Amazon Sponsored Ads PPC</option>
                    <option value="offline_marketing">Retail Dealer Boards & Signage</option>
                    <option value="creative_production">Creative Production & Sampling</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Channel</label>
                  <input
                    type="text"
                    value={campChannel}
                    onChange={(e) => setCampChannel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Agency / Platform Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={campVendor}
                  onChange={(e) => setCampVendor(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Allocated Budget (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={campBudgetRupees}
                    onChange={(e) => setCampBudgetRupees(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Actual Spend (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={campActualSpendRupees}
                    onChange={(e) => setCampActualSpendRupees(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCampaignModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#9E1C23] text-white font-bold"
                >
                  Confirm Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
