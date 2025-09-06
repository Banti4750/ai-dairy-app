import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const TermsOfService = () => {
    const sections = [
        {
            title: '1. Acceptance of Terms',
            content: 'By accessing and using AI Diary ("the App"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.'
        },
        {
            title: '2. Use License',
            content: 'Permission is granted to temporarily download one copy of AI Diary for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:\n\n• modify or copy the materials\n• use the materials for any commercial purpose\n• attempt to decompile or reverse engineer any software\n• remove any copyright or other proprietary notations'
        },
        {
            title: '3. Privacy and Data Protection',
            content: 'Your privacy is important to us. All diary entries and personal data are encrypted and stored securely. We do not share, sell, or distribute your personal information to third parties without your explicit consent, except as required by law.'
        },
        {
            title: '4. User Content',
            content: 'Users retain ownership of all content they create within the App. By using our AI analysis features, you grant us a limited license to process your content for the sole purpose of providing insights and recommendations. This processing is performed automatically and your data remains private.'
        },
        {
            title: '5. Premium Subscription',
            content: 'Premium features require a paid subscription. Subscriptions automatically renew unless auto-renewal is turned off at least 24 hours before the end of the current period. You can manage your subscription and turn off auto-renewal in your device\'s account settings.'
        },
        {
            title: '6. Prohibited Uses',
            content: 'You may not use the App:\n\n• For any unlawful purpose or to solicit others to unlawful acts\n• To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances\n• To infringe upon or violate our intellectual property rights or the intellectual property rights of others\n• To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate'
        },
        {
            title: '7. Disclaimers',
            content: 'The information in this App is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, and conditions relating to our App and the use of this App.'
        },
        {
            title: '8. Limitations of Liability',
            content: 'In no event shall AI Diary or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the App, even if AI Diary or its authorized representative has been notified orally or in writing of the possibility of such damage.'
        },
        {
            title: '9. Accuracy of Materials',
            content: 'The materials appearing in AI Diary could include technical, typographical, or photographic errors. AI Diary does not warrant that any of the materials on its App are accurate, complete, or current. AI Diary may make changes to the materials contained in its App at any time without notice.'
        },
        {
            title: '10. Modifications',
            content: 'AI Diary may revise these terms of service at any time without notice. By using this App, you are agreeing to be bound by the then current version of these terms of service.'
        },
        {
            title: '11. Contact Information',
            content: 'If you have any questions about these Terms of Service, please contact us at:\n\nEmail: support@aidiary.com\nAddress: [Your Company Address]\nPhone: [Your Phone Number]'
        }
    ];

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-6 pt-8 pb-6 border-b border-gray-100">
                    <Text className="text-3xl font-bold text-gray-900 mb-2">
                        Terms of Service
                    </Text>
                    <Text className="text-base text-gray-600">
                        Last updated: {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </Text>
                </View>

                {/* Introduction */}
                <View className="px-6 py-6 bg-gray-50">
                    <Text className="text-base text-gray-700 leading-6">
                        Welcome to AI Diary. These Terms of Service govern your use of our application and services.
                        Please read these terms carefully before using our app.
                    </Text>
                </View>

                {/* Terms Sections */}
                <View className="px-6 py-6">
                    {sections.map((section, index) => (
                        <View key={index} className="mb-8">
                            <Text className="text-xl font-bold text-gray-900 mb-4">
                                {section.title}
                            </Text>
                            <Text className="text-base text-gray-700 leading-6 whitespace-pre-line">
                                {section.content}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Agreement Section */}
                <View className="px-6 py-6 bg-gray-50 border-t border-gray-200">
                    <View className="bg-white p-6 rounded-xl border border-gray-200">
                        <Text className="text-lg font-bold text-gray-900 mb-3">
                            Agreement Acknowledgment
                        </Text>
                        <Text className="text-base text-gray-700 mb-4 leading-6">
                            By using AI Diary, you acknowledge that you have read, understood,
                            and agree to be bound by these Terms of Service.
                        </Text>
                        <TouchableOpacity
                            className="bg-gray-900 py-3 px-6 rounded-lg"
                            onPress={() => console.log('Terms accepted')}
                        >
                            <Text className="text-white text-center font-semibold">
                                I Accept These Terms
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer */}
                <View className="px-6 pb-8">
                    <Text className="text-center text-sm text-gray-500 leading-5">
                        For questions about these terms, please contact our support team through the Help & Support section.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default TermsOfService;