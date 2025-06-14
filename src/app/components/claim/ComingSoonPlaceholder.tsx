import { MediaRenderer } from "thirdweb/react";
import { client, NFT_METADATA } from "@/lib/clients";

export function ComingSoonPlaceholder() {
  return (
    <div className="glass-card p-8 lg:p-12 card-3d group relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-2 h-2 bg-purple-400 rounded-full animate-ping" />
        <div className="absolute top-20 right-20 w-3 h-3 bg-teal-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-10 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '3s' }} />
      </div>
      
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl lg:text-6xl font-bold gradient-text animate-gradient leading-tight">
            {NFT_METADATA.name}
          </h1>
          <p className="text-foreground/80 text-lg lg:text-xl max-w-2xl leading-relaxed">
            {NFT_METADATA.description}
          </p>
        </div>

        {/* NFT Preview with 3D Effect */}
        <div className="relative group/nft perspective-card">
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-teal-600 rounded-3xl blur opacity-30 group-hover/nft:opacity-60 transition duration-500 animate-pulse hidden md:block" />
          <div className="relative media-container">
            <MediaRenderer
              client={client}
              src={NFT_METADATA.image}
              className="w-80 h-80 lg:w-96 lg:h-96 rounded-3xl shadow-2xl border-2 border-glass-border/50 backdrop-blur-sm card-3d
                md:hover:scale-105 md:transition-all md:duration-500
                touch-manipulation"
              style={{
                touchAction: 'manipulation'
              }}
            />
            {/* Holographic overlay - hidden on mobile */}
            <div className="absolute inset-0 rounded-3xl bg-holographic opacity-0 hover:opacity-30 transition-opacity duration-300 pointer-events-none animate-holographic-shimmer hidden md:block" />
          </div>
        </div>

        {/* Coming Soon Status */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-4">
            <div className="text-6xl animate-bounce">⏳</div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold gradient-text">DEGEN TRADING MATRIX INITIALIZING</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                <span className="text-foreground/60 text-sm font-mono ml-2">PORTFOLIO SYNC IN PROGRESS</span>
              </div>
            </div>
          </div>
          
          <div className="glass-card-small p-6 max-w-2xl">
            <p className="text-foreground/80 text-base leading-relaxed">
              🌌 <strong>Degenesis Trading Collection:</strong> A limited series of 420 degen-enhanced digital artifacts. Each NFT contains the legendary rarity trait &ldquo;69&rdquo; - a numerical sequence that transcends conventional meaning and enters the realm of pure degenerative trading energy. 
            </p>
            <p className="text-foreground/70 text-sm mt-4 italic">
              Warning: These digital entities possess an irresistible magnetic field that may cause uncontrollable attraction to your trading psychology.
            </p>
          </div>
        </div>

        {/* Attributes Grid */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
          {NFT_METADATA.attributes.map((attr, index) => (
            <div key={index} className="glass-card-small p-4 lg:p-6 group/attr hover:scale-105 transition-all duration-300">
              <div className="relative">
                <p className="text-foreground/60 text-xs lg:text-sm uppercase tracking-widest mb-2 font-mono">
                  {attr.trait_type}
                </p>
                <p className="gradient-text font-bold text-lg lg:text-xl">
                  {attr.value}
                </p>
                {/* Animated trading connections */}
                <div className="absolute inset-0 rounded-2xl border border-purple-500/0 group-hover/attr:border-purple-500/50 transition-all duration-300" />
                <div className="absolute top-1 right-1 w-1 h-1 bg-teal-400 rounded-full opacity-0 group-hover/attr:opacity-100 animate-ping transition-opacity" />
              </div>
            </div>
          ))}
        </div>

        {/* Progress Indicator */}
        <div className="glass-card-small p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <span className="gradient-text font-bold text-lg">INITIALIZATION PROGRESS</span>
            <span className="text-foreground/60 text-sm font-mono">87.42%</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-3 relative overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-teal-500 h-3 rounded-full animate-pulse" style={{ width: '87.42%' }} />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          <p className="text-foreground/60 text-xs text-center mt-3 font-mono">
            Trading pathways synchronizing... Please maintain portfolio coherence.
          </p>
        </div>

        {/* Notification Signup */}
        <div className="glass-card-small p-6 w-full max-w-lg border-yellow-500/30">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-black text-sm font-bold">📡</span>
            </div>
            <span className="gradient-text font-bold text-lg">DEGEN ALERT SYSTEM</span>
          </div>
          <p className="text-foreground/70 text-sm text-center leading-relaxed">
            Subscribe to our interdimensional notification network to receive instant updates when the degen mint portal becomes active. Your trading signature will be prioritized in the degenerative queue.
          </p>
          <div className="mt-4 flex items-center space-x-2">
            <div className="flex-1 h-2 bg-purple-500/20 rounded-full">
              <div className="w-full h-2 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full animate-pulse" />
            </div>
            <span className="text-xs text-foreground/60 font-mono">SOON&trade;</span>
          </div>
        </div>
      </div>
    </div>
  );
} 