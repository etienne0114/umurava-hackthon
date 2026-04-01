import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from '@/components/common/Header';

export const metadata: Metadata = {
  title: 'AI Recruitment Screening Platform',
  description: 'Intelligent recruitment screening powered by AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, sans-serif' }}>
        <a href="#main-content" className="skip-to-main">
          Skip to main content
        </a>
        <ErrorBoundary>
          <Providers>
            <Header />
            <div id="main-content">
              {children}
            </div>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
