import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'IndoNumis',
  description: 'IndoNumis - A modern marketplace application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <div className="page-wrapper">
              <Navbar />
              <main className="main-content container animate-fade-in delay-100">
                {children}
              </main>
                <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div className="container">
                    <p>&copy; {new Date().getFullYear()} IndoNumis. All rights reserved.</p>
                  </div>
                </footer>
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
