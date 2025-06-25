  import React, { useState } from 'react';
  import { SafeAreaView, View, TouchableOpacity, Text, StyleSheet, TextInput, Image, Modal, Dimensions, Alert } from 'react-native';
  import { useRouter } from 'expo-router';
  import Icon from 'react-native-vector-icons/AntDesign';
  import { supabase } from '@/supabaseClient';
  import 'react-native-url-polyfill/auto';

  const { width, height } = Dimensions.get('screen');

  export default function LoginScreen() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const toggleCheckbox = () => {
      setIsChecked(!isChecked);
    };

    const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Missing Fields', 'Please fill in both email and password.');
    return;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data?.user) {
      Alert.alert(
        'Authentication Failed',
        'You havent confirmed your email yet or entered a wrong email/password'
      );
      return;
      //throw new Error('Authentication failed. Please try again.');
      
    }

    const user = data.user;

    if (!user.email_confirmed_at) {
      Alert.alert(
        'Authentication Failed',
        'You entered a wrong password/email or havent confirmed your email yet.'
      );
      return;
    }

    console.log('Email confirmed on:', user.email_confirmed_at);

    // ✅ Send OTP via Supabase Edge Function
    const response = await fetch('https://mcotdjwbuonaekscxbxa.supabase.co/functions/v1/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        email: user.email,
      }),
    });

    if (!response.ok) {
      let errorMsg = 'Failed to send OTP.';
      try {
        const errorResponse = await response.json();
        errorMsg = errorResponse.error || errorMsg;
      } catch (_) {}
      console.error('OTP send error:', errorMsg);
      Alert.alert('Error', errorMsg);
      return;
    }

    // ✅ Navigate to OTP verification screen
      router.push({
        pathname: '/verify-otp',
        params: {
          userId: user.id,
          email: user.email,
        },
      });

  } catch (error) {
    console.error('Login error:', error);
    Alert.alert('Login Error', error instanceof Error ? error.message : 'Something went wrong.');
  }
};


    async function sendPasswordResetEmail(email: string) {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://reset-page-janellas-projects-deef3e64.vercel.app/', 
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Password reset email sent! Check your inbox.');
      }
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.rectangle}>
          <Image source={require('@/assets/images/logo-red.png')} style={styles.image} />
          <Text style={styles.welcome}>Welcome</Text>
          
          <TextInput style={styles.inputLogin}
            placeholder="Email" placeholderTextColor="#909090" value={email} onChangeText={setEmail}/>

        <View style={styles.passwordContainer}>
          <TextInput style={[styles.inputLogin, styles.inputGap, styles.passwordInput]}
            placeholder="Password" placeholderTextColor="#909090"
            value={password} onChangeText={setPassword} secureTextEntry={!showPassword}/>
          <TouchableOpacity style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}>
            <Icon name={showPassword ? "eye" : "eyeo"} size={24} color="#D12E2E"/>
          </TouchableOpacity>
        </View>
      
          <View style={styles.rowContainer}>
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[styles.checkBox, isChecked && styles.checkboxChecked]}
                onPress={toggleCheckbox}
              >
                {isChecked && <Icon name="check" size={14} color="#fff" />}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Remember Me</Text>
            </View>
            <TouchableOpacity onPress={() => sendPasswordResetEmail(email)}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
        
          <View style={styles.rowContainer01}>
            <Text style={styles.text}>Don't have an account? </Text>

            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={styles.signupText}>Sign Up Now</Text>
            </TouchableOpacity>
          </View>

          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={20} color="#909090" /> 
                </TouchableOpacity>

                <Text style={styles.modalTitle}>SIGN UP</Text>
                <Text style={styles.modalTitle02}>AS</Text>
                
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => router.push('/(auth)/tenant-signup')}
                  onPressOut={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>TENANT</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => router.push('/(auth)/landlord-signup')}
                  onPressOut={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>LANDLORD</Text>
                </TouchableOpacity>

              </View>
            </View>
          </Modal>
        </View>
      </SafeAreaView>
    );
  }


