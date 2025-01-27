import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Linking, Dimensions, Image, ImageBackground, TouchableOpacity, RefreshControl } from 'react-native';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { supabase } from '@/supabaseClient';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const { width, height } = Dimensions.get('screen');

interface ProfileData {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
    fb_link: string;
    email: string;
}

export function ProfileLScreen() {
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [fb_link, setFbLink] = useState('');
    const [email, setEmail] = useState('');
    const navigation = useNavigation();

    const fetchUserProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                
                if (user) {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('first_name, last_name, number, address, fb_link, email')
                        .eq('id', user.id)
                        .single();
    
                    if (error) throw error;
    
                    if (data) {
                        const combinedName = `${data.first_name} ${data.last_name}`;
                        setFullName(combinedName);
                        setPhoneNumber(data.number);
                        setAddress(data.address);
                        setFbLink(data.fb_link);
                        setEmail(data.email);
                    }
                }
            } catch (error) {
                console.log('Error fetching profile:', error);
            }
        };
    
        useEffect(() => {
            fetchUserProfile();
        
            const unsubscribe = navigation.addListener('focus', () => {
                fetchUserProfile();
            });
        
            const subscription = supabase
                .channel('profile-changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'profiles'
                    },
                    () => {
                        fetchUserProfile();
                    }
                )
                .subscribe();
        
            return () => {
                unsubscribe();
                subscription.unsubscribe();
            };
        }, [navigation]);

        const openFacebookLink = () => {
            if (fb_link) {
                Linking.openURL(fb_link);
            }
        };
        

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.redcontainer}>
                <Text style={styles.page}>Profile</Text>
            </View>
            <View style={styles.whitecontainer}>
                <ImageBackground source={require('@/assets/images/default-profile.jpg')} blurRadius={10} style={styles.imageBlur} />
                <Image source={require('@/assets/images/default-profile.jpg')} style={styles.profilePicture} />
                <Text style={styles.tName}>{fullName}</Text>
                <Text style={styles.role}>Landlord</Text>

                <View style={styles.landlordInfo}>
                    <View style={styles.rowInfo}>
                        <Text style={styles.label}>Phone:</Text>
                        <Text style={styles.infoText}>{phoneNumber}</Text>
                    </View>
                    <View style={styles.horizontalLine2} />

                    <View style={styles.rowInfo}>
                        <Text style={styles.label}>Address:</Text>
                        <Text style={styles.infoText}>{address}</Text>
                    </View>
                    <View style={styles.horizontalLine2} />

                    <View style={styles.rowInfo}>
                        <Text style={styles.label}>Email:</Text>
                        <Text style={styles.infoText}>{email}</Text>
                    </View>
                    <View style={styles.horizontalLine2} />

                    <TouchableOpacity onPress={openFacebookLink} style={styles.rowInfo}>
                        <Text style={styles.label}>Facebook: </Text>
                        <Text style={[styles.infoText, { color: '#4267B2', textDecorationLine: 'underline' }]}>
                            {fb_link || 'Not linked'}
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
        </SafeAreaView>
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
        height: 40,
        flexDirection: 'row',
        justifyContent: 'center',
        position: 'relative',
    },

    page: {
        fontWeight: 'bold',
        color: 'white',
        fontSize: 16,
        marginTop: 0,
    },

    whitecontainer: {
        height: height * 1,
        width: width * 1,
        backgroundColor: '#fff',
        padding: 0,
        flex: 1,
        margin:0,
        alignItems: 'center',
    },

    titleCurrent: { 
        fontSize: 18, 
        fontWeight: 'bold',     
    },

    titleRent: { 
        fontSize: 18, 
        fontWeight: 'bold',
        marginLeft: 40,     
    },

    card: { 
        backgroundColor: '#fff', 
        width: 300, 
        height: 230,
        marginBottom: 2,
        marginTop: 20, 
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width:0, height: 3 },  
        shadowOpacity: 0.25,  
        shadowRadius: 1,
    },

    image: {
        width: '100%',
        height: '60%',
    },

    imageBlur: {
        width: width * 1,
        height: 270,
        shadowColor: '#000',
        shadowOffset: { width:0, height: 3 },  
        shadowOpacity: 0.4,  
        shadowRadius: 4,
    },

    profilePicture: {
        width: 110,
        height: 110,
        borderRadius: 180,
        borderWidth: 5,
        borderColor: 'white',
        position: 'absolute',
        marginTop: 210,
        shadowColor: '#000',
        shadowOffset: { width:0, height: 0 },  
        shadowOpacity: 0.25,  
        shadowRadius: 2,
    },

    tName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#D12E2E',
        marginTop: 60,
    },

    role: {
        fontSize: 16,
        color: 'black',
        marginTop: 5,
        fontWeight: 'semibold',
    },
    rowInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        width: '100%',
        flexWrap: 'wrap'
      },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    infoText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 10,
      },
    horizontalLine2: {
        height: 1,
        width: '100%',
        backgroundColor: '#ADADAD',
        borderRadius: 20,
        marginVertical: 10,
        alignSelf: 'center',
      },

    landlordInfo: {
        width: width * 0.9,
        alignSelf: 'center',
        marginTop: 20,
      },

});


