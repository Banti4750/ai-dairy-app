import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    Share,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const ShareApp = () => {
    const [shareCount, setShareCount] = useState(0);

    const shareMessage = `🌟 I've been loving AI Diary for my personal growth journey!

    It's an amazing app that uses AI to help you understand your thoughts, track your mood, and achieve your goals through journaling.

    ✨ Features I love:
    • AI-powered insights from my entries
    • Mood tracking and analytics
    • Goal setting and progress tracking
    • Beautiful, intuitive interface

    Download AI Diary: [App Store/Play Store Link]

    #AIJournal #PersonalGrowth #Mindfulness`;


    const shareViaSocial = async () => {
        try {
            await Share.share({
                message: shareMessage,
                title: 'AI Diary - Transform Your Journaling',
                url: 'https://aidiary.app', // Replace with your actual app URL
            });
            updateShareCount();
        } catch (error) {
            console.log('Error sharing via social:', error);
        }
    };


    const updateShareCount = () => {
        setShareCount(prev => prev + 1);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-6 pt-8 pb-6">
                    <Text className="text-3xl font-bold text-gray-900 mb-2">
                        Share AI Diary
                    </Text>
                    <Text className="text-lg text-gray-600 leading-6">
                        Help friends discover the power of AI-guided journaling and earn rewards!
                    </Text>
                </View>



                {/* Preview Message */}
                <View className="px-6 mb-8">
                    <Text className="text-xl font-bold text-gray-900 mb-4">
                        Share Message Preview
                    </Text>
                    <View className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                        <Text className="text-sm text-gray-700 leading-5 mb-4">
                            {shareMessage}
                        </Text>
                        <TouchableOpacity
                            onPress={() => Alert.alert('Message', 'You can customize this message before sharing!')}
                            className="bg-white border border-gray-200 py-2 px-4 rounded-lg self-start"
                        >
                            <Text className="text-gray-600 text-sm font-medium">
                                Customize Message
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>



                {/* Call to Action */}
                <View className="px-6 pb-8">
                    <View className="bg-gray-900 rounded-2xl p-6 items-center">
                        <Text className="text-white text-lg font-bold mb-2 text-center">
                            Start Sharing Today!
                        </Text>
                        <Text className="text-gray-300 text-center text-base mb-6">
                            Help your friends discover better mental health through AI-powered journaling
                        </Text>
                        <TouchableOpacity
                            onPress={shareViaSocial}
                            className="bg-white py-4 px-8 rounded-xl"
                        >
                            <Text className="text-gray-900 font-semibold text-lg">
                                Share Now
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer */}
                <View className="px-6 pb-8">
                    <Text className="text-center text-sm text-gray-500 leading-5">
                        Sharing rewards are credited automatically when friends join using your referral code.
                        Terms and conditions apply.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ShareApp;