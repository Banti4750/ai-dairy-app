// get purose: get all data from the database

const BaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
import * as SecureStore from 'expo-secure-store';
export const getPurpose = async () => {
    const token = await SecureStore.getItemAsync('authToken');
    try {
        const response = await fetch(`${BaseUrl}/api/purpose`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error fetching purpose:", error);
        throw error;
    }
};

export const getGoal = async () => {
    const token = await SecureStore.getItemAsync('authToken');
    try {
        const response = await fetch(`${BaseUrl}/api/goal`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return await response.json();
    }
    catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

export const getAboutMe = async () => {
    try {
        const response = await fetch(`${BaseUrl}/api/goal`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        return await response.json();
    }
    catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

