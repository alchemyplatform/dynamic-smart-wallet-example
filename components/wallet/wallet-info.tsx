import { ThemedText } from "@/components/themed-text";
import { useDynamicClient } from "@/lib/dynamic-client";
import { Button } from "react-native";

export const DynamicWalletInfo = () => {
  const dynClient = useDynamicClient();

  return (
    <>
      <ThemedText>{JSON.stringify(dynClient.wallets.primary)}</ThemedText>
      <Button
        onPress={async () => {
          await dynClient.auth.logout();
        }}
        title="Logout"
        color="#ff3b30"
      />
    </>
  );
};
