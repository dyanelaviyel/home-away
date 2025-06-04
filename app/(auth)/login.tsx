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
        alert('Please fill in all fields');
        return;
      }
    
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
    
        if (error || !data?.user) {
          throw new Error('Authentication failed. Please try again.');
        }

          //Check if email is confirmed
        try {
          const { data: userData, error } = await supabase.auth.getUser();

          if (error) {
            console.error('Error fetching user:', error.message);
            Alert.alert('Error', 'Unable to verify email confirmation status.');
            return;
          }

          const confirmedAt = userData?.user?.email_confirmed_at;

          if (!confirmedAt) {
            Alert.alert(
              'Email Not Confirmed',
              'Please check your email and confirm your account before continuing.'
            );
            return;
          }

          // Email is confirmed, continue with the login logic here
          console.log('Email confirmed on:', confirmedAt);

        } catch (err) {
          console.error('Unexpected error checking email confirmation:', err);
          Alert.alert('Error', 'Something went wrong. Please try again later.');
        }

    
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('kindofuser')
          .eq('id', data.user.id)
          .single();
    
        if (profileError || !profileData?.kindofuser) {
          throw new Error('User profile not found. Please contact support.');
        }
    
        const userType = profileData.kindofuser.toLowerCase();
        console.log('User type:', userType);
    
        // Navigate based on user type
        if (userType === 'landlord') {
          router.replace('/(tabs)/landlord/upload'); // Navigate to landlord explore
        } else if (userType === 'tenant') {
          router.replace('/(tabs)/tenant/explore'); // Navigate to tenant explore
        } else {
          alert('Unauthorized user type. Please log in with the correct account.');
        }
      } catch (error) {
        // Properly handle 'unknown' type
        if (error instanceof Error) {
          console.error('Error during login:', error.message);
          alert(error.message || 'Login failed. Please try again.');
        } else {
          console.error('Unexpected error:', error);
          alert('An unexpected error occurred. Please try again.');
        }
      }
    };

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
  
    forgotPassword: {
      fontFamily: 'Inter',
      fontSize: 12,
      color: '#909090',
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
    }
  
  });