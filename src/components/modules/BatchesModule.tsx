import React, { useState } from 'react';
import {
  PackagePlus,
  Play,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  ChevronRight,
  Calculator,
  Search,
  Filter,
  Edit,
  Trash2,
  X,
  Plus,
  BookOpen,
  Boxes,
  Layers,
  Clock,
  Truck,
  ShieldCheck,
  Factory,
  BarChart2,
  PackageCheck,
  ArrowRight,
} from 'lucide-react';
import { db } from '../../lib/storage';
import {
  PackingBatch,
  StockLot,
  InventoryItem,
  Recipe,
  PackingFloorFulfillmentJob,
  PrimaryPackTier,
  SecondaryPackTier,
  TertiaryShipperTier,
} from '../../types';
import { formatINR, formatGrams, formatQty, formatPct, formatDate } from '../../lib/format';

export const BatchesModule: React.FC<{ onNavigateToFloor?: () => void }> = ({ onNavigateToFloor }) => {
  const [batches, setBatches] = useState<PackingBatch[]>(db.getBatches());
  const [recipes, setRecipes] = useState<Recipe[]>(db.getRecipes());
  const [lots, setLots] = useState<StockLot[]>(db.getLots());
  const [items, setItems] = useState<InventoryItem[]>(db.getItems());
  const [selectedBatch, setSelectedBatch] = useState<PackingBatch | null>(batches[0] || null);

  // Active Tab: Batches vs Recipes (BOM) vs 3-Tier Packaging & Floor Flow
  const [activeTab, setActiveTab] = useState<'batches' | 'recipes' | 'packing_flow'>('batches');
  const [floorJobs, setFloorJobs] = useState<PackingFloorFulfillmentJob[]>(() => db.getPackingFloorJobs());
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [showLogProgressModal, setShowLogProgressModal] = useState(false);
  const [selectedJobForProgress, setSelectedJobForProgress] = useState<PackingFloorFulfillmentJob | null>(null);

  // New Job Wizard Form States
  const [jobCustomerName, setJobCustomerName] = useState('Taj Vivanta & Gateway Palace Catering Division');
  const [jobOrderRef, setJobOrderRef] = useState('PO-2026-OCT-102');
  const [jobSpiceName, setJobSpiceName] = useState('Turmeric Powder (Pure Agmark Grade)');
  const [jobTargetKg, setJobTargetKg] = useState(1000);
  const [jobPrimaryTier, setJobPrimaryTier] = useState<PrimaryPackTier>('pouch_100g');
  const [jobSecondaryTier, setJobSecondaryTier] = useState<SecondaryPackTier>('pack_10pcs');
  const [jobTertiaryTier, setJobTertiaryTier] = useState<TertiaryShipperTier>('box_20kg');
  const [jobDailyQuota, setJobDailyQuota] = useState(2500);

  // Shift Log Form States
  const [logShift, setLogShift] = useState<'morning' | 'evening' | 'night'>('morning');
  const [logSupervisor, setLogSupervisor] = useState('Pravin Solanki');
  const [logUnits, setLogUnits] = useState(2500);
  const [logSpillWastageGrams, setLogSpillWastageGrams] = useState(1200);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'all' | 'running' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. New Batch Wizard Modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newBatchStep, setNewBatchStep] = useState(1);
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id || '');
  const [selectedLotId, setSelectedLotId] = useState(lots[0]?.id || '');
  const [issuedGrams, setIssuedGrams] = useState(20000); // 20 kg
  const [targetPacks, setTargetPacks] = useState(195);
  const [shift, setShift] = useState<'morning' | 'evening' | 'night'>('morning');
  const [machineId, setMachineId] = useState('mach_auger_01');
  const [workersText, setWorkersText] = useState('Ramesh Prajapati, Sunita Parmar');

  // 2. Edit Batch Modal
  const [showEditBatchModal, setShowEditBatchModal] = useState(false);
  const [editBatchNo, setEditBatchNo] = useState('');
  const [editStatus, setEditStatus] = useState<'planned' | 'running' | 'completed' | 'closed'>('running');
  const [editShift, setEditShift] = useState<'morning' | 'evening' | 'night'>('morning');
  const [editMachineName, setEditMachineName] = useState('');
  const [editWorkers, setEditWorkers] = useState('');
  const [editIssuedGrams, setEditIssuedGrams] = useState(20000);
  const [editReturnedGrams, setEditReturnedGrams] = useState(0);
  const [editPacksProduced, setEditPacksProduced] = useState(195);
  const [editNotes, setEditNotes] = useState('');

  // 3. Recipe Modal (Create / Edit)
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [recipeFinishedItemId, setRecipeFinishedItemId] = useState(
    items.find((i) => i.type === 'finished_good')?.id || ''
  );
  const [recipePackSizeGrams, setRecipePackSizeGrams] = useState(100);
  const [recipePowderGrams, setRecipePowderGrams] = useState(100);
  const [recipeYieldPct, setRecipeYieldPct] = useState(98.5);
  const [recipePackingItemId, setRecipePackingItemId] = useState(
    items.find((i) => i.type === 'packing_material')?.id || ''
  );
  const [recipeNotes, setRecipeNotes] = useState('');

  const reload = () => {
    const bList = db.getBatches();
    setBatches(bList);
    setRecipes(db.getRecipes());
    setLots(db.getLots());
    setItems(db.getItems());

    if (selectedBatch) {
      const refreshed = bList.find((b) => b.id === selectedBatch.id);
      setSelectedBatch(refreshed || bList[0] || null);
    }
  };

  // Create Batch
  const handleCreateBatch = () => {
    const recipe = recipes.find((r) => r.id === selectedRecipeId) || recipes[0];
    const lot = lots.find((l) => l.id === selectedLotId) || lots[0];
    const finishedItem = items.find((i) => i.id === recipe.finishedItemId);
    const machines = db.getAssets();
    const machine = machines.find((m) => m.id === machineId) || machines[0];

    const batchNo = `BATCH-2026-${Math.floor(100 + Math.random() * 900)}`;
    const costPowderPaise = Math.round((issuedGrams / 1000) * (lot?.landedCostPerKgPaise || 18000));
    const costPkgPaise = Math.round(targetPacks * 420);
    const costLabourPaise = 30000;
    const costPowerPaise = 12000;
    const totalCostPaise = costPowderPaise + costPkgPaise + costLabourPaise + costPowerPaise;
    const costPerPack = Math.round(totalCostPaise / (targetPacks || 1));
    const costPerKg = Math.round((totalCostPaise / (issuedGrams || 1)) * 1000);

    const newBatch: PackingBatch = {
      id: `batch_${Date.now()}`,
      batchNo,
      date: new Date().toISOString().split('T')[0],
      shift,
      status: 'running',
      machineId: machine?.id || 'mach_auger_01',
      machineName: machine?.name || 'Auger Servo Filler',
      workers: workersText.split(',').map((s) => s.trim()),
      rawLotId: lot.id,
      rawItemId: lot.itemId,
      rawItemName: lot.itemName,
      rawIssuedGrams: issuedGrams,
      rawReturnedGrams: 0,
      outputs: [
        {
          itemId: recipe.finishedItemId,
          itemName: recipe.finishedItemName,
          packsProduced: targetPacks,
          packSizeGrams: recipe.packSizeGrams,
          totalGrams: targetPacks * recipe.packSizeGrams,
          mrpPaise: finishedItem?.mrpPaise || 4500,
        },
      ],
      packingMaterialsUsed: [
        {
          itemId: recipe.packingMaterials[0]?.itemId || 'item_pkg_cyl100',
          itemName: recipe.packingMaterials[0]?.itemName || '100g Cylinder Can',
          qtyPcs: targetPacks + 2,
        },
      ],
      wastage: [
        { reason: 'powder_spill', qtyGramsOrPcs: 120, notes: 'Hopper purge and sieve dust' },
        { reason: 'cylinder_damage', qtyGramsOrPcs: 2, notes: 'Setup sample calibration' },
      ],
      qcPassed: true,
      qcChecks: {
        weightAccuracy: true,
        sealIntegrity: true,
        metalDetectorClean: true,
        batchCodingLegible: true,
      },
      costs: {
        rawPowderPaise: costPowderPaise,
        packingMaterialPaise: costPkgPaise,
        directLabourPaise: costLabourPaise,
        powerAndWearPaise: costPowerPaise,
        thirdPartyFeePaise: 0,
        totalCostPaise,
        costPerPackPaise: costPerPack,
        costPerKgPaise: costPerKg,
      },
      toleranceVariancePct: 0.45,
      notes: `Batch initiated for ${recipe.finishedItemName}. Target yield 98.5%.`,
    };

    db.addMovement({
      id: `mov_batch_out_${Date.now()}`,
      date: newBatch.date,
      time: new Date().toLocaleTimeString(),
      itemId: lot.itemId,
      itemName: lot.itemName,
      lotId: lot.id,
      lotNo: lot.lotNo,
      locationId: 'loc_raw',
      locationName: 'Raw Powder Store',
      qtyBase: -issuedGrams,
      type: 'production_out',
      reference: newBatch.batchNo,
      unitCostPaise: Math.round(lot.landedCostPerKgPaise / 1000),
      notes: `Issued to batch ${newBatch.batchNo}`,
    });

    db.addBatch(newBatch);
    setShowNewModal(false);
    setNewBatchStep(1);
    reload();
    setSelectedBatch(newBatch);
  };

  // Open Edit Batch
  const handleOpenEditBatch = (batch: PackingBatch) => {
    setSelectedBatch(batch);
    setEditBatchNo(batch.batchNo);
    setEditStatus(batch.status);
    setEditShift(batch.shift);
    setEditMachineName(batch.machineName);
    setEditWorkers(batch.workers.join(', '));
    setEditIssuedGrams(batch.rawIssuedGrams);
    setEditReturnedGrams(batch.rawReturnedGrams);
    setEditPacksProduced(batch.outputs[0]?.packsProduced || 0);
    setEditNotes(batch.notes || '');
    setShowEditBatchModal(true);
  };

  // Save Edit Batch
  const handleSaveEditBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    const updatedOutputs = selectedBatch.outputs.map((out, idx) => {
      if (idx === 0) {
        return {
          ...out,
          packsProduced: editPacksProduced,
          totalGrams: editPacksProduced * out.packSizeGrams,
        };
      }
      return out;
    });

    const updated: PackingBatch = {
      ...selectedBatch,
      batchNo: editBatchNo,
      status: editStatus,
      shift: editShift,
      machineName: editMachineName,
      workers: editWorkers.split(',').map((w) => w.trim()),
      rawIssuedGrams: Number(editIssuedGrams) || 0,
      rawReturnedGrams: Number(editReturnedGrams) || 0,
      outputs: updatedOutputs,
      notes: editNotes,
    };

    db.updateBatch(updated);
    setShowEditBatchModal(false);
    reload();
  };

  // Delete Batch
  const handleDeleteBatch = (id: string, batchNo: string) => {
    if (confirm(`Are you sure you want to void / delete Batch "${batchNo}"? This action cannot be undone.`)) {
      db.deleteBatch(id);
      reload();
    }
  };

  // Close Batch
  const handleCloseBatch = (batch: PackingBatch) => {
    const updated: PackingBatch = {
      ...batch,
      status: 'closed',
    };

    batch.outputs.forEach((out) => {
      db.addMovement({
        id: `mov_fg_in_${Date.now()}_${out.itemId}`,
        date: batch.date,
        time: new Date().toLocaleTimeString(),
        itemId: out.itemId,
        itemName: out.itemName,
        locationId: 'loc_fg',
        locationName: 'Finished Goods Store',
        qtyBase: out.packsProduced,
        type: 'production_in',
        reference: batch.batchNo,
        unitCostPaise: batch.costs.costPerPackPaise,
        notes: `Production completed from batch ${batch.batchNo}`,
      });
    });

    db.updateBatch(updated);
    reload();
  };

  // Recipe CRUD
  const handleOpenCreateRecipe = () => {
    setEditingRecipe(null);
    const fg = items.find((i) => i.type === 'finished_good') || items[0];
    const pkg = items.find((i) => i.type === 'packing_material') || items[0];
    setRecipeFinishedItemId(fg ? fg.id : '');
    setRecipePackSizeGrams(100);
    setRecipePowderGrams(100);
    setRecipeYieldPct(98.5);
    setRecipePackingItemId(pkg ? pkg.id : '');
    setRecipeNotes('Standard high-speed auger cylinder packaging formula');
    setShowRecipeModal(true);
  };

  const handleOpenEditRecipe = (rec: Recipe) => {
    setEditingRecipe(rec);
    setRecipeFinishedItemId(rec.finishedItemId);
    setRecipePackSizeGrams(rec.packSizeGrams);
    setRecipePowderGrams(rec.powderPerPackGrams);
    setRecipeYieldPct(rec.expectedYieldPct);
    setRecipePackingItemId(rec.packingMaterials[0]?.itemId || '');
    setRecipeNotes(rec.notes || '');
    setShowRecipeModal(true);
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    const fgItem = items.find((i) => i.id === recipeFinishedItemId);
    const pkgItem = items.find((i) => i.id === recipePackingItemId);

    const recipeData: Recipe = {
      id: editingRecipe ? editingRecipe.id : `recipe_${Date.now()}`,
      finishedItemId: recipeFinishedItemId,
      finishedItemName: fgItem ? fgItem.name : 'Finished Spice Pack',
      packSizeGrams: Number(recipePackSizeGrams) || 100,
      powderPerPackGrams: Number(recipePowderGrams) || 100,
      packingMaterials: [
        {
          itemId: recipePackingItemId,
          itemName: pkgItem ? pkgItem.name : 'Primary Packaging Can',
          qtyPerPack: 1,
        },
      ],
      expectedYieldPct: Number(recipeYieldPct) || 98.5,
      notes: recipeNotes,
    };

    if (editingRecipe) {
      db.updateRecipe(recipeData);
    } else {
      db.addRecipe(recipeData);
    }

    setShowRecipeModal(false);
    reload();
  };

  const handleDeleteRecipe = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete Recipe/BOM for "${name}"?`)) {
      db.deleteRecipe(id);
      reload();
    }
  };

  const handleCreateFloorJob = (e: React.FormEvent) => {
    e.preventDefault();
    const targetGrams = (Number(jobTargetKg) || 100) * 1000;
    let packSizeGrams = 100;
    if (jobPrimaryTier === 'pouch_10rs') packSizeGrams = 20;
    else if (jobPrimaryTier === 'pouch_50g') packSizeGrams = 50;
    else if (jobPrimaryTier === 'pouch_100g') packSizeGrams = 100;
    else if (jobPrimaryTier === 'pouch_200g') packSizeGrams = 200;
    else if (jobPrimaryTier === 'pouch_500g') packSizeGrams = 500;
    else if (jobPrimaryTier === 'bag_1kg') packSizeGrams = 1000;
    else if (jobPrimaryTier === 'bag_2kg') packSizeGrams = 2000;
    else if (jobPrimaryTier === 'bag_5kg') packSizeGrams = 5000;
    else if (jobPrimaryTier === 'bulk_10kg') packSizeGrams = 10000;
    else if (jobPrimaryTier === 'bulk_25kg') packSizeGrams = 25000;
    else if (jobPrimaryTier === 'bulk_50kg') packSizeGrams = 50000;

    const targetPacks = Math.round(targetGrams / packSizeGrams);
    const newJob: PackingFloorFulfillmentJob = {
      id: `job_${Date.now()}`,
      jobNo: `JOB-2026-10-${String(floorJobs.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      customerName: jobCustomerName,
      orderRef: jobOrderRef,
      spiceName: jobSpiceName,
      targetGrams,
      targetPacks,
      primaryTier: jobPrimaryTier,
      secondaryTier: jobSecondaryTier,
      tertiaryTier: jobTertiaryTier,
      isMixedAssortedShipper: false,
      dailyPackQuotaUnits: Number(jobDailyQuota) || 2500,
      packedGramsCompleted: 0,
      packedUnitsCompleted: 0,
      deficitGrams: targetGrams,
      deficitUnits: targetPacks,
      fulfillmentPct: 0,
      dailyProgressRecords: [],
      status: 'grinding_ready',
      lotTraceability: {
        rawSpiceSupplierLot: lots[0]?.lotNo || 'LOT-HLD-2610A',
        grindingBatchNo: batches[0]?.batchNo || 'BAT-2026-10-01',
        primaryPackLotNo: `PL-${Date.now().toString().slice(-6)}`,
        tertiaryShipperBoxBarcodes: [`BOX-${Date.now().toString().slice(-4)}-01`],
      },
    };

    db.addPackingFloorJob(newJob);
    setFloorJobs(db.getPackingFloorJobs());
    setShowNewJobModal(false);
  };

  const handleLogShiftProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobForProgress) return;

    let packSizeGrams = 100;
    if (selectedJobForProgress.primaryTier === 'pouch_10rs') packSizeGrams = 20;
    else if (selectedJobForProgress.primaryTier === 'pouch_50g') packSizeGrams = 50;
    else if (selectedJobForProgress.primaryTier === 'pouch_100g') packSizeGrams = 100;
    else if (selectedJobForProgress.primaryTier === 'pouch_200g') packSizeGrams = 200;
    else if (selectedJobForProgress.primaryTier === 'pouch_500g') packSizeGrams = 500;
    else if (selectedJobForProgress.primaryTier === 'bag_1kg') packSizeGrams = 1000;
    else if (selectedJobForProgress.primaryTier === 'bag_2kg') packSizeGrams = 2000;
    else if (selectedJobForProgress.primaryTier === 'bag_5kg') packSizeGrams = 5000;
    else if (selectedJobForProgress.primaryTier === 'bulk_10kg') packSizeGrams = 10000;
    else if (selectedJobForProgress.primaryTier === 'bulk_25kg') packSizeGrams = 25000;
    else if (selectedJobForProgress.primaryTier === 'bulk_50kg') packSizeGrams = 50000;

    const units = Number(logUnits) || 0;
    const grams = units * packSizeGrams;
    const wastage = Number(logSpillWastageGrams) || 0;

    db.recordPackingDailyProgress(
      selectedJobForProgress.id,
      logShift,
      logSupervisor,
      units,
      grams,
      wastage
    );

    setFloorJobs(db.getPackingFloorJobs());
    setShowLogProgressModal(false);
    setSelectedJobForProgress(null);
  };

  const filteredBatches = batches.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (
      searchQuery &&
      !b.batchNo.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !b.rawItemName.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E1C23] dark:text-amber-400">
            <span>Module M4 &amp; M5</span>
            <span>·</span>
            <span>Adalaj Packing Production &amp; Costing</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Batch Manufacturing Records (BMR) &amp; BOM
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
            Trace spice lots, packaging consumption, powder spill wastage, net yields, and true per-pack unit cost.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToFloor && (
            <button
              onClick={onNavigateToFloor}
              className="px-3 py-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-[#9E1C23] dark:text-amber-300 border border-[#9E1C23]/20 dark:border-amber-500/30 font-semibold text-xs transition hover:bg-amber-500/20"
            >
              Floor Touch Console
            </button>
          )}

          {activeTab === 'batches' ? (
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold text-xs transition shadow-sm active:scale-95"
            >
              <PackagePlus className="w-4 h-4" />
              <span>+ Create Batch Wizard</span>
            </button>
          ) : activeTab === 'recipes' ? (
            <button
              onClick={handleOpenCreateRecipe}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold text-xs transition shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Recipe / BOM</span>
            </button>
          ) : (
            <button
              onClick={() => setShowNewJobModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold text-xs transition shadow-sm active:scale-95"
            >
              <PackagePlus className="w-4 h-4" />
              <span>+ Stage Customer Packing Job</span>
            </button>
          )}
        </div>
      </div>

      {/* Module Sub-tabs: Batches vs Recipes vs 3-Tier Packaging & Floor Flow */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('batches')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'batches'
              ? 'border-[#9E1C23] text-[#9E1C23] dark:text-amber-400 dark:border-amber-400 font-bold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Active &amp; Closed Batches ({batches.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('recipes')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'recipes'
              ? 'border-[#9E1C23] text-[#9E1C23] dark:text-amber-400 dark:border-amber-400 font-bold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Formulas &amp; Recipes (BOM) ({recipes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('packing_flow')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition whitespace-nowrap ${
            activeTab === 'packing_flow'
              ? 'border-[#9E1C23] text-[#9E1C23] dark:text-amber-400 dark:border-amber-400 font-bold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>3-Tier Packaging &amp; Floor Flow ({floorJobs.length})</span>
        </button>
      </div>

      {/* TAB 1: BATCHES */}
      {activeTab === 'batches' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="p-3 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 ml-1" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by batch # or spice name..."
                className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Batches ({batches.length})
              </button>
              <button
                onClick={() => setStatusFilter('running')}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition ${
                  statusFilter === 'running'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Running ({batches.filter((b) => b.status === 'running').length})
              </button>
              <button
                onClick={() => setStatusFilter('closed')}
                className={`px-3 py-1 rounded-md text-[11px] font-medium transition ${
                  statusFilter === 'closed'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Closed ({batches.filter((b) => b.status === 'closed').length})
              </button>
            </div>
          </div>

          {/* Master-Detail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left: Batch List */}
            <div className="lg:col-span-5 space-y-2.5">
              {filteredBatches.length === 0 ? (
                <div className="p-8 text-center rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs shadow-sm">
                  No batches found matching filter.
                </div>
              ) : (
                filteredBatches.map((b) => {
                  const isSelected = selectedBatch?.id === b.id;
                  const isRunning = b.status === 'running';

                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBatch(b)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer select-none shadow-sm ${
                        isSelected
                          ? 'border-[#9E1C23] bg-amber-50/60 dark:bg-[#9E1C23]/15 shadow-md ring-1 ring-[#9E1C23]'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-slate-900 dark:text-white">{b.batchNo}</span>
                          {isRunning ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 dark:text-sky-400">
                              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                              Running
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                              Closed
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                          {formatDate(b.date)}
                        </span>
                      </div>

                      <div className="mt-2 text-xs">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {b.outputs[0]?.itemName || b.rawItemName}
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                          {b.machineName} · Shift: <span className="capitalize">{b.shift}</span>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-700 dark:text-slate-300">
                          {formatQty(b.outputs[0]?.packsProduced || 0, 'packs')}
                        </span>
                        <span className="font-bold text-[#9E1C23] dark:text-amber-400">
                          ₹{(b.costs.costPerPackPaise / 100).toFixed(2)}/pack
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right: Selected Batch Full Details */}
            <div className="lg:col-span-7">
              {selectedBatch ? (
                <div className="rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-4 shadow-sm text-slate-900 dark:text-slate-100">
                  {/* Top Bar with CRUD Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                          {selectedBatch.batchNo}
                        </h3>
                        {selectedBatch.status === 'running' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-700">
                            Running Live
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700">
                            Locked &amp; Posted
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        Machine: <strong className="text-slate-800 dark:text-slate-200">{selectedBatch.machineName}</strong> · Shift: <strong className="text-slate-800 dark:text-slate-200 capitalize">{selectedBatch.shift}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedBatch.status === 'running' && (
                        <button
                          onClick={() => handleCloseBatch(selectedBatch)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Close &amp; Post</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenEditBatch(selectedBatch)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition"
                        title="Edit Batch"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteBatch(selectedBatch.id, selectedBatch.batchNo)}
                        className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/40 transition"
                        title="Void / Delete Batch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Workers & Traceability */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs p-3 rounded-lg border bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-slate-600 dark:text-slate-400 block text-[11px] font-medium">Raw Powder Lot Linked:</span>
                      <span className="font-semibold text-[#9E1C23] dark:text-amber-300 font-mono">
                        {selectedBatch.rawLotId} ({selectedBatch.rawItemName})
                      </span>
                      <span className="text-slate-600 dark:text-slate-400 block text-[11px] mt-1">
                        Issued Weight: <strong className="text-slate-900 dark:text-white">{formatGrams(selectedBatch.rawIssuedGrams)}</strong>
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400 block text-[11px] font-medium">Operators &amp; Line Workers:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-200">
                        {selectedBatch.workers.join(', ')}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400 block text-[11px] mt-1">
                        Tolerance Variance: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{formatPct(selectedBatch.toleranceVariancePct)}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Production Outputs Table */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 mb-2">
                      Finished Packaged Output
                    </h4>
                    <div className="overflow-x-auto border rounded-lg border-slate-200 dark:border-slate-800">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Item Description</th>
                            <th className="py-2.5 px-3">Pack Size</th>
                            <th className="py-2.5 px-3 text-right">Packs Produced</th>
                            <th className="py-2.5 px-3 text-right">Net Powder Used</th>
                            <th className="py-2.5 px-3 text-right">MRP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {selectedBatch.outputs.map((out, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                              <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{out.itemName}</td>
                              <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{out.packSizeGrams}g</td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-[#9E1C23] dark:text-amber-300">
                                {formatQty(out.packsProduced, 'pcs')}
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-slate-800 dark:text-slate-300">
                                {formatGrams(out.totalGrams)}
                              </td>
                              <td className="py-2 px-3 text-right font-mono text-slate-800 dark:text-slate-300">
                                {formatINR(out.mrpPaise)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Wastage & QC Checks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800">
                      <span className="font-bold text-slate-900 dark:text-slate-200 block mb-1.5">
                        Wastage &amp; Rejects Breakdown
                      </span>
                      {selectedBatch.wastage.map((w, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-200 dark:border-slate-800/50 last:border-none text-[11px]">
                          <span className="text-slate-700 dark:text-slate-400 capitalize">{w.reason.replace('_', ' ')}:</span>
                          <span className="font-mono text-rose-700 dark:text-rose-400 font-bold">
                            {w.reason === 'cylinder_damage' ? `${w.qtyGramsOrPcs} pcs` : `${w.qtyGramsOrPcs} g`}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 space-y-1.5">
                      <span className="font-bold text-slate-900 dark:text-slate-200 block mb-1.5">
                        Quality Control (QC) Sign-off
                      </span>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-700 dark:text-slate-400">Weight Check ±0.5%:</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">Passed</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-700 dark:text-slate-400">Heat/Alu Seal Integrity:</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">Passed</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-700 dark:text-slate-400">Metal Detector Clear:</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">Clean</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-700 dark:text-slate-400">Batch Code &amp; MRP Print:</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">Legible</span>
                      </div>
                    </div>
                  </div>

                  {/* Unit Costing Sheet */}
                  <div className="p-4 rounded-xl border border-[#9E1C23]/30 bg-amber-50/70 dark:bg-slate-950 text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[#9E1C23] dark:text-amber-400 font-bold text-sm">
                        <Calculator className="w-4 h-4" />
                        <span>Unit Costing &amp; Margin Analysis</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">BMR Accurate Math</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400 text-[10px] block font-medium">Raw Powder</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {formatINR(selectedBatch.costs.rawPowderPaise)}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400 text-[10px] block font-medium">Cans &amp; Packaging</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {formatINR(selectedBatch.costs.packingMaterialPaise)}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400 text-[10px] block font-medium">Direct Labour</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {formatINR(selectedBatch.costs.directLabourPaise)}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-600 dark:text-slate-400 text-[10px] block font-medium">Power &amp; Wear</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          {formatINR(selectedBatch.costs.powerAndWearPaise)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#9E1C23]/20 flex items-center justify-between font-mono">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Total Batch Cost:</span>
                      <span className="text-base font-bold text-[#9E1C23] dark:text-amber-400">
                        {formatINR(selectedBatch.costs.totalCostPaise)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs">
                  Select a batch from the left to inspect records.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RECIPES & BOM */}
      {activeTab === 'recipes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug">
                        {rec.finishedItemName}
                      </h3>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                        Pack Size: <strong className="text-slate-900 dark:text-white">{rec.packSizeGrams}g</strong>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700">
                      Yield {rec.expectedYieldPct}%
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Powder Per Pack:</span>
                      <span className="font-mono font-medium text-slate-900 dark:text-slate-100">
                        {rec.powderPerPackGrams}g
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Primary Packaging:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[180px]">
                        {rec.packingMaterials[0]?.itemName || 'Cylinder Can'}
                      </span>
                    </div>
                    {rec.notes && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic pt-1">
                        "{rec.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditRecipe(rec)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition"
                    title="Edit Recipe BOM"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRecipe(rec.id, rec.finishedItemName)}
                    className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/40 transition"
                    title="Delete Recipe"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {recipes.length === 0 && (
            <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs">
              No recipes registered. Click "+ New Recipe / BOM" above to register your first formula.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: 3-TIER PACKAGING & FLOOR FLOW TRACKER */}
      {activeTab === 'packing_flow' && (
        <div className="space-y-4">
          {/* Packaging Hierarchy Architecture Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Tier 1 Card */}
            <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold">
                <Boxes className="w-4 h-4" />
                <span>Tier 1: Primary Packaging (Filling)</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Direct powder fill into food-grade barrier pouches or bulk industrial bags.
              </p>
              <div className="space-y-1 pt-1 font-mono text-[11px]">
                <div className="flex justify-between border-b pb-1 border-slate-100 dark:border-slate-800">
                  <span>₹10 Sachet Pouch</span>
                  <span className="font-bold text-slate-900 dark:text-white">18g – 25g net</span>
                </div>
                <div className="flex justify-between border-b pb-1 border-slate-100 dark:border-slate-800">
                  <span>Consumer Pouches</span>
                  <span className="font-bold text-slate-900 dark:text-white">50g, 100g, 200g, 500g</span>
                </div>
                <div className="flex justify-between border-b pb-1 border-slate-100 dark:border-slate-800">
                  <span>Medium Consumer Packs</span>
                  <span className="font-bold text-slate-900 dark:text-white">1kg, 2kg, 5kg bags</span>
                </div>
                <div className="flex justify-between">
                  <span>Industrial Bulk PP</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">10kg, 25kg, 50kg (loose)</span>
                </div>
              </div>
            </div>

            {/* Tier 2 Card */}
            <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold">
                <Layers className="w-4 h-4" />
                <span>Tier 2: Secondary Bundling (Over-Wrap)</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Intermediate bundling, striping, and outer film sealing for trade distribution.
              </p>
              <div className="space-y-1 pt-1 font-mono text-[11px]">
                <div className="flex justify-between border-b pb-1 border-slate-100 dark:border-slate-800">
                  <span>₹10 Pouch Bundle</span>
                  <span className="font-bold text-amber-700 dark:text-amber-300">3 strips × 10 pcs (30 pcs)</span>
                </div>
                <div className="flex justify-between border-b pb-1 border-slate-100 dark:border-slate-800">
                  <span>100g Pouch Bundle</span>
                  <span className="font-bold text-slate-900 dark:text-white">10 pcs pack (1 kg net)</span>
                </div>
                <div className="flex justify-between border-b pb-1 border-slate-100 dark:border-slate-800">
                  <span>200g Pouch Bundle</span>
                  <span className="font-bold text-slate-900 dark:text-white">5 pcs pack (1 kg net)</span>
                </div>
                <div className="flex justify-between">
                  <span>500g Pouch Bundle</span>
                  <span className="font-bold text-slate-900 dark:text-white">2 pcs pack (1 kg net)</span>
                </div>
              </div>
            </div>

            {/* Tier 3 Card */}
            <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold">
                <Truck className="w-4 h-4" />
                <span>Tier 3: Tertiary Shipper Packaging</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                Outer shippers (15kg – 50kg) for logistics, rail/road transit &amp; container export.
              </p>
              <div className="space-y-1 pt-1 font-mono text-[11px]">
                <div className="flex justify-between border-b pb-1 border-slate-100 dark:border-slate-800">
                  <span>Woven PP Bags</span>
                  <span className="font-bold text-blue-700 dark:text-blue-300">15kg, 25kg, 50kg</span>
                </div>
                <div className="flex justify-between border-b pb-1 border-slate-100 dark:border-slate-800">
                  <span>Food-Grade Jute Bags</span>
                  <span className="font-bold text-slate-900 dark:text-white">25kg export sacks</span>
                </div>
                <div className="flex justify-between border-b pb-1 border-slate-100 dark:border-slate-800">
                  <span>5-Ply Corrugated Boxes</span>
                  <span className="font-bold text-slate-900 dark:text-white">20kg, 25kg master cartons</span>
                </div>
                <div className="flex justify-between">
                  <span>Mixed / Assorted Shipper</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Institutional Multi-SKU Box</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Order Fulfillment Jobs List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Factory className="w-4 h-4 text-[#9E1C23] dark:text-amber-400" />
                <span>Active Customer Fulfillment Pipeline &amp; Floor Jobs</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">{floorJobs.length} Active Orders Staged</span>
            </div>

            {floorJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-2xl border p-4 sm:p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                {/* Top Row: Job Meta & Stage Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-[#9E1C23] dark:text-amber-400">{job.jobNo}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{job.customerName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-400">
                        {job.orderRef}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Target Product: <strong>{job.spiceName}</strong> (Total Target: {job.targetGrams / 1000} kg / {job.targetPacks.toLocaleString()} units)
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                        job.status === 'tertiary_boxed' || job.status === 'staged_for_dispatch'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                          : job.status === 'secondary_bundling'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {job.status === 'grinding_ready'
                        ? '1. Powder Grinding Ready'
                        : job.status === 'primary_packing'
                        ? '2. Primary Packing'
                        : job.status === 'secondary_bundling'
                        ? '3. Secondary Bundling'
                        : '4. Shipper Boxed (Dispatch Ready)'}
                    </span>

                    <button
                      onClick={() => {
                        setSelectedJobForProgress(job);
                        setShowLogProgressModal(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold text-xs transition shadow-sm active:scale-95"
                    >
                      + Log Shift Output
                    </button>
                  </div>
                </div>

                {/* Packaging Tier Badges Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Primary Pack Format</span>
                    <span className="font-semibold text-slate-900 dark:text-white capitalize">
                      {job.primaryTier.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Secondary Bundling</span>
                    <span className="font-semibold text-slate-900 dark:text-white capitalize">
                      {job.secondaryTier.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tertiary Outer Shipper</span>
                    <span className="font-semibold text-slate-900 dark:text-white capitalize">
                      {job.tertiaryTier.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Progress Bar & Fulfillment Deficit Tracking */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Fulfillment Progress: {job.packedUnitsCompleted.toLocaleString()} / {job.targetPacks.toLocaleString()} units completed ({job.fulfillmentPct}%)
                    </span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                      Remaining Deficit: {job.deficitUnits.toLocaleString()} units ({job.deficitGrams / 1000} kg)
                    </span>
                  </div>

                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div
                      style={{ width: `${job.fulfillmentPct}%` }}
                      className="bg-[#9E1C23] h-full transition-all duration-300 rounded-full"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Daily Quota Target: {job.dailyPackQuotaUnits.toLocaleString()} units/shift</span>
                    <span>
                      Est. Completion:{' '}
                      {job.deficitUnits > 0
                        ? `${Math.ceil(job.deficitUnits / job.dailyPackQuotaUnits)} more shift(s)`
                        : 'Fulfilled'}
                    </span>
                  </div>
                </div>

                {/* Backward & Forward Lot Traceability Chain */}
                <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-semibold text-[11px] uppercase">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Complete Backward &amp; Forward Lot Traceability Chain</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono pt-1">
                    <div>
                      <span className="text-slate-400 block text-[9.5px]">Supplier Spice Lot:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                        {job.lotTraceability.rawSpiceSupplierLot}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9.5px]">Grinding Batch #:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {job.lotTraceability.grindingBatchNo}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9.5px]">Primary Pack Lot:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {job.lotTraceability.primaryPackLotNo}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9.5px]">Shipper Box Barcodes:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate block">
                        {job.lotTraceability.tertiaryShipperBoxBarcodes.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shift Progress History (if any) */}
                {job.dailyProgressRecords.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                      Shift Production Output Log:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {job.dailyProgressRecords.map((prog, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-[11px]"
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span>{prog.date} ({prog.shift})</span>
                            <span className="text-emerald-600 font-mono font-bold">+{prog.packedUnits} units</span>
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5 flex justify-between">
                            <span>Sup: {prog.supervisor}</span>
                            <span>Spill: {(prog.spillWastageGrams / 1000).toFixed(2)}kg</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE BATCH WIZARD */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-4 sm:p-6 space-y-4 my-8 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#9E1C23]/10 text-[#9E1C23] dark:text-amber-400">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Create New Packing Batch (Step {newBatchStep} of 2)
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    BMR Issue &amp; Packaging Calibration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {newBatchStep === 1 ? (
              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Product Recipe / BOM *
                  </label>
                  <select
                    value={selectedRecipeId}
                    onChange={(e) => setSelectedRecipeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    {recipes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.finishedItemName} ({r.packSizeGrams}g, Target Yield {r.expectedYieldPct}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Raw Spice Lot from Store *
                  </label>
                  <select
                    value={selectedLotId}
                    onChange={(e) => setSelectedLotId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    {lots.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.lotNo} - {l.itemName} (Available: {formatGrams(l.qtyBase)}, ₹{l.landedCostPerKgPaise / 100}/kg)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Raw Powder Issue (Grams) *
                    </label>
                    <input
                      type="number"
                      step="500"
                      min="1000"
                      value={issuedGrams}
                      onChange={(e) => setIssuedGrams(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                    />
                    <span className="text-[11px] text-slate-500 mt-0.5 block">
                      = {(issuedGrams / 1000).toFixed(1)} kg
                    </span>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Finished Packs *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={targetPacks}
                      onChange={(e) => setTargetPacks(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewBatchStep(2)}
                    className="px-5 py-2 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold"
                  >
                    Next: Assign Floor &amp; Shift &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Working Shift *
                    </label>
                    <select
                      value={shift}
                      onChange={(e) => setShift(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      <option value="morning">Morning (08:00 - 16:30)</option>
                      <option value="evening">Evening (16:30 - 01:00)</option>
                      <option value="night">Night (01:00 - 08:00)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Packaging Machine *
                    </label>
                    <select
                      value={machineId}
                      onChange={(e) => setMachineId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    >
                      {db.getAssets().map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.serialNo})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Operators &amp; Line Helpers (comma-separated) *
                  </label>
                  <input
                    type="text"
                    value={workersText}
                    onChange={(e) => setWorkersText(e.target.value)}
                    placeholder="Ramesh Prajapati, Sunita Parmar"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="p-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs">
                  <strong>Batch Start Confirmation:</strong> This will issue {formatGrams(issuedGrams)} from raw lot immediately and mark production running on the shop floor.
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setNewBatchStep(1)}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    &larr; Back
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateBatch}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Launch Batch Live
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT BATCH */}
      {showEditBatchModal && selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-4 sm:p-6 space-y-4 my-8 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#9E1C23] dark:text-amber-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Edit Batch Record: {selectedBatch.batchNo}
                </h3>
              </div>
              <button
                onClick={() => setShowEditBatchModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditBatch} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={editBatchNo}
                    onChange={(e) => setEditBatchNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Batch Status *
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="planned">Planned</option>
                    <option value="running">Running</option>
                    <option value="completed">Completed</option>
                    <option value="closed">Closed / Locked</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Shift *
                  </label>
                  <select
                    value={editShift}
                    onChange={(e) => setEditShift(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="morning">Morning</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Machine Name
                  </label>
                  <input
                    type="text"
                    value={editMachineName}
                    onChange={(e) => setEditMachineName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Raw Issued (g)
                  </label>
                  <input
                    type="number"
                    value={editIssuedGrams}
                    onChange={(e) => setEditIssuedGrams(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Raw Returned (g)
                  </label>
                  <input
                    type="number"
                    value={editReturnedGrams}
                    onChange={(e) => setEditReturnedGrams(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Packs Produced
                  </label>
                  <input
                    type="number"
                    value={editPacksProduced}
                    onChange={(e) => setEditPacksProduced(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Workers &amp; Operators (comma-separated)
                </label>
                <input
                  type="text"
                  value={editWorkers}
                  onChange={(e) => setEditWorkers(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes &amp; Observations
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditBatchModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold shadow-sm"
                >
                  Save Batch Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RECIPE / BOM CREATE & EDIT */}
      {showRecipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-4 sm:p-6 space-y-4 my-8 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#9E1C23] dark:text-amber-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {editingRecipe ? 'Edit Recipe / BOM Formula' : 'Register New Recipe / BOM'}
                </h3>
              </div>
              <button
                onClick={() => setShowRecipeModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Finished Good Item *
                </label>
                <select
                  value={recipeFinishedItemId}
                  onChange={(e) => setRecipeFinishedItemId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  {items
                    .filter((i) => i.type === 'finished_good')
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.sku})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pack Size (g) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={recipePackSizeGrams}
                    onChange={(e) => setRecipePackSizeGrams(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Powder / Pack (g) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={recipePowderGrams}
                    onChange={(e) => setRecipePowderGrams(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Yield (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    step="0.1"
                    value={recipeYieldPct}
                    onChange={(e) => setRecipeYieldPct(parseFloat(e.target.value) || 98)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Packaging Material *
                </label>
                <select
                  value={recipePackingItemId}
                  onChange={(e) => setRecipePackingItemId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  {items
                    .filter((i) => i.type === 'packing_material')
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.sku})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  BOM Specifications &amp; Notes
                </label>
                <textarea
                  rows={2}
                  value={recipeNotes}
                  onChange={(e) => setRecipeNotes(e.target.value)}
                  placeholder="e.g. Standard line speed 45 cans/min with induction seal"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRecipeModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold shadow-sm"
                >
                  {editingRecipe ? 'Update Recipe Formula' : 'Save Recipe BOM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL 4: STAGE CUSTOMER PACKING JOB WIZARD */}
      {showNewJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-4 sm:p-6 space-y-4 my-8 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#9E1C23]/10 text-[#9E1C23] dark:text-amber-400">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    Stage Customer Packing Job
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    3-Tier Packaging Hierarchy &amp; Fulfillment Quota Calibration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNewJobModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFloorJob} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer / Institutional Buyer Name *
                </label>
                <input
                  type="text"
                  required
                  value={jobCustomerName}
                  onChange={(e) => setJobCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Customer PO / Order Ref *
                  </label>
                  <input
                    type="text"
                    required
                    value={jobOrderRef}
                    onChange={(e) => setJobOrderRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Order Target Volume (kg) *
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    required
                    value={jobTargetKg}
                    onChange={(e) => setJobTargetKg(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Spice Powder Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={jobSpiceName}
                  onChange={(e) => setJobSpiceName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              {/* 3-Tier Packaging Selections */}
              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 space-y-2.5">
                <span className="font-bold text-[11px] text-[#9E1C23] dark:text-amber-400 block uppercase">
                  3-Tier Packaging Architecture Specifications
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Tier 1: Primary Filling *
                    </label>
                    <select
                      value={jobPrimaryTier}
                      onChange={(e) => setJobPrimaryTier(e.target.value as PrimaryPackTier)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                    >
                      <option value="pouch_10rs">₹10 Pouch (18g-25g)</option>
                      <option value="pouch_50g">50g Consumer Pouch</option>
                      <option value="pouch_100g">100g Consumer Pouch</option>
                      <option value="pouch_200g">200g Consumer Pouch</option>
                      <option value="pouch_500g">500g Consumer Pouch</option>
                      <option value="bag_1kg">1 kg Consumer Bag</option>
                      <option value="bag_2kg">2 kg Consumer Bag</option>
                      <option value="bag_5kg">5 kg Consumer Bag</option>
                      <option value="bulk_10kg">10 kg Bulk PP Bag</option>
                      <option value="bulk_25kg">25 kg Bulk PP Bag</option>
                      <option value="bulk_50kg">50 kg Bulk PP Bag</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Tier 2: Bundling *
                    </label>
                    <select
                      value={jobSecondaryTier}
                      onChange={(e) => setJobSecondaryTier(e.target.value as SecondaryPackTier)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                    >
                      <option value="strip_10pcs">10 pcs Strip</option>
                      <option value="bundle_30pcs">3 Strips × 10 (30 pcs)</option>
                      <option value="pack_10pcs">10 pcs Pack (100g to 1kg)</option>
                      <option value="pack_5pcs">5 pcs Pack (200g to 1kg)</option>
                      <option value="pack_2pcs">2 pcs Pack (500g to 1kg)</option>
                      <option value="none_direct">None / Direct Shipper</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Tier 3: Outer Shipper *
                    </label>
                    <select
                      value={jobTertiaryTier}
                      onChange={(e) => setJobTertiaryTier(e.target.value as TertiaryShipperTier)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs"
                    >
                      <option value="box_20kg">20 kg Master Box (5-Ply)</option>
                      <option value="box_25kg">25 kg Master Box (5-Ply)</option>
                      <option value="box_custom">Custom Assorted Box</option>
                      <option value="pp_bag_15kg">15 kg Woven PP Bag</option>
                      <option value="pp_bag_25kg">25 kg Woven PP Bag</option>
                      <option value="pp_bag_50kg">50 kg Heavy PP Bag</option>
                      <option value="jute_bag_25kg">25 kg Food-Grade Jute</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Daily Floor Packing Quota (Units / Shift) *
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  required
                  value={jobDailyQuota}
                  onChange={(e) => setJobDailyQuota(Number(e.target.value) || 2500)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewJobModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold shadow-sm"
                >
                  Stage Fulfillment Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: LOG SHIFT PROGRESS */}
      {showLogProgressModal && selectedJobForProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-4 sm:p-6 space-y-4 my-8 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Log Shift Production Output
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {selectedJobForProgress.jobNo} · {selectedJobForProgress.customerName}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowLogProgressModal(false);
                  setSelectedJobForProgress(null);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogShiftProgress} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Volume:</span>
                  <span className="font-bold">{selectedJobForProgress.targetPacks.toLocaleString()} units ({selectedJobForProgress.targetGrams / 1000} kg)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Completed So Far:</span>
                  <span className="font-bold text-emerald-600">{selectedJobForProgress.packedUnitsCompleted.toLocaleString()} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Remaining Deficit:</span>
                  <span className="font-bold text-rose-600">{selectedJobForProgress.deficitUnits.toLocaleString()} units</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Operating Shift *
                  </label>
                  <select
                    value={logShift}
                    onChange={(e) => setLogShift(e.target.value as 'morning' | 'evening' | 'night')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="morning">Morning (08:00 - 16:30)</option>
                    <option value="evening">Evening (16:30 - 01:00)</option>
                    <option value="night">Night (01:00 - 08:00)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Floor Supervisor *
                  </label>
                  <input
                    type="text"
                    required
                    value={logSupervisor}
                    onChange={(e) => setLogSupervisor(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Units Packed this Shift *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={logUnits}
                    onChange={(e) => setLogUnits(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Spill / Wastage (Grams)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={logSpillWastageGrams}
                    onChange={(e) => setLogSpillWastageGrams(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowLogProgressModal(false);
                    setSelectedJobForProgress(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold shadow-sm"
                >
                  Confirm &amp; Update Fulfillment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
