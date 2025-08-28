import CryptoES from "crypto-es";



export async function encryptData(plainText, keyWordArray) {
    if (!keyWordArray) throw new Error("No encryption key available");
    return CryptoES.AES.encrypt(plainText, keyWordArray).toString();
}

export async function decryptData(cipherText, keyWordArray) {
    if (!keyWordArray) throw new Error("No encryption key available");
    const bytes = CryptoES.AES.decrypt(cipherText, keyWordArray);
    return bytes.toString(CryptoES.enc.Utf8);
}
