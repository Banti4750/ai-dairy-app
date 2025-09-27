import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Clipboard,
    Modal,
    ScrollView,
    Share,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import CryptoService from '../utils/CryptoService';

const EncryptionKeyCard = ({
    isVisible,
    onClose,
    mode = 'generate', // 'generate' or 'input'
    onKeyGenerated,
    onKeyVerified
}) => {
    const [generatedKey, setGeneratedKey] = useState('');
    const [inputKey, setInputKey] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [keyInfo, setKeyInfo] = useState(null);
    const [showFullKey, setShowFullKey] = useState(false);

    useEffect(() => {
        if (mode === 'generate' && isVisible) {
            generateNewKey();
        }
    }, [mode, isVisible]);

    const generateNewKey = async () => {
        setIsGenerating(true);
        try {
            const newKey = await CryptoService.generateMasterKey();
            // await SecureStore.setItemAsync('derivedKey', base64Key, { keychainAccessible: SecureStore.WHEN_UNLOCKED });
            setGeneratedKey(newKey);

            // Set key info for display
            setKeyInfo({
                partial: newKey.substring(0, 8) + '...' + newKey.substring(newKey.length - 8),
                full: newKey,
                length: newKey.length,
                type: 'AES-256-GCM',
                created: new Date().toISOString()
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to generate encryption key');
            console.error('Key generation error:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await Clipboard.setStringAsync(generatedKey);
            Alert.alert('Copied!', 'Encryption key copied to clipboard');
        } catch (error) {
            Alert.alert('Error', 'Failed to copy key');
        }
    };

    const downloadKey = async () => {
        try {
            const keyData = {
                encryptionKey: generatedKey,
                keyInfo: {
                    type: 'AES-256-GCM',
                    length: 256,
                    created: new Date().toISOString(),
                    appVersion: '1.0.0'
                },
                instructions: [
                    'This is your master encryption key for the AI Diary app',
                    'Keep this key safe and secure - you cannot recover your data without it',
                    'Do not share this key with anyone',
                    'Store this in a secure location like a password manager',
                    'You will need this key every time you log in'
                ],
                warning: 'IMPORTANT: If you lose this key, your encrypted diary entries cannot be recovered!'
            };

            const fileName = `ai_diary_encryption_key_${new Date().toISOString().split('T')[0]}.json`;
            const fileUri = FileSystem.documentDirectory + fileName;

            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(keyData, null, 2));

            // Check if sharing is available
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/json',
                    dialogTitle: 'Save your encryption key'
                });
            } else {
                Alert.alert('File Saved', `Key saved to: ${fileName}`);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to save key file');
            console.error('Download error:', error);
        }
    };

    const shareKey = async () => {
        try {
            const message = `Your AI Diary Encryption Key:\n\n${generatedKey}\n\nIMPORTANT: Keep this key safe and secure. You cannot recover your data without it!`;

            await Share.share({
                message: message,
                title: 'AI Diary Encryption Key'
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to share key');
        }
    };

    const handleKeyInput = (text) => {
        setInputKey(text.trim());
    };

    const verifyAndSetKey = async () => {
        if (!inputKey) {
            Alert.alert('Error', 'Please enter your encryption key');
            return;
        }

        if (!CryptoService.isValidKey(inputKey)) {
            Alert.alert('Invalid Key', 'Please enter a valid 64-character encryption key');
            return;
        }

        try {
            CryptoService.setMasterKey(inputKey);
            await SecureStore.setItemAsync('userKey', inputKey, { keychainAccessible: SecureStore.WHEN_UNLOCKED });
            console.log("hi input key")
            Alert.alert('Success!', 'Encryption key verified and set successfully');
            onKeyVerified?.(inputKey);
        } catch (error) {
            Alert.alert('Error', 'Invalid encryption key format');
            console.error('Key verification error:', error);
        }
    };

    const confirmKeyAndProceed = () => {
        Alert.alert(
            'Confirm Key Safety',
            'Have you safely stored your encryption key?\n\n⚠️ WARNING: If you lose this key, your diary entries cannot be recovered!',
            [
                {
                    text: 'Not Yet',
                    style: 'cancel'
                },
                {
                    text: 'Yes, I\'ve Saved It',
                    onPress: () => {
                        CryptoService.setMasterKey(generatedKey);
                        onKeyGenerated?.(generatedKey);
                    }
                }
            ]
        );
    };

    if (!isVisible) return null;

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            presentationStyle="pageSheet"
        >
            <View className="flex-1 bg-gray-50">
                <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>

                    {/* Header */}
                    <View className="items-center mb-6">
                        <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
                            <Text className="text-blue-600 text-2xl">🔐</Text>
                        </View>
                        <Text className="text-2xl font-bold text-gray-800 text-center">
                            {mode === 'generate' ? 'Your Encryption Key' : 'Enter Encryption Key'}
                        </Text>
                        <Text className="text-gray-600 text-center mt-2">
                            {mode === 'generate'
                                ? 'This key will encrypt and protect your diary entries'
                                : 'Please enter your encryption key to access your diary'
                            }
                        </Text>
                    </View>

                    {mode === 'generate' ? (
                        <>
                            {/* Generated Key Display */}
                            <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="text-lg font-semibold text-gray-800">Generated Key</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowFullKey(!showFullKey)}
                                        className="px-3 py-1 bg-gray-100 rounded-full"
                                    >
                                        <Text className="text-sm text-gray-600">
                                            {showFullKey ? 'Hide' : 'Show'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                <View className="bg-gray-50 p-4 rounded-lg mb-4">
                                    <Text className="font-mono text-sm text-gray-800" selectable>
                                        {isGenerating ? 'Generating...' :
                                            showFullKey ? generatedKey : keyInfo?.partial}
                                    </Text>
                                </View>

                                {keyInfo && (
                                    <View className="space-y-2">
                                        <Text className="text-sm text-gray-600">
                                            Type: {keyInfo.type}
                                        </Text>
                                        <Text className="text-sm text-gray-600">
                                            Length: {keyInfo.length} bits
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Action Buttons */}
                            <View className="space-y-3 mb-6">
                                <TouchableOpacity
                                    onPress={copyToClipboard}
                                    className="bg-blue-600 py-4 rounded-xl"
                                    disabled={isGenerating}
                                >
                                    <Text className="text-white font-semibold text-center text-lg">
                                        📋 Copy to Clipboard
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={downloadKey}
                                    className="bg-green-600 py-4 rounded-xl"
                                    disabled={isGenerating}
                                >
                                    <Text className="text-white font-semibold text-center text-lg">
                                        💾 Download Key File
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={shareKey}
                                    className="bg-purple-600 py-4 rounded-xl"
                                    disabled={isGenerating}
                                >
                                    <Text className="text-white font-semibold text-center text-lg">
                                        📤 Share Key
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Warning */}
                            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                                <Text className="text-red-800 font-semibold mb-2">⚠️ IMPORTANT WARNING</Text>
                                <Text className="text-red-700 text-sm leading-5">
                                    • Keep this key safe and secure{'\n'}
                                    • You cannot recover your diary without it{'\n'}
                                    • Store it in multiple secure locations{'\n'}
                                    • Never share it with anyone{'\n'}
                                    • If lost, your data cannot be recovered!
                                </Text>
                            </View>

                            {/* Bottom Actions */}
                            <View className="flex-row space-x-3">
                                <TouchableOpacity
                                    onPress={onClose}
                                    className="flex-1 bg-gray-300 py-4 rounded-xl"
                                >
                                    <Text className="text-gray-800 font-semibold text-center">Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={confirmKeyAndProceed}
                                    className="flex-1 bg-gray-800 py-4 rounded-xl"
                                    disabled={isGenerating}
                                >
                                    <Text className="text-white font-semibold text-center">
                                        I've Saved It Safely
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <>
                            {/* Key Input */}
                            <View className="bg-white rounded-xl p-6 shadow-sm mb-6">
                                <Text className="text-lg font-semibold text-gray-800 mb-4">
                                    Enter Your Encryption Key
                                </Text>

                                <TextInput
                                    className="bg-gray-50 p-4 rounded-lg font-mono text-sm"
                                    placeholder="Paste your 64-character encryption key here"
                                    value={inputKey}
                                    onChangeText={handleKeyInput}
                                    multiline
                                    autoCorrect={false}
                                    autoCapitalize="none"
                                    placeholderTextColor="#9CA3AF"
                                />

                                <Text className="text-sm text-gray-500 mt-2">
                                    Key should be 64 characters long
                                </Text>
                            </View>

                            {/* Bottom Actions */}
                            <View className="flex-row space-x-3">
                                <TouchableOpacity
                                    onPress={onClose}
                                    className="flex-1 bg-gray-300 py-4 rounded-xl"
                                >
                                    <Text className="text-gray-800 font-semibold text-center">Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={verifyAndSetKey}
                                    className="flex-1 bg-blue-600 py-4 rounded-xl"
                                    disabled={!inputKey}
                                >
                                    <Text className="text-white font-semibold text-center">
                                        Verify & Continue
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </ScrollView>
            </View>
        </Modal>
    );
};

export default EncryptionKeyCard;