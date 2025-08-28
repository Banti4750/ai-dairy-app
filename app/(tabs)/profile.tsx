// In your profile/settings component
import { useAuth } from '@/context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';

const Profile = () => {
    const { logout, user } = useAuth();
    const [token, setToken] = useState("")


    useEffect(() => {

        (async () => {
            setToken(await SecureStore.getItemAsync('authToken') || "")
        })();

    }, []);

    const handleLogout = async () => {
        try {
            const result = await logout();
            if (result.success) {
                Alert.alert('Success', 'Logged out successfully');
                // Will automatically redirect to Auth screen
            } else {
                Alert.alert('Error', result.error);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to logout');
        }
    };

    return (
        <View style={{ padding: 20 }}>
            {user && (
                <Text style={{ fontSize: 18, marginBottom: 20 }}>
                    Welcome, {token}!
                </Text>
            )}
            <Button title="Logout" onPress={handleLogout} />
        </View>
    );
};

export default Profile