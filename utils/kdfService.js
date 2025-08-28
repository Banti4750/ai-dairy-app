import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

export const KDFJoinKey = async (encryptedKey, email, userSaltFromDb) => {
    const combinedword = `${email}:${userSaltFromDb}:${encryptedKey}`;

    const derived = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        combinedword
    );
    return derived
};


// Retrieve key from storage
export async function getStoredKey() {
    return await SecureStore.getItemAsync('userKey');
}
