import { KDFJoinKey } from '@/utils/kdfFunction'; // fixed import
import CryptoES from "crypto-es";
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
    const [key, setKey] = useState("");
    const [endata, setEndata] = useState("");
    const [dedata, setDedata] = useState("");
    const democontent = "hi i am jshdfvhjdbg dfhvdfuvhgd dsvgvdfyuvgd svgdsvg dvhjdgdvubanti";

    useEffect(() => {
        (async () => {
            // 1️⃣ Derive the key first
            const digest = await KDFJoinKey("dshjvfdhj", "sduyvdsyu", "duygdsuy");
            setKey(digest);

            // 2️⃣ Encrypt after key is ready
            const encrypted = CryptoES.AES.encrypt(democontent, digest).toString();
            setEndata(encrypted);

            // 3️⃣ Decrypt after encryption
            const decrypted = CryptoES.AES.decrypt(encrypted, digest).toString(CryptoES.enc.Utf8);
            setDedata(decrypted);
        })();
    }, []);

    return (
        <View style={styles.container}>
            <Text>Derived Key: {key}</Text>
            <Text>Encrypted Data: {endata}</Text>
            <Text>Decrypted Data: {dedata}</Text>
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
