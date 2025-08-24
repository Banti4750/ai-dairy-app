import { ActivityIndicator, Text, View } from "react-native";

export default function Loader({ message = "Loading..." }) {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#fff",
            }}
        >
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={{ marginTop: 10, fontSize: 16, color: "#333" }}>
                {message}
            </Text>
        </View>
    );
}
