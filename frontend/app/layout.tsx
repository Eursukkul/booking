import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Concert Tickets',
  description: 'Free concert reservation app'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
