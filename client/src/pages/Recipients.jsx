import React, { useEffect, useState } from 'react'
import { api } from '../api'
import Table from '../components/Table'
import Alert from '../components/Alert'
import { required, isEmail } from '../validate'

export default function Recipients() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ email:'', name:'', department:'' })
  const [error, setError] = useState(null)

  const load = () => api.recipients.list().then(setItems).catch(e => setError(e.message))

  useEffect(() => { load() }, [])

  const validate = () => {
    const errs = []
    const emailReq = required(form.email, 'Email'); if (emailReq) errs.push(emailReq)
    const emailFmt = isEmail(form.email, 'Email'); if (emailFmt) errs.push(emailFmt)
    return errs
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (errs.length) { setError(errs.join(' • ')); return }
    try {
      await api.recipients.create(form)
      setForm({ email:'', name:'', department:'' })
      setError(null)
      load()
    } catch (e) { setError(e.message) }
  }

  const remove = async (id) => {
    if (!confirm('Delete recipient?')) return
    try { await api.recipients.delete(id); load() } catch (e) { setError(e.message) }
  }

  return (
    <div className="grid">
      <h2>Recipients</h2>
      {error && <Alert type="error" title="There was a problem" onClose={()=>setError(null)}>{error}</Alert>}
      <form onSubmit={onSubmit} className="card grid" style={{ maxWidth: 720 }}>
        <div className="field">
          <label>Email</label>
          <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
        </div>
        <div className="field">
          <label>Name</label>
          <input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        </div>
        <div className="field">
          <label>Department</label>
          <input placeholder="Department" value={form.department} onChange={e=>setForm({...form, department:e.target.value})} />
        </div>
        <div className="row">
          <button type="submit">Add Recipient</button>
        </div>
      </form>
      <div className="card">
        <Table
          columns={[
            { key:'id', title:'ID' },
            { key:'email', title:'Email' },
            { key:'name', title:'Name' },
            { key:'department', title:'Dept' },
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
