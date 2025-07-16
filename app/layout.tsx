
import './globals.css';
import { Inter } from 'next/font/google';
import { MovieProvider } from '@/context/moviecontext'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'CinemaScope',
  description: 'Mood-based movie discovery and recommendation platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 text-gray-800`}>

        <MovieProvider>
          {children}
        </MovieProvider>
      </body>
    </html>
  );
}
