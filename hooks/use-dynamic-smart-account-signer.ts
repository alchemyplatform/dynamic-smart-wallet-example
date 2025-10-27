import { useDynamicClient } from "@/lib/dynamic-client";
import { raise } from "@/lib/utils";
import { useMemo } from "react";
import {
  Address,
  OneOf,
  SignableMessage,
  SignedAuthorization,
  TypedData,
  TypedDataDefinition,
} from "viem";

export const useDynamicSmartAccountSigner = () => {
  const dynamicWallet = useDynamicClient();
  const primaryWallet = dynamicWallet.wallets.primary;
  const isLoggedIn = !!primaryWallet;

  const account = useMemo(() => {
    if (!primaryWallet) {
      return null;
    }
    return dynamicWallet.viem.createAccountFromWallet(primaryWallet);
  }, [dynamicWallet.viem, primaryWallet]);

  const signer = useMemo(() => {
    if (!account) {
      return null;
    }

    return {
      signerType: "custom",
      inner: account,

      getAddress: async () => account.address,

      signMessage: (message: SignableMessage) =>
        account.signMessage?.({ message }) ??
        raise("signMessage not implemented"),

      signTypedData: <
        const TTypedData extends TypedData | Record<string, unknown>,
        TPrimaryType extends
          | keyof TTypedData
          | "EIP712Domain" = keyof TTypedData,
      >(
        params: TypedDataDefinition<TTypedData, TPrimaryType>,
      ) =>
        account.signTypedData?.(params) ??
        raise("signTypedData not implemented"),

      signAuthorization: async (
        unsignedAuthorization: OneOf<
          | {
              address: Address;
            }
          | {
              contractAddress: Address;
            }
        > & {
          chainId: number;
          nonce: number;
        },
      ): Promise<SignedAuthorization<number>> => {
        return (
          account.signAuthorization?.({
            address:
              unsignedAuthorization.address ??
              unsignedAuthorization.contractAddress ??
              raise("Missing delegation addresss"),
            nonce: unsignedAuthorization.nonce,
            chainId: unsignedAuthorization.chainId,
          }) ?? raise("signAuthorization not implemented")
        );
      },
    };
  }, [account]);

  return {
    address: account?.address,
    signer,
    isLoggedIn,
  };
};
