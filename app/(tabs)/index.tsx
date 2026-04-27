import { Link } from "expo-router";
import { View, Text, Pressable, StyleSheet } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cricket Scorer</Text>

      <Link href="/create-match" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.btnText}>Start Match</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  title: { color: "#fff", fontSize: 26, marginBottom: 20 },
  button: { backgroundColor: "#22c55e", padding: 15, borderRadius: 10 },
  btnText: { color: "#fff" },
});