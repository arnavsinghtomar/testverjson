import type { ReactNode } from 'react';

export const metadata = {
  title: 'Roundhouse — tickets for independent venues',
  description: 'Find and book shows at independent music venues.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB">
      <body>
        <header>
          <a href="/">Roundhouse</a>
          <nav>
            <a href="/events">What&apos;s on</a>
            <a href="/venues">Venues</a>
            <a href="/orders">My tickets</a>
            <a href="/account">Account</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
