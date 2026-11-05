import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './app/App.jsx'
import './styles.css'

class AppBoundary extends React.Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error) { console.error('AlgoQuest render failed', error) }
  render() {
    if (this.state.error) return <main style={{ padding: 40, color: '#f3c2cb', fontFamily: 'sans-serif' }}><h1>AlgoQuest could not start</h1><pre>{this.state.error.message}</pre></main>
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(<AppBoundary><React.StrictMode><BrowserRouter><App /></BrowserRouter></React.StrictMode></AppBoundary>)
