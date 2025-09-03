import { useAuth } from '@/context/AuthContext';
import { decryptData } from '@/utils/cryptoEnDe';
import { getStoredKey, KDFJoinKey } from '@/utils/kdfService';
import { useRouter } from 'expo-router';
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

const TodayTab = () => {
    const { user } = useAuth();
    const router = useRouter();

    const [todayEntry, setTodayEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hasEntry, setHasEntry] = useState(false);

    // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const fetchTodayEntry = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const token = await SecureStore.getItemAsync('authToken');
            const todayDate = getTodayDate();

            console.log('Fetching entry for today:', todayDate);

            const response = await fetch('http://192.168.1.23:9000/api/diary/entries', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const entries = data.data?.entries || data.entries || [];

                // Find today's entry
                const todayEntryRaw = entries.find(entry => {
                    const entryDate = entry.entryDate?.split('T')[0] || entry.createdAt?.split('T')[0];
                    return entryDate === todayDate;
                });

                if (todayEntryRaw) {
                    console.log('Found today entry:', todayEntryRaw._id);
                    const decryptedEntry = await decryptSingleEntry(todayEntryRaw);

                    // Fetch mood data if available
                    let entryWithMood = { ...decryptedEntry };
                    if (decryptedEntry.moodId) {
                        // Add your getMoodDisplay function call here if you have it
                        // const moodData = await getMoodDisplay(decryptedEntry.moodId);
                        // entryWithMood.moodData = moodData;
                    }

                    setTodayEntry(entryWithMood);
                    setHasEntry(true);
                } else {
                    console.log('No entry found for today');
                    setTodayEntry(null);
                    setHasEntry(false);
                }
            } else {
                console.error('Failed to fetch entries:', response.status);
                Alert.alert('Error', 'Failed to load today\'s entry');
            }
        } catch (error) {
            console.error('Error fetching today entry:', error);
            Alert.alert('Error', 'Something went wrong while loading today\'s entry');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const decryptSingleEntry = async (entry: any) => {
        try {
            const keyLocal = await getStoredKey();
            const derivedKey = await KDFJoinKey(keyLocal, user.email, user.encryptionKeySalt);

            const decryptedTitle = await decryptData(entry.encryptedTitle, derivedKey);
            const decryptedContent = await decryptData(entry.encryptedContent, derivedKey);

            // Check if decryption actually worked
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

            return {
                ...entry,
                title: 'Unable to decrypt',
                content: 'Unable to decrypt content',
                date: entry.entryDate?.split('T')[0] || entry.createdAt?.split('T')[0],
                decryptionSuccess: false
            };
        }
    };

    const handleCreateEntry = () => {
        // Navigate to create/add diary tab
        router.push('/create'); // Adjust this path based on your routing structure
    };

    const handleViewEntry = () => {
        if (todayEntry) {
            // Navigate to the entry detail page
            router.push(`/Diary/${todayEntry._id}`);
        }
    };

    const onRefresh = () => {
        fetchTodayEntry(true);
    };

    useEffect(() => {
        fetchTodayEntry();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#000000" />
                <Text className="text-gray-600 mt-4 text-base">Loading today's entry...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-gray-50"
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View className="bg-white border-b border-gray-100">
                <View className="px-6 py-8">
                    <Text className="text-3xl font-bold text-black">Today</Text>
                    <Text className="text-gray-500 text-base mt-2">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </Text>
                </View>
            </View>

            <View className="px-6 py-8">
                {hasEntry && todayEntry ? (
                    // Show today's entry
                    <View>
                        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                            {/* Entry Header */}
                            <View className="flex-row justify-between items-start mb-4">
                                <View className="flex-1">
                                    <Text className="text-xl font-bold text-black mb-2">
                                        {todayEntry.title}
                                    </Text>
                                    {todayEntry.moodData && (
                                        <View className="flex-row items-center">
                                            <Text className="text-sm text-gray-500">
                                                Mood: {todayEntry.moodData.mood}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Entry Content Preview */}
                            <Text className="text-gray-700 text-base leading-6 mb-6">
                                {todayEntry.content.length > 200
                                    ? `${todayEntry.content.substring(0, 200)}...`
                                    : todayEntry.content
                                }
                            </Text>

                            {/* Action Button */}
                            <TouchableOpacity
                                onPress={handleViewEntry}
                                className="bg-black py-4 rounded-xl"
                                activeOpacity={0.8}
                            >
                                <Text className="text-white text-center font-semibold text-base">
                                    View Full Entry
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Quick Stats or Additional Info */}
                        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <Text className="text-lg font-semibold text-black mb-3">
                                Entry Details
                            </Text>
                            <View className="space-y-2">
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-600">Word Count</Text>
                                    <Text className="text-black font-medium">
                                        {todayEntry.content.split(' ').length} words
                                    </Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-600">Character Count</Text>
                                    <Text className="text-black font-medium">
                                        {(todayEntry.content.length)} characters
                                    </Text>
                                </View>
                                {!todayEntry.decryptionSuccess && (
                                    <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                                        <Text className="text-yellow-800 text-sm">
                                            ⚠️ This entry may have decryption issues
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                ) : (
                    // No entry for today - prompt to create
                    <View className="items-center justify-center py-12">
                        <View className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 w-full max-w-sm">
                            {/* Empty State Icon */}
                            <View className="items-center mb-6">
                                <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                                    <Text className="text-3xl">📝</Text>
                                </View>
                                <Text className="text-xl font-bold text-black text-center mb-2">
                                    No Entry Today
                                </Text>
                                <Text className="text-gray-500 text-center text-base leading-6">
                                    You haven't written anything today yet. How are you feeling? What's on your mind?
                                </Text>
                            </View>

                            {/* Create Entry Button */}
                            <TouchableOpacity
                                onPress={handleCreateEntry}
                                className="bg-black py-4 rounded-xl mb-3"
                                activeOpacity={0.8}
                            >
                                <Text className="text-white text-center font-semibold text-base">
                                    Write Today's Entry
                                </Text>
                            </TouchableOpacity>

                            <Text className="text-gray-400 text-center text-sm">
                                Start documenting your thoughts and feelings
                            </Text>
                        </View>

                        {/* Motivational Quote or Tip */}
                        <View className="bg-gray-100 rounded-xl p-6 mt-8 w-full">
                            <Text className="text-gray-700 text-center text-base italic mb-2">
                                "The secret of getting ahead is getting started."
                            </Text>
                            <Text className="text-gray-500 text-center text-sm">
                                - Mark Twain
                            </Text>
                        </View>
                    </View>
                )}

                {/* Quick Actions */}
                {hasEntry && (
                    <View className="mt-6">
                        <Text className="text-lg font-semibold text-black mb-4">Quick Actions</Text>
                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                onPress={() => router.push(`/Diary/${todayEntry._id}`)}
                                className="flex-1 bg-white border border-gray-200 py-4 rounded-xl"
                                activeOpacity={0.8}
                            >
                                <Text className="text-black text-center font-medium">Edit Entry</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleCreateEntry}
                                className="flex-1 bg-gray-100 py-4 rounded-xl"
                                activeOpacity={0.8}
                            >
                                <Text className="text-gray-700 text-center font-medium">New Entry</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Motivational Quote or Tip */}
                        <View className="bg-gray-100 rounded-xl p-6 mt-8 w-full">
                            <Text className="text-gray-700 text-center text-base italic mb-2">
                                "The secret of getting ahead is getting started."
                            </Text>
                            <Text className="text-gray-500 text-center text-sm">
                                - Mark Twain
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

export default TodayTab;