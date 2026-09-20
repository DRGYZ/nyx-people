import React from 'react';
import ReactDOM from 'react-dom/client';
import { enableMocking } from './data/mock/browser';
import { App } from './App';
import './styles/globals.css';

enableMocking().finally(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
