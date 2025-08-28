
import { useAuth } from '@/context/AuthContext';
import { decryptData, encryptData } from '@/utils/cryptoEnDe';
import { getStoredKey, KDFJoinKey } from '@/utils/kdfService';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';


export default function App() {
    const { logout, user, token } = useAuth();
    const [key, setKey] = useState('');
    const [encrypted, setEncrypted] = useState('');
    const [decrypted, setDecrypted] = useState('');
    const [keyLocal, setkeyLocal] = useState("")

    const demoText = 'hi i am hjdfgbfhdjgb dfgduiffgdfughbanti';

    useEffect(() => {
        (async () => {
            try {
                setkeyLocal(await getStoredKey() || "")
                const derivedKey = await KDFJoinKey(keyLocal, user.email, 'duygdsuy');
                setKey(derivedKey); // store in state for display

                // 3️⃣ Encrypt using the derived key
                const cipher = await encryptData(demoText, derivedKey);
                setEncrypted(cipher);

                // 4️⃣ Decrypt using the derived key
                const plain = await decryptData(cipher, derivedKey);
                setDecrypted(plain);
            } catch (err) {
                console.error('Crypto error:', err);
            }
        })();
    }, []);


    return (
        <View style={styles.container}>
            <Text>Derived Key: {key}</Text>
            <Text>Encrypted: {encrypted}</Text>
            <Text>Decrypted: {decrypted}</Text>
            <Text>{keyLocal}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
});
