import TakeData from '@/components/Takedata';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';

interface GoalsProps {
    onGoalsSubmit?: (goals: string) => void;
}

const BASE_URL = 'http://192.168.1.23:9000/api/userdetails';

const Goals: React.FC<GoalsProps> = ({ onGoalsSubmit }) => {
    const [goalsDB, setGoalsDB] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    const fetchGoals = async () => {
        try {
            const token = await SecureStore.getItemAsync('authToken');

            if (!token) {
                console.error('No auth token found');
                setLoading(false);
                return;
            }

            const response = await fetch(`${BASE_URL}/goals/get`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to get goals:', errorData.message);
                setLoading(false);
                return;
            }

            const result = await response.json();
            console.log('Fetched goals:', result);

            // Set the goals from database or empty string if null
            setGoalsDB(result.goals || '');
        } catch (error) {
            console.error('Error getting goals:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const handleSubmit = async (value: string) => {
        try {
            const token = await SecureStore.getItemAsync('authToken');

            if (!token) {
                console.error('No auth token found');
                return;
            }

            console.log('Submitting goals:', value);

            const response = await fetch(`${BASE_URL}/goals/add-update`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    goals: value
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to update goals:', errorData.message);
                return;
            }

            const result = await response.json();
            console.log('Goals updated successfully:', result);
            Alert.alert('Success', '✨ Goals updated successfully!', [
                { text: 'OK', style: 'default' }
            ]);

            // Update local state with new goals
            setGoalsDB(value);

            if (onGoalsSubmit) {
                onGoalsSubmit(value);
            }

            // You might want to navigate to next screen or show success message
            // navigation.navigate('Purpose') or showSuccessToast()
        } catch (error) {
            console.error('Error submitting goals:', error);
        }
    };

    return (
        <TakeData
            title="What do you want to achieve?"
            description="Share your goals to help AI diary create personalized recaps that track your progress and keep you motivated. Be specific about what success looks like to you."
            inputPlaceholder="I want to become a successful writer by publishing my first novel within the next year. I also want to improve my physical health by exercising regularly and eating mindfully..."
            handleSubmit={handleSubmit}
            buttonText="Set My Goals"
            multiline={true}
            maxLength={400}
            loading={loading}
            initialValue={goalsDB}
        />
    );
};

export default Goals;