interface PaymentOptionsProps {
  onSelect: (provider: "stripe" | "coinbase" | "transak") => void;
}

export function PaymentOptions({ onSelect }: PaymentOptionsProps) {
  const paymentMethods = [
    {
      provider: "stripe" as const,
      name: "Degen Stripe",
      description: "Trading Cards, Degen Pay, Bio Auth",
      logo: "💳",
      fees: "3.5% + $0.30",
      popular: true,
    },
    {
      provider: "coinbase" as const,
      name: "Coinbase Degen",
      description: "Direct Transfer, Trading Cards",
      logo: "🟦",
      fees: "1% (Transfer) / 3.9% (Card)",
      popular: false,
    },
    {
      provider: "transak" as const,
      name: "Transak Matrix",
      description: "Multi-Market Payment Hub",
      logo: "🌐",
      fees: "0.99% - 5.5%",
      popular: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="gradient-text text-2xl font-bold mb-3">
          ⚡ INITIALIZE PAYMENT MATRIX
        </h3>
        <p className="text-foreground/70 text-base">
          Select your degen payment protocol
        </p>
      </div>

      <div className="space-y-4">
        {paymentMethods.map((method, index) => (
          <button
            key={method.provider}
            onClick={() => onSelect(method.provider)}
            className="w-full glass-card-small p-6 hover:scale-105 transition-all duration-300 group relative overflow-hidden"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {method.popular && (
              <div className="absolute -top-2 left-6 bg-gradient-to-r from-purple-500 to-teal-500 text-white text-xs px-3 py-1 rounded-full font-bold tracking-wider">
                🎆 DEGEN OPTIMIZED
              </div>
            )}

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-4">
                <div className="text-3xl p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-teal-500/20 backdrop-blur-sm border border-purple-500/30">
                  {method.logo}
                </div>
                <div className="text-left">
                  <div className="gradient-text font-bold text-lg mb-1">
                    {method.name}
                  </div>
                  <div className="text-foreground/80 text-sm mb-1">
                    {method.description}
                  </div>
                  <div className="text-foreground/60 text-xs font-mono">
                    Processing Fee: {method.fees}
                  </div>
                </div>
              </div>
              <div className="text-teal-400 group-hover:translate-x-2 group-hover:scale-110 transition-all duration-300 text-2xl">
                ➤
              </div>
            </div>
            
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Glowing border effect */}
            <div className="absolute inset-0 rounded-2xl border border-purple-500/0 group-hover:border-purple-500/30 transition-all duration-300" />
          </button>
        ))}
      </div>

      <div className="glass-card-small p-6 mt-8 relative overflow-hidden">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-teal-400 flex items-center justify-center">
            <span className="text-black font-bold">🔒</span>
          </div>
          <span className="gradient-text font-bold text-lg">
            DEGEN SECURITY PROTOCOL
          </span>
        </div>
        <p className="text-foreground/70 text-sm leading-relaxed">
          All transactions are secured through military-grade encryption and processed via interdimensional payment gateways. Your trading signature is never stored in our degen servers.
        </p>
        
        {/* Animated security indicators */}
        <div className="flex space-x-2 mt-4">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          <span className="text-xs text-foreground/60 ml-2 font-mono">DEGEN LINK ACTIVE</span>
        </div>
      </div>
    </div>
  );
} 