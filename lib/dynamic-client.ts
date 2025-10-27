import { createClient } from "@dynamic-labs/client";
import { useReactiveClient } from "@dynamic-labs/react-hooks";
import { ReactNativeExtension } from "@dynamic-labs/react-native-extension";
import { ViemExtension } from "@dynamic-labs/viem-extension";
import { raise } from "./utils";

export const dynamicClient = createClient({
  environmentId:
    process.env.EXPO_PUBLIC_DYNAMIC_ID ??
    raise("EXPO_PUBLIC_DYNAMIC_ID is not defined"),
})
  .extend(ReactNativeExtension())
  .extend(ViemExtension());

export const DynamicWebView = dynamicClient.reactNative.WebView;

export const useDynamicClient = () => {
  return useReactiveClient(dynamicClient);
};
