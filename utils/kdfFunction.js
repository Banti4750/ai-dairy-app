import * as Crypto from 'expo-crypto';

export const KDFJoinKey = async (encryptedKey, email, userSaltFromDb) => {
    const combinedword = `${email}:${userSaltFromDb}:${encryptedKey}`;

    const derived = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        combinedword
    );
    return derived
};
