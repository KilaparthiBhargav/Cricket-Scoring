import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function CreateMatch() {
  const router = useRouter();
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");

  const next = () => {
    if (!teamA || !teamB) return alert("Enter team names");

    router.push({
      pathname: "/players",
      params: { teamA, teamB },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Match</Text>

      <TextInput
        placeholder="Team A"
        placeholderTextColor="#aaa"
        value={teamA}
        onChangeText={setTeamA}
        style={styles.input}
      />

      <TextInput
        placeholder="Team B"
        placeholderTextColor="#aaa"
        value={teamB}
        onChangeText={setTeamB}
        style={styles.input}
      />

      <Pressable style={styles.button} onPress={next}>
        <Text style={styles.btnText}>Next</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#0f172a",
  },
  title: { color: "#fff", fontSize: 22, marginBottom: 20 },
  input: {
    backgroundColor: "#1e293b",
    color: "#fff",
    padding: 10,
    marginBottom: 10,
  },
  button: { backgroundColor: "#22c55e", padding: 12, alignItems: "center" },
  btnText: { color: "#fff" },
});
