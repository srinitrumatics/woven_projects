import re

with open('/media/trumatics/New Volume/wovn/woven_projects-main/app/configure/page.tsx', 'r') as f:
    content = f.read()

# We want to replace the return statement with standard Tailwind classes.
# But it's 300 lines long, so we can just provide the new return statement.

new_return = """  return (
    <div onClick={(e) => {
      // close dropdowns if clicked outside
      if (!(e.target as Element).closest('#quickAddWrap')) setQuickAddOpen(false);
      if (!(e.target as Element).closest('#grpWrap')) setGrpDDOpen(false);
    }} className="flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configure Order</h1>
          <p className="text-gray-600 dark:text-gray-400 text-[16px] mt-1 truncate" title="Build a hierarchical list of products">Build a hierarchical list of products</p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lines Stats Card */}
        <div className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-500"></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1 truncate" title="Lines">Lines</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white truncate">{productCount}</span>
                </div>
              </div>
              <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Order Total Card */}
        <div className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide mb-1 truncate" title="Order Total">Order Total</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white truncate">{fmt(totalSell)}</span>
                </div>
              </div>
              <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6 h-[600px]">
        {/* Table Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
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
                      <div key={p.id} className="p-2 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer flex justify-between items-center transition-colors" onClick={() => quickAddProduct(p)}>
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate">{p.sku}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-semibold text-green-600 dark:text-green-400">{fmt(p.sell)}</span>
                          <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 dark:border-gray-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">+</button>
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
                  <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700">Presets</div>
                    <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer flex items-center gap-2" onClick={() => addGroup('AV Components', 'bg-indigo-500')}><span className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold text-white bg-indigo-500">AV</span> AV Components</div>
                    <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer flex items-center gap-2" onClick={() => addGroup('Networking', 'bg-teal-600')}><span className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold text-white bg-teal-600">NW</span> Networking</div>
                    <div className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer flex items-center gap-2" onClick={() => addGroup('Cables & Wiring', 'bg-blue-500')}><span className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold text-white bg-blue-500">CW</span> Cables & Wiring</div>
                    <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/80 border-y border-gray-100 dark:border-gray-700 mt-1">Custom</div>
                    <div className="p-2 flex gap-2">
                      <input type="text" placeholder="Group name..." value={customGrpName} onChange={e => setCustomGrpName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGroup(customGrpName, 'bg-gray-500')} className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:outline-none focus:border-purple-500" />
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
            <table className="w-full text-left border-collapse min-w-[800px]" style={{ display: lines.length ? 'table' : 'none' }}>
              <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-3 w-10 text-center"><input type="checkbox" checked={lines.length > 0 && lines.every(l => l.sel)} onChange={e => selAll(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" /></th>
                  <th className="px-1 py-3 w-8"></th>
                  <th className="px-3 py-3 text-sm font-semibold truncate">Level</th>
                  <th className="px-3 py-3 text-sm font-semibold truncate">Seq</th>
                  <th className="px-3 py-3 text-sm font-semibold truncate">Product / Sku</th>
                  <th className="px-3 py-3 text-sm font-semibold truncate">Description</th>
                  <th className="px-3 py-3 text-sm font-semibold truncate">Manufacturer</th>
                  <th className="px-3 py-3 text-sm font-semibold text-right truncate">Sell Price</th>
                  <th className="px-3 py-3 text-sm font-semibold text-center truncate w-24">Qty</th>
                  <th className="px-3 py-3 text-sm font-semibold text-right truncate">Ext. Price</th>
                  <th className="px-3 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
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
                    lines.forEach(c => { if (c.pid === l.id && c.type === 'product') { s.ts += c.sell * c.qty; s.n++; } });
                    const abbr = l.grpName.split(/[\s&]+/).map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();

                    return (
                      <tr key={l.id} draggable className={`border-b border-gray-200 dark:border-gray-700 bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors ${l.sel ? 'bg-indigo-100/50 dark:bg-indigo-900/30' : ''}`} onDragStart={e => startDrag(e, 'row', l.id)} onDragOver={e => onDragOverRow(e, idx)} onDrop={e => { e.preventDefault(); e.stopPropagation(); execDrop(insertIdxRef.current); }}>
                        <td className="px-3 py-2 text-center"><input type="checkbox" checked={l.sel} onChange={e => rowSel(l.id, e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" /></td>
                        <td className="px-1 py-2 cursor-grab text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-center">&#9776;</td>
                        <td colSpan={3} className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {hasKids ? <button className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-transform" onClick={() => toggleExp(l.id)} style={{ transform: l.exp ? 'rotate(0)' : 'rotate(-90deg)' }}>&#9660;</button> : <span className="w-5 inline-block"></span>}
                            <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white ${l.grpColor}`}>{abbr}</span>
                            <input className="font-bold text-sm bg-transparent border border-transparent hover:border-gray-300 focus:border-purple-500 focus:bg-white dark:focus:bg-gray-800 rounded px-1 py-0.5 outline-none transition-colors w-48 text-gray-900 dark:text-white" value={l.grpName} onChange={e => setLines(prev => prev.map(x => x.id === l.id ? { ...x, grpName: e.target.value } : x))} />
                            <span className="text-xs text-gray-500 dark:text-gray-400">{s.n} item{s.n !== 1 ? 's' : ''}</span>
                          </div>
                        </td>
                        <td colSpan={4}></td>
                        <td className="px-3 py-2 text-right font-bold text-indigo-600 dark:text-indigo-400 text-sm">{fmt(s.ts)}</td>
                        <td className="px-3 py-2 text-center"><button className="text-gray-400 hover:text-red-500 transition-colors" onClick={() => delLine(l.id)}>&#10005;</button></td>
                      </tr>
                    );
                  } else {
                    const indent = (l.lv - 1) * 20;
                    const lvColors = ['bg-gray-200 text-gray-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700'];
                    const lvCls = lvColors[Math.min(l.lv - 1, 3)];
                    return (
                      <tr key={l.id} draggable className={`border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${l.sel ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`} onDragStart={e => startDrag(e, 'row', l.id)} onDragOver={e => onDragOverRow(e, idx)} onDrop={e => { e.preventDefault(); e.stopPropagation(); execDrop(insertIdxRef.current); }}>
                        <td className="px-3 py-2 text-center"><input type="checkbox" checked={l.sel} onChange={e => rowSel(l.id, e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary" /></td>
                        <td className="px-1 py-2 cursor-grab text-gray-300 hover:text-gray-500 dark:hover:text-gray-400 text-center">&#9776;</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center" style={{ paddingLeft: `${indent}px` }}>
                            {hasKids ? <button className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-transform" onClick={() => toggleExp(l.id)} style={{ transform: l.exp ? 'rotate(0)' : 'rotate(-90deg)' }}>&#9660;</button> : <span className="w-5 inline-block"></span>}
                            <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${lvCls}`}>{l.lv}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">{l.seq}</td>
                        <td className="px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer truncate max-w-[200px]" title={`${l.sku} - ${l.name}`}>{l.name}</td>
                        <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 truncate max-w-[150px]" title={l.desc}>{l.desc}</td>
                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 truncate max-w-[120px]" title={l.mfr}>{trn(l.mfr, 18)}</td>
                        <td className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 text-right">{fmt(l.sell)}</td>
                        <td className="px-3 py-2 text-center">
                          <input type="text" value={l.qty} readOnly className="w-16 text-right py-1 px-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white cursor-default focus:outline-none mx-auto block" />
                        </td>
                        <td className="px-3 py-2 text-sm font-semibold text-green-600 dark:text-green-400 text-right">{fmt(l.sell * l.qty)}</td>
                        <td className="px-3 py-2 text-center"><button className="text-gray-400 hover:text-red-500 transition-colors" onClick={() => delLine(l.id)}>&#10005;</button></td>
                      </tr>
                    );
                  }
                })}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-800/80 border-t-2 border-gray-200 dark:border-gray-700">
                <tr>
                  <td colSpan={7}></td>
                  <td colSpan={2} className="px-3 py-3 text-right text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Order Total</td>
                  <td className="px-3 py-3 text-right text-lg font-bold text-green-600 dark:text-green-400">{fmt(totalSell)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
            {!lines.length && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-3 opacity-50">&#128193;</div>
                <div className="text-lg font-medium mb-1">No lines in configuration</div>
                <div className="text-sm">Search to add products or drag them from the catalog.</div>
              </div>
            )}
          </div>
        </div>

        {/* Panel Area (Catalog) */}
        {panelOpen && (
          <div className="w-80 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0 animate-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-900 dark:text-white">Product Catalog</span>
                <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{filteredCatalog.length}/{catalog.length}</span>
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

                return (
                  <div key={p.id} className="p-2.5 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 shadow-sm transition-all flex gap-2 cursor-grab group" draggable onDragStart={e => startDrag(e, 'cat', p.id)}>
                    <div className="text-gray-300 group-hover:text-gray-400 mt-1">&#9776;</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate">{p.sku}</span>
                        <span className="text-gray-400">&middot;</span>
                        <span className="text-xs text-gray-700 dark:text-gray-300 truncate" title={p.name}>{p.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-gray-600 dark:text-gray-400 truncate max-w-[80px]">{trn(p.mfr, 16)}</span>
                        <span className="text-gray-500">Sell <span className="font-bold text-gray-900 dark:text-white">{fmt(p.sell)}</span></span>
                        <span className={`px-1.5 py-0.5 rounded font-medium ${av.cls}`}>{av.text}</span>
                      </div>
                    </div>
                    <button className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded border border-gray-200 dark:border-gray-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors self-center" onClick={() => addCat(p.id)} title="Add to order">&#43;</button>
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
"""

import sys
# Find the start of the return statement
start_idx = content.find("  return (")
if start_idx == -1:
    print("Could not find return statement")
    sys.exit(1)

# we just replace everything from `return (` to the end with `new_return + "\n}\n"`
new_content = content[:start_idx] + new_return + "\n}\n"

with open('/media/trumatics/New Volume/wovn/woven_projects-main/app/configure/page.tsx', 'w') as f:
    f.write(new_content)
print("Updated successfully")
