import { WalletContextProvider } from '@/components/WalletContextProvider';
import './globals.css';

export const metadata = {
  title: 'IDO Launchpad',
  description: 'A decentralized IDO launchpad platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}