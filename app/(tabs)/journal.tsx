import { useAuth } from '@/context/AuthContext';
import { decryptData } from '@/utils/cryptoEnDe';
import { getStoredKey, KDFJoinKey } from '@/utils/kdfService';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const Journal = () => {
    const { user } = useAuth();
    const [diaryEntries, setDiaryEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedEntry, setExpandedEntry] = useState(null);

    // Fetch diary entries from backend
    const fetchDiaryEntries = async () => {
        try {
            const token = await SecureStore.getItemAsync('authToken');
            console.log('Token:', token);

            const response = await fetch('http://192.168.1.23:9000/api/diary/entries', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('API Response:', data);

                // Fixed: Access the correct path in the response
                const entries = data.data?.entries || data.entries || [];
                console.log('Entries to decrypt:', entries);

                // Decrypt and process entries
                const decryptedEntries = await decryptEntries(entries);
                setDiaryEntries(decryptedEntries);
            } else {
                const errorData = await response.text();
                console.error('Failed to fetch diary entries:', response.status, errorData);
                Alert.alert('Error', 'Failed to load diary entries');
            }
        } catch (error) {
            console.error('Error fetching diary entries:', error);
            Alert.alert('Error', 'Something went wrong while loading entries');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Decrypt diary entries
    const decryptEntries = async (entries) => {
        try {
            const keyLocal = await getStoredKey();
            const derivedKey = await KDFJoinKey(keyLocal, user.email, user.encryptionKeySalt);

            console.log('Decrypting entries with derived key...');

            let failedDecryptionCount = 0;
            const totalEntries = entries.length;

            const decryptedEntries = await Promise.all(
                entries.map(async (entry) => {
                    try {
                        console.log('Decrypting entry:', entry._id);

                        const decryptedTitle = await decryptData(entry.encryptedTitle, derivedKey);
                        const decryptedContent = await decryptData(entry.encryptedContent, derivedKey);

                        // Check if decryption actually worked (not just empty or garbled data)
                        if (!decryptedTitle || !decryptedContent ||
                            decryptedTitle.includes('�') || decryptedContent.includes('�') ||
                            decryptedTitle.length === 0 || decryptedContent.length === 0) {
                            throw new Error('Invalid decryption result');
                        }

                        console.log('Decrypted successfully:', { title: decryptedTitle, content: decryptedContent });

                        return {
                            ...entry,
                            title: decryptedTitle,
                            content: decryptedContent,
                            date: entry.entryDate?.split('T')[0] || entry.createdAt?.split('T')[0],
                            decryptionSuccess: true
                        };
                    } catch (decryptError) {
                        console.error('Failed to decrypt entry:', entry._id, decryptError);
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

            // If all or most entries failed to decrypt, it's likely a wrong encryption key
            if (totalEntries > 0 && (failedDecryptionCount === totalEntries || failedDecryptionCount / totalEntries >= 0.8)) {
                console.error('Most entries failed to decrypt - likely wrong encryption key');
                throw new Error('WRONG_ENCRYPTION_KEY');
            }

            console.log('All entries processed:', decryptedEntries);
            return decryptedEntries;
        } catch (error) {
            console.error('Error during decryption:', error);

            if (error.message === 'WRONG_ENCRYPTION_KEY') {
                throw error; // Re-throw to be handled in fetchDiaryEntries
            }

            return entries.map(entry => ({
                ...entry,
                title: 'Decryption failed',
                content: 'Unable to decrypt content',
                date: entry.entryDate?.split('T')[0] || entry.createdAt?.split('T')[0],
                decryptionSuccess: false
            }));
        }
    };

    // Group entries by date
    const groupEntriesByDate = (entries) => {
        const grouped = {};

        entries.forEach(entry => {
            // Fixed: Use the date field we set during decryption
            const entryDate = entry.date;
            if (entryDate && !grouped[entryDate]) {
                grouped[entryDate] = [];
            }
            if (entryDate) {
                grouped[entryDate].push(entry);
            }
        });

        // Sort dates in descending order (newest first)
        const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a));

        return sortedDates.map(date => ({
            date,
            entries: grouped[date].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        }));
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    // Get mood emoji - simplified since API doesn't return mood data
    const getMoodDisplay = (moodId) => {
        // Default emoji since mood data isn't in the API response
        return '📝';
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchDiaryEntries();
    };

    const toggleExpanded = (entryId) => {
        setExpandedEntry(expandedEntry === entryId ? null : entryId);
    };

    useEffect(() => {
        if (user?.id) {
            fetchDiaryEntries();
        }
    }, [user]);

    if (loading) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#6b7280" />
                <Text className="text-gray-500 mt-4">Loading your journal...</Text>
            </View>
        );
    }

    const groupedEntries = groupEntriesByDate(diaryEntries);

    return (
        <View className="flex-1 bg-white">
            <ScrollView
                className="flex-1 p-5"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Header */}
                <View className="mb-8 pt-10">
                    <Text className="text-3xl font-semibold text-gray-800 text-center">
                        My Journal
                    </Text>
                    <Text className="text-base text-gray-500 text-center mt-2">
                        {diaryEntries.length} {diaryEntries.length === 1 ? 'entry' : 'entries'}
                    </Text>
                </View>

                {/* Diary Entries */}
                {groupedEntries.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <Text className="text-6xl mb-4">📝</Text>
                        <Text className="text-xl font-medium text-gray-600 mb-2">
                            {diaryEntries.length === 0 ? 'No entries yet' : 'No entries to display'}
                        </Text>
                        <Text className="text-base text-gray-400 text-center">
                            {diaryEntries.length === 0
                                ? 'Start writing your first diary entry to see it here'
                                : 'Check your encryption key and try again'
                            }
                        </Text>
                    </View>
                ) : (
                    groupedEntries.map((dateGroup) => (
                        <View key={dateGroup.date} className="mb-8">
                            {/* Date Header */}
                            <View className="mb-4">
                                <Text className="text-lg font-semibold text-gray-700">
                                    {formatDate(dateGroup.date)}
                                </Text>
                                <View className="h-px bg-gray-200 mt-2" />
                            </View>

                            {/* Entries for this date */}
                            {dateGroup.entries.map((entry) => (
                                <TouchableOpacity
                                    key={entry._id || entry.id}
                                    className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm"
                                    onPress={() => toggleExpanded(entry._id || entry.id)}
                                    activeOpacity={0.7}
                                >
                                    {/* Entry Header */}
                                    <View className="flex-row items-center justify-between mb-3">
                                        <View className="flex-row items-center flex-1">
                                            <Text className="text-2xl mr-3">
                                                {getMoodDisplay()}
                                            </Text>
                                            <View className="flex-1">
                                                <Text className="text-base font-semibold text-gray-800" numberOfLines={1}>
                                                    {entry.title}
                                                </Text>
                                                <Text className="text-sm text-gray-500">
                                                    {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="text-gray-400 text-lg">
                                            {expandedEntry === (entry._id || entry.id) ? '▲' : '▼'}
                                        </Text>
                                    </View>

                                    {/* Entry Content */}
                                    <View className={`${expandedEntry === (entry._id || entry.id) ? 'block' : 'hidden'}`}>
                                        <View className="h-px bg-gray-100 mb-3" />
                                        <Text className="text-gray-700 text-base leading-6">
                                            {entry.content}
                                        </Text>

                                        {/* Additional metadata */}
                                        <View className="mt-3 pt-3 border-t border-gray-100">
                                            <Text className="text-sm text-gray-500">
                                                Entry Date: {new Date(entry.entryDate || entry.createdAt).toLocaleString()}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Preview for collapsed state */}
                                    {expandedEntry !== (entry._id || entry.id) && (
                                        <Text className="text-gray-600 text-sm" numberOfLines={2}>
                                            {entry.content}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

export default Journal;