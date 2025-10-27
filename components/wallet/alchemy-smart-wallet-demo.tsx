import { useAlchemySmartWalletClient } from "@/hooks/use-alchemy-smart-wallet";
import { arbitrumSepolia } from "@account-kit/infra";
import { createSmartWalletClient } from "@account-kit/wallet-client";
import { useState } from "react";
import { ActivityIndicator, Button, View } from "react-native";
import { zeroAddress } from "viem";

type AlchemySmartWalletDemoProps = {
  signer: Parameters<typeof createSmartWalletClient>[0]["signer"];
};

export const AlchemySmartWalletDemo = ({
  signer,
}: AlchemySmartWalletDemoProps) => {
  const { client, account, isLoading } = useAlchemySmartWalletClient({
    chain: arbitrumSepolia,
    signer,
  });
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!account) return;

    setIsSending(true);
    try {
      const {
        preparedCallIds: [callId],
      } = await client.sendCalls({
        from: account,
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

  if (isLoading) {
    return (
      <View>
        <ActivityIndicator size="large" style={{ marginVertical: 10 }} />
      </View>
    );
  }

  return (
    <View>
      {isSending ? (
        <ActivityIndicator size="large" style={{ marginVertical: 10 }} />
      ) : (
        <Button onPress={handleSend} title="Send call" disabled={!account} />
      )}
    </View>
  );
};
