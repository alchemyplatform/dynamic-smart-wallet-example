import { dynamicClient } from "@/lib/dynamic-client";
import { useState } from "react";
import { ActivityIndicator, Button, TextInput, View } from "react-native";

export const EmailSignIn = () => {
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
            <ActivityIndicator size="large" style={{ paddingVertical: 10 }} />
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
