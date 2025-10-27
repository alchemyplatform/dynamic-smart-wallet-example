import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AlchemySmartWalletDemo } from "@/components/wallet/alchemy-smart-wallet-demo";
import { EmailSignIn } from "@/components/wallet/email-sign-in";
import { DynamicWalletInfo } from "@/components/wallet/wallet-info";
import { useDynamicSmartAccountSigner } from "@/hooks/use-dynamic-smart-account-signer";
import { DynamicWebView } from "@/lib/dynamic-client";
import "@react-native-anywhere/polyfill-base64";
import { Image } from "expo-image";
import { StyleSheet } from "react-native";

export default function HomeScreen() {
  const { isLoggedIn, signer } = useDynamicSmartAccountSigner();

  return (
    <>
      <DynamicWebView />
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
          {!isLoggedIn ? <EmailSignIn /> : <DynamicWalletInfo />}
          {signer && <AlchemySmartWalletDemo signer={signer} />}
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
