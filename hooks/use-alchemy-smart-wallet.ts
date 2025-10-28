import { raise } from "@/lib/utils";
import { alchemy } from "@account-kit/infra";
import { createSmartWalletClient } from "@account-kit/wallet-client";
import { useState } from "react";
import { Address, Chain } from "viem";

type UseAlchemySmartWalletClientParams = {
  chain: Chain;
  signer: Parameters<typeof createSmartWalletClient>[0]["signer"];
  address: Address;
};

export const useAlchemySmartWalletClient = ({
  address,
  chain,
  signer,
}: UseAlchemySmartWalletClientParams) => {
  const [client] = useState(() =>
    createSmartWalletClient({
      signer,
      transport: alchemy({
        apiKey:
          process.env.EXPO_PUBLIC_ALCHEMY_API_KEY ??
          raise("EXPO_PUBLIC_ALCHEMY_API_KEY is not defined"),
      }),
      chain,
      account: address,
      policyId:
        process.env.EXPO_PUBLIC_ALCHEMY_POLICY_ID ??
        raise("EXPO_PUBLIC_ALCHEMY_POLICY_ID is not defined"),
    }),
  );

  return {
    client,
  };
};
