'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { universities } from '@/lib/api';
import { Search, Globe, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const COUNTRIES = ['All', 'UK', 'Canada', 'Australia', 'USA', 'Germany', 'Ireland', 'New Zealand'];

export default function UniversitiesPage() {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('All');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['universities', search, country, page],
    queryFn: () => universities.list({
      search,
      ...(country !== 'All' && { country }),
      page: String(page),
      pageSize: '18',
    }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">University Marketplace</h1>
        <p className="text-text-muted text-sm mt-1">
          {data?.meta.total ?? 0} universities · Browse courses, commissions and requirements
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search universities..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface-card border border-surface-border rounded-lg text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-brand-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {COUNTRIES.map(c => (
            <button key={c} onClick={() => { setCountry(c); setPage(1); }}
              className={cn('px-3 py-2 rounded-lg text-sm border transition-colors',
                country === c ? 'bg-brand-500 border-brand-500 text-white' : 'border-surface-border text-text-secondary hover:border-brand-500')}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="text-text-muted">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data.map(uni => (
            <Link key={uni.id} href={`/universities/${uni.id}`}
              className="bg-surface-card border border-surface-border rounded-xl p-5 hover:border-brand-500/50 transition-colors block">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-surface-card2 flex items-center justify-center text-brand-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="flex gap-1.5">
                  {uni.isPartner && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-status-success/20 text-status-success">Partner</span>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface-card2 text-text-muted">{uni.country}</span>
                </div>
              </div>
              <h3 className="font-semibold text-text-primary text-sm mb-1">{uni.name}</h3>
              <p className="text-text-muted text-xs mb-3">{uni.city}</p>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-text-secondary">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {uni.visaSuccessRate ? `${(uni.visaSuccessRate * 100).toFixed(0)}% visa rate` : 'N/A'}
                </div>
                <span className="text-status-success font-medium">
                  {uni.defaultCommissionPct}% commission
                </span>
              </div>
              {uni.qsWorldRank && (
                <div className="mt-2 text-xs text-text-muted">QS Rank #{uni.qsWorldRank}</div>
              )}
              {uni.courses && uni.courses.length > 0 && (
                <div className="mt-3 pt-3 border-t border-surface-border text-xs text-text-muted">
                  {uni.courses.length} active course{uni.courses.length !== 1 ? 's' : ''}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
            className="px-4 py-2 text-sm bg-surface-card border border-surface-border text-text-secondary rounded-lg disabled:opacity-40">Prev</button>
          <span className="px-4 py-2 text-sm text-text-muted">Page {page} of {data.meta.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= data.meta.totalPages}
            className="px-4 py-2 text-sm bg-surface-card border border-surface-border text-text-secondary rounded-lg disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
