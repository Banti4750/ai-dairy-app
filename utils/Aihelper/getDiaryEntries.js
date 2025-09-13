import * as SecureStore from 'expo-secure-store';

const BaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const getDiaryEntries = async (timeframe = '30days') => {
    const token = await SecureStore.getItemAsync('authToken');
    try {
        const response = await fetch(`${BaseUrl}/api/diary-entries`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ timeframe })
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching diary entries:", error);
        throw error;
    }
};