import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { alchemy, arbitrumSepolia } from "@account-kit/infra";
import { createSmartWalletClient } from "@account-kit/wallet-client";
import { createClient } from "@dynamic-labs/client";
import { useReactiveClient } from "@dynamic-labs/react-hooks";
import { ReactNativeExtension } from "@dynamic-labs/react-native-extension";
import { ViemExtension } from "@dynamic-labs/viem-extension";
import "@react-native-anywhere/polyfill-base64";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import {
  Address,
  OneOf,
  SignableMessage,
  SignedAuthorization,
  TypedData,
  TypedDataDefinition,
  zeroAddress,
} from "viem";

export const dynamicClient = createClient({
  // Find your environment id at https://app.dynamic.xyz/dashboard/developer
  environmentId: process.env.EXPO_PUBLIC_DYNAMIC_ID!,
})
  .extend(ReactNativeExtension())
  .extend(ViemExtension());

// const MAV2_DELEGATION_ADDR = "0x69007702764179f14F51cdce752f4f775d74E139";

export default function HomeScreen() {
  const dynClient = useReactiveClient(dynamicClient);
  // const alchClient = useAlchemyWalletClient();
  const isLoggedIn = !!dynClient.wallets.primary;

  // const getAuthorization = async (params: {
  //   chainId: number;
  //   contractAddress: Address;
  // }) => {
  //   const primaryWallet = dynClient.wallets.primary;

  //   if (!primaryWallet) {
  //     // Handle no wallet connected
  //     return null;
  //   }

  //   const account = dynClient.viem.createAccountFromWallet(primaryWallet);

  //   const authorization = await account.signAuthorization?.({
  //     chainId: params.chainId,
  //     address: params.contractAddress,
  //     nonce: 0,
  //   });

  //   return authorization;
  // };

  const { signer } = useDynamicSmartAccountSigner(dynClient);

  return (
    <>
      <dynamicClient.reactNative.WebView />
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        headerImage={
          <Image
            source={require("@/assets/images/partial-react-logo.png")}
            style={styles.reactLogo}
          />
        }
      >
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">Wallet</ThemedText>

          {!isLoggedIn ? (
            <EmailSignIn />
          ) : (
            <>
              <ThemedText>
                {JSON.stringify(dynClient.wallets.primary)}
              </ThemedText>
              {signer && <AlchemySmartWalletDemo signer={signer} />}
              {/* <Button
                onPress={async () => {
                  const auth = await getAuthorization({
                    contractAddress: MAV2_DELEGATION_ADDR,
                    chainId: 1,
                  });
                  console.log("Authorization:", auth);
                }}
                title="Sign authorization"
              /> */}
              <Button
                onPress={async () => {
                  await dynClient.auth.logout();
                }}
                title="Logout"
                color="#ff3b30"
              />
            </>
          )}
        </ThemedView>
      </ParallaxScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});

const AlchemySmartWalletDemo = (props: {
  signer: Parameters<typeof createSmartWalletClient>[0]["signer"];
}) => {
  const [isSending, setIsSending] = useState(false);
  const [client] = useState(() =>
    createSmartWalletClient({
      signer: props.signer,
      transport: alchemy({ apiKey: process.env.EXPO_PUBLIC_ALCHEMY_API_KEY! }),
      chain: arbitrumSepolia,
      policyId: process.env.EXPO_PUBLIC_ALCHEMY_POLICY_ID!,
    }),
  );

  // TODO(jh): make a hook for getting client & requesting account.
  const handleSend = async () => {
    setIsSending(true);
    try {
      const account = await client.requestAccount({
        creationHint: {
          accountType: "7702",
        },
      });
      console.log("Smart wallet account:", account.address);
      const {
        preparedCallIds: [callId],
      } = await client.sendCalls({
        from: account.address,
        calls: [
          {
            to: zeroAddress,
            data: "0x",
            value: "0x0",
          },
        ],
      });
      console.log("Sent call, id:", callId);
      const status = await client.waitForCallsStatus({
        id: callId,
      });
      alert(`Call status: ${status.status}`);
      console.log("Call status:", status);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View>
      {isSending ? (
        <ActivityIndicator size="large" style={{ marginVertical: 10 }} />
      ) : (
        <Button onPress={handleSend} title="Send call" />
      )}
    </View>
  );
};

const EmailSignIn = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSendOTP = async () => {
    await dynamicClient.auth.email.sendOTP(email);
    setOtpSent(true);
  };

  const handleResendOTP = () => {
    dynamicClient.auth.email.resendOTP();
  };

  const handleVerifyOTP = async () => {
    setIsVerifying(true);
    try {
      await dynamicClient.auth.email.verifyOTP(otp);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View>
      {!otpSent ? (
        <View>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            autoFocus
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button onPress={handleSendOTP} title="Send OTP" />
        </View>
      ) : (
        <View>
          <TextInput
            value={otp}
            onChangeText={setOtp}
            placeholder="Enter OTP"
            autoFocus
            keyboardType="number-pad"
            editable={!isVerifying}
          />
          {isVerifying ? (
            <ActivityIndicator size="large" style={{ marginVertical: 10 }} />
          ) : (
            <>
              <Button onPress={handleVerifyOTP} title="Verify OTP" />
              <Button onPress={handleResendOTP} title="Resend OTP" />
            </>
          )}
        </View>
      )}
    </View>
  );
};

const useDynamicSmartAccountSigner = (dynClient: typeof dynamicClient) => {
  const signer = useMemo(() => {
    const primaryWallet = dynClient.wallets.primary;
    if (!primaryWallet) {
      return null;
    }

    const account = dynClient.viem.createAccountFromWallet(primaryWallet);

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
  }, [dynClient.viem, dynClient.wallets.primary]);

  return { signer };
};

const raise = (msg: string): never => {
  throw new Error(msg);
};
