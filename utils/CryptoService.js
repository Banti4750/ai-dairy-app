// utils/CryptoService.js
import * as Crypto from 'expo-crypto';

class CryptoService {
    static instance = null;
    masterKey = null;

    static getInstance() {
        if (!CryptoService.instance) {
            CryptoService.instance = new CryptoService();
        }
        return CryptoService.instance;
    }

    // Convert ArrayBuffer to hex string
    arrayBufferToHex(buffer) {
        return Array.from(new Uint8Array(buffer))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // Convert hex string to ArrayBuffer
    hexToArrayBuffer(hexString) {
        const bytes = new Uint8Array(hexString.length / 2);
        for (let i = 0; i < hexString.length; i += 2) {
            bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
        }
        return bytes.buffer;
    }

    // Generate secure random bytes
    async generateRandomBytes(length) {
        try {
            const randomBytes = await Crypto.getRandomBytesAsync(length);
            return this.arrayBufferToHex(randomBytes);
        } catch (error) {
            console.error('Error generating random bytes:', error);
            throw error;
        }
    }

    // Generate master encryption key (32 bytes = 256 bits)
    async generateMasterKey() {
        try {
            const keyHex = await this.generateRandomBytes(32);
            this.masterKey = keyHex;
            return keyHex;
        } catch (error) {
            console.error('Error generating master key:', error);
            throw error;
        }
    }

    // Derive key from password using PBKDF2
    async deriveKeyFromPassword(password, salt, iterations = 100000) {
        try {
            // Use Web Crypto API for proper PBKDF2
            const enc = new TextEncoder();
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                enc.encode(password),
                { name: 'PBKDF2' },
                false,
                ['deriveBits', 'deriveKey']
            );

            const saltBuffer = this.hexToArrayBuffer(salt);

            const key = await crypto.subtle.deriveKey(
                {
                    name: 'PBKDF2',
                    salt: saltBuffer,
                    iterations: iterations,
                    hash: 'SHA-256'
                },
                keyMaterial,
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );

            const exported = await crypto.subtle.exportKey('raw', key);
            return this.arrayBufferToHex(exported);
        } catch (error) {
            console.error('Error deriving key from password:', error);
            throw error;
        }
    }

    // AES-GCM encryption (secure)
    async encryptWithAES(data, keyHex) {
        try {
            const enc = new TextEncoder();
            const dataBuffer = enc.encode(JSON.stringify(data));

            // Generate random IV (12 bytes for GCM)
            const ivHex = await this.generateRandomBytes(12);
            const iv = this.hexToArrayBuffer(ivHex);

            // Import key
            const keyBuffer = this.hexToArrayBuffer(keyHex);
            const cryptoKey = await Crypto.subtle.importKey(
                'raw',
                keyBuffer,
                { name: 'AES-GCM' },
                false,
                ['encrypt']
            );
            console.log("hi")
            // Encrypt
            const encrypted = await Crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                cryptoKey,
                dataBuffer
            );

            return {
                data: this.arrayBufferToHex(encrypted),
                iv: ivHex,
                algorithm: 'AES-GCM'
            };
        } catch (error) {
            console.error('AES encryption error:', error);
            throw error;
        }
    }

    // AES-GCM decryption (secure)
    async decryptWithAES(encryptedData, keyHex) {
        try {
            const dataBuffer = this.hexToArrayBuffer(encryptedData.data);
            const iv = this.hexToArrayBuffer(encryptedData.iv);

            // Import key
            const keyBuffer = this.hexToArrayBuffer(keyHex);
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                keyBuffer,
                { name: 'AES-GCM' },
                false,
                ['decrypt']
            );

            // Decrypt
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                cryptoKey,
                dataBuffer
            );

            const dec = new TextDecoder();
            const decryptedString = dec.decode(decrypted);
            return JSON.parse(decryptedString);
        } catch (error) {
            console.error('AES decryption error:', error);
            throw error;
        }
    }

    // Encrypt content with master key
    async encryptContent(content) {
        if (!this.masterKey) {
            throw new Error('Master key not available. Please initialize first.');
        }
        return await this.encryptWithAES(content, this.masterKey);
    }

    // Decrypt content with master key
    async decryptContent(encryptedContent) {
        if (!this.masterKey) {
            throw new Error('Master key not available. Please initialize first.');
        }
        return await this.decryptWithAES(encryptedContent, this.masterKey);
    }

    // Set master key (when user provides it)
    setMasterKey(keyHex) {
        // Validate key format
        if (!keyHex || keyHex.length !== 64) {
            throw new Error('Invalid key format. Expected 64 character hex string.');
        }
        this.masterKey = keyHex;
    }

    // Clear sensitive data from memory
    clearKeys() {
        this.masterKey = null;
    }

    // Check if service is ready
    isReady() {
        return this.masterKey !== null;
    }

    // Get key info for display (first 8 chars only)
    getKeyInfo() {
        if (!this.masterKey) return null;

        return {
            partial: this.masterKey.substring(0, 8) + '...',
            length: this.masterKey.length,
            type: 'AES-256-GCM',
            status: 'Active'
        };
    }

    // Validate key format
    isValidKey(keyHex) {
        return typeof keyHex === 'string' &&
            keyHex.length === 64 &&
            /^[0-9a-fA-F]+$/.test(keyHex);
    }
}

export default CryptoService.getInstance();