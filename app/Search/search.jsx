import { useAuth } from '@/context/AuthContext';
import { decryptData } from '@/utils/cryptoEnDe';
import { getStoredKey, KDFJoinKey } from '@/utils/kdfService';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const Search = () => {
    const { user } = useAuth();
    const router = useRouter();

    // State management
    const [diaryEntries, setDiaryEntries] = useState([]);
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMoodFilter, setSelectedMoodFilter] = useState('all');
    const [selectedDateFilter, setSelectedDateFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedEntry, setExpandedEntry] = useState(null);
    const [moodCache, setMoodCache] = useState({});
    const [availableMoods, setAvailableMoods] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Fetch diary entries from backend
    const fetchDiaryEntries = async () => {
        try {
            const token = await SecureStore.getItemAsync('authToken');

            const response = await fetch('https://ai-dairy-backend.onrender.com/api/diary/entries', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const entries = data.data?.entries || data.entries || [];

                // Decrypt and process entries
                const decryptedEntries = await decryptEntries(entries);

                // Fetch mood data for all entries
                const entriesWithMoods = await Promise.all(
                    decryptedEntries.map(async (entry) => {
                        if (entry.moodId) {
                            const moodData = await getMoodDisplay(entry.moodId);
                            return {
                                ...entry,
                                moodData
                            };
                        } else {
                            return {
                                ...entry,
                                moodData: { iconURL: null, mood: 'Unknown' }
                            };
                        }
                    })
                );

                setDiaryEntries(entriesWithMoods);
                setFilteredEntries(entriesWithMoods);

                // Extract unique moods for filter options
                const moods = [...new Set(entriesWithMoods
                    .map(entry => entry.moodData?.mood)
                    .filter(mood => mood && mood !== 'Unknown')
                )];
                setAvailableMoods(moods);

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

    // Decrypt diary entries (same as Journal component)
    const decryptEntries = async (entries) => {
        try {
            const keyLocal = await getStoredKey();
            const derivedKey = await KDFJoinKey(keyLocal, user.email, user.encryptionKeySalt);

            let failedDecryptionCount = 0;
            const totalEntries = entries.length;

            const decryptedEntries = await Promise.all(
                entries.map(async (entry) => {
                    try {
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

            if (totalEntries > 0 && (failedDecryptionCount === totalEntries || failedDecryptionCount / totalEntries >= 0.8)) {
                console.error('Most entries failed to decrypt - likely wrong encryption key');
                throw new Error('WRONG_ENCRYPTION_KEY');
            }

            return decryptedEntries;
        } catch (error) {
            console.error('Error during decryption:', error);

            if (error.message === 'WRONG_ENCRYPTION_KEY') {
                throw error;
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

    // Get mood display data (same as Journal component)
    const getMoodDisplay = async (moodId) => {
        if (moodCache[moodId]) {
            return moodCache[moodId];
        }

        const token = await SecureStore.getItemAsync('authToken');
        const url = `https://ai-dairy-backend.onrender.com/api/mood/${moodId}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const moodData = {
                    iconURL: data.mood?.moodIconURL,
                    mood: data.mood?.mood || 'Unknown'
                };

                setMoodCache(prev => ({ ...prev, [moodId]: moodData }));
                return moodData;
            } else {
                return { iconURL: null, mood: 'Unknown' };
            }
        } catch (error) {
            console.error('Error fetching mood:', error);
            return { iconURL: null, mood: 'Unknown' };
        }
    };

    // Search and filter functionality
    const handleSearch = (query) => {
        setSearchQuery(query);
        setIsSearching(query.length > 0);
        filterEntries(query, selectedMoodFilter, selectedDateFilter);
    };

    const handleMoodFilter = (mood) => {
        setSelectedMoodFilter(mood);
        filterEntries(searchQuery, mood, selectedDateFilter);
    };

    const handleDateFilter = (dateRange) => {
        setSelectedDateFilter(dateRange);
        filterEntries(searchQuery, selectedMoodFilter, dateRange);
    };

    const filterEntries = (query, moodFilter, dateFilter) => {
        let filtered = [...diaryEntries];

        // Text search
        if (query.trim()) {
            filtered = filtered.filter(entry =>
                entry.title.toLowerCase().includes(query.toLowerCase()) ||
                entry.content.toLowerCase().includes(query.toLowerCase())
            );
        }

        // Mood filter
        if (moodFilter !== 'all') {
            filtered = filtered.filter(entry =>
                entry.moodData?.mood === moodFilter
            );
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            const filterDate = new Date();

            switch (dateFilter) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    filtered = filtered.filter(entry =>
                        new Date(entry.createdAt) >= filterDate
                    );
                    break;
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    filtered = filtered.filter(entry =>
                        new Date(entry.createdAt) >= filterDate
                    );
                    break;
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    filtered = filtered.filter(entry =>
                        new Date(entry.createdAt) >= filterDate
                    );
                    break;
            }
        }

        // Sort by most recent first
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setFilteredEntries(filtered);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedMoodFilter('all');
        setSelectedDateFilter('all');
        setFilteredEntries(diaryEntries);
        setIsSearching(false);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchDiaryEntries();
    };

    const toggleExpanded = (entryId) => {
        setExpandedEntry(expandedEntry === entryId ? null : entryId);
    };

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
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
    };

    const highlightText = (text, query) => {
        if (!query.trim()) return text;

        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <Text key={index} className="bg-yellow-200 text-yellow-800 font-semibold">
                    {part}
                </Text>
            ) : part
        );
    };

    useEffect(() => {
        if (user?.id) {
            fetchDiaryEntries();
        }
    }, [user]);

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#6366f1" />
                <Text className="text-gray-600 mt-4 text-base">Loading your entries...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-5 border-b border-gray-200 shadow-sm">
                <Text className="text-2xl font-bold text-gray-900 text-center mb-4">
                    Search Diary
                </Text>

                {/* Search Input */}
                <View className="bg-gray-100 rounded-2xl px-4 py-3 mb-4 flex-row items-center">
                    <Text className="text-gray-400 text-lg mr-3">🔍</Text>
                    <TextInput
                        className="flex-1 text-base text-gray-800"
                        placeholder="Search your entries..."
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={handleSearch}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <Text className="text-gray-400 text-lg">✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Filter Chips */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-row"
                >
                    {/* Mood Filters */}
                    <TouchableOpacity
                        className={`px-4 py-2 rounded-full mr-2 ${selectedMoodFilter === 'all'
                                ? 'bg-indigo-100 border-2 border-indigo-500'
                                : 'bg-white border border-gray-300'
                            }`}
                        onPress={() => handleMoodFilter('all')}
                    >
                        <Text className={`text-sm font-medium ${selectedMoodFilter === 'all' ? 'text-indigo-700' : 'text-gray-600'
                            }`}>
                            All Moods
                        </Text>
                    </TouchableOpacity>

                    {availableMoods.map((mood) => (
                        <TouchableOpacity
                            key={mood}
                            className={`px-4 py-2 rounded-full mr-2 ${selectedMoodFilter === mood
                                    ? 'bg-indigo-100 border-2 border-indigo-500'
                                    : 'bg-white border border-gray-300'
                                }`}
                            onPress={() => handleMoodFilter(mood)}
                        >
                            <Text className={`text-sm font-medium ${selectedMoodFilter === mood ? 'text-indigo-700' : 'text-gray-600'
                                }`}>
                                {mood}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    {/* Date Filters */}
                    {['today', 'week', 'month'].map((period) => (
                        <TouchableOpacity
                            key={period}
                            className={`px-4 py-2 rounded-full mr-2 ${selectedDateFilter === period
                                    ? 'bg-green-100 border-2 border-green-500'
                                    : 'bg-white border border-gray-300'
                                }`}
                            onPress={() => handleDateFilter(period)}
                        >
                            <Text className={`text-sm font-medium ${selectedDateFilter === period ? 'text-green-700' : 'text-gray-600'
                                }`}>
                                {period === 'today' ? 'Today' : period === 'week' ? 'This Week' : 'This Month'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Clear Filters Button */}
                {(searchQuery || selectedMoodFilter !== 'all' || selectedDateFilter !== 'all') && (
                    <TouchableOpacity
                        className="mt-3 self-center"
                        onPress={clearFilters}
                    >
                        <Text className="text-indigo-600 font-medium text-sm">Clear all filters</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Results */}
            <ScrollView
                className="flex-1 px-5"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Search Stats */}
                {isSearching && (
                    <View className="py-4">
                        <Text className="text-gray-600 text-center">
                            Found {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
                            {searchQuery && ` for "${searchQuery}"`}
                        </Text>
                    </View>
                )}

                {/* No Results */}
                {filteredEntries.length === 0 && diaryEntries.length > 0 && (
                    <View className="items-center justify-center py-20">
                        <Text className="text-6xl mb-4">🔍</Text>
                        <Text className="text-xl font-medium text-gray-600 mb-2">
                            No entries found
                        </Text>
                        <Text className="text-base text-gray-400 text-center px-8">
                            {searchQuery
                                ? `No entries match "${searchQuery}". Try different keywords or clear filters.`
                                : 'No entries match your current filters. Try adjusting your search criteria.'
                            }
                        </Text>
                    </View>
                )}

                {/* No Entries */}
                {diaryEntries.length === 0 && (
                    <View className="items-center justify-center py-20">
                        <Text className="text-6xl mb-4">📝</Text>
                        <Text className="text-xl font-medium text-gray-600 mb-2">
                            No entries yet
                        </Text>
                        <Text className="text-base text-gray-400 text-center">
                            Start writing your first diary entry to search through your thoughts
                        </Text>
                    </View>
                )}

                {/* Entry Results */}
                {filteredEntries.map((entry) => (
                    <TouchableOpacity
                        key={entry._id || entry.id}
                        className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 shadow-sm"
                        onPress={() => toggleExpanded(entry._id || entry.id)}
                        activeOpacity={0.7}
                    >
                        {/* Entry Header */}
                        <TouchableOpacity
                            className="flex-row items-center justify-between mb-3"
                            onPress={() => router.push(`/Diary/${entry._id}`)}
                            activeOpacity={0.7}
                        >
                            <View className="flex-row items-center flex-1">
                                {/* Mood Icon */}
                                {entry.moodData?.iconURL ? (
                                    <Image
                                        source={{ uri: entry.moodData.iconURL }}
                                        className="w-8 h-8 mr-3"
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <Text className="text-2xl mr-3">📝</Text>
                                )}

                                <View className="flex-1">
                                    <Text className="text-base font-semibold text-gray-800" numberOfLines={1}>
                                        {searchQuery ? highlightText(entry.title, searchQuery) : entry.title}
                                    </Text>
                                    <View className="flex-row items-center">
                                        <Text className="text-sm text-gray-500">
                                            {formatDate(entry.createdAt)}
                                        </Text>
                                        <Text className="text-sm text-gray-400 mx-1">•</Text>
                                        <Text className="text-sm text-gray-500">
                                            {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </Text>
                                        {entry.moodData?.mood && entry.moodData.mood !== 'Unknown' && (
                                            <>
                                                <Text className="text-sm text-gray-400 mx-1">•</Text>
                                                <Text className="text-sm text-indigo-500">
                                                    {entry.moodData.mood}
                                                </Text>
                                            </>
                                        )}
                                    </View>
                                </View>
                            </View>
                            <Text className="text-gray-400 text-lg">
                                {expandedEntry === (entry._id || entry.id) ? '▲' : '▼'}
                            </Text>
                        </TouchableOpacity>

                        {/* Entry Content Preview */}
                        {expandedEntry !== (entry._id || entry.id) && (
                            <Text className="text-gray-600 text-sm" numberOfLines={2}>
                                {searchQuery ? highlightText(entry.content, searchQuery) : entry.content}
                            </Text>
                        )}

                        {/* Expanded Entry Content */}
                        {expandedEntry === (entry._id || entry.id) && (
                            <View>
                                <View className="h-px bg-gray-100 mb-3" />
                                <Text className="text-gray-700 text-base leading-6">
                                    {searchQuery ? highlightText(entry.content, searchQuery) : entry.content}
                                </Text>

                                {/* Entry Metadata */}
                                <View className="mt-3 pt-3 border-t border-gray-100">
                                    <Text className="text-sm text-gray-500">
                                        Created: {new Date(entry.createdAt).toLocaleString()}
                                    </Text>
                                    {entry.moodData?.mood && entry.moodData.mood !== 'Unknown' && (
                                        <Text className="text-sm text-gray-500 mt-1">
                                            Mood: {entry.moodData.mood}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}

                {/* Bottom Spacing */}
                <View className="h-8" />
            </ScrollView>
        </View>
    );
};

export default Search;