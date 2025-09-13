const BaseUrl = 'http://192.168.1.23:9000';
console.log("BaseUrl:", BaseUrl);
import * as SecureStore from 'expo-secure-store';

// Hardcoded token (replace with SecureStore later)
// const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YjE4NWI5MDRjNjA1ZjY2OWE2N2NjMCIsImVtYWlsIjoiYmFudGlAZ21haWwuY2ltIiwiaWF0IjoxNzU3Nzg4NDQzLCJleHAiOjE3NTgzOTMyNDN9.XctXEN8TcCPX0kFzP45-jb8etnOqo8fCiLxWhpBJqis";
export const getPurpose = async () => {
    const token = await SecureStore.getItemAsync('authToken');
    try {
        const response = await fetch(`${BaseUrl}/api/userdetails/purpose/get`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();
        console.log("Purpose data:", data);
        return data.purpose;
    } catch (error) {
        console.error("Error fetching purpose:", error);
        throw error;
    }
};

export const getGoal = async () => {
    const token = await SecureStore.getItemAsync('authToken');
    try {
        const response = await fetch(`${BaseUrl}/api/userdetails/goals/get`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();
        console.log("Goals data:", data);
        return data.goals;
    } catch (error) {
        console.error("Error fetching goals:", error);
        throw error;
    }
};

export const getAboutMe = async () => {
    const token = await SecureStore.getItemAsync('authToken');
    try {
        const response = await fetch(`${BaseUrl}/api/userdetails/aboutme/get`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await response.json();
        console.log("AboutMe data:", data);
        return data.aboutme;
    } catch (error) {
        console.error("Error fetching about me:", error);
        throw error;
    }
};

// Run them all
(async () => {
    await getPurpose();
    await getGoal();
    await getAboutMe();
})();
