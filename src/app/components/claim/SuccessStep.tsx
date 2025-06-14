import { base } from "thirdweb/chains";
import { NFT_METADATA } from "@/lib/clients";

interface SuccessStepProps {
  txHash: string;
  nftMetadata: typeof NFT_METADATA;
}

export function SuccessStep({ txHash, nftMetadata }: SuccessStepProps) {
  const explorerUrl = `${base.blockExplorers?.[0]?.url}/tx/${txHash}`;

  return (
    <div className="text-center space-y-8 animate-float">
      {/* Success Animation */}
      <div className="relative">
        <div className="text-8xl mb-4 animate-bounce">🎆</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-gradient-to-r from-green-400 to-teal-400 rounded-full opacity-20 animate-ping"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-teal-400 rounded-full opacity-30 animate-ping" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="gradient-text text-3xl font-bold mb-2">
          ✨ DEGEN SYNTHESIS COMPLETE
        </h3>
        <p className="text-foreground/90 text-lg leading-relaxed">
          Degen materialization successful! Your degenity has been permanently encoded into the blockchain trading matrix.
        </p>
      </div>

      <div className="glass-card-small p-6 space-y-4 neon-border relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-teal-500/10 animate-pulse"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <p className="gradient-text font-bold text-xl">{nftMetadata.name}</p>
            <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <p className="text-foreground/80 text-sm mb-4 leading-relaxed">
            {nftMetadata.description}
          </p>
          
          <div className="flex items-center justify-center space-x-4 p-3 rounded-xl bg-black/20 border border-purple-500/30">
            <span className="text-foreground/60 text-xs font-mono">TX_HASH:</span>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="gradient-text text-sm font-mono hover:scale-105 transition-transform underline"
            >
              {txHash.slice(0, 6)}...{txHash.slice(-6)}
            </a>
            <span className="text-green-400">✓</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => window.location.reload()}
          className="cyber-button w-full text-lg py-4 relative overflow-hidden group/btn"
        >
          <span className="relative z-10 flex items-center justify-center space-x-3">
            <span>🚀</span>
            <span>INITIATE NEW SYNTHESIS</span>
          </span>
        </button>
        
        <button
          onClick={() => {
            // Share functionality
            navigator.share?.({
              title: "Degen synthesis complete!",
              text: `I just materialized a ${nftMetadata.name} NFT through degen blockchain synthesis!`,
              url: explorerUrl,
            });
          }}
          className="w-full glass-card-small py-4 px-6 hover:scale-105 transition-all duration-300 group"
        >
          <span className="gradient-text font-bold flex items-center justify-center space-x-3">
            <span>🌌</span>
            <span>BROADCAST TO DEGEN NETWORK</span>
            <span className="group-hover:translate-x-1 transition-transform">➤</span>
          </span>
        </button>
        
        {/* Achievement badge */}
        <div className="glass-card-small p-4 relative overflow-hidden">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-black text-sm font-bold">🏆</span>
            </div>
            <span className="gradient-text font-bold text-sm">DEGENERATE STATUS: ACTIVATED</span>
          </div>
          <p className="text-foreground/60 text-xs mt-2 text-center font-mono">
            Welcome to the degen collective, fellow trader.
          </p>
        </div>
      </div>
    </div>
  );
} 