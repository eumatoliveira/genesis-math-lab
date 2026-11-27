import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('../visualizers/ObservatoryCanvas3D', () => ({
  ObservatoryCanvas3D: () => <div data-testid="mock-3d-canvas">WebGL 3D Canvas</div>,
}))

vi.mock('../adapters/genesisApiAdapter', () => ({
  genesisApi: {
    checkHealth: vi.fn().mockResolvedValue(null),
    getAgents: vi.fn().mockResolvedValue(null),
    getHardware: vi.fn().mockResolvedValue(null),
    getKnowledgeSummary: vi.fn().mockResolvedValue(null),
    getKnowledgeGraph: vi.fn().mockResolvedValue(null),
    listExperiments: vi.fn().mockResolvedValue([]),
    listHypotheses: vi.fn().mockResolvedValue([]),
    listCounterexamples: vi.fn().mockResolvedValue([]),
    listRejections: vi.fn().mockResolvedValue([]),
    listBooks: vi.fn().mockResolvedValue([]),
    getBookPreview: vi.fn().mockResolvedValue(null),
    listReferences: vi.fn().mockResolvedValue(null),
    listProblemFiles: vi.fn().mockResolvedValue([]),
    runDiscoveryCycle: vi.fn().mockResolvedValue(null),
  },
}))

import App from '../App'

describe('GENESIS Observatory UI Integration', () => {
  it('renders Google x Microsoft editorial home with articles, navigates to 3D lab, switches problems, and toggles Wi-Fi field', async () => {
    render(<App />)

    await waitFor(() => expect(screen.getByText('GENESIS')).toBeInTheDocument())
    expect(screen.getByText(/Descoberta Matemática Orientada por Visualização/i)).toBeInTheDocument()
    expect(screen.getByText(/Como Cada Cálculo Foi Projetado, Executado e Verificado/i)).toBeInTheDocument()

    // Click CTA to enter 3D Laboratory
    fireEvent.click(screen.getByRole('button', { name: /Abrir Laboratório 3D/i }))
    expect(screen.getByTestId('mock-3d-canvas')).toBeInTheDocument()
    expect(screen.getByText(/Campo Físico \(Modo Wi-Fi\): ON/i)).toBeInTheDocument()

    // Search and switch to Collatz
    const searchInput = screen.getByPlaceholderText(/Buscar Riemann, Collatz, Cuboide/i)
    fireEvent.change(searchInput, { target: { value: 'Collatz' } })
    const collatzBtn = screen.getByRole('button', { name: /NT-03.*Conjectura de Collatz/i })
    fireEvent.click(collatzBtn)

    expect(screen.getByRole('heading', { name: /Conjectura de Collatz/i })).toBeInTheDocument()
    expect(screen.getByText('111')).toBeInTheDocument()

    // Toggle Wi-Fi field OFF and ON
    const wifiBtn = screen.getByRole('button', { name: /Campo Físico \(Modo Wi-Fi\)/i })
    fireEvent.click(wifiBtn)
    expect(screen.getByText(/Campo Físico \(Modo Wi-Fi\): OFF/i)).toBeInTheDocument()

    // Switch to Reports & Sources view
    fireEvent.click(screen.getByRole('button', { name: /Relatórios & Fontes/i }))
    expect(screen.getByText(/Os 23 Problemas de Hilbert/i)).toBeInTheDocument()
  })
})
