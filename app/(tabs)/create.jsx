import { useAuth } from '@/context/AuthContext';
import { encryptData } from '@/utils/cryptoEnDe';
import { getStoredKey, KDFJoinKey } from '@/utils/kdfService';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

const Create = ({ onSave, onCancel }) => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedMood, setSelectedMood] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [moodsDb, setMoodsDb] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const contentInputRef = useRef(null);
    const titleInputRef = useRef(null);
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

    // Count words in content
    useEffect(() => {
        const words = content.trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);
    }, [content]);

    // Fetch moods from database
    async function fetchDB() {
        try {
            setLoading(true);
            const response = await fetch("https://ai-dairy-backend.onrender.com/api/mood/all", {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Moods fetched:', data);
                setMoodsDb(data.moods || []);
            } else {
                console.error('Failed to fetch moods:', response.status);
            }
        } catch (error) {
            console.error('Error fetching moods:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchDB();
    }, []);

    const handleSave = async () => {
        if (!title.trim() || !content.trim() || !selectedMood) {
            Alert.alert('Missing Information', 'Please fill in all fields and select a mood.');
            return;
        }

        try {
            setSaving(true);

            // Get encryption key and token
            const keyLocal = await getStoredKey();
            const derivedKey = await KDFJoinKey(keyLocal, user.email, user.encryptionKeySalt);
            const token = await SecureStore.getItemAsync('authToken');

            // Encrypt diary data
            const encryptedTitle = await encryptData(title.trim(), derivedKey);
            const encryptedContent = await encryptData(content.trim(), derivedKey);

            // Save to backend
            const response = await fetch("https://ai-dairy-backend.onrender.com/api/diary/add", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    encryptedTitle: encryptedTitle,
                    encryptedContent: encryptedContent,
                    moodId: selectedMood,
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Diary saved:', result);

                Alert.alert('Success', 'Your diary entry has been saved!', [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Reset form
                            setTitle('');
                            setContent('');
                            setSelectedMood('');
                            setDate(new Date().toISOString().split('T')[0]);

                            // Call onSave callback with the saved entry data
                            onSave?.(result);
                        }
                    }
                ]);
            } else {
                const errorData = await response.json();
                console.error('Failed to save diary:', errorData);
                Alert.alert('Error', errorData.message || 'Failed to save diary entry');
            }
        } catch (error) {
            console.error('Error saving diary:', error);
            Alert.alert('Error', 'Something went wrong while saving your diary entry');
        } finally {
            setSaving(false);
        }
    };

    const renderMoodIcon = (mood) => {
        const emojiMap = {
            'Happy': '😊',
            'Sad': '😢',
            'Angry': '😠',
            'Excited': '🤗',
            'Calm': '😌',
            'Anxious': '😰',
            'Grateful': '🙏',
            'Confused': '😕',
            'Loved': '🥰',
            'Tired': '😴'
        };

        if (mood.moodIconURL) {
            return (
                <Image
                    source={{ uri: mood.moodIconURL }}
                    className="w-5 h-5 mr-1.5"
                    resizeMode="contain"
                />
            );
        }

        return (
            <Text className="text-lg mr-1.5">
                {emojiMap[mood.mood] || '😊'}
            </Text>
        );
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getProgressColor = () => {
        if (wordCount < 50) return 'bg-red-400';
        if (wordCount < 150) return 'bg-yellow-400';
        return 'bg-green-400';
    };

    const getProgressWidth = () => {
        const maxWords = 500; // Target word count
        return Math.min((wordCount / maxWords) * 100, 100);
    };

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-gray-50"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                ref={scrollViewRef}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: isKeyboardVisible ? 300 : 50 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets={true}
            >
                {/* Header */}
                <View className='flex-row mx-4 text-2xl justify-start items-center m-2'>
                    <Ionicons name="calendar-outline" size={18} color="#6B7280" style={{ marginRight: 8 }} />
                    <Text className="text-base text-gray-900">{formatDate(date)}</Text>
                </View>

                {/* Mood Section - Minimized when keyboard is visible */}
                {(!isKeyboardVisible || focusedField !== 'content') && (
                    <View className="bg-white mx-4 mt-4 p-5 rounded-2xl shadow-sm">
                        <Text className="text-lg font-semibold text-gray-800 mb-4">
                            How are you feeling today?
                        </Text>
                        {loading ? (
                            <View className="py-8">
                                <Text className="text-gray-500 text-center">Loading moods...</Text>
                            </View>
                        ) : (
                            <View className="flex-row flex-wrap gap-3">
                                {moodsDb.map((mood) => (
                                    <TouchableOpacity
                                        key={mood._id}
                                        className={`flex-row items-center py-3 px-4 rounded-xl border-2 ${selectedMood === mood._id
                                            ? 'border-blue-400 bg-blue-50'
                                            : 'border-gray-200 bg-gray-50'
                                            }`}
                                        onPress={() => setSelectedMood(mood._id)}
                                        activeOpacity={0.7}
                                    >
                                        {renderMoodIcon(mood)}
                                        <Text className={`text-sm font-medium ${selectedMood === mood._id ? 'text-blue-700' : 'text-gray-700'
                                            }`}>
                                            {mood.mood}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* Title Section */}
                <View className="bg-white mx-4 mt-4 p-5 rounded-2xl shadow-sm">
                    <Text className="text-lg font-semibold text-gray-800 mb-3">
                        What's on your mind?
                    </Text>
                    <TextInput
                        ref={titleInputRef}
                        className="text-xl font-medium text-gray-800 py-3 px-0"
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Give your entry a title..."
                        placeholderTextColor="#9ca3af"
                        maxLength={100}
                        onFocus={() => setFocusedField('title')}
                        multiline
                    />
                    <View className="flex-row justify-between mt-2">
                        <Text className="text-xs text-gray-400">
                            {title.length}/100 characters
                        </Text>
                    </View>
                </View>

                {/* Writing Area */}
                <View className="bg-white mx-4 mt-4 rounded-2xl shadow-sm">
                    <View className="p-5 pb-0">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-lg font-semibold text-gray-800">
                                Your thoughts
                            </Text>
                            <View className="flex-row items-center">
                                <Text className="text-sm text-gray-500 mr-2">
                                    {wordCount} words
                                </Text>
                                <View className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <View
                                        className={`h-full rounded-full transition-all ${getProgressColor()}`}
                                        style={{ width: `${getProgressWidth()}%` }}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Fixed TextInput with proper scrolling */}
                    <TextInput
                        ref={contentInputRef}
                        className="text-base text-gray-800 px-5 pb-8 leading-6"
                        style={{
                            minHeight: isKeyboardVisible ? 250 : 400,
                            textAlignVertical: 'top'
                        }}
                        value={content}
                        onChangeText={setContent}
                        placeholder="Pour your heart out... What happened today? How did it make you feel? What are you thinking about? Write as much or as little as you want."
                        placeholderTextColor="#9ca3af"
                        multiline
                        onFocus={() => {
                            setFocusedField('content');
                            // Auto-scroll to content area when focused
                            setTimeout(() => {
                                scrollViewRef.current?.scrollToEnd({ animated: true });
                            }, 300);
                        }}
                        onContentSizeChange={() => {
                            // Auto-scroll as content grows
                            if (focusedField === 'content' && isKeyboardVisible) {
                                setTimeout(() => {
                                    scrollViewRef.current?.scrollToEnd({ animated: true });
                                }, 100);
                            }
                        }}
                        scrollEnabled={true}
                        returnKeyType="default"
                        blurOnSubmit={false}
                    />


                </View>

                {/* Spacer for keyboard */}
                {isKeyboardVisible && <View style={{ height: 100 }} />}
            </ScrollView>

            {/* Fixed Action Buttons */}
            <View className="bg-white px-6 py-4 shadow-lg border-t border-gray-100">
                <View className="flex-row gap-3">
                    {onCancel && (
                        <TouchableOpacity
                            className="flex-1 py-4 rounded-xl items-center border-2 border-gray-300 bg-white"
                            onPress={onCancel}
                            activeOpacity={0.7}
                        >
                            <Text className="text-base font-semibold text-gray-600">
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        className={`flex-1 py-4 rounded-xl items-center shadow-sm ${saving
                            ? 'bg-gray-400'
                            : (!title.trim() || !content.trim() || !selectedMood)
                                ? 'bg-gray-300'
                                : 'bg-gray-900'
                            }`}
                        onPress={handleSave}
                        activeOpacity={0.7}
                        disabled={saving || !title.trim() || !content.trim() || !selectedMood}
                    >
                        <Text className="text-base font-semibold text-white">
                            {saving ? 'Saving...' : 'Save Entry'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default Create;