const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#EE5A24',
    },
  
    rectangle: {
      height: height * 1,
      width: width * 1,
      backgroundColor: '#FFFFFF',
      borderTopRightRadius: 30,
      borderTopLeftRadius: 30,
      position: 'absolute',
      top: 65,
      alignItems: 'center',
      paddingTop: 20,
    },
  
    image: {
      width: 290,
      height: 290,
      marginTop: 5,
    },
  
    welcome: {
      color: '#D12E2E',
      fontSize: 24,
      fontWeight: 'bold',
      fontFamily: 'Inter',
      position: 'absolute',
      marginTop: 290,
    },
  
    inputLogin: {
      width: '80%',
      padding: 13,
      borderWidth: 1,
      borderColor: '#D12E2E',
      borderRadius: 10,
      marginTop: 20,
      backgroundColor: '#fff',
      color: 'black',
      fontFamily: 'Inter',
      elevation: 3,
    },
  
    inputGap: {
      marginTop: 20,
    },
  
    rowContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '77%',
      marginBottom: 30,
      marginTop: 10,
    },
  
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  
    checkBox: {
      width: 15,
      height: 15,
      borderWidth: 1,
      borderColor: '#D12E2E',
      borderRadius: 3,
      marginRight: 10,
    },
  
    checkboxLabel: {
      fontFamily: 'Inter',
      fontSize: 12,
      color: '#D42121',
      fontWeight: 'bold',
    },
  
    checkboxChecked: {
      backgroundColor: '#D12E2E',
    },
  
    loginButton: {
      width: '35%',
      height: 50,
      backgroundColor: '#D12E2E',
      padding: 13,
      borderRadius: 10,
      marginTop: 5,
      alignItems: 'center',
      elevation: 5,
    },
  
    loginText: {
      color: '#FFFFFF',
      fontFamily: 'Inter',
      fontWeight: 'bold',
      fontSize: 18,
      textAlign: 'center',
    },
  
    rowContainer01: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      width: '50%',
      marginTop: '38%',
    },
  
    text:{
      color: '#000000',
      fontFamily: 'Inter',
      fontWeight: 400,
      fontSize: 14,
    },
  
    signupText: {
      color:'#D42121',
      fontWeight: 'bold',
      fontFamily: 'Inter',
      fontSize: 14,
    },
  
    modalBackground: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
  
    modalContainer: {
      width: '80%',
      backgroundColor: '#FFFFFF',
      borderRadius: 15,
      padding: 20,
      alignItems: 'center',
      position: 'relative',
    },
  
    modalTitle: {
      fontSize: 32,
      fontFamily: 'Inter',
      fontWeight: 'bold',
      marginTop: 30,
      color: '#D12E2E',
    },
  
    modalTitle02: {
      fontSize: 18,
      fontFamily: 'Inter',
      fontWeight: 'bold',
      color: '#D12E2E',
      marginBottom: 20,
    },
  
    modalButton: {
      width: '60%',
      padding: 15,
      marginBottom: 10,
      backgroundColor: '#D12E2E',
      borderRadius: 15,
      alignItems: 'center',
      elevation: 5,
    }, 
    modalButtonText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 20,
      fontFamily: 'Inter',
    },
    closeButton: {
      marginTop: 15,
      padding: 10,
      position: 'absolute',
      right: 15,
    },

    passwordContainer: {
      width: '80%',
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center'
    },
    passwordInput: {
      width: '100%',
    },
    eyeIcon: {
      position: 'absolute',
      right: 15,
      top: '50%',
      justifyContent: 'center',
      alignItems: 'center',
    },

    forgotPasswordText: {
      color: '#909090',
      textAlign: 'right',
      marginRight: 10,
      fontSize: 12,
      fontFamily: 'Inter', 
    },
  });