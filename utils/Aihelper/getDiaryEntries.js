
const BaseUrl = 'http://192.168.1.23:9000';

// const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YjE4NWI5MDRjNjA1ZjY2OWE2N2NjMCIsImVtYWlsIjoiYmFudGlAZ21haWwuY2ltIiwiaWF0IjoxNzU3Nzg4NDQzLCJleHAiOjE3NTgzOTMyNDN9.XctXEN8TcCPX0kFzP45-jb8etnOqo8fCiLxWhpBJqis";
import * as SecureStore from 'expo-secure-store';
import { decryptData } from '../cryptoEnDe.js';
import KDFJoinKey, { getStoredKey } from '../kdfService.js';

const decryptEntries = async (entries) => {
    // const { user } = useAuth();
    try {
        const keyLocal = await getStoredKey();
        // const derivedKey = await KDFJoinKey(keyLocal, user.email, user.encryptionKeySalt);

        //testing
        // const keyLocal = "7fef001aa5ee20392b84aac2dcb0678c5cf1fe31974af8678ead610369efef01";
        const derivedKey = await KDFJoinKey(keyLocal, "banti@gmail.cim", "$2b$10$rNBqeTOBxd0tuplCVq3BBO");

        console.log('Decrypting entries with derived key...');

        let failedDecryptionCount = 0;
        const totalEntries = entries.length;

        const decryptedEntries = await Promise.all(
            entries.map(async (entry) => {
                try {
                    console.log('Decrypting entry:', entry._id);

                    const decryptedTitle = await decryptData(entry.encryptedTitle, derivedKey);
                    const decryptedContent = await decryptData(entry.encryptedContent, derivedKey);
                    console.log('Decrypted title and content:', { decryptedTitle, decryptedContent });
                    // Check if decryption actually worked (not just empty or garbled data)
                    if (!decryptedTitle || !decryptedContent ||
                        decryptedTitle.includes('�') || decryptedContent.includes('�') ||
                        decryptedTitle.length === 0 || decryptedContent.length === 0) {
                        throw new Error('Invalid decryption result');
                    }

                    console.log('Decrypted successfully:', { title: decryptedTitle, content: decryptedContent });

                    return {
                        ...entry,
                        title: decryptedTitle,
                        content: decryptedContent,
                        date: entry.entryDate?.split('T')[0] || entry.createdAt?.split('T')[0],
                        decryptionSuccess: true
                    };
                } catch (decryptError) {
                    console.error('Failed to decrypt entry:', entry._id, decryptError);
                    failedDecryptionCount++;

                    return {
                        ...entry,
                        title: 'Unable to decrypt',
                        content: 'Unable to decrypt content',
                        date: entry.entryDate?.split('T')[0] || entry.createdAt?.split('T')[0],
                        decryptionSuccess: false
                    };
                }
            })
        );

        // If all or most entries failed to decrypt, it's likely a wrong encryption key
        if (totalEntries > 0 && (failedDecryptionCount === totalEntries || failedDecryptionCount / totalEntries >= 0.8)) {
            console.error('Most entries failed to decrypt - likely wrong encryption key');
            throw new Error('WRONG_ENCRYPTION_KEY');
        }

        console.log('All entries processed:', decryptedEntries);
        return decryptedEntries;
    } catch (error) {
        console.error('Error during decryption:', error);

        if (error.message === 'WRONG_ENCRYPTION_KEY') {
            throw error; // Re-throw to be handled in fetchDiaryEntries
        }

        return entries.map(entry => ({
            ...entry,
            title: 'Decryption failed',
            content: 'Unable to decrypt content',
            date: entry.entryDate?.split('T')[0] || entry.createdAt?.split('T')[0],
            decryptionSuccess: false
        }));
    }
};


export const getDiaryEntries = async (timeframe = 'yesterday') => {
    const token = await SecureStore.getItemAsync('authToken');
    try {
        // entries?start=2025-09-01&end=2025-09-14
        const response = await fetch(`${BaseUrl}/api/diary/entries?timeframe=${timeframe}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            // body: JSON.stringify({ timeframe })
        });

        const data = await response.json();
        console.log("Purpose data:", data.data.entries);
        return decryptEntries(data.data.entries);
    } catch (error) {
        console.error("Error fetching diary entries:", error);
        throw error;
    }
};

export const getDiaryEntriesByStartandEnd = async (start, end) => {
    const token = await SecureStore.getItemAsync('authToken');
    try {
        const response = await fetch(`${BaseUrl}/api/diary/entries?start=${start}&end=${end}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            // body: JSON.stringify({ timeframe })
        });

        const data = await response.json();
        console.log("Purpose data:", data.data.entries);
        return decryptEntries(data.data.entries);
    } catch (error) {
        console.error("Error fetching diary entries:", error);
        throw error;
    }
};


(async () => {
    try {
        await getDiaryEntries();
        await getDiaryEntriesByStartandEnd("2025-09-01", "2025-09-14");
    } catch (err) {
        console.error("Error in test run:", err);
    }
})();
