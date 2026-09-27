import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const ROOT_ELEMENT_ID = 'root';

const rootElement = document.getElementById(ROOT_ELEMENT_ID);
if (!rootElement) {
  // Fail loudly: a missing mount point means index.html and this file are out of sync
  throw new Error(`Mount element #${ROOT_ELEMENT_ID} was not found in index.html`);
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
