"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUserSession } from '@/components/UserSessionContext';
import { useToast } from "@/components/ui/Toast";
import './configure.css';

// Formatter
const fmt = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const trn = (s: string, m: number) => s.length > m ? s.substring(0, m) + '\u2026' : s;

export default function ConfigureOrderPage() {
  const router = useRouter();
  const { user, selectedAccount } = useUserSession();
  const SF_ACCOUNT_ID = selectedAccount?.Id || selectedAccount?.id || "";
  const SF_CONTACT_ID = user?.Id || user?.contact?.Id || user?.contact?.id || "";

  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);

  const [lines, setLines] = useState<any[]>([]);
  const [catalog, setCatalog] = useState<any[]>([]);
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

  // DnD state refs (to avoid re-renders during drag)
  const dragSrcRef = useRef<{ type: string, id: string | number } | null>(null);
  const insertIdxRef = useRef<number>(-1);
  const [insertLineStyle, setInsertLineStyle] = useState<{ top: string, display: string }>({ top: '0', display: 'none' });

  // Load draft and catalog on mount
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

    if (SF_ACCOUNT_ID && SF_CONTACT_ID) {
      fetch(`/api/salesforce/orders?action=products&accountId=${encodeURIComponent(SF_ACCOUNT_ID)}&contactId=${encodeURIComponent(SF_CONTACT_ID)}`)
        .then(res => res.json())
        .then(data => {
          let items = Array.isArray(data) ? data : (data.data || []);
          const cat = items.map((p: any) => ({
            id: p.Id || p.id,
            sku: p.StockKeepingUnit || p.SKU || p.sku || p.Name,
            name: p.Name || p.name || 'Unnamed',
            desc: p.Description || p.description || '',
            mfr: p['Manufacturer_Name__r.Name'] || p.Manufacturer__c || p.Manufacturer_Name || p.Manufacturer_Name__c || 'Unknown',
            family: p.Family || p.productFamily || 'General',
            groupingLabel: p.Grouping__c || p.Product_Grouping__c || '',
            sell: p.List_Price__c || p.listPrice || p.Unit_Price__c || p.unitPrice || 0,
            avail: p.Available_To_Sell__c || p.availableQty || 10,
            moq: p.MOQ__c || p.moq || 1
          }));
          setCatalog(cat);
        })
        .catch(err => console.error(err));
    }
  }, [SF_ACCOUNT_ID, SF_CONTACT_ID]);

  // Save draft on lines change
  useEffect(() => {
    if (lines.length > 0) {
      localStorage.setItem('gth-configured-draft', JSON.stringify(lines));
    } else {
      localStorage.removeItem('gth-configured-draft');
    }
  }, [lines]);

  const reseq = (newLines: any[]) => {
    let s = 0;
    return newLines.map(l => {
      if (l.type === 'product') { s += 10; return { ...l, seq: s }; }
      else { return { ...l, seq: 0 }; }
    });
  };

  const calcTotals = () => {
    let ts = 0, pc = 0;
    lines.forEach(l => { if (l.type === 'product') { ts += l.sell * l.qty; pc++; } });
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
      id, productId: p.id, type: 'product', sku: p.sku, name: p.name, desc: p.desc, mfr: p.mfr, groupingLabel: p.groupingLabel,
      lv: 1, seq: 0, sell: p.sell, qty: p.moq || 1, pid: null, exp: true, dirty: true, sel: false
    };
  };

  const quickAddProduct = (p: any) => {
    const nl = makeLine(p);
    setLines(prev => reseq([...prev, nl]));
    setQuickAddQ('');
    setQuickAddOpen(false);
  };

  const addCat = (id: string) => {
    const p = catalog.find(x => x.id === id);
    if (p) quickAddProduct(p);
  };

  const selAll = (v: boolean) => setLines(prev => prev.map(l => ({ ...l, sel: v })));
  const rowSel = (id: number, v: boolean) => setLines(prev => prev.map(l => l.id === id ? { ...l, sel: v } : l));
  const toggleExp = (id: number) => setLines(prev => prev.map(l => l.id === id ? { ...l, exp: !l.exp } : l));
  const renameGrp = (id: number, name: string) => setLines(prev => prev.map(l => l.id === id ? { ...l, grpName: name.trim() || 'Untitled Group', dirty: true } : l));

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
    const id = nextId; setNextId(id + 1);
    const nl = { id, type: 'group', grpName: name, grpColor: color || 'gc-misc', lv: 1, seq: 0, pid: null, exp: true, dirty: true, sel: false, sku: '', name: '', desc: '', mfr: '', sell: 0, qty: 0 };
    setLines(prev => reseq([...prev, nl]));
    setGrpDDOpen(false);
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

  const execDrop = (at: number) => {
    const dragSrc = dragSrcRef.current;
    if (!dragSrc) return;

    if (dragSrc.type === 'cat') {
      const prod = catalog.find(p => p.id === dragSrc.id);
      if (!prod) return;
      const nl = {
        id: nextId, productId: prod.id, type: 'product', sku: prod.sku, name: prod.name, desc: prod.desc, mfr: prod.mfr, groupingLabel: prod.groupingLabel,
        lv: 1, seq: 0, sell: prod.sell, qty: prod.moq || 1, pid: null, exp: true, dirty: true, sel: false
      };
      setNextId(nextId + 1);

      setLines(prev => {
        const ctx = resolveParentInList(prev, at);
        nl.pid = ctx.pid; nl.lv = ctx.lv;
        let temp = [...prev];
        temp.splice(at, 0, nl);
        return reseq(temp);
      });
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
    dragSrcRef.current = null;
    insertIdxRef.current = -1;
    setInsertLineStyle({ top: '0', display: 'none' });
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
          Order_Qty__c: l.qty,
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

  return (
    <div className="configure-wrapper">
      <div className="configure-page" onClick={(e) => {
        // close dropdowns if clicked outside
        if (!(e.target as Element).closest('#quickAddWrap')) setQuickAddOpen(false);
        if (!(e.target as Element).closest('#grpWrap')) setGrpDDOpen(false);
      }}>


        <div className="pg-hdr">
          <div className="pg-hdr-left">
            <div className="pg-hdr-icon">
              <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V2m0 4a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V8m12 10a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <div className="pg-hdr-title">Configure Order</div>
              <div className="pg-hdr-sub">Build a hierarchical list of products</div>
            </div>
          </div>
          <div className="pg-hdr-actions flex items-center gap-3">
            <button
              className="px-4 py-2 !bg-gray-100 !text-gray-700 dark:!bg-gray-800 dark:!text-gray-300 rounded-lg hover:!bg-gray-200 dark:hover:!bg-gray-700 transition-colors flex items-center gap-2 truncate text-sm"
              onClick={() => { setLines([]); localStorage.removeItem('gth-configured-draft'); }}
            >
              Discard
            </button>
            <button
              className="px-4 py-2 !bg-primary !text-white rounded-lg hover:!bg-[#6B9DB8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 truncate text-sm"
              onClick={handleCreateOrder}
              disabled={loading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {loading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </div>

        <div className="summary-bar">
          <div className="sm-metrics">
            <div className="sm"><span className="sm-v">{productCount}</span><span className="sm-l">Lines</span></div>
            <div className="sm"><span className="sm-v green">{fmt(totalSell)}</span><span className="sm-l">Order Total</span></div>
          </div>
          <div className="tbar-r">
            <button className="configure-btn btn-bo" onClick={() => setPanelOpen(!panelOpen)}>{panelOpen ? 'Close Catalog' : 'Browse Catalog'}</button>
          </div>
        </div>

        <div className="content-body">
          <div className="table-area">
            <div className="tbar">
              <div className="tbar-l">
                <span className="tbar-title">Lines</span>
                <span className="pill">{lines.length}</span>
                <div className="sep"></div>
                <div className="tbar-search">
                  <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" placeholder="Search lines..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
                </div>
                <div className="quick-add" id="quickAddWrap">
                  <svg fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  <input type="text" placeholder="Quick add product..." value={quickAddQ} onChange={e => { setQuickAddQ(e.target.value); setQuickAddOpen(true); }} onClick={() => setQuickAddOpen(true)} />
                  {quickAddOpen && quickAddQ && (
                    <div className="quick-add-dd open">
                      {filteredQuickAdd.length > 0 ? filteredQuickAdd.map(p => (
                        <div key={p.id} className="qa-item" onClick={() => quickAddProduct(p)}>
                          <div className="qa-item-left">
                            <span className="qa-item-sku">{p.sku}</span>
                            <span className="qa-item-name">{p.name}</span>
                          </div>
                          <div className="qa-item-right">
                            <span className="qa-item-price">{fmt(p.sell)}</span>
                            <button className="qa-add-btn" title="Add to order">+</button>
                          </div>
                        </div>
                      )) : (
                        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>No matching products</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="tbar-r">
                <button className="configure-btn btn-n" disabled={selectedCount === 0} onClick={() => doIndent(-1)}>Outdent</button>
                <button className="configure-btn btn-n" disabled={selectedCount === 0} onClick={() => doIndent(1)}>Indent</button>
                <div className="sep"></div>
                <div className="grp-dd-wrap" id="grpWrap">
                  <button className="configure-btn btn-grp" onClick={() => setGrpDDOpen(!grpDDOpen)}>+ Add Group</button>
                  {grpDDOpen && (
                    <div className="grp-dd open">
                      <div className="grp-dd-title">Presets</div>
                      <div className="grp-dd-item" onClick={() => addGroup('AV Components', 'gc-av')}><span className="grp-dd-icon gc-av">AV</span> AV Components</div>
                      <div className="grp-dd-item" onClick={() => addGroup('Networking', 'gc-net')}><span className="grp-dd-icon gc-net">NW</span> Networking</div>
                      <div className="grp-dd-item" onClick={() => addGroup('Cables & Wiring', 'gc-cable')}><span className="grp-dd-icon gc-cable">CW</span> Cables & Wiring</div>
                      <div className="grp-dd-sep"></div>
                      <div className="grp-dd-title">Custom</div>
                      <div className="grp-dd-custom">
                        <input type="text" placeholder="Group name..." value={customGrpName} onChange={e => setCustomGrpName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGroup(customGrpName, 'gc-misc')} />
                        <button onClick={() => addGroup(customGrpName, 'gc-misc')}>Add</button>
                      </div>
                    </div>
                  )}
                </div>
                <button className="configure-btn btn-del" disabled={selectedCount === 0} onClick={delSelected}>Remove</button>
              </div>
            </div>

            <div className="tscroll"
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
                  // default to append if dragging over empty space
                  insertIdxRef.current = lines.length;
                }
              }}
            >
              <div className="insert-line" style={insertLineStyle}></div>
              <table className="configure-table" style={{ display: lines.length ? '' : 'none' }}>
                <colgroup>
                  <col className="cc" /><col className="cd" /><col className="cl" /><col className="cs" />
                  <col className="cpn" /><col className="cdd" /><col className="cm" />
                  <col className="csp" /><col className="cq" /><col className="cep" /><col className="ca" />
                </colgroup>
                <thead>
                  <tr>
                    <th className="c"><input type="checkbox" checked={lines.length > 0 && lines.every(l => l.sel)} onChange={e => selAll(e.target.checked)} /></th>
                    <th></th>
                    <th>Level</th>
                    <th className="c">Seq</th>
                    <th>Product / Sku</th>
                    <th>Description</th>
                    <th>Manufacturer</th>
                    <th className="r">Sell Price</th>
                    <th className="r">Qty</th>
                    <th className="r">Ext. Price</th>
                    <th className="c"></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l, idx) => {
                    const hidden = isHidden(l);
                    const hasKids = lines.some(c => c.pid === l.id);
                    if (hidden) return null;

                    const q = searchQ.trim().toLowerCase();
                    if (q && l.type === 'product' && !l.name.toLowerCase().includes(q) && !l.sku.toLowerCase().includes(q) && !l.desc.toLowerCase().includes(q) && !l.mfr.toLowerCase().includes(q)) {
                      return null; // hide non-matching
                    }

                    if (l.type === 'group') {
                      let s = { ts: 0, n: 0 };
                      lines.forEach(c => { if (c.pid === l.id && c.type === 'product') { s.ts += c.sell * c.qty; s.n++; } });
                      const abbr = l.grpName.split(/[\s&]+/).map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();

                      return (
                        <tr key={l.id} draggable className={`grp-row ${l.sel ? 'sel' : ''}`} onDragStart={e => startDrag(e, 'row', l.id)} onDragOver={e => onDragOverRow(e, idx)} onDrop={e => { e.preventDefault(); e.stopPropagation(); execDrop(insertIdxRef.current); }}>
                          <td className="c"><input type="checkbox" checked={l.sel} onChange={e => rowSel(l.id, e.target.checked)} /></td>
                          <td><div className="grip">&#9776;</div></td>
                          <td colSpan={3} style={{ paddingLeft: '4px' }}>
                            {hasKids ? <button className={`exp-btn ${l.exp ? '' : 'shut'}`} onClick={() => toggleExp(l.id)}>&#9660;</button> : <span className="exp-ph"></span>}
                            <span className={`grp-icon ${l.grpColor}`}>{abbr}</span>
                            <input className="grp-name" value={l.grpName} onChange={e => setLines(prev => prev.map(x => x.id === l.id ? { ...x, grpName: e.target.value } : x))} style={{ border: 'none', background: 'transparent' }} />
                            <span className="grp-meta">{s.n} item{s.n !== 1 ? 's' : ''}</span>
                          </td>
                          <td colSpan={4}></td>
                          <td className="r"><span className="grp-subtotal">{fmt(s.ts)}</span></td>
                          <td className="c"><button className="x-btn" onClick={() => delLine(l.id)}>&#10005;</button></td>
                        </tr>
                      );
                    } else {
                      const indent = (l.lv - 1) * 18;
                      const lvCls = 'lv' + Math.min(l.lv - 1, 3);
                      return (
                        <tr key={l.id} draggable className={l.sel ? 'sel' : ''} onDragStart={e => startDrag(e, 'row', l.id)} onDragOver={e => onDragOverRow(e, idx)} onDrop={e => { e.preventDefault(); e.stopPropagation(); execDrop(insertIdxRef.current); }}>
                          <td className="c"><input type="checkbox" checked={l.sel} onChange={e => rowSel(l.id, e.target.checked)} /></td>
                          <td><div className="grip">&#9776;</div></td>
                          <td className="c">
                            <div className="lvl-wrap">
                              <span className="lvl-indent" style={{ width: indent }}></span>
                              {hasKids ? <button className={`exp-btn ${l.exp ? '' : 'shut'}`} onClick={() => toggleExp(l.id)}>&#9660;</button> : <span className="exp-ph"></span>}
                              <span className={`lvl-badge ${lvCls}`}>{l.lv}</span>
                            </div>
                          </td>
                          <td className="c" style={{ color: 'var(--text-dim)' }}>{l.seq}</td>
                          <td><a className="prod-lk" title={`${l.sku} - ${l.name}`}>{l.name}</a></td>
                          <td><span className="trunc" style={{ color: 'var(--text-muted)' }} title={l.desc}>{l.desc}</span></td>
                          <td><span className="trunc" title={l.mfr}>{trn(l.mfr, 18)}</span></td>
                          <td className="r" style={{ color: 'var(--text-secondary)' }}>
                            {fmt(l.sell)}
                          </td>
                          <td className="r">
                            <input 
                              type="text" 
                              value={l.qty} 
                              readOnly 
                              className="w-[60px] text-right py-1 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md !bg-gray-50 dark:!bg-gray-800 text-gray-900 dark:text-white cursor-default focus:outline-none"
                            />
                          </td>
                          <td className="r" style={{ fontWeight: 600, color: 'var(--green)' }}>{fmt(l.sell * l.qty)}</td>
                          <td className="c"><button className="x-btn" onClick={() => delLine(l.id)}>&#10005;</button></td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={7}></td>
                    <td className="tot-label">Order Total</td>
                    <td colSpan={2} className="tot-val">{fmt(totalSell)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
              {!lines.length && (
                <div className="empty vis">
                  <div className="empty-icon">&#128193;</div>
                  <div className="empty-t">No lines in configuration</div>
                  <div className="empty-d">Search to add products or drag them from the catalog.</div>
                </div>
              )}
            </div>
          </div>

          <div className={`panel ${panelOpen ? 'open' : ''}`}>
            <div className="panel-inner">
              <div className="p-hdr">
                <div className="p-hdr-l">
                  <div className="p-hdr-t">Product Catalog</div>
                  <div className="p-badge">{filteredCatalog.length}/{catalog.length}</div>
                </div>
                <button className="p-close" onClick={() => setPanelOpen(false)}>&#10005;</button>
              </div>
              <div className="p-search">
                <input type="search" placeholder="Search catalog..." value={catQ} onChange={e => setCatQ(e.target.value)} />
                <div className="p-filters">
                  <select value={fMfr} onChange={e => setFMfr(e.target.value)}>
                    <option value="">All Manufacturers</option>
                    {mfrs.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={fFamily} onChange={e => setFFamily(e.target.value)}>
                    <option value="">All Families</option>
                    {fams.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div className="cat-scroll">
                {filteredCatalog.length > 0 ? filteredCatalog.map(p => {
                  let av = { text: p.avail + ' avail', cls: 'in' };
                  if (p.avail < 0) av = { text: 'Unlimited', cls: 'unl' };
                  else if (p.avail === 0) av = { text: '0 avail', cls: 'out' };

                  return (
                    <div key={p.id} className="ci" draggable onDragStart={e => startDrag(e, 'cat', p.id)}>
                      <div className="ci-grip">&#9776;</div>
                      <div className="ci-body">
                        <div className="ci-top">
                          <span className="ci-sku">{p.sku}</span><span className="ci-dot">&middot;</span><span className="ci-name" title={p.name}>{p.name}</span>
                        </div>
                        <div className="ci-bottom">
                          <span className="ci-f"><b>{trn(p.mfr, 16)}</b></span>
                          <span className="ci-f">Sell <span className="price">{fmt(p.sell)}</span></span>
                          <span className="ci-f"><span className={`ci-avail ${av.cls}`}>{av.text}</span></span>
                        </div>
                      </div>
                      <button className="ci-add" onClick={() => addCat(p.id)} title="Add to order">&#43;</button>
                    </div>
                  );
                }) : (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>
                    <div style={{ fontSize: '28px', opacity: 0.2, marginBottom: '8px' }}>&#128270;</div>
                    No matches
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
