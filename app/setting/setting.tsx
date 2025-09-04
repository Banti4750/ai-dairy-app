import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const Setting = () => {
    const handlePress = (item) => {
        console.log(`${item} pressed`);
        // Add navigation or functionality here
    };

    const MenuItem = ({ icon, title, onPress, iconFamily = 'Ionicons', isLast = false, iconColor = '#4F46E5' }) => {
        const IconComponent = iconFamily === 'MaterialIcons' ? MaterialIcons :
            iconFamily === 'Feather' ? Feather : Ionicons;

        return (
            <TouchableOpacity
                className={`flex-row items-center justify-between px-6 py-5 ${!isLast ? 'border-b border-gray-50' : ''}`}
                onPress={onPress}
                activeOpacity={0.7}
            >
                <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4">
                        <IconComponent name={icon} size={20} color={iconColor} />
                    </View>
                    <Text className="text-base text-gray-700 font-medium">{title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>
        );
    };

    const SectionHeader = ({ title }) => (
        <Text className="text-lg font-bold text-gray-800 mb-3 mt-6 mx-1">{title}</Text>
    );

    return (
        <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
            <View className="px-4 pt-4 pb-6">
                {/* Header */}
                <View className="mb-2">
                    {/* <Text className="text-3xl font-bold text-gray-900 mb-2">Settings</Text> */}
                    <Text className="text-xl text-gray-500">Manage your account and preferences</Text>
                </View>

                {/* Your Account Section */}
                <SectionHeader title="Your Account" />
                <View className="bg-white rounded-2xl mb-4 shadow-sm">
                    <MenuItem
                        icon="person-outline"
                        title="Profile"
                        onPress={() => handlePress('Profile')}
                        iconColor="#4F46E5"
                    />
                    <MenuItem
                        icon="notifications-outline"
                        title="Notifications"
                        onPress={() => handlePress('Notifications')}
                        iconColor="#10B981"
                    />
                    <MenuItem
                        icon="target-outline"
                        title="Goals"
                        onPress={() => handlePress('Goals')}
                        iconColor="#F59E0B"
                    />
                    <MenuItem
                        icon="flag-outline"
                        title="Purpose"
                        onPress={() => handlePress('Purpose')}
                        iconColor="#EF4444"
                    />
                    <MenuItem
                        icon="information-circle-outline"
                        title="About Me"
                        onPress={() => handlePress('About Me')}
                        iconColor="#8B5CF6"
                        isLast={true}
                    />
                </View>

                {/* Subscription Section */}
                <SectionHeader title="Subscription" />
                <View className="bg-white rounded-2xl mb-4 shadow-sm">
                    <MenuItem
                        icon="star-outline"
                        title="Upgrade to Premium"
                        onPress={() => handlePress('Upgrade to Premium')}
                        iconColor="#F59E0B"
                        isLast={true}
                    />
                </View>

                {/* About Section */}
                <SectionHeader title="About" />
                <View className="bg-white rounded-2xl mb-6 shadow-sm">
                    <MenuItem
                        icon="help-circle-outline"
                        title="Help & Support"
                        onPress={() => handlePress('Help & Support')}
                        iconColor="#06B6D4"
                    />
                    <MenuItem
                        icon="document-text-outline"
                        title="Terms of Service"
                        onPress={() => handlePress('Terms of Service')}
                        iconColor="#6B7280"
                    />
                    <MenuItem
                        icon="share-outline"
                        title="Share App"
                        onPress={() => handlePress('Share App')}
                        iconColor="#10B981"
                        isLast={true}
                    />
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    className="flex-row items-center justify-center bg-white rounded-2xl py-5 shadow-sm border border-red-100"
                    onPress={() => handlePress('Logout')}
                    activeOpacity={0.8}
                >
                    <View className="w-10 h-10 bg-red-50 rounded-full items-center justify-center mr-3">
                        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                    </View>
                    <Text className="text-base text-red-500 font-semibold">Logout</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default Setting;