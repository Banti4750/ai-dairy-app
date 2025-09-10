import { useAuth } from '@/context/AuthContext';
import { decryptData } from '@/utils/cryptoEnDe';
import { getStoredKey, KDFJoinKey } from '@/utils/kdfService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
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
    const [dailyQuote, setDailyQuote] = useState([]);



    const fetchDailyQuote = async () => {
        try {
            const response = await fetch("http://192.168.1.23:9000/api/dailyquotes", {
                method: "GET"
            })

            const data = await response.json()
            if (response.ok) {
                setDailyQuote(data.dailyQuote)
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch  dailyQuote');
            }
        } catch (error) {
            console.error('dailyQuote fetch error:', error);
            Alert.alert('Error', 'Network error. Please check your connection.');
        }
    }

    useEffect(() => {
        fetchDailyQuote();
    }, [])

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

    const decryptSingleEntry = async (entry) => {
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
        router.push('/create');
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
            <View className="flex-1 bg-gradient-to-b from-blue-50 to-indigo-50 justify-center items-center">
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text className="text-gray-600 mt-4 text-base">Loading your day...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-gradient-to-b from-blue-50 to-indigo-50"
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />
            }
            showsVerticalScrollIndicator={false}
        >
            {/* Header with Date */}

            <View className='flex-row mx-4 text-2xl justify-start items-center m-2'>
                <Ionicons name="calendar-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                <Text className="text-base text-gray-900"> {new Date().toLocaleDateString('en-US', { weekday: 'long' })} , {new Date().toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                })}</Text>
            </View>


            {/* Daily Quote Card */}
            <View className="px-5 mb-6">
                <View className="bg-white rounded-2xl p-6 shadow-sm border border-indigo-100">
                    <View className="flex-row items-start">
                        <View className="bg-indigo-100 p-2 rounded-lg mr-4">
                            <Text className="text-indigo-600 text-xl">💭</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg text-gray-800 italic mb-2">
                                "{dailyQuote.quote}"
                            </Text>
                            <Text className="text-sm text-gray-500">— {dailyQuote.author}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {hasEntry && todayEntry ? (
                // Existing Entry View
                <View className="px-5">
                    <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                        <View className="flex-row justify-between items-center mb-5">
                            <Text className="text-xl font-bold text-gray-900">Today's Reflection</Text>
                            <View className="bg-green-100 px-3 py-1 rounded-full">
                                <Text className="text-green-700 text-sm">Completed</Text>
                            </View>
                        </View>

                        <View className="mb-6">
                            <Text className="text-2xl font-semibold text-gray-900 mb-2">
                                {todayEntry.title}
                            </Text>
                            <View className="h-1 w-12 bg-indigo-400 rounded-full"></View>
                        </View>

                        <Text className="text-gray-700 text-base leading-7 mb-6">
                            {todayEntry.content.length > 150
                                ? `${todayEntry.content.substring(0, 150)}...`
                                : todayEntry.content
                            }
                        </Text>

                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center mr-2">
                                    <Text className="text-indigo-600 text-xs">📊</Text>
                                </View>
                                <View>
                                    <Text className="text-gray-600 text-xs">Word Count</Text>
                                    <Text className="text-gray-900 font-medium">
                                        {todayEntry.content.split(' ').length}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleViewEntry}
                                className="bg-gray-800 py-3 px-5 rounded-xl"
                                activeOpacity={0.8}
                            >
                                <Text className="text-white text-center font-medium">
                                    Read More
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* <CalendarView /> */}


                </View>
            ) : (
                // No Entry Today - Writing Prompt
                <View className="px-5">
                    <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                        <View className="flex-row justify-between items-center mb-5">
                            <Text className="text-xl font-bold text-gray-900">Today's Reflection</Text>
                            <View className="bg-amber-100 px-3 py-1 rounded-full">
                                <Text className="text-amber-700 text-sm">Pending</Text>
                            </View>
                        </View>

                        <View className="mb-6">
                            <Text className="text-2xl font-semibold text-gray-900 mb-4">
                                Ready to reflect on your day?
                            </Text>
                            <View className="h-1 w-12 bg-indigo-400 rounded-full"></View>
                        </View>

                        <View className="bg-blue-50 rounded-xl p-5 mb-6">
                            <Text className="text-blue-800 text-lg font-medium mb-2">Writing Prompt</Text>
                            <Text className="text-blue-700 text-base leading-6">
                                What was the most meaningful moment of your day, and why did it stand out to you?
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={handleCreateEntry}
                            className="bg-gray-800 py-4 rounded-xl mb-4"
                            activeOpacity={0.8}
                        >
                            <Text className="text-white text-center font-semibold text-base">
                                Start Journaling
                            </Text>
                        </TouchableOpacity>

                        <Text className="text-gray-400 text-center text-sm">
                            Just 5 minutes of reflection can bring clarity
                        </Text>
                    </View>

                    {/* Benefits of Journaling */}
                    <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <Text className="text-lg font-semibold text-gray-900 mb-4">Why Journal Daily?</Text>

                        <View className="space-y-4">
                            <View className="flex-row items-start">
                                <View className="bg-green-100 p-2 rounded-lg mr-4">
                                    <Text className="text-green-600 text-lg">😌</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-800 font-medium mb-1">Reduces Stress</Text>
                                    <Text className="text-gray-600 text-sm">Writing about emotions can help process difficult experiences</Text>
                                </View>
                            </View>

                            <View className="flex-row items-start">
                                <View className="bg-blue-100 p-2 rounded-lg mr-4">
                                    <Text className="text-blue-600 text-lg">🧠</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-800 font-medium mb-1">Boosts Memory</Text>
                                    <Text className="text-gray-600 text-sm">Recording experiences helps with retention and recall</Text>
                                </View>
                            </View>

                            <View className="flex-row items-start">
                                <View className="bg-purple-100 p-2 rounded-lg mr-4">
                                    <Text className="text-purple-600 text-lg">💡</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-800 font-medium mb-1">Enhances Clarity</Text>
                                    <Text className="text-gray-600 text-sm">Organizing thoughts on paper brings mental clarity</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {/* Bottom Spacing */}
            <View className="h-20"></View>
        </ScrollView>
    );
};

export default TodayTab;