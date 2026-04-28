import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";

export default function Players() {
  const params = useLocalSearchParams();

  const teamA = params.teamA;
  const teamB = params.teamB;

  const router = useRouter();

  const [teamAPlayers, setTeamAPlayers] = useState(Array(11).fill(""));
  const [teamBPlayers, setTeamBPlayers] = useState(Array(11).fill(""));

  const [overs, setOvers] = useState("");
  const [battingTeam, setBattingTeam] = useState(null);

  // update player name
  const updatePlayer = (team, index, value) => {
    const list = team === "A" ? [...teamAPlayers] : [...teamBPlayers];
    list[index] = value;

    team === "A" ? setTeamAPlayers(list) : setTeamBPlayers(list);
  };

  // start match
  const startMatch = () => {
    if (!overs.trim() || Number(overs) <= 0) {
      return alert("Enter valid overs");
    }

    if (!battingTeam) {
      return alert("Select batting team");
    }

    const finalTeamA = teamAPlayers.map((p, i) =>
      p.trim() ? p : `Player A${i + 1}`,
    );

    const finalTeamB = teamBPlayers.map((p, i) =>
      p.trim() ? p : `Player B${i + 1}`,
    );

    router.push({
      pathname: "/scoring",
      params: {
        teamA: teamA?.trim() || "Team A",
        teamB: teamB?.trim() || "Team B",
        teamAPlayers: JSON.stringify(finalTeamA),
        teamBPlayers: JSON.stringify(finalTeamB),
        overs: String(overs),
        battingTeam: String(battingTeam),
      },
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
          onChangeText={(t) => updatePlayer("A", i, t.trimStart())}
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
          onChangeText={(t) => updatePlayer("B", i, t.trimStart())}
          style={styles.input}
        />
      ))}

      {/* Overs */}
      <Text style={styles.title}>Match Overs</Text>
      <TextInput
        placeholder="Enter overs (e.g. 5)"
        placeholderTextColor="#999"
        value={overs}
        onChangeText={setOvers}
        keyboardType="numeric"
        style={styles.input}
      />

      {/* Batting Team */}
      <Text style={styles.title}>Select Batting Team</Text>

      <Pressable
        style={[styles.selectBtn, battingTeam === "A" && styles.selected]}
        onPress={() => setBattingTeam("A")}
      >
        <Text style={styles.btnText}>{teamA || "Team A"}</Text>
      </Pressable>

      <Pressable
        style={[styles.selectBtn, battingTeam === "B" && styles.selected]}
        onPress={() => setBattingTeam("B")}
      >
        <Text style={styles.btnText}>{teamB || "Team B"}</Text>
      </Pressable>

      {/* Start */}
      <Pressable
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.7 : 1 }]}
        onPress={startMatch}
      >
        <Text style={styles.btnText}>Start Match</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#0f172a",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    marginTop: 12,
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#1e293b",
    color: "#fff",
    padding: 10,
    marginBottom: 8,
    borderRadius: 6,
  },
  selectBtn: {
    backgroundColor: "#334155",
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  selected: {
    backgroundColor: "#22c55e",
  },
  button: {
    backgroundColor: "#22c55e",
    padding: 14,
    alignItems: "center",
    marginTop: 15,
    borderRadius: 8,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
