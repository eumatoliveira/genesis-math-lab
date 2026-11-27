import React from 'react'
import { telemetry } from './telemetry'

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error): void {
    telemetry.log('error', 'ErrorBoundary', error.message)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-6 text-slate-200">
          <h3 className="text-base font-semibold text-rose-300">Falha de Renderização Recuperável</h3>
          <p className="mt-1 text-xs text-slate-300">{this.state.message}</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="mt-3 rounded bg-cyan-500/20 px-3 py-1.5 text-xs text-cyan-200 hover:bg-cyan-500/30"
          >
            Reiniciar Módulo Visual
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
