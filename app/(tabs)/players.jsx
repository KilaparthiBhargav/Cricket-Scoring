import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from "react-native";

export default function Players() {
  const { teamA, teamB } = useLocalSearchParams();
  const router = useRouter();

  const [teamAPlayers, setA] = useState(Array(11).fill(""));
  const [teamBPlayers, setB] = useState(Array(11).fill(""));

  const update = (team: "A" | "B", index: number, value: string) => {
    if (team === "A") {
      const arr = [...teamAPlayers];
      arr[index] = value;
      setA(arr);
    } else {
      const arr = [...teamBPlayers];
      arr[index] = value;
      setB(arr);
    }
  };

  const start = () => {
    // ✅ Fill default names if empty
    const finalTeamA = teamAPlayers.map((p, i) =>
      p.trim() === "" ? `Player A${i + 1}` : p
    );

    const finalTeamB = teamBPlayers.map((p, i) =>
      p.trim() === "" ? `Player B${i + 1}` : p
    );

    router.push({
      pathname: "/scoring",
      params: {
        teamA: teamA || "Team A",
        teamB: teamB || "Team B",
        teamAPlayers: JSON.stringify(finalTeamA),
        teamBPlayers: JSON.stringify(finalTeamB)
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Team A */}
      <Text style={styles.title}>{teamA || "Team A"} Players</Text>

      {teamAPlayers.map((p, i) => (
        <TextInput
          key={i}
          placeholder={`Player A${i + 1}`}
          placeholderTextColor="#999"
          value={p}
          onChangeText={(t) => update("A", i, t)}
          style={styles.input}
        />
      ))}

      {/* Team B */}
      <Text style={styles.title}>{teamB || "Team B"} Players</Text>

      {teamBPlayers.map((p, i) => (
        <TextInput
          key={i}
          placeholder={`Player B${i + 1}`}
          placeholderTextColor="#999"
          value={p}
          onChangeText={(t) => update("B", i, t)}
          style={styles.input}
        />
      ))}

      {/* Start Button */}
      <Pressable style={styles.button} onPress={start}>
        <Text style={styles.btnText}>Start Match</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0f172a"
  },
  title: {
    color: "#fff",
    fontSize: 18,
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "600"
  },
  input: {
    backgroundColor: "#1e293b",
    color: "#fff",
    padding: 10,
    marginBottom: 8,
    borderRadius: 6
  },
  button: {
    backgroundColor: "#22c55e",
    padding: 14,
    alignItems: "center",
    marginTop: 15,
    borderRadius: 8
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  }
});