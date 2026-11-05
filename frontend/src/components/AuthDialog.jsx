import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Sparkles, X } from 'lucide-react'

export default function AuthDialog({ onClose, onSubmit, error, busy, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const register = mode === 'register'
  const change = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  return <AnimatePresence><motion.div className="auth-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <motion.section role="dialog" aria-modal="true" aria-labelledby="auth-title" className="auth-card" initial={{ opacity: 0, y: 12, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: .98 }}>
      <button className="icon-button auth-close" aria-label="Close" onClick={onClose}><X size={17} /></button>
      <div className="auth-brand"><div className="brand-mark"><Sparkles size={18} fill="currentColor" /></div><span>algo<span>quest</span></span></div>
      <div className="panel-kicker">{register ? 'BEGIN YOUR ADVENTURE' : 'WELCOME BACK, QUESTer'}</div>
      <h2 id="auth-title">{register ? 'Create your account' : 'Sign in to continue'}</h2>
      <p>Your learning progress is saved to your account.</p>
      <form onSubmit={(event) => { event.preventDefault(); onSubmit(mode, form) }}>
        <label>Username<input required minLength={3} maxLength={30} autoComplete="username" value={form.username} onChange={change('username')} /></label>
        {register && <label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={change('email')} /></label>}
        <label>Password<div className="password-input"><input required minLength={register ? 10 : undefined} type={showPassword ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} value={form.password} onChange={change('password')} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div>{register && <small>Use at least 10 characters.</small>}</label>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <button className="primary-button auth-submit" disabled={busy}>{busy ? 'Working…' : register ? 'Create account' : 'Sign in'} <ArrowRight size={15} /></button>
      </form>
      <div className="auth-switch">{register ? 'Already have an account?' : 'New to AlgoQuest?'} <button onClick={() => { setMode(register ? 'login' : 'register'); setForm({ username: '', email: '', password: '' }) }}>{register ? 'Sign in' : 'Create an account'}</button></div>
    </motion.section>
  </motion.div></AnimatePresence>
}
