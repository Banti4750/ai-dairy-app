import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

const page = () => {
    const params = useLocalSearchParams();
    const { id } = params; // This gets the [id] from the folder name

    console.log('Diary entry ID:', id);
    console.log('All params:', params);

    return (
        <View className="flex-1 bg-white p-5">
            <Text className="text-2xl font-bold mb-4">Diary Entry</Text>
            <Text className="text-lg">Entry ID: {id}</Text>
            <Text className="text-sm text-gray-500 mt-2">
                All params: {JSON.stringify(params, null, 2)}
            </Text>
        </View>
    );
};

export default page;