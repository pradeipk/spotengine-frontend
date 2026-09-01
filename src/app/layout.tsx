import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0b0c10',
};

export const metadata: Metadata = {
  title: 'SpotEngine | Premium Tech Services',
  description: 'Book verified engineers and technicians instantly.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="animate-fade-in">
          {children}
        </main>
      </body>
    </html>
  );
}
