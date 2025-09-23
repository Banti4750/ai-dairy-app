import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as SecureStore from 'expo-secure-store';
import React, { memo, useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const BASE_URL = 'https://ai-dairy-backend.onrender.com/api/auth';

// Extract ProfileField as a separate memoized component
const ProfileField = memo(({ icon, label, value, onChangeText, editable = true, iconColor = '#4F46E5', onPress, isEditing, updating }) => {
    return (
        <View className="mb-5">
            <TouchableOpacity
                className="flex-row items-center bg-white rounded-xl px-4 py-4 border-b border-gray-200"
                onPress={onPress}
                disabled={!onPress}
                activeOpacity={onPress ? 0.7 : 1}
            >
                <View className="w-11 h-11 bg-gray-50 rounded-full items-center justify-center mr-3">
                    <Ionicons name={icon} size={20} color={iconColor} />
                </View>

                {editable && !onPress ? (
                    <TextInput
                        className="flex-1 text-base text-gray-800 font-medium"
                        value={value}
                        onChangeText={onChangeText}
                        multiline={label === 'Bio'}
                        numberOfLines={label === 'Bio' ? 4 : 1}
                        placeholder={`Enter your ${label.toLowerCase()}`}
                        placeholderTextColor="#9CA3AF"
                        editable={isEditing && !updating}
                        style={{
                            backgroundColor: isEditing && !updating ? '#FFFFFF' : 'transparent',
                            opacity: isEditing && !updating ? 1 : 0.7,
                        }}
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
});

const MoodCard = memo(({ emoji, label, count, color }) => (
    <View className="flex-1 bg-white rounded-xl p-4 mx-1 shadow-sm items-center">
        <Text className="text-2xl mb-1">{emoji}</Text>
        <Text className="text-lg font-bold" style={{ color }}>{count}</Text>
        <Text className="text-xs text-gray-600 text-center">{label}</Text>
    </View>
));

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showImageOptions, setShowImageOptions] = useState(false);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const { user, setUser } = useAuth();

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: 'Not Updated',
        bio: '',
        joinDate: '',
        dob: 'Not Updated',
        gender: 'Male',
        profileImage: null,
    });

    const [originalData, setOriginalData] = useState({});

    // Fetch profile data on component mount
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const token = await SecureStore.getItemAsync('authToken');

            if (!token) {
                Alert.alert('Error', 'Authentication token not found');
                return;
            }

            const response = await fetch(`${BASE_URL}/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (response.ok) {
                const userData = data.user;
                const profileInfo = {
                    name: userData.name || '',
                    email: userData.email || '',
                    phone: userData.phone || 'Not Updated',
                    bio: userData.bio || '',
                    joinDate: userData.joinDate || '',
                    dob: userData.dob || 'Not Updated',
                    gender: userData.gender || 'Male',
                    profileImage: userData.profileImage || null,
                };

                setProfileData(profileInfo);
                setOriginalData(profileInfo);

                // Update auth context if needed
                if (setUser) {
                    setUser(userData);
                }
            } else {
                Alert.alert('Error', data.message || 'Failed to fetch profile');
            }
        } catch (error) {
            console.error('Profile fetch error:', error);
            Alert.alert('Error', 'Network error. Please check your connection.');
        } finally {
            setLoading(false);
        }
    }, [setUser]);

    const handleSave = useCallback(async () => {
        try {
            setUpdating(true);
            const token = await SecureStore.getItemAsync('authToken');

            if (!token) {
                Alert.alert('Error', 'Authentication token not found');
                return;
            }

            // Only send changed fields
            const changedData = {};
            Object.keys(profileData).forEach(key => {
                if (profileData[key] !== originalData[key] && key !== 'email' && key !== 'joinDate') {
                    // Handle special cases
                    if (key === 'phone' && profileData[key] === 'Not Updated') {
                        return;
                    }
                    if (key === 'dob' && profileData[key] === 'Not Updated') {
                        return;
                    }
                    changedData[key] = profileData[key];
                }
            });

            // If no changes, just exit edit mode
            if (Object.keys(changedData).length === 0) {
                setIsEditing(false);
                return;
            }

            const response = await fetch(`${BASE_URL}/edit-profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(changedData),
            });

            const data = await response.json();

            if (response.ok) {
                // Update local state with response data
                const updatedUserData = data.user;
                const updatedProfileInfo = {
                    name: updatedUserData.name || '',
                    email: updatedUserData.email || '',
                    phone: updatedUserData.phone || 'Not Updated',
                    bio: updatedUserData.bio || '',
                    joinDate: updatedUserData.joinDate || '',
                    dob: updatedUserData.dob || 'Not Updated',
                    gender: updatedUserData.gender || 'Male',
                    profileImage: updatedUserData.profileImage || null,
                };

                setProfileData(updatedProfileInfo);
                setOriginalData(updatedProfileInfo);
                setIsEditing(false);

                // Update auth context
                if (setUser) {
                    setUser(updatedUserData);
                }

                Alert.alert('Success', '✨ Profile updated successfully!', [
                    { text: 'OK', style: 'default' }
                ]);
            } else {
                Alert.alert('Error', data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            Alert.alert('Error', 'Network error. Please check your connection.');
        } finally {
            setUpdating(false);
        }
    }, [profileData, originalData, setUser]);

    const handleCancel = useCallback(() => {
        setProfileData(originalData);
        setIsEditing(false);
    }, [originalData]);

    const handleImageSelect = useCallback((option) => {
        setShowImageOptions(false);
        if (option === 'camera') {
            Alert.alert('Camera', 'Camera functionality will be implemented');
        } else if (option === 'gallery') {
            Alert.alert('Gallery', 'Gallery selection will be implemented');
        } else {
            setProfileData(prev => ({ ...prev, profileImage: null }));
        }
    }, []);

    // Date picker logic
    const handleDatePress = useCallback(() => {
        if (isEditing) {
            setShowDatePicker(true);
        }
    }, [isEditing]);

    const handleDateChange = useCallback((event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            // Format date as YYYY-MM-DD
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setProfileData(prev => ({ ...prev, dob: formattedDate }));
        }
    }, []);

    // Memoized update functions that won't cause re-renders
    const updateName = useCallback((text) => {
        setProfileData(prev => ({ ...prev, name: text }));
    }, []);

    const updatePhone = useCallback((text) => {
        setProfileData(prev => ({ ...prev, phone: text }));
    }, []);

    const updateGender = useCallback((text) => {
        setProfileData(prev => ({ ...prev, gender: text }));
    }, []);

    const updateBio = useCallback((text) => {
        setProfileData(prev => ({ ...prev, bio: text }));
    }, []);

    const toggleEdit = useCallback(() => {
        if (isEditing) {
            handleSave();
        } else {
            setIsEditing(true);
        }
    }, [isEditing, handleSave]);

    const ImageOptionsModal = useCallback(() => (
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
    ), [showImageOptions, handleImageSelect]);

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 justify-center items-center">
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="text-gray-600 mt-4">Loading profile...</Text>
            </View>
        );
    }

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
                        onPress={toggleEdit}
                        disabled={updating}
                    >
                        {updating ? (
                            <ActivityIndicator size="small" color="#4F46E5" />
                        ) : (
                            <Ionicons
                                name={isEditing ? "checkmark" : "pencil"}
                                size={20}
                                color={isEditing ? "#10B981" : "#4F46E5"}
                            />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Profile Picture Section */}
                <View className="items-center mb-8">
                    <View className="relative">
                        <View className="w-36 h-36 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 rounded-full items-center justify-center shadow-xl border-4 border-white">
                            <Text className="text-5xl font-bold text-white">
                                {profileData.name ? profileData.name.split(' ').map(n => n[0]).join('') : '?'}
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
                    <Text className="text-2xl font-bold text-gray-900 mt-4">{profileData.name || 'Unknown'}</Text>
                    <Text className="text-base text-gray-500">{profileData.email}</Text>
                    <View className="flex-row items-center mt-2 bg-white px-3 py-1 rounded-full shadow-sm">
                        <Ionicons name="journal" size={14} color="#8B5CF6" />
                        <Text className="text-sm text-gray-600 ml-1">
                            Diary Member since {profileData.joinDate || 'Unknown'}
                        </Text>
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
                <View className="bg-white rounded-2xl p-2 space-y-2">
                    <ProfileField
                        icon="person"
                        label="Full Name"
                        value={profileData.name}
                        onChangeText={updateName}
                        iconColor="#4F46E5"
                        isEditing={isEditing}
                        updating={updating}
                    />

                    <ProfileField
                        icon="mail"
                        label="Email"
                        value={profileData.email}
                        editable={false}
                        iconColor="#10B981"
                        isEditing={isEditing}
                        updating={updating}
                    />

                    <ProfileField
                        icon="call"
                        label="Phone"
                        value={profileData.phone}
                        onChangeText={updatePhone}
                        iconColor="#F59E0B"
                        isEditing={isEditing}
                        updating={updating}
                    />

                    <ProfileField
                        icon="calendar"
                        label="Date of Birth"
                        value={profileData.dob}
                        iconColor="#8B5CF6"
                        onPress={handleDatePress}
                        isEditing={isEditing}
                        updating={updating}
                    />

                    <ProfileField
                        icon="person-circle"
                        label="Gender"
                        value={profileData.gender}
                        onChangeText={updateGender}
                        iconColor="#06B6D4"
                        isEditing={isEditing}
                        updating={updating}
                    />

                    <ProfileField
                        icon="heart"
                        label="Bio"
                        value={profileData.bio}
                        onChangeText={updateBio}
                        iconColor="#EC4899"
                        isEditing={isEditing}
                        updating={updating}
                    />
                </View>

                {/* Date Picker */}
                {showDatePicker && (
                    <DateTimePicker
                        value={profileData.dob !== 'Not Updated' ? new Date(profileData.dob) : new Date()}
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                    />
                )}

                {/* Action Buttons */}
                {isEditing && (
                    <View className="flex-row mt-6 mb-4">
                        <TouchableOpacity
                            className="flex-1 bg-gray-400 rounded-xl py-4 mr-2 items-center"
                            onPress={handleCancel}
                            disabled={updating}
                        >
                            <Text className="text-base font-semibold text-gray-800">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-1 bg-gray-900 rounded-xl py-4 ml-2 items-center shadow-lg border border-blue-700"
                            onPress={handleSave}
                            disabled={updating}
                        >
                            {updating ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text className="text-base font-bold text-white">Save Changes</Text>
                            )}
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