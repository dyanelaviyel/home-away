import React, { useState } from 'react';
import { View, StyleSheet, Text, Dimensions, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { supabase } from '@/supabaseClient';
import { NavigationProp } from '@react-navigation/native';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('screen');
type RootStackParamList = {
  Login: undefined;
};
export default function LoginSecurity() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      Alert.alert('Success', 'Password updated successfully');
      setIsExpanded(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', 'Failed to update password');
    }
  };

  const handleDeleteAccount = async () => {
  Alert.alert(
    'Delete Account',
    'Are you sure you want to delete your account? This action cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
              console.error('Error getting user:', userError?.message);
              Alert.alert('Error', 'Could not get current user.');
              return;
            }

            const { error: profileError } = await supabase
              .from('profiles')
              .delete()
              .eq('id', user.id);

            if (profileError) {
              console.error('Error deleting profile:', profileError.message);
              Alert.alert('Error', 'Failed to delete user profile from database.');
              return;
            }

            console.log(`✅ Profile with ID ${user.id} deleted from database.`);

            const { error: signOutError } = await supabase.auth.signOut();
            if (signOutError) {
              console.error('Sign-out error:', signOutError.message);
              Alert.alert('Error', 'Sign-out failed.');
              return;
            }

            console.log('✅ Signed out successfully. Redirecting to login...');
            router.replace('/(auth)/login'); // Make sure this path exists
          } catch (error: any) {
            console.error('Unexpected error during account deletion:', error);
            Alert.alert('Error', 'Unexpected error deleting account.');
          }
        },
      },
    ]
  );
};


  return (
    <View style={styles.container}>
      <View style={styles.redcontainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-ios" size={20} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Login & Security</Text>
      </View>

      <View style={styles.whitecontainer}>
        <Text style={styles.subtitle}>Password</Text>
        <View style={styles.details}>
          <View style={styles.rectangle}>
            <Text style={styles.label}>Change Password</Text>
            <Icon 
              onPress={() => setIsExpanded((prev) => !prev)}
              name={isExpanded ? "expand-less" : "expand-more"}
              size={26} 
              color="black" 
            />
          </View>
        </View>

        {isExpanded && (
          <View style={styles.dropdown}>
            <View style={styles.edit}>
              <Text style={styles.editLabel}>Current Password</Text>
              <TextInput
                style={styles.editPass}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
              />

              <Text style={styles.editLabel}>New Password</Text>
              <TextInput
                style={styles.editPass}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
              />

              <Text style={styles.editLabel}>Confirm Password</Text>
              <TextInput
                style={styles.editPass}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
              />
            </View>

            <TouchableOpacity style={styles.updateButton} onPress={handlePasswordChange}>
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>    
          </View>
        )}

        <Text style={styles.subtitle}>Account</Text>
        <View style={styles.details}>
          <TouchableOpacity style={styles.rectangle} onPress={handleDeleteAccount}>
            <Text style={[styles.label, { color: '#D12E2E' }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center',
    backgroundColor: '#D12E2E',
  },
  redcontainer: {
    backgroundColor: '#D12E2E',
    width: width * 1,
    alignItems: 'center',
    height: 87,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  whitecontainer: {
    height: height * 1,
    width: width * 1,
    backgroundColor: '#fff',
    padding: 10,
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 16,
    marginTop: 45,
    textAlign: 'center',
    flex: 1,
  },

  backButton: {
    left: 25,
    marginTop: 45,
    zIndex: 10,
  },

  subtitle: {
    fontWeight: 'bold',
    fontSize: 20,
    padding: 10,
    marginBottom: 10,
  },
  rectangle: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ADADAD',
    width: 330,
    height: 45,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  label:{
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'left',
  },
  details: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dropdown: {
    alignItems: 'center',
    marginBottom: 20,
  },
  edit: {
    marginBottom: 20,
  },
  editLabel: {
    fontSize: 12,
    left: 5,
    color: '#616060',
  },
  editPass: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#C6C6C6',
    width: 270,
    height: 45,
    padding: 10,
    marginTop: 5,
    marginBottom: 18,
  },
  updateButton: {
    backgroundColor: '#D12E2E',
    borderRadius: 20,
    width: 90,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginRight: 55,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
