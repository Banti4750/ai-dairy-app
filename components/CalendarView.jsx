import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

const BASE_URL = 'http://192.168.1.23:9000/api/diary';

const CalendarViewTest = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [entries, setEntries] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);


    const fetchEntriesForMonth = async () => {
        try {
            setLoading(true);
            const token = await SecureStore.getItemAsync('authToken');
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;

            // Call your backend API
            const response = await fetch(
                `${BASE_URL}/calendar?month=${month}&year=${year}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    }
                }
            );

            const result = await response.json();

            if (response.ok) {
                // Transform response into dictionary { "YYYY-MM-DD": true }
                const mappedEntries = {};
                result.data.forEach(entry => {
                    const dateObj = new Date(entry.entryDate);
                    const dateStr = dateObj.toISOString().split("T")[0]; // "2025-09-11"
                    mappedEntries[dateStr] = true;
                });
                setEntries(mappedEntries);
            } else {
                console.error("API error:", result.message);
            }
        } catch (error) {
            console.error("Error fetching entries:", error);
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
        console.log('Selected date:', newDate.toISOString().split('T')[0]);
        console.log('Has entry:', hasEntry(day));
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDayOfMonth = getFirstDayOfMonth(currentDate);
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<View key={`empty-${i}`} style={{ width: 40, height: 40, margin: 4 }} />);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayHasEntry = hasEntry(day);
            const dayIsToday = isToday(day);
            const dayIsSelected = isSelected(day);

            days.push(
                <TouchableOpacity
                    key={`day-${day}`}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        margin: 4,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: dayIsSelected ? '#333' : dayIsToday ? '#E5E5E5' : 'transparent',
                        borderWidth: 1,
                        borderColor: '#E5E5E5',
                        position: 'relative'
                    }}
                    onPress={() => handleDateSelect(day)}
                >
                    <Text style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: dayIsSelected ? 'white' : '#333'
                    }}>
                        {day}
                    </Text>
                    {dayHasEntry && (
                        <View style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>

                            <View style={{
                                width: 35,
                                height: 1,
                                color: '#666',
                                backgroundColor: '#333',
                                transform: [{ rotate: '-45deg' }],
                                position: 'absolute'
                            }} />
                        </View>
                    )}
                </TouchableOpacity>
            );
        }

        return days;
    };

    if (loading) {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 16,
                backgroundColor: 'white',
                borderRadius: 12,
                margin: 16
            }}>
                <ActivityIndicator size="large" color="#333" />
                <Text style={{ color: '#666', marginTop: 8 }}>Loading calendar...</Text>
            </View>
        );
    }

    return (
        <View style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: 16,
            margin: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3
        }}>


            {/* Calendar Header */}
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16
            }}>
                <TouchableOpacity onPress={() => navigateMonth('prev')} style={{ padding: 8 }}>
                    <Ionicons name="chevron-back" size={24} color="#333" />
                </TouchableOpacity>

                <Text style={{ fontSize: 18, fontWeight: '600', color: '#333' }}>
                    {formatMonthYear(currentDate)}
                </Text>

                <TouchableOpacity onPress={() => navigateMonth('next')} style={{ padding: 8 }}>
                    <Ionicons name="chevron-forward" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Week Days Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <Text key={day} style={{
                        textAlign: 'center',
                        color: '#666',
                        fontWeight: '500',
                        width: 40,
                        margin: 4
                    }}>
                        {day}
                    </Text>
                ))}
            </View>

            {/* Calendar Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                {renderCalendarDays()}
            </View>

            {/* Legend */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 8 }}>
                    <View style={{
                        width: 16,
                        height: 16,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 4
                    }}>

                        <View style={{
                            width: 12,
                            height: 1,
                            backgroundColor: '#333',
                            transform: [{ rotate: '-45deg' }],
                            position: 'absolute'
                        }} />
                    </View>
                    <Text style={{ fontSize: 12, color: '#666' }}>Entry exists</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16, marginBottom: 8 }}>
                    <View style={{ width: 12, height: 12, backgroundColor: '#E5E5E5', borderRadius: 6, marginRight: 4 }} />
                    <Text style={{ fontSize: 12, color: '#666' }}>Today</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ width: 12, height: 12, backgroundColor: '#333', borderRadius: 6, marginRight: 4 }} />
                    <Text style={{ fontSize: 12, color: '#666' }}>Selected</Text>
                </View>
            </View>


        </View>
    );
};

export default CalendarViewTest;