'use client';
import { SignInWithBaseButton } from '@base-org/account-ui/react';
import { useAccount, useSignMessage, usePublicClient } from 'wagmi';
import { createSiweMessage, generateSiweNonce } from 'viem/siwe';

interface WalletConnectProps {
  onSuccess?: () => void;
}

export function WalletConnect({ onSuccess }: WalletConnectProps) {
  const { address, chainId, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const publicClient = usePublicClient();

  async function signIn() {
    if (!isConnected || !address || !chainId || !publicClient) return;

    const nonce = generateSiweNonce();
    const message = createSiweMessage({
      address,
      chainId,
      domain: window.location.host,
      nonce,
      uri: window.location.origin,
      version: '1',
    });

    const signature = await signMessageAsync({ message });
    const valid = await publicClient.verifySiweMessage({ message, signature });

    if (valid) {
      const res = await fetch('/api/auth/base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, message, signature }),
      });
      if (res.ok) {
        onSuccess?.();
      }
    }
  }

  return <SignInWithBaseButton colorScheme="dark" onClick={signIn} />;
}
