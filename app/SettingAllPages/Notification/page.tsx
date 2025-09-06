import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface NotificationSetting {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
    time?: string;
    frequency?: string;
}

interface NotificationSection {
    title: string;
    description?: string;
    settings: NotificationSetting[];
}

const NotificationPreferences = () => {
    const [notificationSections, setNotificationSections] = useState<NotificationSection[]>([
        {
            title: 'Daily Reminders',
            description: 'Get gentle reminders to maintain your journaling habit',
            settings: [
                {
                    id: 'daily_journal',
                    title: 'Daily Journal Reminder',
                    description: 'Remind me to write in my diary',
                    enabled: true,
                    time: '8:00 PM',
                },
                {
                    id: 'morning_reflection',
                    title: 'Morning Reflection',
                    description: 'Start your day with a mindful moment',
                    enabled: false,
                    time: '7:00 AM',
                },
                {
                    id: 'evening_gratitude',
                    title: 'Evening Gratitude',
                    description: 'End your day by reflecting on positive moments',
                    enabled: true,
                    time: '9:30 PM',
                },
            ],
        },
        {
            title: 'AI Insights & Analysis',
            description: 'Stay updated with your personal growth insights',
            settings: [
                {
                    id: 'weekly_insights',
                    title: 'Weekly AI Insights',
                    description: 'Receive your personalized weekly analysis',
                    enabled: true,
                    frequency: 'Every Sunday at 6:00 PM',
                },
                {
                    id: 'mood_patterns',
                    title: 'Mood Pattern Alerts',
                    description: 'Get notified about significant mood changes',
                    enabled: true,
                },

            ],
        },


    ]);



    const [globalNotifications, setGlobalNotifications] = useState(true);

    const toggleNotification = (sectionIndex: number, settingIndex: number) => {
        const newSections = [...notificationSections];
        newSections[sectionIndex].settings[settingIndex].enabled =
            !newSections[sectionIndex].settings[settingIndex].enabled;
        setNotificationSections(newSections);
    };




    const savePreferences = () => {
        // Here you would save to AsyncStorage or API
        Alert.alert(
            'Preferences Saved',
            'Your notification preferences have been updated successfully.',
            [{ text: 'OK' }]
        );
    };

    const resetToDefaults = () => {
        Alert.alert(
            'Reset to Defaults',
            'Are you sure you want to reset all notification preferences to default settings?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        // Reset logic here
                        console.log('Reset to defaults');
                    }
                },
            ]
        );
    };

    const NotificationToggle = ({
        setting,
        sectionIndex,
        settingIndex
    }: {
        setting: NotificationSetting,
        sectionIndex: number,
        settingIndex: number
    }) => (
        <View className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
            <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-4">
                    <Text className="text-base font-semibold text-gray-900 mb-1">
                        {setting.title}
                    </Text>
                    <Text className="text-sm text-gray-600 mb-2">
                        {setting.description}
                    </Text>
                    {(setting.time || setting.frequency) && (
                        <TouchableOpacity
                            className="bg-gray-50 px-3 py-1 rounded-lg self-start"
                        >
                            <Text className="text-xs text-gray-700 font-medium">
                                {setting.time || setting.frequency}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
                <Switch
                    value={setting.enabled && globalNotifications}
                    onValueChange={() => toggleNotification(sectionIndex, settingIndex)}
                    disabled={!globalNotifications}
                    trackColor={{ false: '#E5E7EB', true: '#374151' }}
                    thumbColor={setting.enabled ? '#FFFFFF' : '#9CA3AF'}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-6 pt-8 pb-6">
                    <Text className="text-3xl font-bold text-gray-900 mb-2">
                        Notification Preferences
                    </Text>
                    <Text className="text-lg text-gray-600 leading-6">
                        Customize how and when AI Diary keeps you engaged with your personal growth
                    </Text>
                </View>



                {/* Notification Sections */}
                {notificationSections.map((section, sectionIndex) => (
                    <View key={sectionIndex} className="px-6 mb-8">
                        <Text className="text-xl font-bold text-gray-900 mb-2">
                            {section.title}
                        </Text>
                        {section.description && (
                            <Text className="text-base text-gray-600 mb-4">
                                {section.description}
                            </Text>
                        )}
                        <View className="space-y-0">
                            {section.settings.map((setting, settingIndex) => (
                                <NotificationToggle
                                    key={setting.id}
                                    setting={setting}
                                    sectionIndex={sectionIndex}
                                    settingIndex={settingIndex}
                                />
                            ))}
                        </View>
                    </View>
                ))}

                {/* Action Buttons */}
                <View className="px-6 pb-8 space-y-4">
                    <TouchableOpacity
                        onPress={savePreferences}
                        className="bg-gray-900 py-4 px-6 rounded-xl items-center"
                    >
                        <Text className="text-white text-lg font-semibold">
                            Save Preferences
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={resetToDefaults}
                        className="bg-white border border-gray-300 py-4 px-6 rounded-xl items-center"
                    >
                        <Text className="text-gray-700 text-lg font-semibold">
                            Reset to Defaults
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Footer Info */}
                <View className="px-6 pb-8">
                    <View className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <Text className="text-blue-800 text-sm font-medium mb-2">
                            💡 Notification Tips
                        </Text>
                        <Text className="text-blue-700 text-sm leading-5">
                            • Customize times to fit your schedule
                            • Start with fewer notifications and add more as needed
                            • Use quiet hours to ensure uninterrupted sleep
                            • Crisis support notifications cannot be disabled for your safety
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default NotificationPreferences;