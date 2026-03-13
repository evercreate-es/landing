'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

// ── Interfaces ──────────────────────────────────────────────────────────

interface IndustryRow {
  slug: string; name: string; url: string; code: string
  currentUses: number; maxUses: number; active: boolean; codeInDb: boolean; waitlistCount: number
}
interface Totals { totalRedemptions: number; totalWaitlist: number; totalIndustries: number; industriesWithCode: number }
interface RecentRedemption { code: string; industry: string; created_at: string }
interface RecentWaitlist { email: string; industry: string | null; created_at: string }
interface IndustriesData { industries: IndustryRow[]; totals: Totals; recentRedemptions: RecentRedemption[]; recentWaitlist: RecentWaitlist[] }

interface CampaignGroup { id: string; name: string }
interface CampaignMetric {
  name: string; campaign_id: string; leads: number; sent: number; contacted: number
  opens: number; unique_opens: number; replies: number; unique_replies: number; bounced: number; interested: number
}
interface CampaignGroupTotals {
  total_leads: number; sent: number; contacted: number; opens: number; replies: number
  bounced: number; interested: number; open_rate: number; reply_rate: number; bounce_rate: number
}

interface InterestedLead {
  email: string; slug: string; campaign_name: string; auto_replied_at: string; booked_at: string | null; followed_up: boolean
}

type TabKey = 'industries' | 'campaigns' | 'leads'
type CampaignSortKey = 'name' | 'leads' | 'sent' | 'opens' | 'open_rate' | 'replies' | 'reply_rate' | 'bounced' | 'interested'

// ── Component ───────────────────────────────────────────────────────────

function AdminDashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Auth
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Tab
  const activeTab = (searchParams.get('tab') as TabKey) || 'industries'
  const setActiveTab = (tab: TabKey) => {
    router.push(`/admin?tab=${tab}`, { scroll: false })
  }

  // Tab data caches
  const [industriesData, setIndustriesData] = useState<IndustriesData | null>(null)
  const [campaignGroups, setCampaignGroups] = useState<CampaignGroup[] | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [campaignTotals, setCampaignTotals] = useState<CampaignGroupTotals | null>(null)
  const [campaignMetrics, setCampaignMetrics] = useState<CampaignMetric[] | null>(null)
  const [interestedLeads, setInterestedLeads] = useState<InterestedLead[] | null>(null)
  const [leadsTotal, setLeadsTotal] = useState(0)

  // UI state
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [campaignSort, setCampaignSort] = useState<{ key: CampaignSortKey; desc: boolean }>({ key: 'reply_rate', desc: true })
  const [tabLoading, setTabLoading] = useState(false)
  const [tabError, setTabError] = useState('')

  // ── Fetch helpers ─────────────────────────────────────────────────────

  const fetchIndustries = useCallback(async (pw: string) => {
    setTabLoading(true)
    setTabError('')
    try {
      const res = await fetch('/api/admin/industries', { headers: { 'x-admin-password': pw } })
      if (res.status === 401) {
        setAuthenticated(false)
        sessionStorage.removeItem('admin-pw')
        setAuthError('Wrong password')
        return
      }
      const json = await res.json()
      setIndustriesData(json)
      setAuthenticated(true)
      sessionStorage.setItem('admin-pw', pw)
    } catch {
      setTabError('Failed to fetch industries')
    } finally {
      setTabLoading(false)
    }
  }, [])

  const fetchCampaignGroups = useCallback(async (pw: string) => {
    setTabLoading(true)
    setTabError('')
    try {
      const res = await fetch('/api/admin/campaigns', { headers: { 'x-admin-password': pw } })
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      const groups: CampaignGroup[] = json.groups ?? []
      setCampaignGroups(groups)
      if (groups.length > 0 && !selectedGroup) {
        setSelectedGroup(groups[0].id)
      }
    } catch {
      setTabError('Failed to fetch campaign groups')
    } finally {
      setTabLoading(false)
    }
  }, [selectedGroup])

  const fetchGroupAnalytics = useCallback(async (pw: string, tagId: string) => {
    setTabLoading(true)
    setTabError('')
    try {
      const res = await fetch(`/api/admin/campaigns?tag_id=${tagId}`, { headers: { 'x-admin-password': pw } })
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      setCampaignTotals(json.groupTotals ?? null)
      setCampaignMetrics(json.campaigns ?? [])
    } catch {
      setTabError('Failed to fetch campaign analytics')
    } finally {
      setTabLoading(false)
    }
  }, [])

  const fetchInterestedLeads = useCallback(async (pw: string) => {
    setTabLoading(true)
    setTabError('')
    try {
      const res = await fetch('/api/admin/interested-leads', { headers: { 'x-admin-password': pw } })
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      setInterestedLeads(json.leads ?? [])
      setLeadsTotal(json.total ?? 0)
    } catch {
      setTabError('Failed to fetch interested leads')
    } finally {
      setTabLoading(false)
    }
  }, [])

  // ── Auth bootstrap ────────────────────────────────────────────────────

  useEffect(() => {
    const saved = sessionStorage.getItem('admin-pw')
    if (saved) {
      setPassword(saved)
      fetchIndustries(saved)
    }
  }, [fetchIndustries])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    fetchIndustries(password).finally(() => setAuthLoading(false))
  }

  // ── Lazy load tab data ────────────────────────────────────────────────

  useEffect(() => {
    if (!authenticated) return
    const pw = sessionStorage.getItem('admin-pw')
    if (!pw) return

    if (activeTab === 'industries' && !industriesData) {
      fetchIndustries(pw)
    }
    if (activeTab === 'campaigns' && !campaignGroups) {
      fetchCampaignGroups(pw)
    }
    if (activeTab === 'leads' && !interestedLeads) {
      fetchInterestedLeads(pw)
    }
  }, [activeTab, authenticated, industriesData, campaignGroups, interestedLeads, fetchIndustries, fetchCampaignGroups, fetchInterestedLeads])

  // ── Fetch analytics when group changes ────────────────────────────────

  useEffect(() => {
    if (!authenticated || activeTab !== 'campaigns' || !selectedGroup) return
    const pw = sessionStorage.getItem('admin-pw')
    if (!pw) return
    fetchGroupAnalytics(pw, selectedGroup)
  }, [selectedGroup, authenticated, activeTab, fetchGroupAnalytics])

  // ── Refresh ───────────────────────────────────────────────────────────

  const handleRefresh = () => {
    const pw = sessionStorage.getItem('admin-pw')
    if (!pw) return
    if (activeTab === 'industries') { setIndustriesData(null); fetchIndustries(pw) }
    if (activeTab === 'campaigns' && selectedGroup) { fetchGroupAnalytics(pw, selectedGroup) }
    if (activeTab === 'leads') { setInterestedLeads(null); fetchInterestedLeads(pw) }
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 1500)
  }

  const toggleSort = (key: CampaignSortKey) => {
    setCampaignSort(prev => ({ key, desc: prev.key === key ? !prev.desc : true }))
  }

  const cleanCampaignName = (name: string) =>
    name.replace(/^Evercreate\s*[-\u2014\u2013]\s*/i, '')

  const sortedCampaigns = campaignMetrics
    ? [...campaignMetrics].sort((a, b) => {
        const k = campaignSort.key
        let aVal: number | string
        let bVal: number | string
        if (k === 'open_rate') {
          aVal = a.sent > 0 ? a.opens / a.sent : 0
          bVal = b.sent > 0 ? b.opens / b.sent : 0
        } else if (k === 'reply_rate') {
          aVal = a.sent > 0 ? a.replies / a.sent : 0
          bVal = b.sent > 0 ? b.replies / b.sent : 0
        } else if (k === 'name') {
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
        } else {
          aVal = a[k]
          bVal = b[k]
        }
        if (aVal < bVal) return campaignSort.desc ? 1 : -1
        if (aVal > bVal) return campaignSort.desc ? -1 : 1
        return 0
      })
    : []

  // ── Login screen ──────────────────────────────────────────────────────

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
          <h1 className="text-2xl font-bold text-center">Admin</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-teal-500"
            autoFocus
          />
          {authError && <p className="text-red-400 text-sm text-center">{authError}</p>}
          <button
            type="submit"
            disabled={authLoading}
            className="rounded-lg bg-teal-600 px-4 py-3 font-medium text-white hover:bg-teal-500 disabled:opacity-50"
          >
            {authLoading ? 'Loading...' : 'Enter'}
          </button>
        </form>
      </div>
    )
  }

  // ── Tabs config ───────────────────────────────────────────────────────

  const tabs: { key: TabKey; label: string; badge?: number }[] = [
    { key: 'industries', label: 'Industries' },
    { key: 'campaigns', label: 'Campaigns' },
    { key: 'leads', label: 'Interested Leads', badge: leadsTotal || undefined },
  ]

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen px-6 py-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Evercreate Admin</h1>
        <button
          onClick={handleRefresh}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white hover:border-white/20"
        >
          Refresh
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-white/10 mb-8">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.key
                ? 'border-teal-500 text-white'
                : 'border-transparent text-white/40 hover:text-white/60'
            }`}
          >
            {t.label}
            {t.badge !== undefined && (
              <span className="ml-2 rounded-full bg-teal-600/30 px-2 py-0.5 text-xs text-teal-400">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading / Error */}
      {tabLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-white/40 text-sm">Loading...</div>
        </div>
      )}
      {tabError && !tabLoading && (
        <div className="text-red-400 text-sm text-center py-10">{tabError}</div>
      )}

      {/* ── Tab 1: Industries ──────────────────────────────────────────── */}
      {activeTab === 'industries' && !tabLoading && !tabError && industriesData && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Industries', value: industriesData.totals.totalIndustries },
              { label: 'With code in DB', value: industriesData.totals.industriesWithCode },
              { label: 'Total redemptions', value: industriesData.totals.totalRedemptions },
              { label: 'Waitlist signups', value: industriesData.totals.totalWaitlist },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-white/50">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Industries table */}
          <h2 className="text-xl font-bold mb-4 text-white/80">Industries</h2>
          <div className="rounded-xl border border-white/10 overflow-hidden mb-10">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-left text-white/50">
                    <th className="px-4 py-3 font-medium">Industry</th>
                    <th className="px-4 py-3 font-medium">URL</th>
                    <th className="px-4 py-3 font-medium">Code</th>
                    <th className="px-4 py-3 font-medium text-center">Uses</th>
                    <th className="px-4 py-3 font-medium text-center">Waitlist</th>
                    <th className="px-4 py-3 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {industriesData.industries.map((row) => (
                    <tr key={row.slug} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-medium">{row.name}</td>
                      <td className="px-4 py-3">
                        <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300">
                          {row.url}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => copyToClipboard(row.code, `code-${row.slug}`)}
                          className="font-mono text-xs bg-white/5 px-2 py-1 rounded hover:bg-white/10"
                          title="Click to copy code"
                        >
                          {copiedCode === `code-${row.slug}` ? 'Copied!' : row.code}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={row.currentUses > 0 ? 'text-teal-400' : 'text-white/30'}>
                          {row.currentUses}
                        </span>
                        <span className="text-white/20">/{row.maxUses}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={row.waitlistCount > 0 ? 'text-teal-400' : 'text-white/30'}>
                          {row.waitlistCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {!row.codeInDb ? (
                          <span className="text-yellow-400/70 text-xs">No DB entry</span>
                        ) : row.active ? (
                          <span className="text-green-400/70 text-xs">Active</span>
                        ) : (
                          <span className="text-red-400/70 text-xs">Inactive</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent activity */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-xl border border-white/10 p-5">
              <h2 className="font-bold mb-4 text-white/70">Recent Redemptions</h2>
              {industriesData.recentRedemptions.length === 0 ? (
                <p className="text-white/30 text-sm">No redemptions yet</p>
              ) : (
                <div className="space-y-2">
                  {industriesData.recentRedemptions.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="font-mono text-xs text-white/50">{r.code}</span>
                      <span className="text-white/30 text-xs">
                        {new Date(r.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-white/10 p-5">
              <h2 className="font-bold mb-4 text-white/70">Recent Waitlist</h2>
              {industriesData.recentWaitlist.length === 0 ? (
                <p className="text-white/30 text-sm">No signups yet</p>
              ) : (
                <div className="space-y-2">
                  {industriesData.recentWaitlist.map((w, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-white/60">{w.email}</span>
                      <div className="flex items-center gap-3">
                        {w.industry && <span className="text-white/30 text-xs">{w.industry}</span>}
                        <span className="text-white/30 text-xs">
                          {new Date(w.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Tab 2: Campaigns ───────────────────────────────────────────── */}
      {activeTab === 'campaigns' && !tabLoading && !tabError && (
        <>
          {/* Group selector */}
          {campaignGroups && campaignGroups.length > 0 && (
            <div className="mb-8">
              <label className="block text-sm text-white/50 mb-2">Campaign Group</label>
              <select
                value={selectedGroup ?? ''}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-teal-500 min-w-[240px]"
              >
                {campaignGroups.map((g) => (
                  <option key={g.id} value={g.id} className="bg-neutral-900">
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {campaignGroups && campaignGroups.length === 0 && (
            <div className="text-white/30 text-sm text-center py-20">No campaign groups found</div>
          )}

          {/* Totals cards */}
          {campaignTotals && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-10">
              {[
                { label: 'Total Leads', value: campaignTotals.total_leads.toLocaleString() },
                { label: 'Emails Sent', value: campaignTotals.sent.toLocaleString() },
                { label: 'Contacted', value: campaignTotals.contacted.toLocaleString() },
                { label: 'Open Rate', value: `${campaignTotals.open_rate}%` },
                { label: 'Reply Rate', value: `${campaignTotals.reply_rate}%` },
                { label: 'Bounce Rate', value: `${campaignTotals.bounce_rate}%` },
                { label: 'Interested', value: campaignTotals.interested.toLocaleString() },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <p className="text-sm text-white/50">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Campaigns table */}
          {sortedCampaigns.length > 0 && (
            <>
              <h2 className="text-xl font-bold mb-4 text-white/80">Sub-campaigns</h2>
              <div className="rounded-xl border border-white/10 overflow-hidden mb-10">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-left text-white/50">
                        {([
                          ['name', 'Campaign'],
                          ['leads', 'Leads'],
                          ['sent', 'Sent'],
                          ['opens', 'Opens'],
                          ['open_rate', 'Open %'],
                          ['replies', 'Replies'],
                          ['reply_rate', 'Reply %'],
                          ['bounced', 'Bounced'],
                          ['interested', 'Interested'],
                        ] as [CampaignSortKey, string][]).map(([key, label]) => (
                          <th
                            key={key}
                            onClick={() => toggleSort(key)}
                            className={`px-4 py-3 font-medium cursor-pointer hover:text-white/80 select-none ${key !== 'name' ? 'text-right' : ''} ${campaignSort.key === key ? 'text-teal-400' : ''}`}
                          >
                            {label}
                            {campaignSort.key === key && (campaignSort.desc ? ' \u2193' : ' \u2191')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedCampaigns.map((c) => {
                        const openRate = c.sent > 0 ? Math.round((c.opens / c.sent) * 1000) / 10 : 0
                        const replyRate = c.sent > 0 ? Math.round((c.replies / c.sent) * 1000) / 10 : 0
                        return (
                          <tr key={c.campaign_id} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="px-4 py-3 font-medium">{cleanCampaignName(c.name)}</td>
                            <td className="px-4 py-3 text-right text-white/60">{c.leads.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-white/60">{c.sent.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-white/60">{c.opens.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-white/60">{openRate}%</td>
                            <td className="px-4 py-3 text-right text-white/60">{c.replies.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-teal-400">{replyRate}%</td>
                            <td className="px-4 py-3 text-right text-white/60">{c.bounced.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right text-white/60">{c.interested.toLocaleString()}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {campaignMetrics && campaignMetrics.length === 0 && !tabLoading && (
            <div className="text-white/30 text-sm text-center py-10">No campaigns in this group</div>
          )}
        </>
      )}

      {/* ── Tab 3: Interested Leads ────────────────────────────────────── */}
      {activeTab === 'leads' && !tabLoading && !tabError && interestedLeads && (
        <>
          <h2 className="text-xl font-bold mb-4 text-white/80">
            Interested Leads ({leadsTotal})
          </h2>
          <div className="rounded-xl border border-white/10 overflow-hidden mb-10">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-left text-white/50">
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Industry</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {interestedLeads.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-white/30">
                        No interested leads yet
                      </td>
                    </tr>
                  ) : (
                    interestedLeads.map((lead, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-white/80">{lead.email}</td>
                        <td className="px-4 py-3 text-white/50">{lead.slug}</td>
                        <td className="px-4 py-3 text-white/50">
                          {new Date(lead.auto_replied_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {lead.booked_at ? (
                            <span className="inline-block rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                              Booked
                            </span>
                          ) : lead.followed_up ? (
                            <span className="inline-block rounded-full bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400">
                              Followed up
                            </span>
                          ) : (
                            <span className="inline-block rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
                              Awaiting
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Default export with Suspense boundary ─────────────────────────────────

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminDashboard />
    </Suspense>
  )
}
