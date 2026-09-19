import './globals.css';
import Nav from '../components/Nav';

export const metadata = {
  title: 'LastPage — Cinematic & Literary Journal',
  description: 'An ultra-premium personal journal for films and books. Track, rate, review, and curate cinema and literature in a luxury dark aesthetic.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="bg-[#000000] text-[#E0E0E0] antialiased min-h-screen selection:bg-white/15 selection:text-white">
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
