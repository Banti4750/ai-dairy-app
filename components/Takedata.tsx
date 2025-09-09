import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface TakeDataProps {
    title: string;
    description: string;
    inputPlaceholder: string;
    handleSubmit: (value: string) => void;
    buttonText?: string;
    multiline?: boolean;
    maxLength?: number;
    loading?: boolean;
    initialValue?: string;
}

const TakeData: React.FC<TakeDataProps> = ({
    title,
    description,
    inputPlaceholder,
    handleSubmit,
    buttonText = "Submit",
    multiline = false,
    maxLength = 500,
    loading = false,
    initialValue = ''
}) => {
    const [value, setValue] = React.useState('');

    // Set initial value when it's loaded
    useEffect(() => {
        if (initialValue) {
            setValue(initialValue);
        }
    }, [initialValue]);

    const onSubmit = () => {
        if (value.trim()) {
            handleSubmit(value.trim());
            // Don't clear value after submit in case user wants to edit
        }
    };

    // Show loading spinner while fetching initial data
    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#1F2937" />
                    <Text className="mt-4 text-gray-600 text-base">Loading...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <View className="flex-1 px-6 py-8">
                {/* Header Section */}
                <View className="mb-8">
                    <Text className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                        {title}
                    </Text>
                    <Text className="text-base text-gray-600 leading-6 font-normal">
                        {description}
                    </Text>
                </View>

                {/* Input Section */}
                <View className="mb-8">
                    <View className="relative">
                        <TextInput
                            placeholder={inputPlaceholder}
                            placeholderTextColor="#9CA3AF"
                            value={value}
                            onChangeText={setValue}
                            className={`
                border-2 border-gray-200 bg-gray-50 px-4 py-4 rounded-xl
                text-base text-gray-900 font-normal shadow-sm
                ${multiline ? 'h-60 pt-4' : 'h-14'}
              `}
                            multiline={multiline}
                            numberOfLines={multiline ? 4 : 1}
                            maxLength={maxLength}
                            textAlignVertical={multiline ? 'top' : 'center'}
                        />

                        {/* Character Count */}
                        {multiline && (
                            <Text className="text-right mt-2 text-xs text-gray-400 font-normal">
                                {value.length}/{maxLength}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    className={`
            py-4 px-6 rounded-xl items-center shadow-lg
            ${value.trim()
                            ? 'bg-gray-900 shadow-gray-900/25'
                            : 'bg-gray-100 shadow-none'
                        }
          `}
                    onPress={onSubmit}
                    disabled={!value.trim()}
                    activeOpacity={0.8}
                >
                    <Text className={`
            text-base font-semibold tracking-wide
            ${value.trim() ? 'text-white' : 'text-gray-400'}
          `}>
                        {buttonText}
                    </Text>
                </TouchableOpacity>

                {/* Bottom Spacer */}
                <View className="flex-1" />
            </View>
        </SafeAreaView>
    );
};

export default TakeData;