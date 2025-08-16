import React, { useEffect, useState } from 'react'
import { api } from '../api'
import Table from '../components/Table'
import Alert from '../components/Alert'
import { required } from '../validate'

export default function Templates() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name:'', subject:'', body:'' })
  const [error, setError] = useState(null)

  const load = () => api.templates.list().then(setItems).catch(e => setError(e.message))

  useEffect(() => { load() }, [])

  const validate = () => {
    const errs = []
    const nameErr = required(form.name, 'Name'); if (nameErr) errs.push(nameErr)
    const subjectErr = required(form.subject, 'Subject'); if (subjectErr) errs.push(subjectErr)
    const bodyErr = required(form.body, 'Body'); if (bodyErr) errs.push(bodyErr)
    return errs
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (errs.length) { setError(errs.join(' • ')); return }
    try {
      await api.templates.create(form)
      setForm({ name:'', subject:'', body:'' })
      setError(null)
      load()
    } catch (e) { setError(e.message) }
  }

  const remove = async (id) => {
    if (!confirm('Delete template?')) return
    try { await api.templates.delete(id); load() } catch (e) { setError(e.message) }
  }

  return (
    <div className="grid">
      <h2>Templates</h2>
      {error && <Alert type="error" title="There was a problem" onClose={()=>setError(null)}>{error}</Alert>}
      <form onSubmit={onSubmit} className="card grid" style={{ maxWidth: 720 }}>
        <div className="field">
          <label>Name</label>
          <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
        </div>
        <div className="field">
          <label>Subject</label>
          <input placeholder="Subject" value={form.subject} onChange={e=>setForm({...form, subject:e.target.value})} required />
        </div>
        <div className="field">
          <label>Body (use {'{{name}}'} and {'{{link}}'})</label>
          <textarea rows={6} placeholder="Body" value={form.body} onChange={e=>setForm({...form, body:e.target.value})} required />
        </div>
        <div className="row">
          <button type="submit">Create Template</button>
        </div>
      </form>
      <div className="card">
        <Table
          columns={[
            { key:'id', title:'ID' },
            { key:'name', title:'Name' },
            { key:'subject', title:'Subject' },
            { key:'updatedAt', title:'Updated' },
          ]}
          data={items}
          actions={(row) => (
            <button onClick={()=>remove(row.id)}>Delete</button>
          )}
        />
      </div>
    </div>
  )
}
