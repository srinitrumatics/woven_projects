"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import algoliasearch from 'algoliasearch';
import { useUserSession } from '@/components/UserSessionContext';
import { useToast } from "@/components/ui/Toast";
import { Table, THead, TBody, Th, Td, TableEmptyState } from "@/components/ui/DataTable";

// Formatter
const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const trn = (s: string, m: number) => s.length > m ? s.substring(0, m) + '…' : s;

// MOQ helpers — Order Qty is the actual order quantity in units, defaulting to and never below MOQ.
const resolveMoq = (product: any): number => {
  const n = Number(product?.moq);
  return Number.isFinite(n) && n > 0 ? n : 1;
};
const safeOrderQty = (line: any): number => {
  const n = Number(line?.orderQty);
  return Number.isFinite(n) && n > 0 ? n : 1;
};

// Unwraps the (loosely-shaped) Salesforce product/details Apex response into a single product record.
const unwrapProductDetails = (sfResult: any): any | null => {
  if (!sfResult) return null;
  if (sfResult.data) {
    const firstData = Array.isArray(sfResult.data) ? sfResult.data[0] : sfResult.data;
    if (firstData?.Product && Array.isArray(firstData.Product) && firstData.Product.length > 0) {
      return firstData.Product[0];
    }
    return firstData ?? null;
  }
  if (sfResult.product) {
    return Array.isArray(sfResult.product) ? sfResult.product[0] : sfResult.product;
  }
  if (sfResult.Id) return sfResult;
  return null;
};

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || "",
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || ""
);

