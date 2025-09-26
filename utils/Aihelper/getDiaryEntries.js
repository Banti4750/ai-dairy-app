

import * as SecureStore from 'expo-secure-store';
import { decryptData } from '../cryptoEnDe.js';
import KDFJoinKey, { getStoredKey } from '../kdfService.js';

const BaseUrl = 'https://ai-dairy-backend.onrender.com';

const decryptEntries = async (entries) => {
    try {
        console.log('Starting decryption process...');

        // Get the stored key properly
        let keyLocal;
        try {
            keyLocal = await getStoredKey();
            // if (!keyLocal) {
            //     // Fallback to hardcoded key for testing - remove in production
            //     keyLocal = "7fef001aa5ee20392b84aac2dcb0678c5cf1fe31974af8678ead610369efef01";
            //     console.warn('Using fallback key - this should not happen in production');
            // }
        } catch (error) {
            console.error('Error getting stored key:', error);
            // Use fallback key
            keyLocal = "7fef001aa5ee20392b84aac2dcb0678c5cf1fe31974af8678ead610369efef01";
        }


        // TODO:
        // Derive the encryption key
        const derivedKey = await KDFJoinKey(keyLocal, "banti@gmail.cim", "$2b$10$rNBqeTOBxd0tuplCVq3BBO");

        if (!derivedKey) {
            throw new Error('Failed to derive encryption key');
        }

        console.log('Key derived successfully, processing entries...');

        let failedDecryptionCount = 0;
        const totalEntries = entries.length;

        const decryptedEntries = await Promise.all(
            entries.map(async (entry) => {
                try {
                    console.log('Processing entry:', entry._id);

                    // Check if entry has required encrypted fields
                    if (!entry.encryptedTitle || !entry.encryptedContent) {
                        console.warn('Entry missing encrypted fields:', entry._id);
                        return {
                            ...entry,
                            title: 'No encrypted data',
                            content: 'No encrypted content available',
                            date: entry.entryDate?.split('T')[0] || entry.createdAt?.split('T')[0],
                            decryptionSuccess: false
                        };
                    }

                    const decryptedTitle = await decryptData(entry.encryptedTitle, derivedKey);
                    const decryptedContent = await decryptData(entry.encryptedContent, derivedKey);

                    // Validate decryption results
                    if (!decryptedTitle || !decryptedContent ||
                        decryptedTitle.includes('�') || decryptedContent.includes('�') ||
                        decryptedTitle.trim().length === 0 || decryptedContent.trim().length === 0) {
                        throw new Error('Invalid decryption result');
                    }

                    console.log('Successfully decrypted entry:', entry._id);
                    console.log(`content ${decryptedContent.trim()}`)
                    console.log(`title ${decryptedTitle.trim()}`)

                    return {
                        ...entry,
                        title: decryptedTitle.trim(),
                        content: decryptedContent.trim(),
                        date: entry.entryDate?.split('T')[0] || entry.createdAt?.split('T')[0],
                        decryptionSuccess: true
                    };
                } catch (decryptError) {
                    console.error('Failed to decrypt entry:', entry._id, decryptError.message);
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

        // Check if too many entries failed (indicates wrong key)
        if (totalEntries > 0 && (failedDecryptionCount === totalEntries || failedDecryptionCount / totalEntries >= 0.8)) {
            console.error('Most entries failed to decrypt - likely wrong encryption key');
            throw new Error('WRONG_ENCRYPTION_KEY');
        }

        console.log(`Decryption complete. Success: ${totalEntries - failedDecryptionCount}/${totalEntries}`);
        return decryptedEntries;

    } catch (error) {
        console.error('Error during decryption process:', error);

        if (error.message === 'WRONG_ENCRYPTION_KEY') {
            throw error;
        }

        // Return entries with failed decryption status
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
    try {
        const token = await SecureStore.getItemAsync('authToken');

        if (!token) {
            throw new Error('No authentication token found');
        }

        console.log(`Fetching diary entries for timeframe: ${timeframe}`);

        const response = await fetch(`${BaseUrl}/api/diary/entries?timeframe=${timeframe}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.data || !data.data.entries) {
            console.warn('No entries found in response');
            return [];
        }

        console.log(`Retrieved ${data.data.entries.length} entries`);
        return await decryptEntries(data.data.entries);

    } catch (error) {
        console.error("Error fetching diary entries:", error);
        throw error;
    }
};

export const getDiaryEntriesByStartandEnd = async (start, end) => {
    try {
        const token = await SecureStore.getItemAsync('authToken');

        if (!token) {
            throw new Error('No authentication token found');
        }

        console.log(`Fetching diary entries from ${start} to ${end}`);

        const response = await fetch(`${BaseUrl}/api/diary/entries?start=${start}&end=${end}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.data || !data.data.entries) {
            console.warn('No entries found in response');
            return [];
        }

        console.log(`Retrieved ${data.data.entries.length} entries`);
        return await decryptEntries(data.data.entries);

    } catch (error) {
        console.error("Error fetching diary entries:", error);
        throw error;
    }
};

// Test function - remove in production
export const testDiaryFetch = async () => {
    try {
        console.log('Testing diary entry fetch...');
        const entries = await getDiaryEntries();
        console.log('Test successful, entries:', entries);

        return entries;
    } catch (error) {
        console.error('Test failed:', error);
        throw error;
    }
};