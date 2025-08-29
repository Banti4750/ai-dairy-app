import { useAuth } from '@/context/AuthContext';
import { encryptData } from '@/utils/cryptoEnDe';
import { getStoredKey, KDFJoinKey } from '@/utils/kdfService';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const Create = ({ onSave, onCancel }) => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedMood, setSelectedMood] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [moodsDb, setMoodsDb] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Fetch moods from database
    async function fetchDB() {
        try {
            setLoading(true);
            const response = await fetch("http://192.168.1.23:9000/api/mood/all", {
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
            const response = await fetch("http://192.168.1.23:9000/api/diary/add", {
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

    return (
        <View className="flex-1 bg-white">
            <ScrollView
                className="flex-grow p-5"
                showsVerticalScrollIndicator={false}
            >


                {/* Mood Section */}
                <View className="mb-6">
                    <Text className="text-base font-medium text-gray-700 mb-3">
                        How are you feeling?
                    </Text>
                    {loading ? (
                        <Text className="text-gray-500 text-center py-4">
                            Loading moods...
                        </Text>
                    ) : (
                        <View className="flex-row flex-wrap gap-3">
                            {moodsDb.map((mood) => (
                                <TouchableOpacity
                                    key={mood._id}
                                    className={`flex-row items-center py-3 px-4 rounded-2xl border-2 min-w-[85px] ${selectedMood === mood._id
                                        ? 'border-gray-400 bg-gray-100'
                                        : 'border-gray-200 bg-white'
                                        }`}
                                    onPress={() => setSelectedMood(mood._id)}
                                    activeOpacity={0.7}
                                >
                                    {renderMoodIcon(mood)}
                                    <Text className="text-sm text-gray-700 font-medium">
                                        {mood.mood}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* Title Section */}
                <View className="mb-6">
                    <Text className="text-base font-medium text-gray-700 mb-3">
                        Title
                    </Text>
                    <TextInput
                        className="border border-gray-300 rounded-xl p-4 text-base text-gray-800 bg-white"
                        value={title}
                        onChangeText={setTitle}
                        placeholder="What's on your mind today?"
                        placeholderTextColor="#9ca3af"
                        maxLength={100}
                    />
                </View>

                {/* Content Section */}
                <View className="mb-6">
                    <Text className="text-base font-medium text-gray-700 mb-3">
                        Content
                    </Text>
                    <TextInput
                        className="border border-gray-300 rounded-xl p-4 text-base text-gray-800 bg-white min-h-[350px]"
                        value={content}
                        onChangeText={setContent}
                        placeholder="Share your thoughts, experiences, or reflections..."
                        placeholderTextColor="#9ca3af"
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                    />
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3 mt-8 mb-10">


                    <TouchableOpacity
                        className={`flex-1 py-4 rounded-xl items-center ${saving ? 'bg-gray-400' : 'bg-gray-700'
                            }`}
                        onPress={handleSave}
                        activeOpacity={0.7}
                        disabled={saving}
                    >
                        <Text className="text-base font-semibold text-white">
                            {saving ? 'Saving...' : 'Save Entry'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default Create;