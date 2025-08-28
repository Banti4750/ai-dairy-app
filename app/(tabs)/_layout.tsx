import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs, useRouter } from "expo-router";
import { Alert, Pressable, View } from "react-native";

// Header right component with search and settings
const HeaderRight = ({ onSearch, onSettings }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginRight: 16 }}>
        <Pressable
            onPress={onSearch}
            style={{
                padding: 8,
                marginRight: 8,
                borderRadius: 20,
            }}
            android_ripple={{ color: '#E5E7EB', borderless: true }}
        >
            <Ionicons name="search-outline" size={26} color="#111827" />
        </Pressable>

        <Pressable
            onPress={onSettings}
            style={{
                padding: 8,
                borderRadius: 20,
            }}
            android_ripple={{ color: '#E5E7EB', borderless: true }}
        >
            <MaterialIcons name="settings" size={26} color="#111827" />
        </Pressable>
    </View>
);

// Search handler function
const handleSearch = () => {
    Alert.alert(
        "Search",
        "Search functionality will be implemented here",
        [{ text: "OK" }]
    );
    // Navigate to search screen or open search modal
    // router.push('/search'); // Uncomment when you have a search screen
};

// Settings handler function
const handleSettings = () => {
    const router = useRouter()

    // Navigate to settings screen or open settings modal
    router.push('/setting/setting'); // Uncomment when you have a settings screen
};

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
                    borderBottomWidth: 1,
                    borderBottomColor: "#E5E7EB",
                },
                headerTitleStyle: {
                    fontSize: 26,
                    fontWeight: "600",
                    letterSpacing: -0.2,
                    color: "#111827",
                },

                // Add header right component to all tabs
                headerRight: () => (
                    <HeaderRight
                        onSearch={handleSearch}
                        onSettings={handleSettings}
                    />
                ),

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
                    headerTitle: "Today's Diary",
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
                    title: "Insight",
                    tabBarIcon: ({ color }) => (
                        <MaterialIcons name="psychology" size={24} color={color} />
                    ),
                    headerTitle: "Insight",
                }}
            />


        </Tabs>
    );
}