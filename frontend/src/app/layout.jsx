import './globals.css';
import Nav from '../components/Nav';

export const metadata = {
  title: 'LastPage — Your cultural journal for films & books',
  description: 'A private diary for the culturally obsessed. Log films and books, write reflective reviews, and build shelves that define your taste.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=DM+Mono:wght@300;400;500&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <Nav />
        <main style={{ display: 'block' }}>{children}</main>
      </body>
    </html>
  );
}
