import './globals.css';
import Nav from '../components/Nav';

export const metadata = {
  title: 'LastPage — Your journal for films & books',
  description: 'A personal diary for films and books. Track what you watch and read, write reviews, and save your favourites.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
