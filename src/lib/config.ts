import { http, createConfig, createStorage, cookieStorage } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { baseAccount, injected } from 'wagmi/connectors';

const baseApiKey = process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
    baseAccount({ appName: 'BonkWithClaude' }),
  ],
  storage: createStorage({ storage: cookieStorage }),
  ssr: true,
  transports: {
    [base.id]: http(baseApiKey ? `https://api.developer.coinbase.com/rpc/v1/base/${baseApiKey}` : undefined),
    [baseSepolia.id]: http(baseApiKey ? `https://api.developer.coinbase.com/rpc/v1/base-sepolia/${baseApiKey}` : undefined),
  },
});
