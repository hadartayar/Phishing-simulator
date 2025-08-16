import React from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Templates from './pages/Templates'
import Recipients from './pages/Recipients'
import Campaigns from './pages/Campaigns'

const navClass = ({ isActive }) => 'nav-link ' + (isActive ? 'active' : '')

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <header className="header">
        <h1 style={{ margin: 0 }}>🎣 Phishing Simulator</h1>
        <nav className="nav">
          <NavLink to="/" className={({isActive}) => isActive ? 'active' : ''} end>Dashboard</NavLink>
          <NavLink to="/campaigns" className={({isActive}) => isActive ? 'active' : ''}>Campaigns</NavLink>
          <NavLink to="/templates" className={({isActive}) => isActive ? 'active' : ''}>Templates</NavLink>
          <NavLink to="/recipients" className={({isActive}) => isActive ? 'active' : ''}>Recipients</NavLink>
        </nav>
      </header>
      <main style={{ marginTop: 20 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/recipients" element={<Recipients />} />
        </Routes>
      </main>
      <footer className="footer">
        Demo-only. Do not use to send real emails.
        <br></br>
        © 2025 Hadar Tayar. All rights reserved.
      </footer>
    </div>
  )
}
