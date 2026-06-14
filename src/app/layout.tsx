import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Airway Assessment Dashboard',
  description:
    'Multimodal difficult airway prediction system — clinical decision support tool for anesthesiologists.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 dark:bg-claude-950 font-sans">{children}</body>
    </html>
  );
}
