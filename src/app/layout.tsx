import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });
const orbitron = Orbitron({ 
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-orbitron"
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Preload fonts for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} ${orbitron.variable} relative overflow-x-hidden`}>
        {/* Main content - higher z-index */}
        <div className="relative" style={{ zIndex: 10 }}>
          <Providers>{children}</Providers>
        </div>
        
        {/* Cosmic dust overlay */}
        <div 
          className="fixed inset-0 pointer-events-none opacity-20" 
          style={{ 
            zIndex: 5,
            background: `
              radial-gradient(circle at 20% 30%, rgba(132, 68, 228, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(32, 219, 221, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(20, 75, 252, 0.1) 0%, transparent 50%)
            `,
          }}
        />
        
        {/* Performance monitoring in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 z-50 text-xs font-mono text-purple-400 bg-black/50 px-2 py-1 rounded backdrop-blur-sm">
            Degen Matrix Active
          </div>
        )}
      </body>
    </html>
  );
}
