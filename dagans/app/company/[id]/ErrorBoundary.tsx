'use client'
import { Component, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#2a1a1a', border: '1px solid #f87171', borderRadius: 12, padding: 24, color: '#f87171' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Client error (send this to debug):</div>
          <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{this.state.error.message}\n{this.state.error.stack}</pre>
        </div>
      )
    }
    return this.props.children
  }
}
