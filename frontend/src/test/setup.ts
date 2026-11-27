import '@testing-library/jest-dom'

// Polyfill ResizeObserver required by React Three Fiber & responsive canvas containers
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Polyfill matchMedia for responsive drawers in tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Provide minimal 2D canvas mock in JSDOM for Oscilloscope2D tests
HTMLCanvasElement.prototype.getContext = function getContext(contextId: string) {
  if (contextId === '2d') {
    return {
      clearRect: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      fill: () => {},
      arc: () => {},
      fillText: () => {},
      setLineDash: () => {},
      scale: () => {},
      save: () => {},
      restore: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      measureText: (t: string) => ({ width: t.length * 6 }),
      fillStyle: '#000',
      strokeStyle: '#000',
      lineWidth: 1,
      font: '11px monospace',
      textAlign: 'left',
    } as unknown as CanvasRenderingContext2D
  }
  return null
} as unknown as typeof HTMLCanvasElement.prototype.getContext
