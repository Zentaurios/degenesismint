'use client';

import { ConnectButton, Theme } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client } from "@/lib/clients";

export function CustomConnectButton() {
    const wallets = [
        createWallet("io.metamask"),
        createWallet("com.coinbase.wallet"),
        createWallet("me.rainbow"),
        createWallet("io.rabby"),
        createWallet("io.zerion.wallet"),
    ];

    const theme: Theme = {
        colors: {
            accentButtonBg: 'rgba(21, 21, 17, 0.8)',
            accentButtonText: '#e8e8e3',
            accentText: '#20dbdd',
            borderColor: '#8444e4',
            connectedButtonBg: 'rgba(21, 21, 17, 0.9)',
            connectedButtonBgHover: 'rgba(132, 68, 228, 0.8)',
            danger: '#FF0800',
            inputAutofillBg: 'rgba(21, 21, 17, 0.9)',
            modalBg: 'rgba(10, 10, 10, 0.95)',
            modalOverlayBg: 'rgba(0, 0, 0, 0.8)',
            primaryButtonText: '#ffffff',
            primaryButtonBg: 'linear-gradient(135deg, #8444e4, #20dbdd)',
            primaryText: '#ffffff',
            scrollbarBg: 'rgba(132, 68, 228, 0.3)',
            secondaryButtonBg: 'rgba(21, 21, 17, 0.6)',
            secondaryButtonHoverBg: 'rgba(132, 68, 228, 0.6)',
            secondaryButtonText: '#e8e8e3',
            secondaryIconColor: '#20dbdd',
            secondaryIconHoverBg: 'rgba(32, 219, 221, 0.2)',
            secondaryIconHoverColor: '#20dbdd',
            secondaryText: '#e8e8e3',
            selectedTextBg: 'rgba(132, 68, 228, 0.3)',
            selectedTextColor: '#ffffff',
            separatorLine: 'rgba(132, 68, 228, 0.3)',
            skeletonBg: 'rgba(132, 68, 228, 0.1)',
            success: '#3FFF00',
            tertiaryBg: 'rgba(21, 21, 17, 0.4)',
            tooltipBg: 'rgba(21, 21, 17, 0.9)',
            tooltipText: '#e8e8e3',
        },
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        type: 'dark',
    };

    return (
        <div className="self-center flex flex-row justify-center relative group" suppressHydrationWarning>
            {/* Glowing background effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-teal-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
            
            <div className="relative glass-card-small hover:scale-105 transition-all duration-300">
                <ConnectButton
                    client={client}
                    theme={theme}
                    wallets={wallets}
                    connectButton={{
                        label: "🚀 CONNECT WALLET",
                        style: {
                            borderRadius: "16px",
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                            padding: "14px 28px",
                            background: "linear-gradient(135deg, #8444e4, #20dbdd)",
                            border: "1px solid rgba(132, 68, 228, 0.3)",
                            boxShadow: "0 4px 20px rgba(132, 68, 228, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                        },
                    }}
                    connectModal={{
                        size: "compact",
                        title: "🌌 Initialize Degen Connection",
                        titleIcon: "https://degenplays.com/logo.png",
                        showThirdwebBranding: false,
                        welcomeScreen: {
                            title: "Welcome to the Degen Network",
                            subtitle: "Connect your trading wallet to access the degenerative trading matrix",
                        },
                    }}
                    detailsModal={{
                        showTestnetFaucet: false,
                    }}
                />
            </div>
        </div>
    );
} 