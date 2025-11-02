import React, { useEffect, useState } from 'react'

type Stats = {
  login: string
  followers: number
  following: number
  public_repos: number
  public_gists: number
  html_url: string
  avatar_url: string
  name?: string
  bio?: string
}

export default function GitHubStats({ theme = 'green' as 'green' | 'pink' }) {
  const [data, setData] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('')
      try {
        const res = await fetch('/api/github-stats')
        const json = await res.json()
        if (!res.ok) throw new Error(json?.error || 'Failed to load')
        setData(json)
      } catch (e: any) {
        setError(e?.message || 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const tagColor = theme === 'pink' ? 'bg-pink-500/20 text-pink-300' : 'bg-emerald-500/20 text-emerald-300'

  if (loading) return <div className="text-gray-300">Loading...</div>
  if (error || !data) return <div className="text-red-300">{error || 'Failed to load'}</div>

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <img src={data.avatar_url} alt="GitHub avatar" className="w-16 h-16 rounded-full" />
        <div>
          <div className="text-white font-bold text-xl">{data.name || data.login}</div>
          <a className={`text-xs px-2 py-1 rounded ${tagColor}`} href={data.html_url} target="_blank" rel="noopener noreferrer">@{data.login}</a>
          {data.bio && <div className="text-gray-300 text-sm mt-1">{data.bio}</div>}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-bold text-white">{data.followers}</div>
          <div className="text-gray-300 text-sm">Followers</div>
        </div>
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-bold text-white">{data.following}</div>
          <div className="text-gray-300 text-sm">Following</div>
        </div>
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-bold text-white">{data.public_repos}</div>
          <div className="text-gray-300 text-sm">Public Repos</div>
        </div>
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 text-center">
          <div className="text-2xl font-bold text-white">{data.public_gists}</div>
          <div className="text-gray-300 text-sm">Public Gists</div>
        </div>
      </div>
    </div>
  )
}


