import { useState, useEffect, Fragment } from 'react';
import {
  Mail,
  MailOpen,
  ChevronDown,
  ChevronUp,
  Phone,
  Building2,
  Calendar,
  Check,
  Inbox,
} from 'lucide-react';
import api from '../../lib/api';

export default function AdminContacts() {
  const [list, setList] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/contact')
      .then((data) => setList(Array.isArray(data) ? data : []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id) => {
    await api.patch(`/contact/${id}/read`, { read: true });
    setList((prev) => prev.map((c) => (c._id === id ? { ...c, read: true } : c)));
  };

  const toggleExpand = (id) => setExpanded((prev) => (prev === id ? null : id));

  const unread = list.filter((c) => !c.read).length;

  return (
    <div className="max-w-5xl space-y-6">

      {/* â”€â”€ Header â”€â”€ */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2FA084] mb-1">Inbox</p>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            Contact Submissions
          </h1>
          <p className="mt-1 text-sm text-white/40">
            {loading ? 'Loadingâ€¦' : `${list.length} total submission${list.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        {unread > 0 && (
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-xs font-semibold text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {unread} unread
          </div>
        )}
      </div>

      {/* â”€â”€ Table card â”€â”€ */}
      <div className="rounded-2xl border border-white/8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[640px]">
            <thead>
              <tr className="border-b border-white/8 bg-white/3">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white/35">Sender</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white/35 hidden md:table-cell">Subject</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white/35 hidden sm:table-cell">Date</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white/35">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-white/35">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-white/30">
                    Loading submissionsâ€¦
                  </td>
                </tr>
              )}

              {!loading && list.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center gap-3 py-16 text-white/25">
                      <Inbox className="w-10 h-10" strokeWidth={1.2} />
                      <p className="text-sm">No submissions yet</p>
                    </div>
                  </td>
                </tr>
              )}

              {list.map((c) => (
                <Fragment key={c._id}>
                  <tr
                    className={`group transition-colors hover:bg-white/3 ${!c.read ? 'bg-[#2FA084]/4' : ''}`}
                  >
                    {/* Sender */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {/* unread dot */}
                        <span
                          className={`shrink-0 w-1.5 h-1.5 rounded-full ${!c.read ? 'bg-[#2FA084]' : 'bg-transparent'}`}
                          aria-hidden
                        />
                        <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-xs font-bold text-white/60 shrink-0 uppercase">
                          {(c.name || '?').slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${!c.read ? 'text-white' : 'text-white/70'}`}>
                            {c.name}
                          </p>
                          <a
                            href={`mailto:${c.email}`}
                            className="text-xs text-white/35 hover:text-[#2FA084] transition-colors truncate block"
                          >
                            {c.email}
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={`text-sm truncate max-w-[240px] block ${!c.read ? 'text-white/80' : 'text-white/45'}`}>
                        {c.subject || <span className="italic text-white/25">No subject</span>}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-white/30">
                        <Calendar className="w-3.5 h-3.5" strokeWidth={1.8} />
                        {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {!c.read ? (
                        <button
                          type="button"
                          onClick={() => markRead(c._id)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#2FA084]/12 text-[#2FA084] border border-[#2FA084]/20 px-3 py-1.5 rounded-full hover:bg-[#2FA084]/20 transition-colors"
                        >
                          <MailOpen className="w-3 h-3" strokeWidth={2} />
                          Mark read
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-white/25">
                          <Check className="w-3.5 h-3.5" strokeWidth={2} />
                          Read
                        </span>
                      )}
                    </td>

                    {/* Expand toggle */}
                    <td className="px-5 py-4">
                      {c.message && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(c._id)}
                          aria-expanded={expanded === c._id}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-white/35 hover:text-white transition-colors rounded-lg px-2.5 py-1.5 hover:bg-white/5"
                        >
                          {expanded === c._id ? (
                            <>
                              <ChevronUp className="w-3.5 h-3.5" strokeWidth={2} />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} />
                              View
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Expanded message row */}
                  {expanded === c._id && (
                    <tr className="bg-white/[0.015]">
                      <td colSpan={5} className="px-6 py-5">
                        <div className="rounded-xl border border-white/8 bg-white/4 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-3 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" strokeWidth={1.8} />
                            Message
                          </p>
                          <p className="text-sm text-white/75 whitespace-pre-wrap leading-relaxed">
                            {c.message}
                          </p>
                          {(c.company || c.phone) && (
                            <div className="mt-4 pt-4 border-t border-white/6 flex flex-wrap gap-x-6 gap-y-2">
                              {c.company && (
                                <p className="flex items-center gap-2 text-xs text-white/40">
                                  <Building2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                                  {c.company}
                                </p>
                              )}
                              {c.phone && (
                                <p className="flex items-center gap-2 text-xs text-white/40">
                                  <Phone className="w-3.5 h-3.5" strokeWidth={1.8} />
                                  {c.phone}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {list.length > 0 && (
        <p className="text-xs text-white/25 px-1">
          {unread} unread Â· {list.length - unread} read Â· {list.length} total
        </p>
      )}
    </div>
  );
}


