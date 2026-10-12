import React, { useState } from 'react';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  AlertTriangle,
  Search,
  Plus,
  Send,
  CheckCircle,
  Truck,
  Building,
  Edit,
  Trash2,
  PackagePlus,
  X,
} from 'lucide-react';
import { db } from '../../lib/storage';
import { InventoryItem, StockLot, StockMovement } from '../../types';
import { formatINR, formatGrams, formatQty, formatDate } from '../../lib/format';

export const InventoryModule: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>(db.getItems());
  const [lots, setLots] = useState<StockLot[]>(db.getLots());
  const [movements, setMovements] = useState<StockMovement[]>(db.getMovements());

  const [activeTab, setActiveTab] = useState<'items' | 'lots' | 'movements' | 'third_party'>('items');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Item Modal (Create / Edit)
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [itemSku, setItemSku] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState<InventoryItem['type']>('raw_material');
  const [itemUnit, setItemUnit] = useState('kg');
  const [itemCurrentStock, setItemCurrentStock] = useState(100);
  const [itemReorderLevel, setItemReorderLevel] = useState(50);
  const [itemCostRupees, setItemCostRupees] = useState(180);
  const [itemMrpRupees, setItemMrpRupees] = useState(45);
  const [itemCategory, setItemCategory] = useState('Raw Spice Powder');

  // Lot Modal (Create & Edit Lot)
  const [showLotModal, setShowLotModal] = useState(false);
  const [editingLot, setEditingLot] = useState<StockLot | null>(null);
  const [lotNo, setLotNo] = useState('');
  const [lotItemId, setLotItemId] = useState(items[0]?.id || '');
  const [lotSupplierName, setLotSupplierName] = useState('Unjha Mandi Spice Traders');
  const [lotSupplierLotNo, setLotSupplierLotNo] = useState('');
  const [lotQtyKg, setLotQtyKg] = useState(250);
  const [lotCostPerKgRupees, setLotCostPerKgRupees] = useState(180);
  const [lotExpiryDate, setLotExpiryDate] = useState('2027-10-01');
  const [lotStatus, setLotStatus] = useState<StockLot['status']>('available');

  // 3rd Party Packer Transfer Modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferLotId, setTransferLotId] = useState(lots[0]?.id || '');
  const [transferKg, setTransferKg] = useState(50);

  const reload = () => {
    setItems(db.getItems());
    setLots(db.getLots());
    setMovements(db.getMovements());
  };

  // Open Create Item Modal
  const handleOpenCreateItem = () => {
    setEditingItem(null);
    setItemSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    setItemName('');
    setItemType('raw_material');
    setItemUnit('kg');
    setItemCurrentStock(100);
    setItemReorderLevel(50);
    setItemCostRupees(180);
    setItemMrpRupees(45);
    setItemCategory('Raw Spice Powder');
    setShowItemModal(true);
  };

  // Open Edit Item Modal
  const handleOpenEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setItemSku(item.sku);
    setItemName(item.name);
    setItemType(item.type);
    setItemUnit(item.unit);
    setItemCurrentStock(
      item.type === 'raw_material' ? item.currentStockBase / 1000 : item.currentStockBase
    );
    setItemReorderLevel(
      item.type === 'raw_material' ? item.reorderLevelBase / 1000 : item.reorderLevelBase
    );
    setItemCostRupees(
      item.type === 'raw_material' ? (item.averageCostPaise * 1000) / 100 : item.averageCostPaise / 100
    );
    setItemMrpRupees(item.mrpPaise ? item.mrpPaise / 100 : 0);
    setItemCategory(item.category);
    setShowItemModal(true);
  };

  // Save Item (Create or Update)
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    const currentStockBase =
      itemType === 'raw_material' ? itemCurrentStock * 1000 : itemCurrentStock;
    const reorderLevelBase =
      itemType === 'raw_material' ? itemReorderLevel * 1000 : itemReorderLevel;
    const averageCostPaise =
      itemType === 'raw_material'
        ? Math.round((itemCostRupees * 100) / 1000)
        : Math.round(itemCostRupees * 100);

    const itemData: InventoryItem = {
      id: editingItem ? editingItem.id : `item_${Date.now()}`,
      sku: itemSku,
      name: itemName,
      type: itemType,
      unit: itemUnit,
      baseUnit: itemType === 'raw_material' ? 'g' : 'pcs',
      currentStockBase,
      reorderLevelBase,
      averageCostPaise,
      mrpPaise: itemMrpRupees ? Math.round(itemMrpRupees * 100) : undefined,
      category: itemCategory,
    };

    if (editingItem) {
      db.updateItem(itemData);
    } else {
      db.addItem(itemData);
    }

    setShowItemModal(false);
    reload();
  };

  // Delete Item
  const handleDeleteItem = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete SKU "${name}"?`)) {
      db.deleteItem(id);
      reload();
    }
  };

  // Open Create Inward Lot Modal
  const handleOpenCreateLot = () => {
    setEditingLot(null);
    setLotNo(`LOT-${Date.now().toString().slice(-6)}`);
    setLotItemId(items.find((i) => i.type === 'raw_material')?.id || items[0]?.id || '');
    setLotSupplierName('Unjha Mandi Spice Traders');
    setLotSupplierLotNo(`SUP-${Math.floor(100 + Math.random() * 900)}`);
    setLotQtyKg(200);
    setLotCostPerKgRupees(180);
    setLotExpiryDate('2027-10-01');
    setLotStatus('available');
    setShowLotModal(true);
  };

  // Open Edit Lot Modal
  const handleOpenEditLot = (lot: StockLot) => {
    setEditingLot(lot);
    setLotNo(lot.lotNo);
    setLotItemId(lot.itemId);
    setLotSupplierName(lot.supplierName || '');
    setLotSupplierLotNo(lot.supplierLotNo || '');
    setLotQtyKg(Math.round((lot.qtyBase / 1000) * 10) / 10);
    setLotCostPerKgRupees(Math.round(lot.landedCostPerKgPaise / 100));
    setLotExpiryDate(lot.expiryOn);
    setLotStatus(lot.status);
    setShowLotModal(true);
  };

  // Save Lot (Create or Edit)
  const handleSaveLot = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedItem = items.find((i) => i.id === lotItemId) || items[0];
    const qtyGrams = lotQtyKg * 1000;

    if (editingLot) {
      const updatedLot: StockLot = {
        ...editingLot,
        lotNo,
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        supplierLotNo: lotSupplierLotNo,
        supplierName: lotSupplierName,
        expiryOn: lotExpiryDate,
        qtyBase: qtyGrams,
        landedCostPerKgPaise: Math.round(lotCostPerKgRupees * 100),
        status: lotStatus,
      };
      db.updateLot(updatedLot);
    } else {
      const newLot: StockLot = {
        id: `lot_${Date.now()}`,
        lotNo,
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        supplierLotNo: lotSupplierLotNo,
        supplierName: lotSupplierName,
        receivedOn: new Date().toISOString().split('T')[0],
        expiryOn: lotExpiryDate,
        qtyBase: qtyGrams,
        landedCostPerKgPaise: Math.round(lotCostPerKgRupees * 100),
        status: lotStatus,
        locationId: 'loc_raw',
      };

      db.addLot(newLot);

      // Record Inward Movement
      db.addMovement({
        id: `mov_in_${Date.now()}`,
        date: newLot.receivedOn,
        time: new Date().toLocaleTimeString(),
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        lotId: newLot.id,
        lotNo: newLot.lotNo,
        locationId: 'loc_raw',
        locationName: 'Raw Powder Store',
        qtyBase: qtyGrams,
        type: 'receipt',
        reference: `INWARD-${newLot.lotNo}`,
        unitCostPaise: Math.round(lotCostPerKgRupees * 100) / 1000,
        notes: `Inward raw powder from ${lotSupplierName}`,
      });

      // Update item current stock
      const updatedItems = items.map((i) => {
        if (i.id === selectedItem.id) {
          return { ...i, currentStockBase: i.currentStockBase + qtyGrams };
        }
        return i;
      });
      db.saveItems(updatedItems);
    }

    setShowLotModal(false);
    reload();
  };

  // Delete Lot
  const handleDeleteLot = (id: string, lotNum: string) => {
    if (confirm(`Are you sure you want to archive / delete lot "${lotNum}"?`)) {
      db.deleteLot(id);
      reload();
    }
  };

  // Delete Movement
  const handleDeleteMovement = (id: string) => {
    if (confirm('Are you sure you want to void / delete this stock movement entry?')) {
      db.deleteMovement(id);
      reload();
    }
  };

  const handleThirdPartyTransfer = () => {
    const lot = lots.find((l) => l.id === transferLotId) || lots[0];
    const grams = transferKg * 1000;

    db.addMovement({
      id: `mov_trf_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(),
      itemId: lot.itemId,
      itemName: lot.itemName,
      lotId: lot.id,
      lotNo: lot.lotNo,
      locationId: 'loc_packer',
      locationName: 'Mahavir Packaging (Sanand)',
      qtyBase: grams,
      type: 'transfer',
      reference: `DC-SANAND-${Math.floor(100 + Math.random() * 900)}`,
      unitCostPaise: Math.round(lot.landedCostPerKgPaise / 1000),
      notes: `Dispatch of ${transferKg}kg raw powder to 3rd party packer for ₹10 strip sachets`,
    });

    const updatedLots = lots.map((l) => {
      if (l.id === lot.id) {
        return { ...l, qtyBase: Math.max(0, l.qtyBase - grams) };
      }
      return l;
    });
    db.saveLots(updatedLots);

    setShowTransferModal(false);
    reload();
  };

  const filteredItems = items.filter((i) => {
    if (filterType !== 'all' && i.type !== filterType) return false;
    if (
      searchQuery &&
      !i.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !i.sku.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9E1C23] dark:text-amber-400">
            <span>Module M3</span>
            <span>·</span>
            <span>Adalaj Warehouse &amp; Stock Ledger</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Inventory &amp; Lot Traceability
          </h2>
          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
            Raw spice powders, printed cylinders, metallized strip rolls, and third-party packer balance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenCreateItem}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold text-xs transition shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add SKU</span>
          </button>
          <button
            onClick={handleOpenCreateLot}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-sm active:scale-95"
          >
            <PackagePlus className="w-4 h-4" />
            <span>+ Inward Lot</span>
          </button>
          <button
            onClick={() => setShowTransferModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs transition shadow-sm"
          >
            <Truck className="w-4 h-4 text-[#9E1C23] dark:text-amber-400" />
            <span>Transfer to Packer</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-xs shadow-sm">
        <div className="flex items-center gap-1 p-1 rounded-lg border bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
              activeTab === 'items'
                ? 'bg-[#9E1C23] text-white'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            All SKUs ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('lots')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
              activeTab === 'lots'
                ? 'bg-[#9E1C23] text-white'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Active Lots ({lots.length})
          </button>
          <button
            onClick={() => setActiveTab('third_party')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
              activeTab === 'third_party'
                ? 'bg-[#9E1C23] text-white'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            3rd-Party Packer
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
              activeTab === 'movements'
                ? 'bg-[#9E1C23] text-white'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Movements Log ({movements.length})
          </button>
        </div>

        {activeTab === 'items' && (
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="raw_material">Raw Spice Powders</option>
            <option value="packing_material">Packing Materials</option>
            <option value="finished_good">Finished Goods</option>
          </select>
        )}
      </div>

      {/* Tab 1: Items Table with Edit & Delete */}
      {activeTab === 'items' && (
        <div className="rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-3 border-b bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Master Item Catalog with Reorder Levels
            </span>
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SKU or name..."
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#9E1C23]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Current Stock</th>
                  <th className="py-2.5 px-3 text-right">Reorder Level</th>
                  <th className="py-2.5 px-3 text-right">Avg Unit Cost</th>
                  <th className="py-2.5 px-3 text-right">Valuation</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredItems.map((item) => {
                  const isLow = item.currentStockBase <= item.reorderLevelBase;
                  const totalValuation = item.currentStockBase * item.averageCostPaise;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#9E1C23] dark:text-amber-400">
                        {item.sku}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                        {item.name}
                        {isLow && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-rose-700 dark:text-rose-300 font-bold bg-rose-100 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-300 dark:border-rose-800">
                            Low Stock
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 capitalize font-medium">
                        {item.type.replace('_', ' ')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {item.type === 'raw_material'
                          ? formatGrams(item.currentStockBase)
                          : formatQty(item.currentStockBase, item.unit)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                        {item.type === 'raw_material'
                          ? formatGrams(item.reorderLevelBase)
                          : formatQty(item.reorderLevelBase, item.unit)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-800 dark:text-slate-200 font-medium">
                        {item.type === 'raw_material'
                          ? `${formatINR(item.averageCostPaise * 1000)}/kg`
                          : formatINR(item.averageCostPaise, true)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {formatINR(totalValuation)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditItem(item)}
                            title="Edit Item"
                            className="p-1 rounded text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            title="Delete Item"
                            className="p-1 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Tab 2: Stock Lots with Actions */}
      {activeTab === 'lots' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {lots.map((lot) => (
            <div
              key={lot.id}
              className="rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 p-4 space-y-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#9E1C23] dark:text-amber-400 font-mono text-sm">
                  {lot.lotNo}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                    {lot.status.toUpperCase()}
                  </span>
                  <button
                    onClick={() => handleOpenEditLot(lot)}
                    className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition"
                    title="Edit Lot"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteLot(lot.id, lot.lotNo)}
                    className="p-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition"
                    title="Archive Lot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">{lot.itemName}</div>
              <div className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Supplier:</span>
                  <strong className="text-slate-900 dark:text-slate-100 truncate max-w-[170px]">
                    {lot.supplierName}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Available Qty:</span>
                  <strong className="text-slate-900 dark:text-white font-mono">
                    {formatGrams(lot.qtyBase)}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Landed Rate:</span>
                  <strong className="text-[#9E1C23] dark:text-amber-300 font-mono">
                    {formatINR(lot.landedCostPerKgPaise)}/kg
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Received On:</span>
                  <span className="text-slate-900 dark:text-slate-200">{formatDate(lot.receivedOn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Expiry Date:</span>
                  <span className="text-slate-900 dark:text-slate-200">{formatDate(lot.expiryOn)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Third Party Packer */}
      {activeTab === 'third_party' && (
        <div className="rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 p-4 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#9E1C23] dark:text-sky-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Mahavir Packaging (Sanand Hub)
                </h3>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                Third-party contract packer for ₹10 strip sachets until own high-speed VFFS machine is commissioned.
              </p>
            </div>
            <button
              onClick={() => setShowTransferModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold text-xs transition"
            >
              + Transfer Raw Material
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 text-[11px] block font-medium">
                Current Powder at Packer
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">100.00 kg</span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-0.5">
                Red Chilli Powder (LOT-MRC-SANAND-1)
              </span>
            </div>
            <div className="p-3.5 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 text-[11px] block font-medium">
                Expected ₹10 Sachet Yield
              </span>
              <span className="text-lg font-bold text-[#9E1C23] dark:text-amber-400 font-mono">
                5,416 packs
              </span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-0.5">
                At 18g/sachet with 2.5% loss tolerance
              </span>
            </div>
            <div className="p-3.5 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800">
              <span className="text-slate-600 dark:text-slate-400 text-[11px] block font-medium">
                Contract Job Work Rate
              </span>
              <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                ₹0.70 / pack
              </span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-0.5">
                Includes nitrogen flush &amp; packing
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg border bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-950 dark:text-amber-300 text-xs font-medium">
            <strong>Business Rule BR-07:</strong> Raw spice powder held at Mahavir Packaging remains on your legal balance sheet until converted into finished goods. Any shortage exceeding 2.5% tolerance will generate an automatic debit note against the packer's billing.
          </div>
        </div>
      )}

      {/* Tab 4: Movements Log */}
      {activeTab === 'movements' && (
        <div className="rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-3 border-b bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200">
            Append-Only Stock Movements Ledger
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-300 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Date/Time</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Item</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3 text-right">Quantity</th>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Notes</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {movements.map((mov) => {
                  const isPositive = mov.qtyBase > 0;
                  return (
                    <tr key={mov.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {formatDate(mov.date)} {mov.time}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                          {mov.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{mov.itemName}</td>
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">{mov.locationName}</td>
                      <td
                        className={`py-2.5 px-3 text-right font-mono font-bold ${
                          isPositive
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {Math.abs(mov.qtyBase) >= 1000 ? formatGrams(mov.qtyBase) : `${mov.qtyBase} pcs`}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-[#9E1C23] dark:text-amber-300">
                        {mov.reference}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                        {mov.notes || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleDeleteMovement(mov.id)}
                          className="p-1 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition"
                          title="Void / Delete Movement Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Item Modal (Create & Edit) */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 p-5 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Inventory Item SKU' : 'Add New Inventory Item SKU'}
              </h3>
              <button
                onClick={() => setShowItemModal(false)}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    SKU Code
                  </label>
                  <input
                    type="text"
                    required
                    value={itemSku}
                    onChange={(e) => setItemSku(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold focus:border-[#9E1C23]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Category
                  </label>
                  <select
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value as any)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="raw_material">Raw Spice Powder</option>
                    <option value="packing_material">Packing Material (Can/Foil)</option>
                    <option value="finished_good">Finished Goods Pack</option>
                    <option value="consumable">Consumable &amp; Spares</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Kashmiri Chilli Powder Special"
                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-[#9E1C23]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Unit
                  </label>
                  <select
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="kg">kg</option>
                    <option value="pcs">pcs</option>
                    <option value="box">box</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Opening Stock ({itemUnit})
                  </label>
                  <input
                    type="number"
                    value={itemCurrentStock}
                    onChange={(e) => setItemCurrentStock(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Reorder Alert ({itemUnit})
                  </label>
                  <input
                    type="number"
                    value={itemReorderLevel}
                    onChange={(e) => setItemReorderLevel(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Unit Cost (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemCostRupees}
                    onChange={(e) => setItemCostRupees(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Retail MRP (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemMrpRupees}
                    onChange={(e) => setItemMrpRupees(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="w-1/3 py-2.5 rounded-lg border bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold transition shadow-sm"
                >
                  {editingItem ? 'Save SKU Changes' : 'Create Inventory SKU'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inward Lot Modal */}
      {showLotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 p-5 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingLot ? `Edit Powder Lot (${editingLot.lotNo})` : 'Record Inward Powder Lot (GRN)'}
              </h3>
              <button
                onClick={() => setShowLotModal(false)}
                className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLot} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Internal Lot Number
                  </label>
                  <input
                    type="text"
                    required
                    value={lotNo}
                    onChange={(e) => setLotNo(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Select Raw Spice Item
                  </label>
                  <select
                    value={lotItemId}
                    onChange={(e) => setLotItemId(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  >
                    {items
                      .filter((i) => i.type === 'raw_material')
                      .map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Supplier Name
                  </label>
                  <input
                    type="text"
                    required
                    value={lotSupplierName}
                    onChange={(e) => setLotSupplierName(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Supplier Lot / Batch #
                  </label>
                  <input
                    type="text"
                    value={lotSupplierLotNo}
                    onChange={(e) => setLotSupplierLotNo(e.target.value)}
                    placeholder="e.g. UNJ-APMC-771"
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Received Qty (kg)
                  </label>
                  <input
                    type="number"
                    required
                    value={lotQtyKg}
                    onChange={(e) => setLotQtyKg(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Landed Rate (₹/kg)
                  </label>
                  <input
                    type="number"
                    required
                    value={lotCostPerKgRupees}
                    onChange={(e) => setLotCostPerKgRupees(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    value={lotExpiryDate}
                    onChange={(e) => setLotExpiryDate(e.target.value)}
                    className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Lot Status / Inspection Sign-off
                </label>
                <select
                  value={lotStatus}
                  onChange={(e) => setLotStatus(e.target.value as any)}
                  className="w-full p-2 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold"
                >
                  <option value="available">Available (Quality Approved)</option>
                  <option value="hold">Hold (Under Lab/QC Quarantine)</option>
                  <option value="exhausted">Exhausted (Nil Balance)</option>
                  <option value="rejected">Rejected (Failed Moisture/Purity)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLotModal(false)}
                  className="w-1/3 py-2.5 rounded-lg border bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold transition shadow-sm"
                >
                  {editingLot ? 'Save Lot Changes' : 'Inward Lot & Post Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer to Packer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 p-5 shadow-2xl text-slate-900 dark:text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#9E1C23] dark:text-amber-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Transfer Powder to Mahavir Packaging
                </h3>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Select Raw Powder Lot
                </label>
                <select
                  value={transferLotId}
                  onChange={(e) => setTransferLotId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium"
                >
                  {lots.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.lotNo} · {l.itemName} ({formatGrams(l.qtyBase)} avail)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Quantity to Dispatch (Kilograms)
                </label>
                <input
                  type="number"
                  value={transferKg}
                  onChange={(e) => setTransferKg(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono font-bold"
                />
              </div>

              <div className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300">
                Destination: <strong>Mahavir Packaging &amp; Job Works (Sanand GIDC)</strong>.<br />
                Delivery Challan (DC) will be automatically generated with GPS timestamp.
              </div>

              <button
                type="button"
                onClick={handleThirdPartyTransfer}
                className="w-full py-2.5 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold text-xs transition shadow-sm"
              >
                Confirm Dispatch &amp; Log Movement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
