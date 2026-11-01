/**
 * Client-side React 18 Entrypoint
 * Mounts the main App component into the #root DOM node under React.StrictMode.
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

