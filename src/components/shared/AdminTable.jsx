import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Download, RefreshCw, Loader2 } from 'lucide-react';

const ACCENT = '#ef4444';

/**
 * Reusable admin data table.
 * schema = { fields: [{key, label, sortable?, render?}], data, loading, title, stats? }
 */
export default function AdminTable({ title, subtitle, fields = [], data = [], loading = false,
  searchable = true, searchPlaceholder = 'Search…',
  stats = [], onRefresh,
  page = 1, setPage, totalPages = 1,
  actions = [], actionLabel = 'Actions',
  emptyMessage = 'No data found',
  exportable = false,
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const filtered = data.filter(row =>
    searchable && search
      ? Object.values(row).some(v => String(v).toLowerCase().includes(search.toLowerCase()))
      : true
  );

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = a[sortKey] ?? '';
        const bv = b[sortKey] ?? '';
        return sortDir === 'asc' ? av > bv ? 1 : -1 : av < bv ? 1 : -1;
      })
    : filtered;

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const perPage = 20;
  const total = totalPages > 1 ? totalPages : Math.ceil(sorted.length / perPage);
  const paged = totalPages > 1 ? sorted.slice((page - 1) * perPage, page * perPage) : sorted;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[16px] font-bold text-white">{title}</h2>
          {subtitle && <p className="text-[12px] text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button onClick={onRefresh}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold border transition-all hover:bg-white/5"
              style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#9ca3af' }}>
              <RefreshCw size={12} /> Refresh
            </button>
          )}
          {exportable && (
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold border transition-all hover:bg-white/5"
              style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#9ca3af' }}>
              <Download size={12} /> Export
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map(s => (
            <div key={s.label} className="rounded-xl border p-4"
              style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
              <div className="text-[11px] text-gray-500 mb-1">{s.label}</div>
              <div className="text-[20px] font-black text-white">{s.value}</div>
              {s.change && (
                <div className={`text-[10px] font-bold mt-0.5 ${s.up ? 'text-green-400' : 'text-red-400'}`}>
                  {s.up ? '↑' : '↓'} {s.change}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Search + actions bar */}
      <div className="flex items-center gap-3">
        {searchable && (
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage?.(1); }}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-[12px] text-white placeholder-gray-600 outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }}
            />
          </div>
        )}
        <div className="flex-1" />
        <span className="text-[11px] text-gray-600">
          {sorted.length} result{sorted.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(239,68,68,0.1)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin" style={{ color: ACCENT }} />
          </div>
        ) : paged.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[13px] text-gray-600">{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(239,68,68,0.1)' }}>
                  {fields.map(f => (
                    <th key={f.key}
                      onClick={f.sortable ? () => handleSort(f.key) : undefined}
                      className={`px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider ${f.sortable ? 'cursor-pointer hover:text-white select-none' : ''}`}>
                      <div className="flex items-center gap-1.5">
                        {f.label}
                        {f.sortable && sortKey === f.key && (
                          <span style={{ color: ACCENT }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">
                      {actionLabel}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paged.map((row, i) => (
                  <tr key={row.id ?? i}
                    className="border-b last:border-0 transition-colors hover:bg-white/[0.02]"
                    style={{ borderColor: 'rgba(239,68,68,0.06)' }}>
                    {fields.map(f => (
                      <td key={f.key} className="px-4 py-3.5">
                        {f.render ? f.render(row[f.key], row) : (
                          <span className="text-[12px] text-gray-300">{row[f.key] ?? '—'}</span>
                        )}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {actions.map(a => (
                            <button
                              key={a.label}
                              onClick={() => a.onClick(row)}
                              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all hover:bg-white/5"
                              style={{ borderColor: 'rgba(255,255,255,0.08)', color: a.danger ? '#ef4444' : '#9ca3af' }}>
                              {a.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-600">
            Page {page} of {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white/5 disabled:opacity-30 transition-all">
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: Math.min(7, total) }, (_, i) => {
              const pg = i + 1;
              return (
                <button key={pg}
                  onClick={() => setPage(pg)}
                  className="w-8 h-8 rounded-lg text-[12px] font-semibold transition-all"
                  style={page === pg
                    ? { background: ACCENT, color: '#fff' }
                    : { color: '#9ca3af' }
                  }>
                  {pg}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(total, p + 1))}
              disabled={page === total}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white/5 disabled:opacity-30 transition-all">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
