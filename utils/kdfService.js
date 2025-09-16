// import * as Crypto from 'expo-crypto';
// import * as SecureStore from 'expo-secure-store';

// export const KDFJoinKey = async (encryptedKey, email, userSaltFromDb) => {
//     const combinedword = `${email}:${userSaltFromDb}:${encryptedKey}`;

//     const derived = await Crypto.digestStringAsync(
//         Crypto.CryptoDigestAlgorithm.SHA256,
//         combinedword
//     );
//     return derived
// };


// // Retrieve key from storage
// export async function getStoredKey() {
//     return await SecureStore.getItemAsync('userKey');
// }


import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

// Main KDF function - make this the default export
const KDFJoinKey = async (encryptedKey, email, userSaltFromDb) => {
    try {
        if (!encryptedKey || !email || !userSaltFromDb) {
            throw new Error('Missing required parameters for KDF');
        }

        const combinedword = `${email}:${userSaltFromDb}:${encryptedKey}`;

        const derived = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            combinedword
        );

        return derived;
    } catch (error) {
        console.error('KDF Error:', error);
        throw error;
    }
};

// Retrieve key from storage
export const getStoredKey = async () => {
    try {
        return await SecureStore.getItemAsync('userKey');
    } catch (error) {
        console.error('Error retrieving stored key:', error);
        return null;
    }
};

// Export as both named and default export for compatibility
export { KDFJoinKey };
export default KDFJoinKey;