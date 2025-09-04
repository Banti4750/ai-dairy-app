import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showImageOptions, setShowImageOptions] = useState(false);

    const [profileData, setProfileData] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        bio: 'Expressing my thoughts and emotions through daily reflections. Life is beautiful! 🌟',
        joinDate: 'January 2024',
        dob: 'January 15, 2004',
        gender: 'Male',
        profileImage: null
    });

    const [tempDob, setTempDob] = useState(profileData.dob);

    const handleSave = () => {
        setIsEditing(false);
        Alert.alert('Success', '✨ Profile updated successfully!', [
            { text: 'OK', style: 'default' }
        ]);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setTempDob(profileData.dob);
    };

    const handleImageSelect = (option) => {
        setShowImageOptions(false);
        if (option === 'camera') {
            Alert.alert('Camera', 'Camera functionality will be implemented');
        } else if (option === 'gallery') {
            Alert.alert('Gallery', 'Gallery selection will be implemented');
        } else {
            setProfileData({ ...profileData, profileImage: null });
        }
    };

    const ProfileField = ({ icon, label, value, onChangeText, editable = true, iconColor = '#4F46E5', onPress }) => (
        <View className="mb-5">
            {/* <Text className="text-sm font-medium text-gray-600 mb-2">{label}</Text> */}
            <TouchableOpacity
                className="flex-row items-center bg-white rounded-xl px-4 py-4  border-b border-gray-200"
                onPress={onPress}
                disabled={!onPress}
                activeOpacity={onPress ? 0.7 : 1}
            >
                <View className="w-11 h-11 bg-gray-50 rounded-full items-center justify-center mr-3">
                    <Ionicons name={icon} size={20} color={iconColor} />
                </View>
                {isEditing && editable && !onPress ? (
                    <TextInput
                        className="flex-1 text-base text-gray-800 font-medium"
                        value={value}
                        onChangeText={onChangeText}
                        multiline={label === 'Bio'}
                        numberOfLines={label === 'Bio' ? 4 : 1}
                        placeholder={`Enter your ${label.toLowerCase()}`}
                        placeholderTextColor="#9CA3AF"
                    />
                ) : (
                    <View className="flex-1">
                        <Text className="text-base text-gray-800 font-medium">{value}</Text>
                        {onPress && isEditing && (
                            <Text className="text-xs text-blue-500 mt-1">Tap to edit</Text>
                        )}
                    </View>
                )}
                {onPress && isEditing && (
                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                )}
            </TouchableOpacity>
        </View>
    );

    const MoodCard = ({ emoji, label, count, color }) => (
        <View className="flex-1 bg-white rounded-xl p-4 mx-1 shadow-sm items-center">
            <Text className="text-2xl mb-1">{emoji}</Text>
            <Text className="text-lg font-bold" style={{ color }}>{count}</Text>
            <Text className="text-xs text-gray-600 text-center">{label}</Text>
        </View>
    );

    const ImageOptionsModal = () => (
        <Modal
            visible={showImageOptions}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowImageOptions(false)}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl p-6 pb-8">
                    <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-6" />
                    <Text className="text-xl font-bold text-gray-900 mb-6 text-center">Change Profile Photo</Text>

                    <TouchableOpacity
                        className="flex-row items-center py-4 px-2"
                        onPress={() => handleImageSelect('camera')}
                    >
                        <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mr-4">
                            <Ionicons name="camera" size={24} color="#4F46E5" />
                        </View>
                        <Text className="text-base font-medium text-gray-800">Take Photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center py-4 px-2"
                        onPress={() => handleImageSelect('gallery')}
                    >
                        <View className="w-12 h-12 bg-green-50 rounded-full items-center justify-center mr-4">
                            <Ionicons name="images" size={24} color="#10B981" />
                        </View>
                        <Text className="text-base font-medium text-gray-800">Choose from Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center py-4 px-2"
                        onPress={() => handleImageSelect('remove')}
                    >
                        <View className="w-12 h-12 bg-red-50 rounded-full items-center justify-center mr-4">
                            <Ionicons name="trash" size={24} color="#EF4444" />
                        </View>
                        <Text className="text-base font-medium text-gray-800">Remove Photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="mt-4 bg-gray-100 rounded-xl py-4 items-center"
                        onPress={() => setShowImageOptions(false)}
                    >
                        <Text className="text-base font-medium text-gray-600">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );

    return (
        <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
            <View className="px-4 pt-4 pb-6">
                {/* Header */}
                <View className="flex-row items-center justify-between mb-6">
                    <View>
                        <Text className="text-3xl font-bold text-gray-900 mb-1">My Profile</Text>
                        <Text className="text-base text-gray-500">Manage your diary profile</Text>
                    </View>
                    <TouchableOpacity
                        className="w-11 h-11 bg-white rounded-full items-center justify-center shadow-sm border border-gray-200"
                        onPress={() => setIsEditing(!isEditing)}
                    >
                        <Ionicons
                            name={isEditing ? "checkmark" : "pencil"}
                            size={20}
                            color={isEditing ? "#10B981" : "#4F46E5"}
                        />
                    </TouchableOpacity>
                </View>

                {/* Profile Picture Section */}
                <View className="items-center mb-8">
                    <View className="relative">
                        <View className="w-36 h-36 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-full items-center justify-center shadow-xl border-4 border-white">
                            <Text className="text-5xl font-bold text-white">
                                {profileData.name.split(' ').map(n => n[0]).join('')}
                            </Text>
                        </View>
                        {isEditing && (
                            <TouchableOpacity
                                className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg border-2 border-gray-100"
                                onPress={() => setShowImageOptions(true)}
                            >
                                <Ionicons name="camera" size={20} color="#4F46E5" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text className="text-2xl font-bold text-gray-900 mt-4">{profileData.name}</Text>
                    <Text className="text-base text-gray-500">{profileData.email}</Text>
                    <View className="flex-row items-center mt-2 bg-white px-3 py-1 rounded-full shadow-sm">
                        <Ionicons name="journal" size={14} color="#8B5CF6" />
                        <Text className="text-sm text-gray-600 ml-1">Diary Member since {profileData.joinDate}</Text>
                    </View>
                </View>

                {/* Mood Stats */}
                <Text className="text-lg font-bold text-gray-800 mb-4">Recent Mood Insights</Text>
                <View className="flex-row mb-8">
                    <MoodCard emoji="😊" label="Happy Days" count="24" color="#10B981" />
                    <MoodCard emoji="😔" label="Sad Days" count="8" color="#EF4444" />
                    <MoodCard emoji="😌" label="Calm Days" count="15" color="#8B5CF6" />
                    <MoodCard emoji="😤" label="Stressed" count="5" color="#F59E0B" />
                </View>

                {/* Profile Information */}
                <Text className="text-lg font-bold text-gray-800 mb-4">Personal Information</Text>
                <View className="bg-white rounded-2xl  p-2 space-y-2">

                    <ProfileField
                        icon="person"
                        label="Full Name"
                        value={profileData.name}
                        onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                        iconColor="#4F46E5"
                    />

                    <ProfileField
                        icon="mail"
                        label="Email"
                        value={profileData.email}
                        editable={false}
                        iconColor="#10B981"
                    />

                    <ProfileField
                        icon="call"
                        label="Phone"
                        value={profileData.phone}
                        onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
                        iconColor="#F59E0B"
                    />

                    <ProfileField
                        icon="calendar"
                        label="Date of Birth"
                        value={profileData.dob}
                        iconColor="#8B5CF6"
                        onPress={() => Alert.alert('Date Picker', 'Date picker will be implemented')}
                    />

                    <ProfileField
                        icon="person-circle"
                        label="Gender"
                        value={profileData.gender}
                        onChangeText={(text) => setProfileData({ ...profileData, gender: text })}
                        iconColor="#06B6D4"
                    />

                    <ProfileField
                        icon="heart"
                        label="Bio"
                        value={profileData.bio}
                        onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
                        iconColor="#EC4899"
                    />
                </View>

                {/* Action Buttons */}
                {isEditing && (
                    <View className="flex-row mt-6 mb-4">
                        <TouchableOpacity
                            className="flex-1 bg-gray-100 rounded-xl py-4 mr-2 items-center"
                            onPress={handleCancel}
                        >
                            <Text className="text-base font-semibold text-gray-600">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl py-4 ml-2 items-center shadow-sm"
                            onPress={handleSave}
                        >
                            <Text className="text-base font-semibold text-gray-950">Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Additional Actions */}
                <View className="bg-white rounded-2xl mt-4 shadow-sm">
                    <TouchableOpacity className="flex-row items-center px-6 py-5 border-b border-gray-50">
                        <View className="w-11 h-11 bg-yellow-50 rounded-full items-center justify-center mr-4">
                            <Ionicons name="key" size={20} color="#F59E0B" />
                        </View>
                        <Text className="flex-1 text-base text-gray-700 font-medium">Change Password</Text>
                        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center px-6 py-5 border-b border-gray-50">
                        <View className="w-11 h-11 bg-purple-50 rounded-full items-center justify-center mr-4">
                            <Ionicons name="analytics" size={20} color="#8B5CF6" />
                        </View>
                        <Text className="flex-1 text-base text-gray-700 font-medium">Mood Analytics</Text>
                        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center px-6 py-5">
                        <View className="w-11 h-11 bg-green-50 rounded-full items-center justify-center mr-4">
                            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                        </View>
                        <Text className="flex-1 text-base text-gray-700 font-medium">Privacy Settings</Text>
                        <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>
            </View>

            <ImageOptionsModal />
        </ScrollView>
    );
};

export default Profile;