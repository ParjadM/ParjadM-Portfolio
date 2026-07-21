import React, { useEffect, useState } from 'react'
import { StatsPanelSkeleton } from './ui/Skeleton.jsx'

type LcStats = {
  username: string
  totalSolved: number
  easySolved: number
  mediumSolved: number
  hardSolved: number
  ranking: number | null
}

export default function LeetCodeStats({ theme = 'green' as 'green' | 'pink' }) {
  const [data, setData] = useState<LcStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('')
      try {
        const res = await fetch('/api/leetcode-stats')
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Failed to load')
        // Ensure we use the exact property names from the API response
        const mapped: LcStats = {
          username: json.username || 'evergreat',
          totalSolved: Number(json.totalSolved ?? 0),
          easySolved: Number(json.easySolved ?? 0),
          mediumSolved: Number(json.mediumSolved ?? 0),
          hardSolved: Number(json.hardSolved ?? 0),
          ranking: json.ranking ?? null,
        }
        setData(mapped)
      } catch (e: any) {
        setError(e?.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <StatsPanelSkeleton />
  if (error || !data) return <div className="text-amber-300/90 text-sm">LeetCode stats temporarily unavailable. {error ? `(${error})` : ''}</div>

  const ring = theme === 'pink' ? 'ring-pink-400/40' : 'ring-emerald-400/40'
  const accent = theme === 'pink' ? 'text-pink-400' : 'text-emerald-400'

  const solvedTotal = data.easySolved + data.mediumSolved + data.hardSolved
  const pct = (n: number) => (solvedTotal > 0 ? (n / solvedTotal) * 100 : 0)

  return (
    <div className={`p-6 rounded-xl bg-white/5 border border-white/10 ring-1 ${ring}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">LeetCode</h3>
        {data.ranking != null && <div className={`text-sm ${accent}`}>Rank #{data.ranking}</div>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total Solved" value={data.totalSolved} />
        <Stat label="Easy" value={data.easySolved} />
        <Stat label="Medium" value={data.mediumSolved} />
        <Stat label="Hard" value={data.hardSolved} />
      </div>
      {solvedTotal > 0 && (
        <div className="mt-6">
          <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-white/10" role="img" aria-label={`Easy ${data.easySolved}, Medium ${data.mediumSolved}, Hard ${data.hardSolved}`}>
            <div className="bg-emerald-400" style={{ width: `${pct(data.easySolved)}%` }} />
            <div className="bg-amber-400" style={{ width: `${pct(data.mediumSolved)}%` }} />
            <div className="bg-rose-400" style={{ width: `${pct(data.hardSolved)}%` }} />
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" />Easy</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />Medium</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400" />Hard</span>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string, value: number }) {
  return (
    <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-gray-300 text-sm">{label}</div>
    </div>
  )
}


