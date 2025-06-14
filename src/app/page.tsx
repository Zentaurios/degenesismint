import type { Metadata } from "next";
import { Claim } from "./components/Claim";

export const metadata: Metadata = {
  title: "Degenesis | dGENz NFT Collection",
  description: "Enter the degenerative matrix. Mint your degenified digital artifact and join the degen collective. 420 limited edition NFTs with pointless legendary rarity trait 69.",
  keywords: "NFT, Degenesis, Base NFT, Digital Art, Blockchain, Crypto",
  openGraph: {
    title: "Degenesis | dGENz NFT Collection",
    description: "Mint your degenified digital artifact and join the degen collective.",
    type: "website",
    images: [
      {
        url: "https://degenplays.com/logo.png",
        width: 1200,
        height: 630,
        alt: "Degenesis NFT Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Degenesis | dGENz NFT Collection",
    description: "Mint your degenified digital artifact and join the degen collective.",
    images: ["https://degenplays.com/logo.png"],
    creator: "@degenplays",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden data-grid">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-cyber-gradient" />
      <div className="absolute inset-0 bg-cyber-grid opacity-20" style={{ backgroundSize: '20px 20px' }} />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-teal-500/20 rounded-full blur-xl animate-float" />
      <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-gradient-to-r from-teal-500/20 to-blue-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />
      
      {/* Main content */}
      <div className="relative z-10 container max-w-6xl mx-auto px-4 py-8">
        <Claim />
      </div>
      
      {/* Holographic overlay */}
      <div className="absolute inset-0 holographic opacity-30 animate-holographic-shimmer pointer-events-none" />
    </main>
  );
}
