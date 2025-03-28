import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ScrollToTop } from '../utils/ScrollToTop';

/**
 * Main layout component that wraps all pages with header and footer
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content
 */
const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F5]">
      <ScrollToTop />
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
