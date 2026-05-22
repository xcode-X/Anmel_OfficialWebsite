import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { agentsApi } from '../../lib/api';
import AgentReviewPanel, { STATUS_COLORS } from '../../components/admin/AgentReviewPanel';

function isNew(createdAt) {
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000;
}

const STATUSES = ['All', 'Pending', 'Approved', 'Rejected', 'Suspended'];

export default function AdminAgents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [live, setLive] = useState(false);
  const selectedRef = useRef(null);
  selectedRef.current = selected;

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await agentsApi.adminList();
      const list = Array.isArray(data) ? data : [];
      setAgents(list);
      const cur = selectedRef.current;
      if (cur) {
        const id = cur._id || cur.id;
        const updated = list.find((a) => (a._id || a.id) === id);
        if (updated) setSelected(updated);
      }
    } catch { /* ignore */ }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const cleanupRealtime = agentsApi.subscribe(() => {
      setLive(true);
      load(true);
    });
    const onVis = () => {
      if (document.visibilityState === 'visible') load(true);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cleanupRealtime();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [load]);

  const filtered = agents.filter((a) => {
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.fullName?.toLowerCase().includes(q) ||
      a.email?.toLowerCase().includes(q) ||
      a.agentCode?.toLowerCase().includes(q) ||
      a.countryOfResidence?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === 'All' ? agents.length : agents.filter((a) => a.status === s).length;
    return acc;
  }, {});

  if (loading && !selected) {
    return (
      <div className="flex items-center justify-center py-24 text-white/40">
        <RefreshCw className="w-6 h-6 animate-spin mr-3" />
        Loading agents…
      </div>
    );
  }

  if (selected) {
    return (
      <AgentReviewPanel
        agent={selected}
        onBack={() => setSelected(null)}
        onApprove={agentsApi.adminApprove}
        onReject={agentsApi.adminReject}
        onResend={agentsApi.adminResendCredentials}
        onRefresh={() => load(true)}
      />
    );
  }

  return (
    <div className="space-y-6 text-white max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3" style={{ fontFamily: 'var(--font-display)' }}>
            Agent Applications
            {counts.Pending > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white">
                {counts.Pending} pending
              </span>
            )}
          </h1>
          <p className="text-sm text-white/40 mt-1">
            {agents.length} total · {counts.Pending} pending · live updates when agents apply
          </p>
        </div>
        <div className="flex items-center gap-3">
          {live ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <Wifi className="w-3.5 h-3.5" /> Live
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-white/30">
              <WifiOff className="w-3.5 h-3.5" /> Connecting…
            </span>
          )}
          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, agent ID…"
            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#2FA084]/50"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                statusFilter === s
                  ? 'bg-[#2FA084] text-white'
                  : 'bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {s} {counts[s] > 0 && <span className="ml-1 opacity-70">({counts[s]})</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/8 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-white/3 border-b border-white/8 text-white/40 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5 font-medium">Agent</th>
              <th className="px-5 py-3.5 font-medium">Login ID</th>
              <th className="px-5 py-3.5 font-medium hidden md:table-cell">Location</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 font-medium text-right">Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((agent) => (
              <tr
                key={agent._id || agent.id}
                onClick={() => setSelected(agent)}
                className="hover:bg-white/4 cursor-pointer transition group"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-white group-hover:text-[#2FA084] transition">{agent.fullName}</p>
                    {isNew(agent.createdAt) && agent.status === 'Pending' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wide">
                        New
                      </span>
                    )}
                  </div>
                  <p className="text-white/40 text-xs mt-0.5">{agent.email}</p>
                </td>
                <td className="px-5 py-4">
                  {agent.agentCode ? (
                    <span className="font-mono text-sm font-bold text-[#2FA084]">{agent.agentCode}</span>
                  ) : (
                    <span className="text-white/25 text-xs">—</span>
                  )}
                </td>
                <td className="px-5 py-4 hidden md:table-cell text-white/70">{agent.countryOfResidence || '—'}</td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${STATUS_COLORS[agent.status]}`}>
                    {agent.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right text-white/35 text-xs whitespace-nowrap">
                  {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-white/30">
                  {search || statusFilter !== 'All' ? 'No agents match your filters.' : 'No agent applications yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
