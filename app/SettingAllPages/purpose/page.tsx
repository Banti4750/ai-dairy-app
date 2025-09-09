import TakeData from '@/components/Takedata';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface PurposeProps {
    onPurposeSubmit?: (purpose: string) => void;
}

const BASE_URL = 'http://192.168.1.23:9000/api/userdetails';

const Purpose: React.FC<PurposeProps> = ({ onPurposeSubmit }) => {
    const [purposeDB, setPurposeDB] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    const fetchPurpose = async () => {
        try {
            const token = await SecureStore.getItemAsync('authToken');

            if (!token) {
                console.error('No auth token found');
                setLoading(false);
                return;
            }

            const response = await fetch(`${BASE_URL}/purpose/get`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to get purpose:', errorData.message);
                setLoading(false);
                return;
            }

            const result = await response.json();
            console.log('Fetched purpose:', result);


            // Set purpose from DB or empty string if null
            setPurposeDB(result.purpose || '');
        } catch (error) {
            console.error('Error getting purpose:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPurpose();
    }, []);

    const handleSubmit = async (value: string) => {
        try {
            const token = await SecureStore.getItemAsync('authToken');

            if (!token) {
                console.error('No auth token found');
                return;
            }

            console.log('Purpose submitted:', value);

            const response = await fetch(`${BASE_URL}/purpose/add-update`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    purpose: value
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to update purpose:', errorData.message);
                return;
            }

            const result = await response.json();
            console.log('Purpose updated successfully:', result);
            Alert.alert('Success', '✨ Purpose updated successfully!', [
                { text: 'OK', style: 'default' }
            ]);

            // Update local state with new purpose
            setPurposeDB(value);

            if (onPurposeSubmit) {
                onPurposeSubmit(value);
            }

            // You might want to navigate to next screen or show success message
            // navigation.navigate('About') or showSuccessToast()
        } catch (error) {
            console.error('Error submitting purpose:', error);
        }
    };

    return (
        <TakeData
            title="What's your deeper purpose?"
            description="Understanding your core purpose helps the AI provide more meaningful insights and suggestions that align with what truly matters to you in life."
            inputPlaceholder="My purpose is to inspire others through storytelling and creativity. I want to make a positive impact by sharing experiences that help people feel less alone and more connected to their own potential..."
            handleSubmit={handleSubmit}
            buttonText="Define My Purpose"
            multiline={true}
            maxLength={350}
            loading={loading}
            initialValue={purposeDB}
        />
    );
};

export default Purpose;