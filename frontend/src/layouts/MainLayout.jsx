/**
 * ==============================================================================
 * Master Application Shell Layout (MainLayout.jsx)
 * ==============================================================================
 *
 * Provides the sticky header, main content wrapper, and footer.
 */

import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main id="main-content">
        {children}
      </main>
      <Footer />
    </>
  );
}

export default MainLayout;
