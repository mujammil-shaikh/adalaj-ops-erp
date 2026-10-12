import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  TrendingUp,
  ShoppingCart,
  Percent,
  Search,
  CheckCircle,
  Clock,
  Eye,
  MousePointer,
  Sparkles,
  Layers,
  ArrowRight,
  Filter,
  DollarSign,
  Building2,
  FileText,
} from 'lucide-react';
import { AdvertisingCampaign, MarketplaceSettlement, AdPlatform } from '../../types';
import { db } from '../../lib/storage';
import { formatCurrency, formatPaiseToRupees } from '../../lib/format';
import { useTheme } from '../../context/ThemeContext';

export const AdvertisingModule: React.FC = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'marketplaces'>('campaigns');
  const [campaigns, setCampaigns] = useState<AdvertisingCampaign[]>(db.getCampaigns());
  const [settlements, setSettlements] = useState<MarketplaceSettlement[]>(db.getSettlements());

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AdvertisingCampaign | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPlatform, setFormPlatform] = useState<AdPlatform>('meta_ads');
  const [formBudgetRupees, setFormBudgetRupees] = useState('');
  const [formSpendRupees, setFormSpendRupees] = useState('');
  const [formGstRupees, setFormGstRupees] = useState('');
  const [formProductLine, setFormProductLine] = useState<'line_a' | 'line_b' | 'shared'>('line_a');
  const [formTargetSku, setFormTargetSku] = useState('FG-HLD-100G');
  const [formVendor, setFormVendor] = useState('');
  const [formChannel, setFormChannel] = useState('');
  const [formRoas, setFormRoas] = useState('4.0');
  const [formNotes, setFormNotes] = useState('');

  // KPIs
  const totalSpendPaise = campaigns.reduce((acc, c) => acc + c.actualSpendPaise, 0);
  const totalBudgetPaise = campaigns.reduce((acc, c) => acc + c.budgetPaise, 0);
  const totalGstPaise = campaigns.reduce((acc, c) => acc + c.gstPaise, 0);
  const activeCampaignsCount = campaigns.filter((c) => c.status === 'active').length;

  const totalMarketplaceSales = settlements.reduce((acc, s) => acc + s.grossSalesPaise, 0);
  const totalMarketplacePayout = settlements.reduce((acc, s) => acc + s.netBankPayoutPaise, 0);
  const totalMarketplaceDeductions = totalMarketplaceSales - totalMarketplacePayout;

  const handleOpenAdd = () => {
    setEditingCampaign(null);
    setFormName('');
    setFormPlatform('meta_ads');
    setFormBudgetRupees('');
    setFormSpendRupees('');
    setFormGstRupees('');
    setFormVendor('');
    setFormChannel('');
    setFormRoas('4.0');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: AdvertisingCampaign) => {
    setEditingCampaign(c);
    setFormName(c.name);
    setFormPlatform(c.platform);
    setFormBudgetRupees((c.budgetPaise / 100).toString());
    setFormSpendRupees((c.actualSpendPaise / 100).toString());
    setFormGstRupees((c.gstPaise / 100).toString());
    setFormProductLine(c.productLine);
    setFormTargetSku(c.targetSkuCode || '');
    setFormVendor(c.vendorName);
    setFormChannel(c.attributionChannel);
    setFormRoas(c.roas ? c.roas.toString() : '4.0');
    setFormNotes(c.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const budgetPaise = Math.round(parseFloat(formBudgetRupees || '0') * 100);
    const actualSpendPaise = Math.round(parseFloat(formSpendRupees || '0') * 100);
    const gstPaise = formGstRupees ? Math.round(parseFloat(formGstRupees) * 100) : Math.round(actualSpendPaise * 0.18);

    const campaignData: AdvertisingCampaign = {
      id: editingCampaign ? editingCampaign.id : `camp_${Date.now()}`,
      name: formName || 'Untitled Campaign',
      platform: formPlatform,
      status: 'active',
      startDate: editingCampaign ? editingCampaign.startDate : new Date().toISOString().split('T')[0],
      budgetPaise,
      actualSpendPaise,
      gstPaise,
      productLine: formProductLine,
      targetSkuCode: formTargetSku,
      attributionChannel: formChannel || 'Digital Direct',
      vendorName: formVendor || 'Advertising Vendor',
      roas: parseFloat(formRoas) || 3.5,
      notes: formNotes,
    };

    if (editingCampaign) {
      db.updateCampaign(campaignData);
    } else {
      db.addCampaign(campaignData);
    }

    setCampaigns(db.getCampaigns());
    setIsModalOpen(false);
  };

  const handleDeleteCampaign = (id: string) => {
    if (confirm('Are you sure you want to archive this campaign?')) {
      db.deleteCampaign(id);
      setCampaigns(db.getCampaigns());
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.targetSkuCode && c.targetSkuCode.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPlatform = selectedPlatform === 'all' || c.platform === selectedPlatform;
    return matchesSearch && matchesPlatform;
  });

  const getPlatformBadge = (platform: AdPlatform) => {
    switch (platform) {
      case 'meta_ads':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">Meta Ads</span>;
      case 'amazon_ads':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">Amazon Ads</span>;
      case 'blinkit_zepto':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">Quick Commerce</span>;
      case 'trade_fair':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">Trade Expo</span>;
      case 'creative_production':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">Artwork & Photos</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/30">General Marketing</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#9A2229]/20 text-[#9A2229] dark:text-rose-400 border border-[#9A2229]/30">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Advertising, Marketing & E-Commerce
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Section 13.3 · Campaign Budgets, Digital Ads, Marketplace Fee Bridges & GST ITC
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-lg border flex items-center gap-1 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'campaigns'
                  ? 'bg-[#9A2229] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Campaigns & Direct Spend
            </button>
            <button
              onClick={() => setActiveTab('marketplaces')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'marketplaces'
                  ? 'bg-[#9A2229] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Marketplace Settlement Bridge
            </button>
          </div>

          {activeTab === 'campaigns' && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#9A2229] hover:bg-[#7F191F] text-white text-xs font-medium shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Campaign</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className={`p-4 rounded-xl border transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Total Ad Spend (MTD)</span>
            <DollarSign className="w-4 h-4 text-[#9A2229]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100">
            {formatPaiseToRupees(totalSpendPaise)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Budget: {formatPaiseToRupees(totalBudgetPaise)} ({Math.round((totalSpendPaise / (totalBudgetPaise || 1)) * 100)}% utilized)
          </div>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Active Campaigns</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-amber-500">
            {activeCampaignsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across Meta, Amazon, Blinkit & Fairs
          </div>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>Input GST Credit (ITC)</span>
            <Percent className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-emerald-500">
            {formatPaiseToRupees(totalGstPaise)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            18% IGST on digital invoices claimed
          </div>
        </div>

        <div className={`p-4 rounded-xl border transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>E-Com Net Payout Rate</span>
            <ShoppingCart className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-blue-500">
            {totalMarketplaceSales ? Math.round((totalMarketplacePayout / totalMarketplaceSales) * 100) : 0}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {formatPaiseToRupees(totalMarketplaceDeductions)} deductions across fees
          </div>
        </div>
      </div>

      {/* 3. Tab 1: Campaigns Table */}
      {activeTab === 'campaigns' && (
        <div className={`rounded-xl border overflow-hidden ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          {/* Filter Bar */}
          <div className="p-3.5 border-b flex flex-col sm:flex-row items-center justify-between gap-3 border-slate-200 dark:border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns, SKU or vendor..."
                className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border outline-none transition-all ${
                  isDark
                    ? 'bg-slate-800/80 border-slate-700 text-slate-100 focus:border-amber-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#9A2229]'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {['all', 'meta_ads', 'amazon_ads', 'blinkit_zepto', 'trade_fair', 'creative_production'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPlatform(p)}
                  className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap transition-all ${
                    selectedPlatform === p
                      ? 'bg-slate-800 text-white dark:bg-slate-700 font-semibold'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {p === 'all'
                    ? 'All'
                    : p === 'meta_ads'
                    ? 'Meta'
                    : p === 'amazon_ads'
                    ? 'Amazon'
                    : p === 'blinkit_zepto'
                    ? 'Quick Com'
                    : p === 'trade_fair'
                    ? 'Trade Fairs'
                    : 'Creative'}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b ${
                isDark ? 'bg-slate-950/60 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <tr>
                  <th className="py-3 px-4 font-semibold">Campaign & Platform</th>
                  <th className="py-3 px-4 font-semibold">Target SKU / Brand</th>
                  <th className="py-3 px-4 font-semibold text-right">Budget</th>
                  <th className="py-3 px-4 font-semibold text-right">Spend</th>
                  <th className="py-3 px-4 font-semibold text-right">GST (18%)</th>
                  <th className="py-3 px-4 font-semibold text-center">ROAS / Leads</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredCampaigns.map((c) => {
                  const spendPct = Math.min(100, Math.round((c.actualSpendPaise / (c.budgetPaise || 1)) * 100));
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          {c.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {getPlatformBadge(c.platform)}
                          <span className="text-[11px] text-slate-500">{c.vendorName}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {c.targetSkuCode || 'All Adalaj SKUs'}
                        <div className="text-[10px] text-slate-400 capitalize">{c.attributionChannel}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-medium">
                        {formatPaiseToRupees(c.budgetPaise)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {formatPaiseToRupees(c.actualSpendPaise)}
                        </div>
                        <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 ml-auto mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${spendPct > 90 ? 'bg-rose-500' : 'bg-[#9A2229]'}`}
                            style={{ width: `${spendPct}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400">
                        {formatPaiseToRupees(c.gstPaise)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {c.roas ? (
                          <span className="font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            {c.roas}x ROAS
                          </span>
                        ) : (
                          <span className="font-mono text-slate-500">{c.conversions || 0} leads</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          c.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-500/15 text-slate-400 border border-slate-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'active' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                          <span className="capitalize">{c.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="px-2 py-1 rounded text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(c.id)}
                            className="px-2 py-1 rounded text-xs text-rose-500 hover:bg-rose-500/10 transition-colors"
                          >
                            Archive
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Tab 2: Marketplace Settlement Bridge (Amazon, Blinkit, Zepto) */}
      {activeTab === 'marketplaces' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl border text-xs ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-amber-50/50 border-amber-200 text-amber-950'
          }`}>
            <div className="font-semibold text-sm mb-1 flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-[#9A2229]" />
              Section 13.3 Settlement Bridge Invariant
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Never book net marketplace bank receipts directly as gross sales. The reconciliation bridge below documents all deductions: referral commission, closing fees, FBA storage, reverse logistics (RTO), platform ads, GST on fees (18%), and TCS (1%) to arrive at the net bank credit.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {settlements.map((s) => (
              <div
                key={s.id}
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center font-bold text-amber-500 uppercase">
                      {s.marketplace.slice(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                        {s.marketplace} Marketplace Payout
                      </div>
                      <div className="text-xs text-slate-500">
                        Period: {s.statementPeriod} · {s.orderCount} Orders Fulfilled
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                      s.status === 'reconciled'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}>
                      {s.status === 'reconciled' ? '✓ Reconciled with Bank' : 'Pending Verification'}
                    </span>
                  </div>
                </div>

                {/* Step-by-Step Waterfall Bridge */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 block text-[11px]">1. Gross Sales</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {formatPaiseToRupees(s.grossSalesPaise)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/20">
                    <span className="text-rose-500 block text-[11px]">- Platform Commission</span>
                    <span className="font-mono font-bold text-rose-500 text-sm">
                      -{formatPaiseToRupees(s.referralFeesPaise + s.closingFeesPaise)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/20">
                    <span className="text-rose-500 block text-[11px]">- Logistics & FBA</span>
                    <span className="font-mono font-bold text-rose-500 text-sm">
                      -{formatPaiseToRupees(s.fulfillmentFeesPaise + s.shippingFeesPaise + s.returnsRtoPaise)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-purple-500/5 border border-purple-500/20">
                    <span className="text-purple-500 block text-[11px]">- Ads & Promotions</span>
                    <span className="font-mono font-bold text-purple-500 text-sm">
                      -{formatPaiseToRupees(s.adsDeductionPaise)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <span className="text-emerald-500 block text-[11px]">GST on Fees (ITC)</span>
                    <span className="font-mono font-bold text-emerald-500 text-sm">
                      {formatPaiseToRupees(s.gstOnFeesPaise)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 col-span-2 sm:col-span-1">
                    <span className="text-blue-500 block text-[11px] font-semibold">= Net Bank Payout</span>
                    <span className="font-mono font-black text-blue-500 text-base">
                      {formatPaiseToRupees(s.netBankPayoutPaise)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span>Credited into: {s.linkedAccountName}</span>
                  <span>Value Date: {s.bankCreditDate} · TCS Deducted: {formatPaiseToRupees(s.tcsPaise)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Add / Edit Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`w-full max-w-lg rounded-xl border p-5 sm:p-6 shadow-2xl transition-all ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#9A2229]" />
              {editingCampaign ? 'Edit Advertising Campaign' : 'Create New Campaign'}
            </h3>

            <form onSubmit={handleSaveCampaign} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-500 mb-1 font-medium">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Diwali Festive Packaging Promotion"
                  className={`w-full p-2 rounded-lg border outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Platform / Channel</label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value as AdPlatform)}
                    className={`w-full p-2 rounded-lg border outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="meta_ads">Meta Ads (FB/Insta)</option>
                    <option value="amazon_ads">Amazon Sponsored Products</option>
                    <option value="blinkit_zepto">Blinkit / Zepto Promo</option>
                    <option value="trade_fair">Trade Fair / Exhibition</option>
                    <option value="creative_production">Creative Design / Photoshoot</option>
                    <option value="offline_marketing">Offline Banners & Standees</option>
                    <option value="influencer">Influencer Collaboration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Target SKU</label>
                  <input
                    type="text"
                    value={formTargetSku}
                    onChange={(e) => setFormTargetSku(e.target.value)}
                    placeholder="e.g. FG-HLD-100G"
                    className={`w-full p-2 rounded-lg border outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Approved Budget (₹)</label>
                  <input
                    type="number"
                    required
                    value={formBudgetRupees}
                    onChange={(e) => setFormBudgetRupees(e.target.value)}
                    placeholder="e.g. 50000"
                    className={`w-full p-2 rounded-lg border outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Actual Spend (₹)</label>
                  <input
                    type="number"
                    required
                    value={formSpendRupees}
                    onChange={(e) => setFormSpendRupees(e.target.value)}
                    placeholder="e.g. 35000"
                    className={`w-full p-2 rounded-lg border outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Vendor / Platform Agency</label>
                  <input
                    type="text"
                    value={formVendor}
                    onChange={(e) => setFormVendor(e.target.value)}
                    placeholder="e.g. Meta Platforms / Studio"
                    className={`w-full p-2 rounded-lg border outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1 font-medium">Target ROAS (x)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formRoas}
                    onChange={(e) => setFormRoas(e.target.value)}
                    placeholder="4.0"
                    className={`w-full p-2 rounded-lg border outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 mb-1 font-medium">Notes & Attribution Strategy</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Creative specs, targeting details, promo discount code..."
                  className={`w-full p-2 rounded-lg border outline-none resize-none ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#9A2229] hover:bg-[#7F191F] text-white font-medium shadow-sm transition-all"
                >
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
