import { raise } from "@/lib/utils";
import { alchemy, arbitrumSepolia } from "@account-kit/infra";
import { createSmartWalletClient } from "@account-kit/wallet-client";
import { useEffect, useState } from "react";
import { Address, Chain } from "viem";

type UseAlchemySmartWalletClientParams = {
  chain: Chain;
  signer: Parameters<typeof createSmartWalletClient>[0]["signer"];
};

export const useAlchemySmartWalletClient = ({
  chain,
  signer,
}: UseAlchemySmartWalletClientParams) => {
  const [isLoading, setIsLoading] = useState(true);
  const [account, setAccount] = useState<Address | undefined>();

  const [client] = useState(() =>
    createSmartWalletClient({
      signer,
      transport: alchemy({
        apiKey:
          process.env.EXPO_PUBLIC_ALCHEMY_API_KEY ??
          raise("EXPO_PUBLIC_ALCHEMY_API_KEY is not defined"),
      }),
      chain: arbitrumSepolia,
      policyId:
        process.env.EXPO_PUBLIC_ALCHEMY_POLICY_ID ??
        raise("EXPO_PUBLIC_ALCHEMY_POLICY_ID is not defined"),
    }),
  );

  useEffect(() => {
    const requestAccount = async () => {
      setIsLoading(true);
      try {
        const { address } = await client.requestAccount({
          creationHint: {
            accountType: "7702",
          },
        });
        console.log("Smart wallet account:", address);
        setAccount(address);
      } catch (error) {
        console.error("Failed to request account:", error);
      } finally {
        setIsLoading(false);
      }
    };

    requestAccount();
  }, [client]);

  return {
    client,
    account,
    isLoading,
  };
};
