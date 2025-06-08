import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/supabaseClient';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { userId, email } = useLocalSearchParams();
  const [otp, setOtp] = useState('');
const [loading, setLoading] = useState(false);
  const handleVerify = async () => {
    setLoading(true);
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP.');
      return;
    }

    const { data, error } = await supabase
      .from('email_otps')
      .select('*')
      .eq('user_id', userId)
      .eq('otp', otp)
        .gt('expires_at', new Date().toISOString()) // Only fetch if not expired
        .single();


    if (error || !data) {
      Alert.alert('Error', 'Invalid OTP');
      return;
    }

    //const isExpired = new Date(data.expires_at) < new Date();
    //if (isExpired) {
    //  Alert.alert('Error', 'OTP has expired');
    //  return;
    //}

    // OTP is valid — delete it after verification
    await supabase.from('email_otps').delete().eq('id', data.id);

    // Redirect to dashboard based on user type
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('kindofuser')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.kindofuser) {
      Alert.alert('Error', 'User profile not found.');
      return;
    }

    const kind = profile.kindofuser.toLowerCase();
    if (kind === 'tenant') {
      router.replace('/(tabs)/tenant/explore');
    } else if (kind === 'landlord') {
      router.replace('/(tabs)/landlord/upload');
    } else {
      Alert.alert('Error', 'Unauthorized user type');
    }
    setLoading(false); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter the 6-digit code sent to {email}</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
        placeholder="Enter OTP"
      />
      <TouchableOpacity style={styles.button} onPress={handleVerify} disabled={loading}>
  <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
</TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 18, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#D12E2E',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 16 },
});
