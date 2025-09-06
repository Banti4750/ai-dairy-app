import React, { useState } from 'react';
import {
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface FAQ {
    question: string;
    answer: string;
}

const HelpSupport = () => {
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
    const [supportMessage, setSupportMessage] = useState('');
    const [userEmail, setUserEmail] = useState('');

    const faqs: FAQ[] = [
        {
            question: 'How does the AI diary analysis work?',
            answer: 'Our AI analyzes your diary entries to identify patterns in your mood, goals, and personal growth. It uses natural language processing to understand the context and sentiment of your writing, providing personalized insights and suggestions.'
        },
        {
            question: 'Is my diary data private and secure?',
            answer: 'Yes, absolutely. All your diary entries are encrypted end-to-end and stored securely. We never share your personal data with third parties. Your privacy is our top priority.'
        },
        {
            question: 'Can I export my diary entries?',
            answer: 'Yes, premium users can export their entries in multiple formats including PDF, TXT, and CSV. Free users can export in basic text format.'
        },
        {
            question: 'How do I cancel my premium subscription?',
            answer: 'You can cancel your subscription anytime from your device\'s subscription settings (App Store or Google Play Store). The cancellation will take effect at the end of your current billing period.'
        },
        {
            question: 'Can I use the app offline?',
            answer: 'Yes, you can write and view your diary entries offline. However, AI analysis and sync features require an internet connection.'
        },
        {
            question: 'How often should I write in my diary?',
            answer: 'There\'s no strict rule! Many users find daily writing helpful, but even weekly entries can provide valuable insights. The AI works better with more data, so regular entries will give you better analysis.'
        },
        {
            question: 'Can I set reminders to write?',
            answer: 'Yes, premium users can set custom reminders at their preferred times. This helps build a consistent journaling habit.'
        },
        {
            question: 'What if I lose my device?',
            answer: 'If you\'re a premium user with cloud sync enabled, your data is safely backed up. Simply log in to your account on a new device to restore your entries.'
        }
    ];

    const contactOptions = [
        {
            title: 'Email Support',
            description: 'Get help via email',
            contact: 'support@aidiary.com',
            icon: '📧',
            action: () => Linking.openURL('mailto:support@aidiary.com')
        },
        {
            title: 'Live Chat',
            description: 'Chat with our support team',
            contact: 'Available 9 AM - 6 PM EST',
            icon: '💬',
            action: () => console.log('Open live chat')
        },
        {
            title: 'Phone Support',
            description: 'Premium users only',
            contact: '+1 (555) 123-4567',
            icon: '📞',
            action: () => Linking.openURL('tel:+15551234567')
        }
    ];

    const handleSendMessage = () => {
        if (!userEmail.trim() || !supportMessage.trim()) {
            Alert.alert('Error', 'Please fill in both email and message fields.');
            return;
        }

        // Here you would typically send the message to your support system
        console.log('Support message sent:', { userEmail, supportMessage });

        Alert.alert(
            'Message Sent',
            'Thank you for contacting us! We\'ll get back to you within 24 hours.',
            [{
                text: 'OK', onPress: () => {
                    setSupportMessage('');
                    setUserEmail('');
                }
            }]
        );
    };

    const toggleFAQ = (index: number) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-6 pt-8 pb-6">
                    <Text className="text-3xl font-bold text-gray-900 mb-2">
                        Help & Support
                    </Text>
                    <Text className="text-lg text-gray-600">
                        We're here to help you get the most out of AI Diary
                    </Text>
                </View>

                {/* Quick Contact Options */}
                <View className="px-6 mb-8">
                    <Text className="text-xl font-bold text-gray-900 mb-4">
                        Contact Us
                    </Text>
                    <View className="space-y-3">
                        {contactOptions.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={option.action}
                                className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex-row items-center"
                            >
                                <Text className="text-2xl mr-4">{option.icon}</Text>
                                <View className="flex-1">
                                    <Text className="text-lg font-semibold text-gray-900">
                                        {option.title}
                                    </Text>
                                    <Text className="text-sm text-gray-600 mb-1">
                                        {option.description}
                                    </Text>
                                    <Text className="text-sm text-gray-500">
                                        {option.contact}
                                    </Text>
                                </View>
                                <Text className="text-gray-400 text-lg">›</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* FAQ Section */}
                <View className="px-6 mb-8">
                    <Text className="text-xl font-bold text-gray-900 mb-4">
                        Frequently Asked Questions
                    </Text>
                    <View className="space-y-3">
                        {faqs.map((faq, index) => (
                            <View key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                                <TouchableOpacity
                                    onPress={() => toggleFAQ(index)}
                                    className="p-4 bg-white"
                                >
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-base font-semibold text-gray-900 flex-1 pr-4">
                                            {faq.question}
                                        </Text>
                                        <Text className="text-gray-400 text-xl">
                                            {expandedFAQ === index ? '−' : '+'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                                {expandedFAQ === index && (
                                    <View className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                                        <Text className="text-gray-700 leading-6">
                                            {faq.answer}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Contact Form */}
                <View className="px-6 mb-8">
                    <Text className="text-xl font-bold text-gray-900 mb-4">
                        Send us a Message
                    </Text>
                    <View className="bg-gray-50 p-6 rounded-xl">
                        <View className="mb-4">
                            <Text className="text-base font-semibold text-gray-900 mb-2">
                                Your Email
                            </Text>
                            <TextInput
                                value={userEmail}
                                onChangeText={setUserEmail}
                                placeholder="Enter your email address"
                                placeholderTextColor="#9CA3AF"
                                className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-base"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View className="mb-6">
                            <Text className="text-base font-semibold text-gray-900 mb-2">
                                Message
                            </Text>
                            <TextInput
                                value={supportMessage}
                                onChangeText={setSupportMessage}
                                placeholder="Describe your issue or question..."
                                placeholderTextColor="#9CA3AF"
                                className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-base h-32"
                                multiline
                                textAlignVertical="top"
                                maxLength={500}
                            />
                            <Text className="text-right mt-1 text-xs text-gray-500">
                                {supportMessage.length}/500
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={handleSendMessage}
                            className="bg-gray-900 py-4 px-6 rounded-xl items-center"
                        >
                            <Text className="text-white text-base font-semibold">
                                Send Message
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Additional Resources */}
                <View className="px-6 pb-8">
                    <Text className="text-xl font-bold text-gray-900 mb-4">
                        Additional Resources
                    </Text>
                    <View className="space-y-3">
                        <TouchableOpacity className="bg-white border border-gray-200 p-4 rounded-xl flex-row items-center justify-between">
                            <View>
                                <Text className="text-base font-semibold text-gray-900">
                                    User Guide
                                </Text>
                                <Text className="text-sm text-gray-600">
                                    Learn how to use all features
                                </Text>
                            </View>
                            <Text className="text-gray-400 text-lg">›</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="bg-white border border-gray-200 p-4 rounded-xl flex-row items-center justify-between">
                            <View>
                                <Text className="text-base font-semibold text-gray-900">
                                    Privacy Policy
                                </Text>
                                <Text className="text-sm text-gray-600">
                                    How we protect your data
                                </Text>
                            </View>
                            <Text className="text-gray-400 text-lg">›</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="bg-white border border-gray-200 p-4 rounded-xl flex-row items-center justify-between">
                            <View>
                                <Text className="text-base font-semibold text-gray-900">
                                    Community Forum
                                </Text>
                                <Text className="text-sm text-gray-600">
                                    Connect with other users
                                </Text>
                            </View>
                            <Text className="text-gray-400 text-lg">›</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default HelpSupport;