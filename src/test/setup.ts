import '@testing-library/jest-dom/vitest';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '@/data/mock/server';

// Fix JSDOM AbortSignal / AbortController incompatibility with Node 20+ native fetch
if (typeof globalThis.AbortController !== 'undefined') {
  window.AbortController = globalThis.AbortController;
  window.AbortSignal = globalThis.AbortSignal;
}

// Polyfills for jsdom
class ResizeObserverPolyfill {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverPolyfill;

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
});

Element.prototype.scrollIntoView = () => {};

// Start MSW Node server before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

// Reset handlers and storage after each test
afterEach(() => {
  server.resetHandlers();
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.clear();
  }
});

// Clean up after all tests
afterAll(() => {
  server.close();
});
