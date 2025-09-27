import { useAuth } from '@/context/AuthContext';
import { decryptData, encryptData } from '@/utils/cryptoEnDe';
import { getStoredKey, KDFJoinKey } from '@/utils/kdfService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const page = () => {
    const { user } = useAuth();
    const params = useLocalSearchParams();
    const router = useRouter();
    const { id } = params;

    const [diary, setDiary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [decryptionError, setDecryptionError] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [saving, setSaving] = useState(false);

    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const scrollViewRef = useRef(null);


    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardVisible(true);
        });
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardVisible(false);
            setFocusedField(null);
        });

        return () => {
            keyboardDidHideListener?.remove();
            keyboardDidShowListener?.remove();
        };
    }, []);

    async function fetchDiaryById(id: any) {
        const token = await SecureStore.getItemAsync('authToken');
        try {
            const response = await fetch(`https://ai-dairy-backend.onrender.com/api/diary/entries/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('diary fetched:', data);

                if (data.data) {
                    const decryptedEntry = await decryptSingleEntry(data.data);
                    setDiary(decryptedEntry);
                    setEditTitle(decryptedEntry.title);
                    setEditContent(decryptedEntry.content);
                } else {
                    console.error('No diary data found');
                }
            } else {
                console.error('Failed to fetch diary:', response.status);
            }
        } catch (error) {
            console.error('Error fetching diary:', error);
        } finally {
            setLoading(false);
        }
    }

    const decryptSingleEntry = async (entry: any) => {
        try {
            const keyLocal = await getStoredKey();
            const derivedKey = await KDFJoinKey(keyLocal, user.email, user.encryptionKeySalt);

            const decryptedTitle = await decryptData(entry.encryptedTitle, derivedKey);
            const decryptedContent = await decryptData(entry.encryptedContent, derivedKey);

            if (!decryptedTitle || !decryptedContent ||
                decryptedTitle.includes('�') || decryptedContent.includes('�') ||
                decryptedTitle.length === 0 || decryptedContent.length === 0) {
                throw new Error('Invalid decryption result');
            }

            return {
                ...entry,
                title: decryptedTitle,
                content: decryptedContent,
                date: entry.entryDate?.split('T')[0] || entry.createdAt?.split('T')[0],
                decryptionSuccess: true
            };
        } catch (decryptError) {
            console.error('Failed to decrypt entry:', entry._id, decryptError);
            setDecryptionError(true);

            return {
                ...entry,
                title: 'Unable to decrypt',
                content: 'Unable to decrypt content',
                date: entry.entryDate?.split('T')[0] || entry.createdAt?.split('T')[0],
                decryptionSuccess: false
            };
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!editTitle.trim() || !editContent.trim()) {
            Alert.alert('Error', 'Title and content cannot be empty');
            return;
        }

        setSaving(true);
        try {
            const keyLocal = await getStoredKey();
            const derivedKey = await KDFJoinKey(keyLocal, user.email, user.encryptionKeySalt);

            const encryptedTitle = await encryptData(editTitle, derivedKey);
            const encryptedContent = await encryptData(editContent, derivedKey);

            const token = await SecureStore.getItemAsync('authToken');

            const response = await fetch(`https://ai-dairy-backend.onrender.com/api/diary/entries/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    encryptedTitle,
                    encryptedContent,
                }),
            });

            if (response.ok) {
                setDiary(prev => ({
                    ...prev,
                    title: editTitle,
                    content: editContent,
                }));
                setIsEditing(false);
                Alert.alert('Success', 'Entry updated successfully');
            } else {
                Alert.alert('Error', 'Failed to update entry');
            }
        } catch (error) {
            console.error('Error updating entry:', error);
            Alert.alert('Error', 'Failed to update entry');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setEditTitle(diary.title);
        setEditContent(diary.content);
        setIsEditing(false);
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Entry',
            'Are you sure you want to delete this diary entry? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: confirmDelete
                }
            ]
        );
    };

    const confirmDelete = async () => {
        try {
            const token = await SecureStore.getItemAsync('authToken');

            const response = await fetch(`https://ai-dairy-backend.onrender.com/api/diary/entries/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                Alert.alert('Success', 'Entry deleted successfully');
                router.back();
            } else {
                Alert.alert('Error', 'Failed to delete entry');
            }
        } catch (error) {
            console.error('Error deleting entry:', error);
            Alert.alert('Error', 'Failed to delete entry');
        }
    };

    useEffect(() => {
        if (id) {
            fetchDiaryById(id);
        }
    }, [id]);

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#000000" />
                <Text className="text-gray-600 mt-4 text-base">Loading entry...</Text>
            </View>
        );
    }

    if (!diary) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center px-6">
                <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <Text className="text-gray-800 text-lg font-medium text-center">
                        Unable to load entry
                    </Text>
                    <Text className="text-gray-500 text-sm text-center mt-2">
                        Please try again later
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white border-b border-gray-100">
                <View className="px-6 py-6">
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-2xl font-bold text-black">Entry</Text>
                            <Text className="text-sm text-gray-500 mt-1">{diary.date}</Text>
                        </View>

                        <View className="flex-row space-x-2">
                            {!isEditing ? (
                                <>
                                    <TouchableOpacity
                                        onPress={handleEdit}
                                        className="bg-black px-5 py-2.5 rounded-full"
                                        activeOpacity={0.8}
                                    >
                                        <Text className="text-white font-medium text-sm">Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleDelete}
                                        className="bg-gray-200 px-5 py-2.5 rounded-full"
                                        activeOpacity={0.8}
                                    >
                                        <Text className="text-gray-700 font-medium text-sm">Delete</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        onPress={handleCancel}
                                        className="bg-gray-200 px-5 py-2.5 rounded-full"
                                        activeOpacity={0.8}
                                    >
                                        <Text className="text-gray-700 font-medium text-sm">Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleSave}
                                        className="bg-black px-5 py-2.5 rounded-full"
                                        disabled={saving}
                                        activeOpacity={0.8}
                                    >
                                        <Text className="text-white font-medium text-sm">
                                            {saving ? 'Saving...' : 'Save'}
                                        </Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView
                ref={scrollViewRef}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: isKeyboardVisible ? 350 : 50 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets={true}
            >
                <View className="px-6 py-8">
                    {/* Decryption Error */}
                    {decryptionError && (
                        <View className="bg-gray-100 border-l-4 border-gray-400 p-4 rounded-r-lg mb-6">
                            <Text className="text-gray-700 text-sm font-medium">
                                Decryption Warning
                            </Text>
                            <Text className="text-gray-600 text-sm mt-1">
                                Content may not display correctly due to decryption issues.
                            </Text>
                        </View>
                    )}

                    {/* Title Section */}
                    <View className="mb-8">
                        {isEditing ? (
                            <View>
                                <Text className="text-gray-700 text-sm font-medium mb-3 uppercase tracking-wide">
                                    Title
                                </Text>
                                <TextInput
                                    value={editTitle}
                                    onChangeText={setEditTitle}
                                    className="bg-white border border-gray-200 rounded-xl p-4 text-xl font-semibold text-black"
                                    placeholder="Enter title..."
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    style={{ minHeight: 60 }}
                                />
                            </View>
                        ) : (
                            <View>
                                <Text className="text-3xl font-bold text-black leading-tight">
                                    {diary.title}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Content Section */}
                    <View>
                        {isEditing ? (
                            <View>
                                <Text className="text-gray-700 text-sm font-medium mb-3 uppercase tracking-wide">
                                    Content
                                </Text>
                                <TextInput
                                    value={editContent}
                                    onChangeText={setEditContent}
                                    className="bg-white border border-gray-200 rounded-xl p-4 text-base text-black leading-relaxed"
                                    placeholder="Share your thoughts..."
                                    placeholderTextColor="#9CA3AF"
                                    multiline
                                    textAlignVertical="top"
                                    style={{ minHeight: 300 }}
                                />
                            </View>
                        ) : (
                            <View className="bg-white rounded-xl p-6 border border-gray-100">
                                <Text className="text-base text-gray-800 leading-7 tracking-wide">
                                    {diary.content}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Bottom Spacing */}
                    <View className="h-12" />
                </View>
            </ScrollView>
        </View>
    );
};

export default page;