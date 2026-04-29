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
  const { teamAPlayers, teamBPlayers, overs, battingTeam } =
    useLocalSearchParams();
  const [tempStriker, setTempStriker] = useState(null);
  const [tempNonStriker, setTempNonStriker] = useState(null);
  const [tempBowler, setTempBowler] = useState(null);
  const totalOvers = Number(overs);
  const maxBalls = totalOvers * 6;

  const teamAList = JSON.parse((teamAPlayers as string) || "[]");
  const teamBList = JSON.parse((teamBPlayers as string) || "[]");

  const createBatters = (list: string[]) =>
    list.map((p) => ({ name: p, runs: 0, balls: 0, out: false }));

  const createBowlers = (list: string[]) =>
    list.map((p) => ({ name: p, runs: 0, balls: 0, wickets: 0 }));

  const isTeamABatting = battingTeam === "A";
  const [state, setState] = useState({
    batting: createBatters(isTeamABatting ? teamAList : teamBList),
    bowling: createBowlers(isTeamABatting ? teamBList : teamAList),

    striker: null,
    nonStriker: null,
    nextBatsman: null,

    bowler: null,

    score: 0,
    wickets: 0,
    balls: 0,
    extras: 0,

    history: [],
    overBalls: [],
    freeHit: false,

    // ✅ NEW
    innings: 1,
    target: null,
    winner: null,
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

    // ONLY THIS controls ball count
    if (legal) {
      m.balls++;
    }

    const valid = m.overBalls.filter(
      (b: any) => b !== "WD" && b !== "NB",
    ).length;

    if (valid === 6) {
      m.history.push({
        balls: [...m.overBalls],
        runs: getOverRuns(m.overBalls),
        bowler: m.bowler,
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
  const checkMatchState = (m: any) => {
    // ✅ FIRST INNINGS END
    if (m.innings === 1 && (m.wickets === 10 || m.balls >= maxBalls)) {
      Alert.alert("Innings Over");

      return {
        ...m,
        innings: 2,
        target: m.score + 1,

        // reset stats
        score: 0,
        wickets: 0,
        balls: 0,
        extras: 0,
        history: [],
        overBalls: [],
        freeHit: false,

        // swap teams
        batting: m.bowling.map((p) => ({
          name: p.name,
          runs: 0,
          balls: 0,
          out: false,
        })),
        bowling: m.batting.map((p) => ({
          name: p.name,
          runs: 0,
          balls: 0,
          wickets: 0,
        })),

        striker: null,
        nonStriker: null,
        nextBatsman: null,
        bowler: null,
      };
    }

    // ✅ SECOND INNINGS WIN CHECK
    if (m.innings === 2 && m.target && m.score >= m.target) {
      Alert.alert("Batting Team Won!");
      return { ...m, winner: "Batting Team" };
    }

    // ✅ SECOND INNINGS LOSE
    if (m.innings === 2 && (m.wickets === 10 || m.balls >= maxBalls)) {
      Alert.alert("Bowling Team Won!");
      return { ...m, winner: "Bowling Team" };
    }

    return m;
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
      if (prev.winner) return prev; // ✅ ADD HERE
      let m = clone(prev);

      if (!ensureBowler(m)) return prev;
      if (m.striker === null || m.nonStriker === null) return prev;
      if (m.nextBatsman !== null) return prev;

      m.score += r;
      // m.balls++; // OK (legal delivery)

      let striker = m.batting[m.striker];
      let bowler = m.bowling[m.bowler];

      striker.runs += r;
      striker.balls++;

      bowler.runs += r;
      bowler.balls++;

      pushBall(m, r, true);

      if (r % 2 === 1) rotate(m);

      m.freeHit = false;

      return checkMatchState({ ...m });
    });
  };

  const wide = () => {
    setState((prev) => {
      if (prev.winner) return prev;

      let m = clone(prev);
      if (!ensureBowler(m)) return prev;

      m.score++;
      m.extras++;
      m.bowling[m.bowler].runs++;

      // ❌ no ball increment
      pushBall(m, "WD", false);

      return checkMatchState({ ...m });
    });
  };

  const noBall = () => {
    setState((prev) => {
      if (prev.winner) return prev;

      let m = clone(prev);
      if (!ensureBowler(m)) return prev;

      m.score++;
      m.extras++;
      m.freeHit = true;

      m.bowling[m.bowler].runs++;

      // ❌ IMPORTANT: do NOT count legal ball
      pushBall(m, "NB", false);

      return checkMatchState({ ...m });
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

      return checkMatchState({ ...m });
    });
  };

  const selectBowler = (i: number) => {
    setState((p) => ({ ...p, bowler: i }));
  };

  const overString = getOver(state.balls);

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

      <Text style={styles.text}>Innings: {state.innings}</Text>

      {state.target && <Text style={styles.text}>Target: {state.target}</Text>}
      {state.innings === 2 && state.target && (
        <Text style={styles.text}>
          Need {Math.max(state.target - state.score, 0)} runs in{" "}
          {Math.max(maxBalls - state.balls, 0)} balls
        </Text>
      )}
      {state.winner && (
        <Text style={{ color: "yellow", fontSize: 18 }}>
          Winner: {state.winner}
        </Text>
      )}
      <Text style={styles.score}>
        Score: {state.score}/{state.wickets}
      </Text>
      <Text style={styles.text}>Overs: {overString}</Text>

      {state.freeHit && <Text style={styles.free}>FREE HIT</Text>}

      {/* Opening Selection */}
      {(state.striker === null || state.nonStriker === null) && (
        <View style={styles.card}>
          <Text style={styles.section}>Select Opening Batsmen</Text>
          {state.batting.map((b, i) => (
            <Pressable
              key={i}
              style={[
                styles.bowler,
                (i === tempStriker || i === tempNonStriker) && {
                  borderColor: "#22c55e",
                  backgroundColor: "#14532d",
                  color: "#fff",
                },
              ]}
              onPress={() => {
                if (tempStriker === i) {
                  setTempStriker(null);
                } else if (tempNonStriker === i) {
                  setTempNonStriker(null);
                } else if (tempStriker === null) {
                  setTempStriker(i);
                } else if (tempNonStriker === null) {
                  setTempNonStriker(i);
                }
              }}
            >
              <Text
                style={[
                  { color: "#0f172a" },
                  (i === tempStriker || i === tempNonStriker) &&
                    styles.selectedText,
                ]}
              >
                {b.name}
              </Text>
            </Pressable>
          ))}
          <Text style={styles.text}>
            Striker:{" "}
            {tempStriker !== null ? state.batting[tempStriker].name : "-"}
          </Text>
          <Text style={styles.text}>
            Non-Striker:{" "}
            {tempNonStriker !== null ? state.batting[tempNonStriker].name : "-"}
          </Text>

          <Pressable
            style={styles.btn}
            onPress={() => {
              if (tempStriker !== null && tempNonStriker !== null) {
                setState((p) => ({
                  ...p,
                  striker: tempStriker,
                  nonStriker: tempNonStriker,
                }));
                setTempStriker(null);
                setTempNonStriker(null);
              } else {
                Alert.alert("Select both batsmen");
              }
            }}
          >
            <Text style={{ color: "#fff" }}>Confirm Batsmen</Text>
          </Pressable>
        </View>
      )}

      {/* New Batsman */}
      {state.nextBatsman !== null && (
        <View style={styles.card}>
          <Text style={styles.section}>Select New Batsman</Text>
          {state.batting.map(
            (b, i) =>
              !b.out &&
              i !== state.striker &&
              i !== state.nonStriker && (
                <Pressable
                  key={i}
                  style={[
                    styles.bowler,
                    (i === tempStriker || i === tempNonStriker) && {
                      borderColor: "#22c55e",
                      backgroundColor: "#14532d",
                    },
                  ]}
                  onPress={() => setTempStriker(i)}
                >
                  <Text
                    style={[
                      { color: "#0f172a" },
                      (i === tempStriker || i === tempNonStriker) &&
                        styles.selectedText,
                    ]}
                  >
                    {b.name}
                  </Text>
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
          <View style={styles.card}>
            <Text style={styles.section}>Select Bowler</Text>
            {state.bowling.map((b, i) => (
              <Pressable
                key={i}
                style={[
                  styles.bowler,
                  i === tempBowler && {
                    borderColor: "#facc15",
                    backgroundColor: "#78350f",
                  },
                ]}
                onPress={() => setTempBowler(i)}
              >
                <Text
                  style={[
                    { color: "#0f172a" },
                    i === tempBowler && styles.selectedText,
                  ]}
                >
                  {b.name}
                </Text>
              </Pressable>
            ))}
            <Text style={styles.text}>
              Selected Bowler:{" "}
              {tempBowler !== null ? state.bowling[tempBowler].name : "-"}
            </Text>

            <Pressable
              style={styles.btn}
              onPress={() => {
                if (tempBowler !== null) {
                  setState((p) => ({ ...p, bowler: tempBowler }));
                  setTempBowler(null);
                } else {
                  Alert.alert("Select bowler");
                }
              }}
            >
              <Text style={{ color: "#fff" }}>Confirm Bowler</Text>
            </Pressable>
          </View>
        )}

      {/* Controls */}
      {!state.winner &&
        state.nextBatsman === null &&
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
      <Text style={styles.text}>
        Current Bowler:{" "}
        {state.bowler !== null ? state.bowling[state.bowler].name : "-"}
      </Text>

      <Text style={styles.text}>
        Striker:{" "}
        {state.striker !== null ? state.batting[state.striker].name : "-"}
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
  container: {
    flex: 1,
    backgroundColor: "#f8fafc", // light background
    padding: 16,
  },

  header: {
    color: "#0f172a",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },

  score: {
    color: "#0f172a",
    fontSize: 32,
    fontWeight: "800",
    marginVertical: 6,
  },

  text: {
    color: "#475569",
    fontSize: 14,
    marginVertical: 2,
  },

  section: {
    color: "#2563eb",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 10,
  },

  free: {
    color: "#eab308",
    fontWeight: "700",
    marginTop: 6,
  },

  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 10,
  },

  btn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    minWidth: 50,
    alignItems: "center",
    color: "#ffffff",
  },

  extra: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5f5",
  },

  wicket: {
    backgroundColor: "#ef4444",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  // Player card
  bowler: {
    backgroundColor: "#ffffff",
    padding: 14,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  // Selected state
  selected: {
    borderColor: "#2563eb",
    backgroundColor: "#dbeafe",
  },

  card: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 6,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  selectedText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
