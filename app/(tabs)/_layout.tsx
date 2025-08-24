import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { Pressable } from "react-native";

export default function RootLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#111827", // dark gray
                tabBarInactiveTintColor: "#9CA3AF", // light gray
                tabBarStyle: {
                    backgroundColor: "#FFFFFF",
                    borderTopWidth: 1,
                    borderTopColor: "#E5E7EB",
                    height: 75,
                    paddingBottom: 12,
                    paddingTop: 8,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                    marginTop: 4,
                    letterSpacing: 0.2,
                },
                headerStyle: {
                    backgroundColor: "#FFFFFF",
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: "600",
                    letterSpacing: -0.2,
                    color: "#111827",
                },
                headerTitleAlign: "center",

                tabBarButton: (props) => (
                    <Pressable {...props} android_ripple={null} style={props.style}>
                        {props.children}
                    </Pressable>
                ),
            }}
        >
            <Tabs.Screen
                name="today"
                options={{
                    title: "Today",
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="today" size={24} color={color} />
                    ),
                    headerTitle: "Today's Focus",
                }}
            />

            <Tabs.Screen
                name="journal"
                options={{
                    title: "Journal",
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="book" size={24} color={color} />
                    ),
                    headerTitle: "Daily Journal",
                }}
            />

            <Tabs.Screen
                name="create"
                options={{
                    title: "Create",
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="add-circle-outline" size={26} color={color} />
                    ),
                    headerTitle: "Create New",
                }}
            />

            <Tabs.Screen
                name="mood"
                options={{
                    title: "Mood",
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="psychology" size={24} color={color} />
                    ),
                    headerTitle: "AI Mood Check",
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="person-outline" size={24} color={color} />
                    ),
                    headerTitle: "Profile & Streaks",
                }}
            />
        </Tabs>
    );
}