export default function ConfigureOrderClientPage({ indexName }: { indexName: string }) {
  const router = useRouter();
  const { user, selectedAccount } = useUserSession();
  const SF_ACCOUNT_ID = selectedAccount?.Id || selectedAccount?.id || "";
  const SF_CONTACT_ID = user?.Id || user?.contact?.Id || user?.contact?.id || "";

  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);

  const [lines, setLines] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
  const [nextId, setNextId] = useState(1000);

  const [panelOpen, setPanelOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [quickAddQ, setQuickAddQ] = useState('');
  const [catQ, setCatQ] = useState('');
  const [fMfr, setFMfr] = useState('');
  const [fFamily, setFFamily] = useState('');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [grpDDOpen, setGrpDDOpen] = useState(false);
  const [customGrpName, setCustomGrpName] = useState('');
  const [grpLabels, setGrpLabels] = useState<string[]>([]);
  const [grpSearch, setGrpSearch] = useState<string>('');
  const [grpNameError, setGrpNameError] = useState(false);

  // DnD state refs (to avoid re-renders during drag)
  const dragSrcRef = useRef<{ type: string, id: string | number } | null>(null);
  const insertIdxRef = useRef<number>(-1);
  const [insertLineStyle, setInsertLineStyle] = useState<{ top: string, display: string }>({ top: '0', display: 'none' });

  const index = useMemo(() => searchClient.initIndex(indexName), [indexName]);

  // Load draft on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem('gth-configured-draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed && parsed.length > 0) {
          setLines(parsed);
          const maxId = Math.max(...parsed.map((l: any) => l.id), 1000);
          setNextId(maxId + 1);
        }
      }
    } catch (e) { }
  }, []);

  // Load Browse Catalog list from the Algolia search index (replaces the old bulk Salesforce catalog fetch).
  // One-shot, broad fetch to keep the existing client-side filtering (filteredCatalog/quickAddResults) unchanged.
  useEffect(() => {
    let cancelled = false;
    index.search('', { hitsPerPage: 1000 })
      .then(({ hits }) => {
        if (cancelled) return;
        const cat = (hits || []).map((h: any) => ({
          id: h.objectID,
          sku: h.sku || h.productcode || h.name || '',
          name: h.name || '-',
          desc: h.description || '',
          mfr: h.manufacturer || '-',
          brand: h.brandName || '-',
          family: h.family || h.category || 'General',
          groupingLabel: h.groupingLabel || '',
          sell: h.price ?? 0,
          avail: h.available_quantity ?? h.gtherp__available_quantity__c ?? h.stock_quantity ?? 0,
        }));
        setCatalog(cat);
      })
      .catch(err => {
        console.error('Error fetching catalog from Algolia:', err);
        if (!cancelled) setCatalog([]);
      });
    return () => { cancelled = true; };
  }, [index]);

  // Save draft on lines change
  useEffect(() => {
    if (lines.length > 0) {
      localStorage.setItem('gth-configured-draft', JSON.stringify(lines));
    } else {
      localStorage.removeItem('gth-configured-draft');
    }
  }, [lines]);

  // Load Product_Grouping__c picklist values for the "+ Add Group" dropdown
  useEffect(() => {
    if (!SF_ACCOUNT_ID || !SF_CONTACT_ID) return;
    async function loadPicklists() {
      try {
        const res = await fetch(`/api/salesforce/picklists?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}`);
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data && result.data.length > 0) {
            const picklistData = result.data[0];
            if (picklistData.Product_Grouping__c) {
              const raw: any[] = picklistData.Product_Grouping__c;
              const normalized = raw.map((item: any) =>
                typeof item === 'object' && item !== null
                  ? (item.value ?? item.label ?? String(item))
                  : String(item)
              ).filter(Boolean);
              setGrpLabels(normalized);
            }
          }
        }
      } catch (e) {
        console.error("Error loading picklists:", e);
      }
    }
    loadPicklists();
  }, [SF_ACCOUNT_ID, SF_CONTACT_ID]);

  useEffect(() => { if (!grpDDOpen) setGrpSearch(''); }, [grpDDOpen]);

  const reseq = (newLines: any[]) => {
    let s = 0;
    return newLines.map(l => {
      if (l.type === 'product') { s += 10; return { ...l, seq: s }; }
      else { return { ...l, seq: 0 }; }
    });
  };

  const calcTotals = () => {
    let ts = 0, pc = 0;
    lines.forEach(l => { if (l.type === 'product') { ts += l.sell * safeOrderQty(l); pc++; } });
    return { ts, pc };
  };
  const { ts: totalSell, pc: productCount } = calcTotals();
  const selectedCount = lines.filter(l => l.sel).length;

  const isHidden = (l: any) => {
    let c = l;
    while (c.pid !== null) {
      const p = lines.find(x => x.id === c.pid);
      if (!p) break;
      if (!p.exp) return true;
      c = p;
    }
    return false;
  };

  const makeLine = (p: any) => {
    const id = nextId; setNextId(id + 1);
    return {
      id: id, productId: p.id, type: 'product', sku: p.sku, name: p.name, desc: p.desc, mfr: p.mfr, brand: p.brand, groupingLabel: p.groupingLabel,
      lv: 1, seq: 0, sell: p.sell, orderQty: resolveMoq(p), moq: p.moq, avail: p.avail, pid: null, exp: true, dirty: true, sel: false
    };
  };

  // Looks up a product's current qty/MOQ/price from Salesforce (never from the Algolia-sourced catalog record) —
  // the search index isn't treated as authoritative for order-line fields.
  const fetchProductDetails = async (productId: string): Promise<{ moq: number; sell: number | null; avail: number | null } | null> => {
    if (!SF_ACCOUNT_ID || !SF_CONTACT_ID) return null;
    try {
      const res = await fetch(`/api/salesforce/product-details?accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}&productId=${encodeURIComponent(productId)}&tabName=product`);
      if (!res.ok) return null;
      const sfResult = await res.json();
      const p = unwrapProductDetails(sfResult);
      if (!p) return null;
      return {
        moq: resolveMoq({ moq: p.MOQ__c ?? p.moq }),
        sell: p.UnitPrice ?? p.Unit_Price__c ?? p.unitPrice ?? null,
        avail: p.Available_To_Sell__c ?? p.availableQty ?? null,
      };
    } catch (e) {
      console.error('Error fetching product details for add:', e);
      return null;
    }
  };

  // Adds a catalog item to the end of the Lines table, after resolving its qty/MOQ from Salesforce.
  const addProductFromCatalog = async (prod: any) => {
    if (addingIds.has(prod.id)) return;
    setAddingIds(prev => new Set(prev).add(prod.id));
    try {
      const details = await fetchProductDetails(prod.id);
      if (!details) {
        toastError(`Unable to add ${prod.name || prod.sku}: product details unavailable`);
        return;
      }
      const enriched = { ...prod, moq: details.moq, sell: details.sell ?? prod.sell, avail: details.avail ?? prod.avail };
      const nl = makeLine(enriched);
      setLines(prev => reseq([...prev, nl]));
      setQuickAddQ('');
      setQuickAddOpen(false);
    } finally {
      setAddingIds(prev => { const next = new Set(prev); next.delete(prod.id); return next; });
    }
  };

  const addCat = (id: string) => {
    const p = catalog.find(x => x.id === id);
    if (p) addProductFromCatalog(p);
  };

  const selAll = (v: boolean) => setLines(prev => prev.map(l => ({ ...l, sel: v })));
  const rowSel = (id: number, v: boolean) => setLines(prev => prev.map(l => l.id === id ? { ...l, sel: v } : l));
  const toggleExp = (id: number) => setLines(prev => prev.map(l => l.id === id ? { ...l, exp: !l.exp } : l));
  const renameGrp = (id: number, name: string) => setLines(prev => prev.map(l => l.id === id ? { ...l, grpName: name.trim() || 'Untitled Group', dirty: true } : l));

  const bumpQty = (id: number, direction: 1 | -1) => setLines(prev => prev.map(l => {
    if (l.id !== id || l.type !== 'product') return l;
    const moq = resolveMoq(l);
    return { ...l, orderQty: Math.max(moq, safeOrderQty(l) + direction * moq), dirty: true };
  }));

  const setOrderQty = (id: number, raw: string) => {
    if (raw !== '' && !/^[0-9]+$/.test(raw)) return;
    setLines(prev => prev.map(l =>
      l.id === id ? { ...l, orderQty: raw === '' ? '' : Number(raw), dirty: true } : l
    ));
  };

  const commitOrderQty = (id: number) => setLines(prev => prev.map(l =>
    l.id === id ? { ...l, orderQty: Math.max(resolveMoq(l), Math.round(safeOrderQty(l))) } : l
  ));

  const rmTree = (id: number, currentLines: any[]) => {
    let toRemove = new Set([id]);
    let changed = true;
    while (changed) {
      changed = false;
      currentLines.forEach(l => {
        if (l.pid && toRemove.has(l.pid) && !toRemove.has(l.id)) {
          toRemove.add(l.id);
          changed = true;
        }
      });
    }
    return currentLines.filter(l => !toRemove.has(l.id));
  };

  const delLine = (id: number) => setLines(prev => reseq(rmTree(id, prev)));
  const delSelected = () => {
    setLines(prev => {
      let temp = [...prev];
      prev.filter(l => l.sel).forEach(l => temp = rmTree(l.id, temp));
      return reseq(temp);
    });
  };

  const addGroup = (name: string, color: string) => {
    if (!name || !name.trim()) {
      setGrpNameError(true);
      toastError('Please enter a group name');
      return;
    }
    setGrpNameError(false);
    const id = nextId; setNextId(id + 1);
    const nl = { id, type: 'group', grpName: name, grpColor: color || 'gc-misc', lv: 1, seq: 0, pid: null, exp: true, dirty: true, sel: false, sku: '', name: '', desc: '', mfr: '', brand: '', sell: 0, qty: 0 };
    setLines(prev => reseq([...prev, nl]));
    setGrpDDOpen(false);
    setCustomGrpName('');
  };

  const shiftKids = (pid: number, d: number, curLines: any[]) => {
    curLines.filter(l => l.pid === pid).forEach(c => {
      c.lv += d;
      shiftKids(c.id, d, curLines);
    });
  };

  const doIndent = (dir: number) => {
    setLines(prev => {
      let temp = JSON.parse(JSON.stringify(prev)); // Deep copy to mutate safely
      temp.filter((l: any) => l.sel && l.type === 'product').forEach((l: any) => {
        if (dir > 0) {
          const idx = temp.findIndex((x: any) => x.id === l.id);
          let prevRow = null;
          for (let i = idx - 1; i >= 0; i--) {
            if (temp[i].lv === l.lv && temp[i].pid === l.pid) { prevRow = temp[i]; break; }
            if (temp[i].lv < l.lv) break;
          }
          if (prevRow) {
            l.lv++; l.pid = prevRow.id; prevRow.exp = true;
            shiftKids(l.id, 1, temp);
          }
        } else {
          if (l.lv <= 1) return;
          const par = temp.find((p: any) => p.id === l.pid);
          if (par) {
            l.lv--; l.pid = par.pid;
            shiftKids(l.id, -1, temp);
          }
        }
      });
      return reseq(temp);
    });
  };

  // DnD Logic
  const startDrag = (e: React.DragEvent, type: string, id: string | number) => {
    dragSrcRef.current = { type, id };
    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.setData('text/plain', type + ':' + id);
    // Let CSS handle visual state, or we can force it here
  };

  const resolveParentInList = (list: any[], at: number) => {
    for (let i = at - 1; i >= 0; i--) {
      if (list[i].type === 'group' && list[i].lv === 1) {
        let j = i + 1;
        while (j < list.length && list[j].lv > list[i].lv) j++;
        if (at <= j) return { pid: list[i].id, lv: list[i].lv + 1 };
      }
      if (list[i].type === 'product' && list[i].pid !== null) return { pid: list[i].pid, lv: list[i].lv };
    }
    return { pid: null, lv: 1 };
  };

  const collectTree = (rid: number, list: any[]) => {
    const root = list.find(l => l.id === rid);
    if (!root) return [];
    const res = [root];
    const ri = list.indexOf(root);
    for (let i = ri + 1; i < list.length; i++) {
      if (list[i].lv > root.lv) res.push(list[i]);
      else break;
    }
    return res;
  };

  // Adds a catalog item at a specific drop position, after resolving its qty/MOQ from Salesforce.
  const addProductFromCatalogAt = async (prod: any, at: number) => {
    if (addingIds.has(prod.id)) return;
    setAddingIds(prev => new Set(prev).add(prod.id));
    try {
      const details = await fetchProductDetails(prod.id);
      if (!details) {
        toastError(`Unable to add ${prod.name || prod.sku}: product details unavailable`);
        return;
      }
      const enriched = { ...prod, moq: details.moq, sell: details.sell ?? prod.sell, avail: details.avail ?? prod.avail };
      const id = nextId; setNextId(id + 1);
      const nl: any = {
        id: id, productId: enriched.id, type: 'product', sku: enriched.sku, name: enriched.name, desc: enriched.desc, mfr: enriched.mfr, brand: enriched.brand, groupingLabel: enriched.groupingLabel,
        lv: 1, seq: 0, sell: enriched.sell, orderQty: resolveMoq(enriched), moq: enriched.moq, avail: enriched.avail, pid: null, exp: true, dirty: true, sel: false
      };
      setLines(prev => {
        const ctx = resolveParentInList(prev, at);
        nl.pid = ctx.pid; nl.lv = ctx.lv;
        let temp = [...prev];
        temp.splice(at, 0, nl);
        return reseq(temp);
      });
    } finally {
      setAddingIds(prev => { const next = new Set(prev); next.delete(prod.id); return next; });
    }
  };

  const execDrop = (at: number) => {
    const dragSrc = dragSrcRef.current;
    if (!dragSrc) return;

    dragSrcRef.current = null;
    insertIdxRef.current = -1;
    setInsertLineStyle({ top: '0', display: 'none' });

    if (dragSrc.type === 'cat') {
      const prod = catalog.find(p => p.id === dragSrc.id);
      if (!prod) return;
      addProductFromCatalogAt(prod, at);
    } else {
      setLines(prev => {
        const src = prev.find(l => l.id === dragSrc.id);
        if (!src) return prev;
        const subtree = collectTree(src.id as number, prev);
        const filtered = prev.filter(l => !subtree.includes(l));
        let tgt = at - subtree.filter(l => prev.indexOf(l) < at).length;
        tgt = Math.max(0, Math.min(tgt, filtered.length));
        const ctx = resolveParentInList(filtered, tgt);
        const delta = ctx.lv - src.lv;
        subtree.forEach(l => l.lv += delta);
        src.pid = ctx.pid;
        filtered.splice(tgt, 0, ...subtree);
        return reseq(filtered);
      });
    }
  };

  const onDragOverRow = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (!dragSrcRef.current) return;
    e.dataTransfer.dropEffect = dragSrcRef.current.type === 'cat' ? 'copy' : 'move';
    const tr = e.currentTarget as HTMLElement;
    const rect = tr.getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    insertIdxRef.current = e.clientY < mid ? idx : idx + 1;

    const tbody = tr.closest('tbody');
    if (tbody) {
      const rows = Array.from(tbody.querySelectorAll('tr:not(.child-hidden)'));
      const tscroll = document.querySelector('.tscroll');
      if (tscroll) {
        const sr = tscroll.getBoundingClientRect();
        let y = 0;
        if (insertIdxRef.current <= 0 && rows[0]) {
          y = rows[0].getBoundingClientRect().top - sr.top + tscroll.scrollTop - 1;
        } else if (insertIdxRef.current >= lines.length && rows[rows.length - 1]) {
          y = rows[rows.length - 1].getBoundingClientRect().bottom - sr.top + tscroll.scrollTop - 1;
        } else {
          const ref = rows[insertIdxRef.current - 1];
          if (ref) {
            y = ref.getBoundingClientRect().bottom - sr.top + tscroll.scrollTop - 1;
          }
        }
        setInsertLineStyle({ top: y + 'px', display: 'block' });
      }
    }
  };

  const handleCreateOrder = async () => {
    if (productCount === 0) {
      toastError('Please add at least one product');
      return;
    }

    try {
      setLoading(true);

      // Create base order
      const orderPayload = {
        accountId: SF_ACCOUNT_ID,
        contactId: SF_CONTACT_ID,
        Proposal_Requested__c: false,
        Transfer_Order__c: false
      };

      const orderRes = await fetch('/api/salesforce/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order');
      }

      const orderResult = await orderRes.json();
      let newOrderId = null;
      if (orderResult.data && Array.isArray(orderResult.data) && orderResult.data.length > 0) {
        newOrderId = orderResult.data[0].Id;
      } else {
        newOrderId = orderResult.orderId || orderResult.Id || orderResult.id;
      }

      if (!newOrderId) throw new Error('No order ID returned from API');

      // Add order lines
      const productsOnly = lines.filter(l => l.type === 'product');
      if (productsOnly.length > 0) {
        const orderLines = productsOnly.map(l => ({
          Status__c: 'Draft',
          Product_Name__c: l.productId || l.id,
          Order_Qty__c: safeOrderQty(l) / resolveMoq(l),
          MOQ__c: resolveMoq(l),
          Unit_Price__c: l.sell,
          Inventory_Account__c: SF_ACCOUNT_ID,
          IsTaxable__c: true
        }));

        const linesPayload = {
          order: {
            Id: newOrderId,
            Status__c: 'Draft',
            Bill_to_Account__c: SF_ACCOUNT_ID,
            Ship_to_Account__c: SF_ACCOUNT_ID,
            Inventory_Account__c: SF_ACCOUNT_ID
          },
          orderLines,
          accountId: SF_ACCOUNT_ID,
          contactId: SF_CONTACT_ID,
          isDraft: true
        };

        const linesRes = await fetch(`/api/salesforce/orders?orderId=${newOrderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(linesPayload)
        });

        if (!linesRes.ok) {
          throw new Error('Failed to add products to order');
        }
      }

      success('Order created successfully!');

      // Clear configuration
      setLines([]);
      localStorage.removeItem('gth-configured-draft');
      localStorage.removeItem('gth-configured-order');

      router.push('/orders/' + newOrderId);

    } catch (err: any) {
      console.error(err);
      toastError(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  // Filtered lists
  const filteredQuickAdd = useMemo(() => {
    const q = quickAddQ.toLowerCase();
    if (!q) return [];
    return catalog.filter(p => p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.mfr.toLowerCase().includes(q)).slice(0, 8);
  }, [quickAddQ, catalog]);

  const filteredCatalog = useMemo(() => {
    const q = catQ.toLowerCase();
    return catalog.filter(p =>
      (!q || p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q) || p.mfr.toLowerCase().includes(q)) &&
      (!fMfr || p.mfr === fMfr) &&
      (!fFamily || p.family === fFamily)
    );
  }, [catalog, catQ, fMfr, fFamily]);

  const mfrs = useMemo(() => [...new Set(catalog.map(p => p.mfr))].sort(), [catalog]);
  const fams = useMemo(() => [...new Set(catalog.map(p => p.family))].sort(), [catalog]);
  const filteredGrpLabels = useMemo(
    () => grpLabels.filter(l => l.toLowerCase().includes(grpSearch.toLowerCase())),
    [grpLabels, grpSearch]
  );

  return (
    <div onClick={(e) => {
      // close dropdowns if clicked outside
      if (!(e.target as Element).closest('#quickAddWrap')) setQuickAddOpen(false);
      if (!(e.target as Element).closest('#grpWrap')) setGrpDDOpen(false);
    }} className="flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configure Order</h1>
          <p className="text-gray-600 dark:text-gray-400 text-base mt-1 truncate" title="Build a hierarchical list of products">Build a hierarchical list of products</p>
        </div>
        <div className="flex items-center gap-3 min-w-0">
          <button
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 truncate"
            onClick={() => { setLines([]); localStorage.removeItem('gth-configured-draft'); }}
          >
            Discard
          </button>
          <button
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 truncate"
            onClick={handleCreateOrder}
            disabled={loading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {loading ? 'Creating...' : 'Create Order'}
          </button>
        </div>
      </div>

      {/* Stats Cards - New Design matching Orders Page */}
      {/* Combined Stats Card */}
      <div className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 mb-6">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-emerald-500"></div>
        <div className="flex flex-col md:flex-row p-4">
          {/* Lines Stat */}
          <div className="flex-1 flex items-center gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-0.5 truncate" title="Lines">Total Products</p>
              <div className="text-3xl font-bold text-gray-900 dark:text-white truncate leading-none">{productCount}</div>
            </div>
          </div>

          {/* Order Total Stat */}
          <div className="flex-1 flex items-center justify-end gap-4 mt-4 md:mt-0">
            <div className="text-right">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-0.5 truncate" title="Order Total">Order Total</p>
              <div className="text-3xl font-bold text-gray-900 dark:text-white truncate leading-none">{fmt(totalSell)}</div>
            </div>
            <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 h-[600px]">
        {/* Table Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-sm text-gray-900 dark:text-white">Lines</span>
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs py-0.5 px-2 rounded-full font-medium">{lines.length}</span>
              <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" placeholder="Search lines..." value={searchQ} onChange={e => setSearchQ(e.target.value)} className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary w-40 focus:w-48 transition-all" />
              </div>
              <div className="relative" id="quickAddWrap">
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <input type="text" placeholder="Quick add product..." value={quickAddQ} onChange={e => { setQuickAddQ(e.target.value); setQuickAddOpen(true); }} onClick={() => setQuickAddOpen(true)} className="pl-9 pr-4 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 w-48 focus:w-56 transition-all" />
                {quickAddOpen && quickAddQ && (
                  <div className="absolute top-full left-0 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                    {filteredQuickAdd.length > 0 ? filteredQuickAdd.map(p => (
                      <div key={p.id} className={`p-2 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex justify-between items-center transition-colors ${addingIds.has(p.id) ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`} onClick={() => !addingIds.has(p.id) && addProductFromCatalog(p)}>
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">{p.sku}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-semibold text-green-600 dark:text-green-400">{fmt(p.sell)}</span>
                          <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 dark:border-gray-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors" disabled={addingIds.has(p.id)}>+</button>
                        </div>
                      </div>
                    )) : (
                      <div className="p-4 text-center text-xs text-gray-500">No matching products</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm" disabled={selectedCount === 0} onClick={() => doIndent(-1)}>Outdent</button>
              <button className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm" disabled={selectedCount === 0} onClick={() => doIndent(1)}>Indent</button>
              <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1"></div>
              <div className="relative" id="grpWrap">
                <button className="px-3 py-1.5 text-sm bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors shadow-sm" onClick={() => setGrpDDOpen(!grpDDOpen)}>+ Add Group</button>
                {grpDDOpen && (
                  <div className="absolute top-full right-0 mt-1 w-70 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    {grpLabels.length > 0 && (
                      <>
                        <div className="px-3 py-2 text-xs font-bold text-gray-500 tracking-wider bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700">Product Groups</div>
                        <input
                          type="text"
                          autoFocus
                          placeholder="Search groups..."
                          value={grpSearch}
                          onChange={e => setGrpSearch(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 placeholder-gray-400 focus:outline-none"
                        />
                        <div className="max-h-[180px] overflow-y-auto">
                          {filteredGrpLabels.length > 0
                            ? filteredGrpLabels.map(label => (
                              <div key={label} className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer" onClick={() => addGroup(label, 'bg-gray-500')}>{label}</div>
                            ))
                            : grpSearch
                              ? <div className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500 italic">No results</div>
                              : null
                          }
                        </div>
                      </>
                    )}
                    <div className="px-3 py-2 text-xs font-bold text-gray-500 tracking-wider bg-gray-50 dark:bg-gray-800/80 border-y border-gray-100 dark:border-gray-700 mt-1">Custom</div>
                    <div className="p-2 flex gap-2">
                      <input type="text" placeholder="Group name..." value={customGrpName}
                        onChange={e => { setCustomGrpName(e.target.value); setGrpNameError(false); }}
                        onKeyDown={e => e.key === 'Enter' && addGroup(customGrpName, 'bg-gray-500')}
                        className={`flex-1 min-w-0 px-3 h-7 text-sm border rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:border-purple-500 transition-colors ${grpNameError ? 'border-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-600'}`} />
                      <button onClick={() => addGroup(customGrpName, 'bg-gray-500')} className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700">Add</button>
                    </div>
                  </div>
                )}
              </div>
              <button className="px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm" disabled={selectedCount === 0} onClick={delSelected}>Remove</button>
              <button className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors shadow-sm ml-2" onClick={() => setPanelOpen(!panelOpen)}>{panelOpen ? 'Close Catalog' : 'Browse Catalog'}</button>
            </div>
          </div>

          <div className="flex-1 overflow-auto relative"
            onDragLeave={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
                setInsertLineStyle({ top: '0', display: 'none' });
                insertIdxRef.current = -1;
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (insertIdxRef.current >= 0) execDrop(insertIdxRef.current);
            }}
            onDragOver={e => {
              e.preventDefault();
              if (insertIdxRef.current === -1) {
                insertIdxRef.current = lines.length;
              }
            }}
          >
            <div className="absolute left-0 right-0 h-0.5 bg-blue-500 pointer-events-none z-50 transition-all duration-75" style={insertLineStyle}></div>
            {lines.length === 0 ? (
              <TableEmptyState
                message="No lines in configuration"
                description="Search to add products or drag them from the catalog."
              />
            ) : (
            <Table className="text-left border-collapse min-w-[800px]">
              <THead className="text-gray-900 dark:text-white sticky top-0 z-10">
                <tr>
                  <Th className="w-10 text-center"><input type="checkbox" checked={lines.length > 0 && lines.every(l => l.sel)} onChange={e => selAll(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" /></Th>
                  <Th className="px-1 w-8"></Th>
                  <Th className="whitespace-nowrap">Level</Th>
                  <Th className="whitespace-nowrap">Seq</Th>
                  <Th className="whitespace-nowrap">Product Name</Th>
                  <Th className="whitespace-nowrap">Description</Th>
                  <Th className="whitespace-nowrap">Brand Name</Th>
                  <Th className="text-right whitespace-nowrap">Sell Price</Th>
                  <Th className="text-center whitespace-nowrap w-28">Order Qty</Th>
                  <Th className="text-center whitespace-nowrap">MOQ</Th>
                  <Th className="text-right whitespace-nowrap">Total Price</Th>
                  <Th className="w-10"></Th>
                </tr>
              </THead>
              <TBody>
                {lines.map((l, idx) => {
                  const hidden = isHidden(l);
                  const hasKids = lines.some(c => c.pid === l.id);
                  if (hidden) return null;

                  const q = searchQ.trim().toLowerCase();
                  if (q && l.type === 'product' && !l.name.toLowerCase().includes(q) && !l.sku.toLowerCase().includes(q) && !l.desc.toLowerCase().includes(q) && !l.mfr.toLowerCase().includes(q)) {
                    return null;
                  }

                  if (l.type === 'group') {
                    let s = { ts: 0, n: 0 };
                    lines.forEach(c => { if (c.pid === l.id && c.type === 'product') { s.ts += c.sell * safeOrderQty(c); s.n++; } });
                    const abbr = l.grpName.split(/[\s&]+/).map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();

                    return (
                      <tr key={l.id} draggable className={`border-b border-gray-200 dark:border-gray-700 bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors ${l.sel ? 'bg-indigo-100/50 dark:bg-indigo-900/30' : ''}`} onDragStart={(e: any) => startDrag(e, 'row', l.id)} onDragOver={(e: any) => onDragOverRow(e, idx)} onDrop={(e: any) => { e.preventDefault(); e.stopPropagation(); execDrop(insertIdxRef.current); }}>
                        <Td className="px-3 py-2 text-center"><input type="checkbox" checked={l.sel} onChange={e => rowSel(l.id, e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" /></Td>
                        <Td className="px-1 py-2 cursor-grab text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-center">&#9776;</Td>
                        <Td colSpan={3} className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {hasKids ? <button className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-transform" onClick={() => toggleExp(l.id)} style={{ transform: l.exp ? 'rotate(0)' : 'rotate(-90deg)' }}>&#9660;</button> : <span className="w-5 inline-block"></span>}
                            <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${l.grpColor}`}>{abbr}</span>
                            <input className="font-bold text-sm bg-transparent border border-transparent hover:border-gray-300 focus:border-purple-500 focus:bg-white dark:focus:bg-gray-800 rounded px-1 py-0.5 outline-none transition-colors w-48 text-gray-900 dark:text-white" value={l.grpName} onChange={e => setLines(prev => prev.map(x => x.id === l.id ? { ...x, grpName: e.target.value } : x))} />
                            <span className="text-xs text-gray-500 dark:text-gray-400">{s.n} item{s.n !== 1 ? 's' : ''}</span>
                          </div>
                        </Td>
                        <Td colSpan={5}></Td>
                        <Td className="px-3 py-2 text-right font-bold text-indigo-600 dark:text-indigo-400 text-sm">{fmt(s.ts)}</Td>
                        <Td className="px-3 py-2 text-center"><button className="text-gray-400 hover:text-red-500 transition-colors" onClick={() => delLine(l.id)}>&#10005;</button></Td>
                      </tr>
                    );
                  } else {
                    const indent = (l.lv - 1) * 20;
                    const lvColors = ['bg-gray-200 text-gray-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700'];
                    const lvCls = lvColors[Math.min(l.lv - 1, 3)];
                    const lineMoq = resolveMoq(l);
                    const orderQty = safeOrderQty(l);
                    const totalPrice = orderQty * l.sell;
                    const atFloor = orderQty <= lineMoq;
                    return (
                      <tr key={l.id} draggable className={`border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${l.sel ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`} onDragStart={(e: any) => startDrag(e, 'row', l.id)} onDragOver={(e: any) => onDragOverRow(e, idx)} onDrop={(e: any) => { e.preventDefault(); e.stopPropagation(); execDrop(insertIdxRef.current); }}>
                        <Td className="px-3 py-2 text-center"><input type="checkbox" checked={l.sel} onChange={e => rowSel(l.id, e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" /></Td>
                        <Td className="px-1 py-2 cursor-grab text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 text-center">&#9776;</Td>
                        <Td className="px-3 py-2">
                          <div className="flex items-center" style={{ paddingLeft: `${indent}px` }}>
                            {hasKids ? <button className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-transform" onClick={() => toggleExp(l.id)} style={{ transform: l.exp ? 'rotate(0)' : 'rotate(-90deg)' }}>&#9660;</button> : <span className="w-5 inline-block"></span>}
                            <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-bold ${lvCls}`}>{l.lv}</span>
                          </div>
                        </Td>
                        <Td className="px-3 py-2 text-sm text-gray-500">{l.seq}</Td>
                        <Td className="px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate max-w-[200px]" title={`${l.sku} - ${l.name}`}>{l.name}</Td>
                        <Td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px]" title={l.desc}>{l.desc}</Td>
                        <Td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{l.brand || '-'}</Td>
                        <Td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 text-right">{fmt(l.sell)}</Td>
                        <Td className="px-3 py-2 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => bumpQty(l.id, -1)}
                                disabled={atFloor}
                                aria-label="Decrease order quantity"
                                className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded border shadow-sm transition-colors text-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-gray-700"
                              >
                                &#8722;
                              </button>
                              <input
                                type="text"
                                value={l.orderQty}
                                onChange={e => setOrderQty(l.id, e.target.value)}
                                onBlur={() => commitOrderQty(l.id)}
                                aria-label="Order quantity"
                                className="w-16 px-1 py-0.5 text-sm border border-gray-300 dark:border-gray-600 rounded text-center text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent"
                              />
                              <button
                                type="button"
                                onClick={() => bumpQty(l.id, 1)}
                                aria-label="Increase order quantity"
                                className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded border shadow-sm transition-colors text-lg bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                              >
                                &#43;
                              </button>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">MOQ: {lineMoq} / Avail: {l.avail ?? 0}</div>
                          </div>
                        </Td>
                        <Td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 text-center">{lineMoq}</Td>
                        <Td className="px-3 py-2 text-sm font-semibold text-green-600 dark:text-green-400 text-right">{fmt(totalPrice)}</Td>
                        <Td className="px-3 py-2 text-center"><button className="text-gray-400 hover:text-red-500 transition-colors" onClick={() => delLine(l.id)}>&#10005;</button></Td>
                      </tr>
                    );
                  }
                })}
              </TBody>
              <tfoot className="bg-gray-50 dark:bg-gray-800/80 border-t-2 border-gray-200 dark:border-gray-700">
                <tr>
                  <Td colSpan={8}></Td>
                  <Td colSpan={3} className="px-3 py-3 text-right text-sm font-bold text-gray-700 dark:text-gray-300  tracking-wider">Order Total</Td>
                  <Td className="px-3 py-3 text-right text-lg font-bold text-green-600 dark:text-green-400">{fmt(totalSell)}</Td>
                  <Td></Td>
                </tr>
              </tfoot>
            </Table>
            )}
          </div>
        </div>

        {/* Panel Area (Catalog) */}
        {panelOpen && (
          <div className="w-80 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0 animate-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-900 dark:text-white">Product Catalog</span>
                <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-1.5 py-0.5 rounded-full font-bold">{filteredCatalog.length}/{catalog.length}</span>
              </div>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" onClick={() => setPanelOpen(false)}>&#10005;</button>
            </div>
            <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex flex-col gap-2">
              <input type="search" placeholder="Search catalog..." value={catQ} onChange={e => setCatQ(e.target.value)} className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary" />
              <div className="flex gap-2">
                <select value={fMfr} onChange={e => setFMfr(e.target.value)} className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="">All Mfrs</option>
                  {mfrs.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={fFamily} onChange={e => setFFamily(e.target.value)} className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary">
                  <option value="">All Families</option>
                  {fams.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {filteredCatalog.length > 0 ? filteredCatalog.map(p => {
                let av = { text: p.avail + ' avail', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
                if (p.avail < 0) av = { text: 'Unlimited', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
                else if (p.avail === 0) av = { text: '0 avail', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
                const isAdding = addingIds.has(p.id);

                return (
                  <div key={p.id} className={`p-2.5 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 shadow-sm transition-all flex gap-2 group ${isAdding ? 'opacity-50 cursor-wait' : 'cursor-grab'}`} draggable={!isAdding} onDragStart={e => startDrag(e, 'cat', p.id)}>
                    <div className="text-gray-300 group-hover:text-gray-400 mt-1">&#9776;</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs text-gray-700 dark:text-gray-300 truncate" title={p.name}>{p.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-600 dark:text-gray-400 truncate max-w-[80px]">{trn(p.brand, 16)}</span>
                        <span className="text-gray-500">Sell <span className="font-bold text-gray-900 dark:text-white">{fmt(p.sell)}</span></span>
                        <span className={`px-1.5 py-0.5 rounded font-medium ${av.cls}`}>{av.text}</span>
                      </div>
                    </div>
                    <button className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded border border-gray-200 dark:border-gray-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors self-center disabled:opacity-40 disabled:cursor-wait" onClick={() => addCat(p.id)} disabled={isAdding} title="Add to order">&#43;</button>
                  </div>
                );
              }) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                  <div className="text-3xl mb-2 opacity-30">&#128270;</div>
                  <div className="text-sm">No matches found</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

}
