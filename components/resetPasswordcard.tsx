import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import image from '../assets/images/ai-diary-logo.png';

const ResetPasswordCard = ({ email, onBackToSignIn }) => {
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const base_url = 'https://ai-dairy-backend.onrender.com/api'; // Replace with your IP

    const validateInputs = () => {
        if (!otp || otp.trim().length === 0) {
            Alert.alert('Error', 'Please enter the OTP code');
            return false;
        }

        if (!newPassword || newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return false;
        }

        if (newPassword !== confirmNewPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return false;
        }

        return true;
    };

    const handleResetPassword = async () => {
        if (!validateInputs()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${base_url}/auth/verify-otp-reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    otp: otp.trim(),
                    email: email,
                    newPassword: newPassword
                }),
            });

            const data = await response.json();
            console.log(data)
            if (response.ok) {
                Alert.alert(
                    'Success',
                    'Password reset successfully! You can now sign in with your new password.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Reset form
                                setOtp('');
                                setNewPassword('');
                                setConfirmNewPassword('');
                                // Redirect to sign in
                                onBackToSignIn();
                            }
                        }
                    ]
                );
            } else {
                const errorMessage = data.message || data.error || 'Failed to reset password';

                if (response.status === 400) {
                    Alert.alert('Invalid OTP', 'The OTP code is invalid or has expired. Please request a new one.');
                } else if (response.status === 404) {
                    Alert.alert('Error', 'Email not found. Please check your email address.');
                } else if (response.status >= 500) {
                    Alert.alert('Server Error', 'Server is experiencing issues. Please try again later.');
                } else {
                    Alert.alert('Error', errorMessage);
                }
            }

        } catch (error) {
            console.error('Reset password error:', error);

            if (error.message === 'Network request failed' || error.name === 'TypeError') {
                Alert.alert(
                    'Connection Error',
                    'Cannot connect to server. Please check your internet connection and try again.'
                );
            } else {
                Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setIsLoading(true);

        try {
            const response = await fetch(`${base_url}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email
                }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Success', 'New OTP sent to your email');
            } else {
                Alert.alert('Error', data.message || 'Failed to resend OTP');
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            Alert.alert('Error', 'Failed to resend OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View className='flex-1 justify-center items-center bg-gray-50 px-6 py-8'>
                    <View className='w-full max-w-sm'>

                        {/* Logo Header */}
                        <View className='items-center mb-8'>
                            <View className='w-28 h-28 bg-white shadow-lg rounded-3xl items-center justify-center mb-4'>
                                <Image className='w-24 h-24 rounded-2xl' source={image} />
                            </View>

                            <Text className='text-gray-600 text-xl font-bold text-center'>
                                Reset Password
                            </Text>
                            <Text className='text-gray-500 text-sm text-center mt-2'>
                                Enter the OTP sent to {email}
                            </Text>
                        </View>

                        {/* Reset Password Form */}
                        <View className='bg-white p-6 rounded-2xl shadow-lg'>

                            {/* OTP Input */}
                            <View className='mb-4'>
                                <Text className='text-gray-700 font-medium mb-2'>OTP Code *</Text>
                                <TextInput
                                    className='bg-gray-100 px-4 py-3 rounded-xl text-gray-800 text-center tracking-widest'
                                    placeholder='Enter 6-digit OTP'
                                    value={otp}
                                    onChangeText={setOtp}
                                    keyboardType='numeric'
                                    maxLength={6}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            {/* New Password */}
                            <View className='mb-4'>
                                <Text className='text-gray-700 font-medium mb-2'>New Password *</Text>
                                <View className='relative'>
                                    <TextInput
                                        className='bg-gray-100 px-4 py-3 rounded-xl text-gray-800 pr-16'
                                        placeholder='Enter new password'
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        secureTextEntry={!showPassword}
                                        autoCapitalize='none'
                                        placeholderTextColor="#9CA3AF"
                                        maxLength={100}
                                    />
                                    <TouchableOpacity
                                        className='absolute right-4 top-3'
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <Text className='text-gray-700 font-medium text-sm'>
                                            {showPassword ? 'Hide' : 'Show'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <Text className='text-xs text-gray-500 mt-1'>
                                    At least 6 characters
                                </Text>
                            </View>

                            {/* Confirm New Password */}
                            <View className='mb-6'>
                                <Text className='text-gray-700 font-medium mb-2'>Confirm New Password *</Text>
                                <TextInput
                                    className='bg-gray-100 px-4 py-3 rounded-xl text-gray-800'
                                    placeholder='Confirm new password'
                                    value={confirmNewPassword}
                                    onChangeText={setConfirmNewPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize='none'
                                    placeholderTextColor="#9CA3AF"
                                    maxLength={100}
                                />
                            </View>

                            {/* Reset Password Button */}
                            <TouchableOpacity
                                className={`py-4 rounded-xl items-center mb-4 ${isLoading ? 'bg-gray-400' : 'bg-gray-700'
                                    }`}
                                onPress={handleResetPassword}
                                disabled={isLoading}
                            >
                                <Text className='text-white font-bold text-lg'>
                                    {isLoading ? 'Resetting...' : 'Reset Password'}
                                </Text>
                            </TouchableOpacity>

                            {/* Resend OTP */}
                            <View className='items-center'>
                                <Text className='text-gray-600 text-sm mb-2'>Didn't receive the code?</Text>
                                <TouchableOpacity
                                    onPress={handleResendOTP}
                                    disabled={isLoading}
                                >
                                    <Text className={`font-medium ${isLoading ? 'text-gray-400' : 'text-gray-950'}`}>
                                        Resend OTP
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Footer Links */}
                        <View className='mt-6 items-center'>
                            <View className='flex-row'>
                                <Text className='text-gray-600'>Remember your password? </Text>
                                <TouchableOpacity onPress={onBackToSignIn}>
                                    <Text className='text-gray-950 font-medium'>Sign In</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default ResetPasswordCard;