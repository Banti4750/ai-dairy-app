import TakeData from '@/components/Takedata';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface AboutProps {
    onAboutSubmit?: (about: string) => void;
}

const BASE_URL = 'https://ai-dairy-backend.onrender.com/api/userdetails';

const About: React.FC<AboutProps> = ({ onAboutSubmit }) => {
    const [aboutDB, setAboutDB] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    const fetchAbout = async () => {
        try {
            const token = await SecureStore.getItemAsync('authToken');

            if (!token) {
                console.error('No auth token found');
                setLoading(false);
                return;
            }

            const response = await fetch(`${BASE_URL}/aboutme/get`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to get about info:', errorData.message);
                setLoading(false);
                return;
            }

            const result = await response.json();
            console.log('Fetched about info:', result);

            // Set about from DB or empty string if null
            setAboutDB(result.aboutme || '');
        } catch (error) {
            console.error('Error getting about info:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAbout();
    }, []);

    const handleSubmit = async (value: string) => {
        try {
            const token = await SecureStore.getItemAsync('authToken');

            if (!token) {
                console.error('No auth token found');
                return;
            }

            console.log('About submitted:', value);

            const response = await fetch(`${BASE_URL}/aboutme/add-update`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    aboutme: value
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to update about info:', errorData.message);
                return;
            }

            const result = await response.json();
            console.log('About info updated successfully:', result);
            Alert.alert('Success', '✨ AboutMe updated successfully!', [
                { text: 'OK', style: 'default' }
            ]);

            // Update local state with new about info
            setAboutDB(value);

            if (onAboutSubmit) {
                onAboutSubmit(value);
            }

            // You might want to navigate to next screen or show success message
            // navigation.navigate('Dashboard') or showSuccessToast()
        } catch (error) {
            console.error('Error submitting about info:', error);
        }
    };

    return (
        <TakeData
            title="Tell us about yourself"
            description="Share your background, interests, and what makes you unique. This helps the AI understand your personality and provide more personalized diary insights and reflections."
            inputPlaceholder="I'm a creative person who loves reading, hiking, and learning new things. I value deep conversations and meaningful connections. I'm currently working in tech but have always been passionate about writing and art..."
            handleSubmit={handleSubmit}
            buttonText="Complete Profile"
            multiline={true}
            maxLength={450}
            loading={loading}
            initialValue={aboutDB}
        />
    );
};

export default About;