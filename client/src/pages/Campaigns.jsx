    import React, { useEffect, useState } from 'react'
    import { api } from '../api'
    import Table from '../components/Table'
    import Alert from '../components/Alert'
    import { required } from '../validate'

    export default function Campaigns() {
      const [items, setItems] = useState([])
      const [templates, setTemplates] = useState([])
      const [recipients, setRecipients] = useState([])
      const [form, setForm] = useState({ name:'', templateId:'', recipientIds:[] })
      const [error, setError] = useState(null)

      const load = () => Promise.all([
        api.campaigns.list().then(setItems),
        api.templates.list().then(setTemplates),
        api.recipients.list().then(setRecipients),
      ]).catch(e => setError(e.message))

      useEffect(() => { load() }, [])

      const validate = () => {
        const errs = []
        const nameErr = required(form.name, 'Campaign name'); if (nameErr) errs.push(nameErr)
        if (!form.templateId) errs.push('Template is required')
        if (!form.recipientIds.length) errs.push('Please select at least one recipient')
        return errs
      }

      const onSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (errs.length) { setError(errs.join(' • ')); return }
        try {
          const payload = {
            name: form.name,
            templateId: Number(form.templateId),
            recipientIds: form.recipientIds.map(Number)
          }
          await api.campaigns.create(payload)
          setForm({ name:'', templateId:'', recipientIds:[] })
          setError(null)
          load()
        } catch (e) { setError(e.message) }
      }

      const remove = async (id) => {
        if (!confirm('Delete campaign?')) return
        try { await api.campaigns.delete(id); load() } catch (e) { setError(e.message) }
      }

      const launch = async (id) => {
        try { await api.campaigns.launch(id); load() } catch (e) { setError(e.message) }
      }

      const toggleRecipient = (id) => {
        setForm(f => ({
          ...f,
          recipientIds: f.recipientIds.includes(id) ? f.recipientIds.filter(x=>x!==id) : [...f.recipientIds, id]
        }))
      }

      return (
        <div className="grid">
          <h2>Campaigns</h2>
          {error && <Alert type="error" title="There was a problem" onClose={()=>setError(null)}>{error}</Alert>}
          <form onSubmit={onSubmit} className="card grid" style={{ maxWidth: 720 }}>
            <div className="field">
              <label>Campaign name</label>
              <input placeholder="Campaign name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
            </div>
            <div className="field">
              <label>Template</label>
              <select value={form.templateId} onChange={e=>setForm({...form, templateId:e.target.value})} required>
                <option value="">-- select template --</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Recipients</label>
              <div style={{ border:'1px solid var(--border)', borderRadius:8, padding:8, maxHeight:160, overflow:'auto' }}>
                {recipients.map(r => (
                  <label key={r.id} style={{ display:'block', padding:'4px 0' }}>
                    <input type="checkbox" checked={form.recipientIds.includes(r.id)} onChange={()=>toggleRecipient(r.id)} />
                    <span style={{ marginLeft: 8 }}>{r.email} {r.name ? `(${r.name})` : ''}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="row">
              <button type="submit">Create Campaign</button>
            </div>
          </form>

          <div className="card">
            <Table
              columns={[
                { key:'id', title:'ID' },
                { key:'name', title:'Name' },
                { key:'templateName', title:'Template' },
                { key:'status', title:'Status' },
                { key:'stats', title:'Stats', render: (v, row) => `${v.opened}/${v.total} opened, ${v.clicked} clicked, ${v.reported} reported` },
                { key:'updatedAt', title:'Updated' },
              ]}
              data={items}
              actions={(row) => (
                <>
                  <button onClick={()=>launch(row.id)} disabled={row.status==='launched'}>Launch</button>{' '}
                  <button onClick={()=>remove(row.id)}>Delete</button>
                </>
              )}
            />
          </div>

          <div className="card" style={{ color:'#cfe0ff' }}>
            <div>After launch, your template body can include links like:</div>
            <pre style={{ background:'#0e1628', padding:8, borderRadius:8, overflow:'auto' }}>
{`http://localhost:4000/r/<campaignRecipientId>?u=${encodeURIComponent('https://acme.com')}
<img src="http://localhost:4000/t/<campaignRecipientId>.png" alt="" />`}
            </pre>
            <div>In a real system, you'd render the campaign per recipient to inject the tracking pixel and unique link.</div>
          </div>
        </div>
      )
    }
