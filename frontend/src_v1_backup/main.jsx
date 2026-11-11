/**
 * ==============================================================================
 * React Client-Side Entrypoint (main.jsx)
 * ==============================================================================
 * 
 * WHAT IS THIS FILE?
 * This is the very first piece of JavaScript code that runs when someone opens
 * the website.
 * 
 * WHAT DOES IT DO?
 * 1. It locates the empty `<div id="root">` element inside `index.html`.
 * 2. It creates a React "root" inside that container.
 * 3. It tells React to start drawing the top-level `<App />` component.
 * 
 * WHY IS React.StrictMode USED?
 * React.StrictMode is a development helper tool. It checks for common bugs,
 * deprecated code, and potential problems during development by running some
 * functions twice in development mode. It has no effect on the production build.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Find the placeholder <div> in index.html where our React site will live
const container = document.getElementById('root');

// Create the React root manager
const root = createRoot(container);

// Render the application into the DOM
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


