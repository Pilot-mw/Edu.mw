import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import { SettingsProvider } from './context/SettingsContext';
import ThemeWrapper from './components/ThemeWrapper';

export const metadata: Metadata = {
  title: 'High Profile Private Secondary School',
  description: 'Leading secondary education in Zomba, Malawi',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SettingsProvider>
            <ThemeWrapper>{children}</ThemeWrapper>
          </SettingsProvider>
        </Providers>
      </body>
    </html>
  );
}
