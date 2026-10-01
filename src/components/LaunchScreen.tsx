import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { GraduationCap } from "lucide-react-native";
import { colors } from "../theme";

export function LaunchScreen() {
  const pulse = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.92, duration: 900, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <LinearGradient colors={["#0B1220", "#122440", "#17476A"]} style={styles.root}>
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />
      <Animated.View style={[styles.mark, { transform: [{ scale: pulse }] }]}>
        <LinearGradient colors={["#37D8A5", "#1CA879"]} style={styles.markGradient}>
          <GraduationCap color="#08261F" size={48} strokeWidth={1.8} />
        </LinearGradient>
      </Animated.View>
      <Text style={styles.wordmark}>Coaching</Text>
      <Text style={styles.tagline}>A better way to learn and grow.</Text>
      <View style={styles.loadingTrack}><View style={styles.loadingBar} /></View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  glowOne: { position: "absolute", width: 300, height: 300, borderRadius: 150, top: -135, right: -90, backgroundColor: "#27C997", opacity: 0.12 },
  glowTwo: { position: "absolute", width: 240, height: 240, borderRadius: 120, bottom: -100, left: -90, backgroundColor: "#2D8FFF", opacity: 0.16 },
  mark: { width: 98, height: 98, borderRadius: 31, padding: 5, backgroundColor: "#FFFFFF18", marginBottom: 25 },
  markGradient: { flex: 1, borderRadius: 27, alignItems: "center", justifyContent: "center" },
  wordmark: { color: colors.white, fontSize: 34, letterSpacing: 0.2, fontWeight: "800" },
  tagline: { color: "#BCD0E6", fontSize: 14, marginTop: 9 },
  loadingTrack: { width: 64, height: 3, backgroundColor: "#FFFFFF24", borderRadius: 4, marginTop: 44, overflow: "hidden" },
  loadingBar: { width: 34, height: 3, backgroundColor: colors.mint, borderRadius: 4 },
});
