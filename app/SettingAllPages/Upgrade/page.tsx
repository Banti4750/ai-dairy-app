import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PlanFeature {
    text: string;
    included: boolean;
}

interface Plan {
    id: string;
    name: string;
    price: string;
    period: string;
    popular?: boolean;
    features: PlanFeature[];
}

const UpgradePremium = () => {
    const [selectedPlan, setSelectedPlan] = useState('yearly');

    const plans: Plan[] = [
        {
            id: 'monthly',
            name: 'Monthly',
            price: '$4.99',
            period: '/month',
            features: [
                { text: 'Unlimited diary entries', included: true },
                { text: 'AI-powered insights', included: true },
                { text: 'Mood tracking & analytics', included: true },
                { text: 'Basic export options', included: true },
                { text: 'Standard support', included: true },
            ],
        },
        {
            id: 'yearly',
            name: 'Yearly',
            price: '$39.99',
            period: '/year',
            popular: true,
            features: [
                { text: 'Everything in Monthly', included: true },
                { text: 'Advanced AI analytics', included: true },
                { text: 'Custom themes & fonts', included: true },
                { text: 'Priority customer support', included: true },
                { text: 'Data backup & sync', included: true },
                { text: 'Export to multiple formats', included: true },
                { text: 'Goal tracking & reminders', included: true },
            ],
        },
    ];

    const handlePurchase = () => {
        const plan = plans.find(p => p.id === selectedPlan);
        Alert.alert(
            'Confirm Purchase',
            `Upgrade to ${plan?.name} plan for ${plan?.price}${plan?.period}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Purchase', onPress: () => console.log('Purchase initiated') },
            ]
        );
    };

    const PlanCard = ({ plan }: { plan: Plan }) => (
        <TouchableOpacity
            onPress={() => setSelectedPlan(plan.id)}
            className={`
        p-6 rounded-2xl mb-4 border-2 relative
        ${selectedPlan === plan.id
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 bg-white'
                }
      `}
        >
            {plan.popular && (
                <View className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <View className="bg-gray-900 px-4 py-1 rounded-full">
                        <Text className="text-white text-xs font-semibold">MOST POPULAR</Text>
                    </View>
                </View>
            )}

            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-xl font-bold text-gray-900">{plan.name}</Text>
                <View className={`
          w-6 h-6 rounded-full border-2 items-center justify-center
          ${selectedPlan === plan.id
                        ? 'border-gray-900 bg-gray-900'
                        : 'border-gray-300'
                    }
        `}>
                    {selectedPlan === plan.id && (
                        <View className="w-2 h-2 rounded-full bg-white" />
                    )}
                </View>
            </View>

            <View className="flex-row items-baseline mb-6">
                <Text className="text-3xl font-bold text-gray-900">{plan.price}</Text>
                <Text className="text-lg text-gray-600 ml-1">{plan.period}</Text>
            </View>

            <View className="space-y-3">
                {plan.features.map((feature, index) => (
                    <View key={index} className="flex-row items-center">
                        <View className="w-5 h-5 rounded-full bg-green-100 items-center justify-center mr-3">
                            <Text className="text-green-600 text-xs font-bold">✓</Text>
                        </View>
                        <Text className="text-gray-700 flex-1">{feature.text}</Text>
                    </View>
                ))}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View className="px-6 pt-8 ">
                    <Text className="text-3xl font-bold text-gray-900 mb-2">
                        Unlock Premium Features
                    </Text>
                    <Text className="text-lg text-gray-600 leading-6">
                        Get the most out of your AI diary with advanced insights and unlimited access
                    </Text>
                </View>

                {/* Premium Benefits */}
                <View className="px-6 mb-4">
                    <View className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-6">
                        <Text className="text-white text-xl font-bold mb-4">
                            Why Go Premium?
                        </Text>
                        <View className="space-y-3 ">
                            {[
                                '🧠 Advanced AI insights and patterns',
                                '📊 Detailed mood and progress analytics',
                                '🎨 Personalize with themes and fonts',
                                '☁️ Secure cloud backup and sync',
                                '🎯 Smart goal tracking and reminders',
                            ].map((benefit, index) => (
                                <Text key={index} className="text-black text-base">
                                    {benefit}
                                </Text>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Plans */}
                <View className="px-6 mb-8">
                    <Text className="text-2xl font-bold text-gray-900 mb-6">
                        Choose Your Plan
                    </Text>
                    {plans.map(plan => (
                        <PlanCard key={plan.id} plan={plan} />
                    ))}
                </View>

                {/* Purchase Button */}
                <View className="px-6 mb-8">
                    <TouchableOpacity
                        onPress={handlePurchase}
                        className="bg-gray-900 py-4 px-6 rounded-xl items-center shadow-lg"
                        activeOpacity={0.8}
                    >
                        <Text className="text-white text-lg font-semibold">
                            Start Premium Now
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View className="px-6 pb-8">
                    <Text className="text-center text-sm text-gray-500 leading-5">
                        Premium subscription auto-renews. Cancel anytime from your account settings.
                        By purchasing, you agree to our Terms of Service and Privacy Policy.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default UpgradePremium;