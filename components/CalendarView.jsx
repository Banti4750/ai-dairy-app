import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

const CalendarView = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [entries, setEntries] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);

    // Get all entries for the current month
    const fetchEntriesForMonth = async () => {
        try {
            setLoading(true);
            const token = await SecureStore.getItemAsync('authToken');
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;

            const response = await fetch(`http://192.168.1.23:9000/api/diary/entries?year=${year}&month=${month}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const entriesData = data.data?.entries || data.entries || [];

                // Create a map of dates that have entries
                const entriesMap = {};
                entriesData.forEach(entry => {
                    const entryDate = entry.entryDate?.split('T')[0] || entry.createdAt?.split('T')[0];
                    if (entryDate) {
                        entriesMap[entryDate] = true;
                    }
                });

                setEntries(entriesMap);
            } else {
                console.error('Failed to fetch entries:', response.status);
                Alert.alert('Error', 'Failed to load entries');
            }
        } catch (error) {
            console.error('Error fetching entries:', error);
            Alert.alert('Error', 'Something went wrong while loading entries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntriesForMonth();
    }, [currentDate]);

    const navigateMonth = (direction) => {
        const newDate = new Date(currentDate);
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const formatMonthYear = (date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const isToday = (day) => {
        const today = new Date();
        return (
            currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear() &&
            day === today.getDate()
        );
    };

    const isSelected = (day) => {
        if (!selectedDate) return false;
        return (
            currentDate.getMonth() === selectedDate.getMonth() &&
            currentDate.getFullYear() === selectedDate.getFullYear() &&
            day === selectedDate.getDate()
        );
    };

    const hasEntry = (day) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return entries[dateStr];
    };

    const handleDateSelect = (day) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(newDate);
        // You could add navigation to that day's entry here if it exists
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDayOfMonth = getFirstDayOfMonth(currentDate);
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<View key={`empty-${i}`} className="w-10 h-10 m-1" />);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayHasEntry = hasEntry(day);
            const dayIsToday = isToday(day);
            const dayIsSelected = isSelected(day);

            days.push(
                <TouchableOpacity
                    key={`day-${day}`}
                    className={`w-10 h-10 rounded-full m-1 items-center justify-center
                        ${dayIsToday ? 'bg-blue-100' : ''}
                        ${dayIsSelected ? 'bg-blue-500' : ''}
                        ${dayHasEntry ? 'border-2 border-green-500' : 'border border-gray-200'}
                    `}
                    onPress={() => handleDateSelect(day)}
                >
                    <Text className={`
                        text-center text-sm font-medium
                        ${dayIsSelected ? 'text-white' : dayIsToday ? 'text-blue-600' : 'text-gray-800'}
                    `}>
                        {day}
                    </Text>
                    {dayHasEntry && (
                        <View className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                    )}
                </TouchableOpacity>
            );
        }

        return days;
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center p-4 bg-white rounded-xl">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-600 mt-2">Loading calendar...</Text>
            </View>
        );
    }

    return (
        <View className="bg-white rounded-xl p-4 shadow-sm">
            {/* Calendar Header */}
            <View className="flex-row justify-between items-center mb-4">
                <TouchableOpacity onPress={() => navigateMonth('prev')} className="p-2">
                    <Ionicons name="chevron-back" size={24} color="#4B5563" />
                </TouchableOpacity>

                <Text className="text-lg font-semibold text-gray-800">
                    {formatMonthYear(currentDate)}
                </Text>

                <TouchableOpacity onPress={() => navigateMonth('next')} className="p-2">
                    <Ionicons name="chevron-forward" size={24} color="#4B5563" />
                </TouchableOpacity>
            </View>

            {/* Week Days Header */}
            <View className="flex-row justify-between mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <Text key={day} className="text-center text-gray-500 font-medium w-10 m-1">
                        {day}
                    </Text>
                ))}
            </View>

            {/* Calendar Grid */}
            <View className="flex-row flex-wrap justify-between">
                {renderCalendarDays()}
            </View>

            {/* Legend */}
            <View className="flex-row justify-center mt-6 space-x-6">
                <View className="flex-row items-center">
                    <View className="w-3 h-3 bg-green-500 rounded-full mr-1" />
                    <Text className="text-xs text-gray-600">Entry exists</Text>
                </View>
                <View className="flex-row items-center">
                    <View className="w-3 h-3 bg-blue-100 rounded-full mr-1" />
                    <Text className="text-xs text-gray-600">Today</Text>
                </View>
            </View>

            {/* Selected Date Info */}
            {selectedDate && (
                <View className="mt-6 p-3 bg-blue-50 rounded-lg">
                    <Text className="text-center text-blue-800 font-medium">
                        {selectedDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </Text>
                    <Text className="text-center text-blue-600 mt-1">
                        {hasEntry(selectedDate.getDate())
                            ? 'You have an entry for this day'
                            : 'No entry for this day'
                        }
                    </Text>
                </View>
            )}
        </View>
    );
};

export default CalendarView;