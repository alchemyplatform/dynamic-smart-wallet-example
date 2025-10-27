import { createClient } from "@dynamic-labs/client";
import { useReactiveClient } from "@dynamic-labs/react-hooks";
import { ReactNativeExtension } from "@dynamic-labs/react-native-extension";
import { ViemExtension } from "@dynamic-labs/viem-extension";

export const dynamicClient = createClient({
  // Find your environment id at https://app.dynamic.xyz/dashboard/developer
  environmentId: process.env.EXPO_PUBLIC_DYNAMIC_ID!,
})
  .extend(ReactNativeExtension())
  .extend(ViemExtension());

export const DynamicWebView = dynamicClient.reactNative.WebView;

export const useDynamicClient = () => {
  return useReactiveClient(dynamicClient);
};
