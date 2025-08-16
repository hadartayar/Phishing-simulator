import React, { useEffect, useState } from 'react'
import { api } from '../api'
import Alert from '../components/Alert'

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.metrics().then(setMetrics).catch(e => setError(e.message))
  }, [])

  if (error) return <Alert type="error" title="Error" onClose={()=>setError(null)}>{error}</Alert>
  if (!metrics) return <div>Loading...</div>

  const card = (title, value, sub) => (
    <div className="card" style={{ flex: 1 }}>
      <div style={{ fontSize: 14, color: '#8aa0b6' }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#8aa0b6' }}>{sub}</div>}
    </div>
  )

  const pct = (n) => (n*100).toFixed(1) + '%'

  return (
    <div className="grid">
      <div className="row">
        {card('Campaigns', metrics.campaigns.total, `${metrics.campaigns.drafts} drafts · ${metrics.campaigns.launched} launched`)}
        {card('Targets', metrics.recipients.total)}
        {card('Open Rate', pct(metrics.rates.openRate))}
        {card('Click Rate', pct(metrics.rates.clickRate))}
        {card('Report Rate', pct(metrics.rates.reportRate))}
      </div>
      <div className="card" style={{ color:'#cfe0ff' }}>
        Tip: Create a template, add some recipients, then build a campaign and launch it. The tracking pixel and redirect
        endpoints will simulate opens and clicks.
      </div>
    </div>
  )
}
