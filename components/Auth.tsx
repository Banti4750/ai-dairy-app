import { useAuth } from '@/context/AuthContext';
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
import ResetPasswordCard from './resetPasswordcard';

// For Android emulator, use 10.0.2.2 instead of localhost
// For iOS simulator, localhost should work
// For physical device, use your computer's IP address
const base_url = 'http://192.168.1.23:9000/api' // Replace with your IP

const Auth = () => {
    const { login, signup } = useAuth(); // Get auth functions from context
    const [authMode, setAuthMode] = useState('signin') // 'signin', 'signup', 'forgot', 'reset-password'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [resetEmail, setResetEmail] = useState('') // Store email for reset password

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const handleAuth = async () => {
        if (!formData.email || !validateEmail(formData.email)) {
            Alert.alert('Error', 'Please enter a valid email address')
            return
        }

        if (authMode === 'forgot') {
            // Handle forgot password
            setIsLoading(true)
            try {
                const response = await fetch(`${base_url}/auth/forgot-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: formData.email
                    }),
                })

                const data = await response.json()

                if (response.ok) {
                    Alert.alert(
                        'Success',
                        'OTP sent to your email. Please check your inbox.',
                        [
                            {
                                text: 'OK',
                                onPress: () => {
                                    // Store email and switch to reset password form
                                    setResetEmail(formData.email)
                                    setAuthMode('reset-password')
                                    resetForm()
                                }
                            }
                        ]
                    )
                } else {
                    Alert.alert('Error', data.message || 'Failed to send reset link')
                }
            } catch (error) {
                console.error('Forgot password error:', error)
                handleNetworkError(error)
            } finally {
                setIsLoading(false)
            }
            return
        }

        if (!formData.password || formData.password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long')
            return
        }

        if (authMode === 'signup') {
            if (!formData.fullName || formData.fullName.trim().length < 2) {
                Alert.alert('Error', 'Please enter your full name (at least 2 characters)')
                return
            }
            if (formData.password !== formData.confirmPassword) {
                Alert.alert('Error', 'Passwords do not match')
                return
            }
        }

        setIsLoading(true)

        try {
            let endpoint = ''
            let requestBody = {}

            if (authMode === 'signin') {
                endpoint = `${base_url}/auth/login`
                requestBody = {
                    email: formData.email,
                    password: formData.password
                }
            } else if (authMode === 'signup') {
                endpoint = `${base_url}/auth/register`
                requestBody = {
                    name: formData.fullName.trim(),
                    email: formData.email.toLowerCase().trim(),
                    password: formData.password
                }
            }

            console.log('Sending request to:', endpoint)
            console.log('Request body:', { ...requestBody, password: '[HIDDEN]' })

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            })

            const data = await response.json()
            console.log('Server response:', { ...data, token: data.token ? '[TOKEN_RECEIVED]' : 'NO_TOKEN' })

            if (response.ok) {
                // Check if we received a token
                if (!data.token) {
                    Alert.alert('Error', 'Invalid response from server - no token received')
                    return
                }

                // Success - Use context functions to handle auth state
                if (authMode === 'signin') {
                    const result = await login(data.token, data.user || {
                        email: formData.email,
                        name: data.name || formData.fullName
                    })

                    if (result.success) {
                        Alert.alert('Success', 'Signed in successfully!')
                        resetForm()
                        // Context will automatically handle navigation
                    } else {
                        Alert.alert('Error', result.error || 'Failed to save login data')
                    }
                } else if (authMode === 'signup') {
                    const userData = {
                        email: formData.email,
                        name: formData.fullName,
                        ...data.user // Include any additional user data from server
                    }

                    const result = await signup(userData, data.token)

                    if (result.success) {
                        Alert.alert('Success', 'Account created successfully!')
                        resetForm()
                        // Context will automatically handle navigation
                    } else {
                        Alert.alert('Error', result.error || 'Failed to save signup data')
                    }
                }

            } else {
                // Handle specific error messages from the server
                const errorMessage = data.message || data.error ||
                    `Failed to ${authMode === 'signin' ? 'sign in' : 'sign up'}`

                // Handle specific HTTP status codes
                if (response.status === 401) {
                    Alert.alert('Authentication Failed',
                        authMode === 'signin'
                            ? 'Invalid email or password'
                            : 'Authentication error occurred')
                } else if (response.status === 422) {
                    Alert.alert('Validation Error', errorMessage)
                } else if (response.status === 409) {
                    Alert.alert('Account Exists', 'An account with this email already exists')
                } else if (response.status >= 500) {
                    Alert.alert('Server Error', 'Server is experiencing issues. Please try again later.')
                } else {
                    Alert.alert('Error', errorMessage)
                }
            }

        } catch (error) {
            console.error(`${authMode} error:`, error)
            handleNetworkError(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleNetworkError = (error) => {
        if (error.message === 'Network request failed' || error.name === 'TypeError') {
            Alert.alert(
                'Connection Error',
                'Cannot connect to server. Please check:\n• Your internet connection\n• Server is running\n• Correct IP address is used\n\nCurrent server: ' + base_url
            )
        } else {
            Alert.alert('Error', 'An unexpected error occurred. Please try again.')
        }
    }

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            fullName: ''
        })
    }

    const switchAuthMode = (mode) => {
        setAuthMode(mode)
        resetForm()
        // Clear reset email when switching modes
        if (mode !== 'reset-password') {
            setResetEmail('')
        }
    }

    const handleBackToSignIn = () => {
        setAuthMode('signin')
        setResetEmail('')
        resetForm()
    }

    // Render ResetPasswordCard when in reset-password mode
    if (authMode === 'reset-password') {
        return (
            <ResetPasswordCard
                email={resetEmail}
                onBackToSignIn={handleBackToSignIn}
            />
        )
    }

    // Render normal Auth form for other modes
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
                                {authMode === 'signin' && 'Welcome back!'}
                                {authMode === 'signup' && 'Create your account'}
                                {authMode === 'forgot' && 'Reset your password'}
                            </Text>
                        </View>

                        {/* Auth Form */}
                        <View className='bg-white p-6 rounded-2xl shadow-lg'>

                            {/* Full Name - Only for Sign Up */}
                            {authMode === 'signup' && (
                                <View className='mb-4'>
                                    <Text className='text-gray-700 font-medium mb-2'>Full Name *</Text>
                                    <TextInput
                                        className='bg-gray-100 px-4 py-3 rounded-xl text-gray-800'
                                        placeholder='Enter your full name'
                                        value={formData.fullName}
                                        onChangeText={(value) => handleInputChange('fullName', value)}
                                        autoCapitalize='words'
                                        placeholderTextColor="#9CA3AF"
                                        maxLength={50}
                                    />
                                </View>
                            )}

                            {/* Email */}
                            <View className='mb-4'>
                                <Text className='text-gray-700 font-medium mb-2'>Email Address *</Text>
                                <TextInput
                                    className='bg-gray-100 px-4 py-3 rounded-xl text-gray-800'
                                    placeholder='Enter your email'
                                    value={formData.email}
                                    onChangeText={(value) => handleInputChange('email', value)}
                                    keyboardType='email-address'
                                    autoCapitalize='none'
                                    autoCorrect={false}
                                    placeholderTextColor="#9CA3AF"
                                    maxLength={100}
                                />
                            </View>

                            {/* Password - Not for Forgot Password */}
                            {authMode !== 'forgot' && (
                                <>
                                    <View className='mb-4'>
                                        <Text className='text-gray-700 font-medium mb-2'>Password *</Text>
                                        <View className='relative'>
                                            <TextInput
                                                className='bg-gray-100 px-4 py-3 rounded-xl text-gray-800 pr-16'
                                                placeholder='Enter your password'
                                                value={formData.password}
                                                onChangeText={(value) => handleInputChange('password', value)}
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
                                        {authMode === 'signup' && (
                                            <Text className='text-xs text-gray-500 mt-1'>
                                                At least 6 characters
                                            </Text>
                                        )}
                                    </View>

                                    {/* Confirm Password - Only for Sign Up */}
                                    {authMode === 'signup' && (
                                        <View className='mb-4'>
                                            <Text className='text-gray-700 font-medium mb-2'>Confirm Password *</Text>
                                            <TextInput
                                                className='bg-gray-100 px-4 py-3 rounded-xl text-gray-800'
                                                placeholder='Confirm your password'
                                                value={formData.confirmPassword}
                                                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                                                secureTextEntry={!showPassword}
                                                autoCapitalize='none'
                                                placeholderTextColor="#9CA3AF"
                                                maxLength={100}
                                            />
                                        </View>
                                    )}
                                </>
                            )}

                            {/* Forgot Password Link - Only for Sign In */}
                            {authMode === 'signin' && (
                                <TouchableOpacity
                                    className='items-end mb-6'
                                    onPress={() => switchAuthMode('forgot')}
                                >
                                    <Text className='text-gray-950 font-medium'>Forgot Password?</Text>
                                </TouchableOpacity>
                            )}

                            {/* Auth Button */}
                            <TouchableOpacity
                                className={`py-4 rounded-xl items-center mb-4 ${isLoading ? 'bg-gray-400' : 'bg-gray-700'
                                    }`}
                                onPress={handleAuth}
                                disabled={isLoading}
                            >
                                <Text className='text-white font-bold text-lg'>
                                    {isLoading ? 'Please wait...' :
                                        authMode === 'signin' ? 'Sign In' :
                                            authMode === 'signup' ? 'Create Account' : 'Send OTP'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Footer Links */}
                        <View className='mt-6 items-center'>
                            {authMode === 'signin' && (
                                <View className='flex-row'>
                                    <Text className='text-gray-600'>Don't have an account? </Text>
                                    <TouchableOpacity onPress={() => switchAuthMode('signup')}>
                                        <Text className='text-gray-950 font-medium'>Sign Up</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {authMode === 'signup' && (
                                <View className='flex-row'>
                                    <Text className='text-gray-600'>Already have an account? </Text>
                                    <TouchableOpacity onPress={() => switchAuthMode('signin')}>
                                        <Text className='text-gray-950 font-medium'>Sign In</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {authMode === 'forgot' && (
                                <View className='flex-row'>
                                    <Text className='text-gray-600'>Remember your password? </Text>
                                    <TouchableOpacity onPress={() => switchAuthMode('signin')}>
                                        <Text className='text-gray-950 font-medium'>Sign In</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Terms and Privacy */}
                            <View className='mt-4 items-center'>
                                <Text className='text-xs text-gray-500 text-center mb-2'>
                                    By continuing, you agree to our
                                </Text>
                                <View className='flex-row'>
                                    <TouchableOpacity>
                                        <Text className='text-xs text-gray-950 underline'>Terms of Service</Text>
                                    </TouchableOpacity>
                                    <Text className='text-xs text-gray-500'> and </Text>
                                    <TouchableOpacity>
                                        <Text className='text-xs text-gray-950 underline'>Privacy Policy</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}

export default Auth