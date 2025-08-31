import { Slot, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native';

const DiaryEntryLayout = () => {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Simple header with back button */}
            {/* <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center"
                    activeOpacity={0.7}
                >
                    <Text className="text-2xl text-gray-600 mr-2">←</Text>
                    <Text className="text-base text-gray-600">Back to Journal</Text>
                </TouchableOpacity>
            </View> */}

            {/* Page content */}
            <Slot />
        </SafeAreaView>
    );
};

export default DiaryEntryLayout;