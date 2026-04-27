import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Scoring() {
  const { teamAPlayers, teamBPlayers } = useLocalSearchParams();

  const teamAList = JSON.parse(teamAPlayers as string);
  const teamBList = JSON.parse(teamBPlayers as string);

  const createBatters = (list: string[]) =>
    list.map((p) => ({ name: p, runs: 0, balls: 0, out: false }));

  const createBowlers = (list: string[]) =>
    list.map((p) => ({ name: p, runs: 0, balls: 0, wickets: 0 }));

  const [state, setState] = useState({
    batting: createBatters(teamAList),
    bowling: createBowlers(teamBList),

    striker: null as number | null,
    nonStriker: null as number | null,
    nextBatsman: null as number | null,

    bowler: null as number | null,

    score: 0,
    wickets: 0,
    balls: 0,
    extras: 0,

    history: [] as any[],
    overBalls: [] as any[],
    freeHit: false,
  });

  const clone = (p: any) => ({
    ...p,
    batting: p.batting.map((x: any) => ({ ...x })),
    bowling: p.bowling.map((x: any) => ({ ...x })),
  });

  const getOver = (balls: number) => `${Math.floor(balls / 6)}.${balls % 6}`;

  const rotate = (m: any) => {
    [m.striker, m.nonStriker] = [m.nonStriker, m.striker];
  };

  const isLegal = (b: any) => b !== "WD" && b !== "NB";

  const getOverRuns = (balls: any[]) =>
    balls.reduce((sum, b) => {
      if (b === "WD" || b === "NB") return sum + 1;
      if (b === "W") return sum;
      return sum + Number(b);
    }, 0);

  const pushBall = (m: any, symbol: any, legal: boolean) => {
    m.overBalls.push(symbol);

    const valid = m.overBalls.filter(isLegal).length;

    if (valid === 6) {
      m.history.push({
        balls: [...m.overBalls],
        runs: getOverRuns(m.overBalls),
        bowler: m.bowler, // ✅ FIX
      });

      m.overBalls = [];
      rotate(m);
      m.bowler = null;
    }
  };

  const ensureBowler = (m: any) => {
    if (m.bowler === null) {
      Alert.alert("Select Bowler");
      return false;
    }
    return true;
  };

  const selectOpening = (i: number) => {
    if (state.striker === null) {
      setState((p) => ({ ...p, striker: i }));
    } else if (state.nonStriker === null && i !== state.striker) {
      setState((p) => ({ ...p, nonStriker: i }));
    }
  };

  const selectBatsman = (i: number) => {
    setState((p) => ({ ...p, striker: i, nextBatsman: null }));
  };

  const addRun = (r: number) => {
    setState((prev) => {
      let m = clone(prev);
      if (!ensureBowler(m)) return prev;
      if (m.striker === null || m.nonStriker === null) return prev;
      if (m.nextBatsman !== null) return prev;

      m.score += r;
      m.balls++;

      let striker = m.batting[m.striker];
      let bowler = m.bowling[m.bowler];

      striker.runs += r;
      striker.balls++;

      bowler.runs += r;
      bowler.balls++;

      pushBall(m, r, true);

      if (r % 2 === 1) rotate(m);

      m.freeHit = false;

      return { ...m };
    });
  };

  const wide = () => {
    setState((prev) => {
      let m = clone(prev);
      if (!ensureBowler(m)) return prev;

      m.score++;
      m.extras++;
      m.bowling[m.bowler].runs++;

      pushBall(m, "WD", false);

      return { ...m };
    });
  };

  const noBall = () => {
    setState((prev) => {
      let m = clone(prev);
      if (!ensureBowler(m)) return prev;

      m.score++;
      m.extras++;
      m.freeHit = true;
      m.bowling[m.bowler].runs++;

      pushBall(m, "NB", false);

      return { ...m };
    });
  };

  const wicket = () => {
    setState((prev) => {
      let m = clone(prev);
      if (!ensureBowler(m)) return prev;

      if (m.freeHit) {
        Alert.alert("Free Hit - No wicket");
        return prev;
      }

      m.wickets++;
      m.balls++;

      let striker = m.batting[m.striker];
      let bowler = m.bowling[m.bowler];

      striker.out = true;
      striker.balls++;

      bowler.wickets++;
      bowler.balls++;

      pushBall(m, "W", true);

      m.nextBatsman = m.batting.findIndex((b: any) => !b.out);

      return { ...m };
    });
  };

  const selectBowler = (i: number) => {
    setState((p) => ({ ...p, bowler: i }));
  };

  const overs = getOver(state.balls);

  const currentOver =
    state.overBalls.length > 0
      ? state.overBalls
      : state.history.length > 0
        ? state.history[state.history.length - 1].balls
        : [];

  const currentOverRuns =
    state.overBalls.length > 0
      ? getOverRuns(state.overBalls)
      : state.history.length > 0
        ? state.history[state.history.length - 1].runs
        : 0;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Batting</Text>

      <Text style={styles.score}>
        {state.score}/{state.wickets}
      </Text>

      <Text style={styles.text}>Overs: {overs}</Text>

      {state.freeHit && <Text style={styles.free}>FREE HIT</Text>}

      {/* Opening Selection */}
      {(state.striker === null || state.nonStriker === null) && (
        <View>
          <Text style={styles.section}>Select Opening Batsmen</Text>
          {state.batting.map((b, i) => (
            <Pressable
              key={i}
              style={styles.bowler}
              onPress={() => selectOpening(i)}
            >
              <Text>{b.name}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* New Batsman */}
      {state.nextBatsman !== null && (
        <View>
          <Text style={styles.section}>Select New Batsman</Text>
          {state.batting.map(
            (b, i) =>
              !b.out &&
              i !== state.striker &&
              i !== state.nonStriker && (
                <Pressable
                  key={i}
                  style={styles.bowler}
                  onPress={() => selectBatsman(i)}
                >
                  <Text>{b.name}</Text>
                </Pressable>
              ),
          )}
        </View>
      )}

      {/* Bowler */}
      {state.bowler === null &&
        state.nextBatsman === null &&
        state.striker !== null &&
        state.nonStriker !== null && (
          <View>
            <Text style={styles.section}>Select Bowler</Text>
            {state.bowling.map((b, i) => (
              <Pressable
                key={i}
                style={styles.bowler}
                onPress={() => selectBowler(i)}
              >
                <Text>{b.name}</Text>
              </Pressable>
            ))}
          </View>
        )}

      {/* Controls */}
      {state.nextBatsman === null &&
        state.striker !== null &&
        state.nonStriker !== null && (
          <>
            <View style={styles.row}>
              {[0, 1, 2, 3, 4, 6].map((r) => (
                <Pressable key={r} style={styles.btn} onPress={() => addRun(r)}>
                  <Text style={{ color: "#fff" }}>{r}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.row}>
              <Pressable style={styles.extra} onPress={wide}>
                <Text>WD</Text>
              </Pressable>
              <Pressable style={styles.extra} onPress={noBall}>
                <Text>NB</Text>
              </Pressable>
              <Pressable style={styles.wicket} onPress={wicket}>
                <Text style={{ color: "#fff" }}>W</Text>
              </Pressable>
            </View>
          </>
        )}

      {/* This Over */}
      <Text style={styles.section}>
        This Over: {currentOver.map((b: any) => b.toString()).join(" ")}
      </Text>

      {/* History */}
      <Text style={styles.section}>Overs History</Text>
      {state.history.map((o, i) => (
        <Text key={i} style={styles.text}>
          Over {i + 1} ({state.bowling[o.bowler]?.name}):{" "}
          {o.balls.map((b: any) => b.toString()).join(" ")} = {o.runs}
        </Text>
      ))}

      {/* Batting */}
      <Text style={styles.section}>Batting</Text>
      {state.batting.map((p, i) => (
        <Text key={i} style={styles.text}>
          {p.name} {p.out ? "out" : ""} {p.runs}({p.balls})
        </Text>
      ))}

      {/* Bowling */}
      <Text style={styles.section}>Bowling</Text>
      {state.bowling.map((b, i) => {
        const overs = `${Math.floor(b.balls / 6)}.${b.balls % 6}`;
        return (
          <Text key={i} style={styles.text}>
            {b.name} {overs} - {b.runs} - {b.wickets}
          </Text>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#0f172a" },
  header: { color: "#fff", fontSize: 20 },
  score: { color: "#fff", fontSize: 30 },
  text: { color: "#fff", marginVertical: 3 },
  section: { color: "#22c55e", marginTop: 15 },
  free: { color: "yellow" },

  row: { flexDirection: "row", flexWrap: "wrap" },
  btn: { backgroundColor: "#2563eb", padding: 12, margin: 5 },
  extra: { backgroundColor: "#facc15", padding: 10, margin: 5 },
  wicket: { backgroundColor: "red", padding: 10, margin: 5 },

  bowler: { backgroundColor: "#ddd", padding: 10, margin: 5 },
});
