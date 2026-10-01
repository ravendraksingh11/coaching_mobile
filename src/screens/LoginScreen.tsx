import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { ArrowRight, Eye, EyeOff, GraduationCap, LockKeyhole, Mail, Sparkles } from "lucide-react-native";
import { signIn } from "../api/endpoints";
import { useAuthStore } from "../store/authStore";
import { colors } from "../theme";

function getMessage(error: unknown) {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
  }
  return "We couldn't sign you in. Check your connection and try again.";
}

export function LoginScreen() {
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    setLoading(true);
    try {
      const response = await signIn(email.trim(), password);
      await setSession(response.data.token, response.data.user);
    } catch (requestError) {
      setError(getMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <LinearGradient colors={["#101E36", "#133E5A", "#0E6A63"]} style={styles.hero}>
            <View style={styles.heroOrb} />
            <View style={styles.brandRow}>
              <View style={styles.brandMark}><GraduationCap color="#07241D" size={27} /></View>
              <Text style={styles.brandName}>Coaching</Text>
              <View style={styles.securePill}><Sparkles color="#6EE7BE" size={13} /><Text style={styles.secureText}>LEARN TOGETHER</Text></View>
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>YOUR INSTITUTE, IN SYNC</Text>
              <Text style={styles.heroTitle}>Every lesson{ "\n" }moves you forward.</Text>
              <Text style={styles.heroSubtitle}>A simpler home for classes, progress and everything in between.</Text>
            </View>
            <View style={styles.heroFoot}><View style={styles.dotRow}><View style={styles.heroDot} /><View style={styles.heroDot} /><View style={styles.heroDot} /></View><Text style={styles.heroFootText}>One place. Your next step.</Text></View>
          </LinearGradient>

          <View style={styles.formSection}>
            <Text style={styles.welcome}>Welcome back</Text>
            <Text style={styles.formIntro}>Sign in to continue to your learning space.</Text>
            {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
            <Text style={styles.label}>Email address</Text>
            <View style={styles.inputWrap}><Mail color="#8A96A8" size={19} /><TextInput autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="you@example.com" placeholderTextColor="#A1AAB8" value={email} onChangeText={setEmail} style={styles.input} returnKeyType="next" /></View>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}><LockKeyhole color="#8A96A8" size={19} /><TextInput autoCapitalize="none" autoComplete="password" placeholder="Enter your password" placeholderTextColor="#A1AAB8" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} style={styles.input} onSubmitEditing={submit} returnKeyType="go" /><TouchableOpacity accessibilityLabel={showPassword ? "Hide password" : "Show password"} onPress={() => setShowPassword((visible) => !visible)} hitSlop={10}>{showPassword ? <EyeOff color="#7A8799" size={19} /> : <Eye color="#7A8799" size={19} />}</TouchableOpacity></View>
            <TouchableOpacity style={[styles.signIn, loading && styles.signInDisabled]} onPress={submit} disabled={loading || !email.trim() || !password} activeOpacity={0.88}>
              <LinearGradient colors={loading ? ["#7E9AE0", "#627FC8"] : ["#3273F1", "#2457C8"]} style={styles.signInGradient}>
                {loading ? <ActivityIndicator color="#fff" /> : <><Text style={styles.signInText}>Sign in</Text><View style={styles.arrow}><ArrowRight color="#2355C0" size={18} /></View></>}
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.footer}><View style={styles.footerLine} /><Text style={styles.footerText}>A little progress, every day.</Text><View style={styles.footerLine} /></View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F7FB" },
  scroll: { flexGrow: 1, paddingBottom: 24 },
  hero: { minHeight: 310, paddingHorizontal: 26, paddingTop: 18, paddingBottom: 23, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: "hidden", justifyContent: "space-between" },
  heroOrb: { position: "absolute", width: 280, height: 280, borderRadius: 140, right: -130, top: 45, backgroundColor: "#47D5B01A", borderWidth: 1, borderColor: "#FFFFFF10" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.mint, alignItems: "center", justifyContent: "center" },
  brandName: { color: colors.white, fontSize: 20, fontWeight: "800", flex: 1 },
  securePill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#FFFFFF12", paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 },
  secureText: { color: "#D3E9E3", fontSize: 9, letterSpacing: 1, fontWeight: "700" },
  heroCopy: { marginTop: 34 },
  eyebrow: { color: "#65E0BB", fontSize: 10, letterSpacing: 2, fontWeight: "800", marginBottom: 12 },
  heroTitle: { color: "#FFFFFF", fontSize: 34, lineHeight: 39, fontWeight: "800", letterSpacing: -0.8 },
  heroSubtitle: { color: "#C3D5E3", fontSize: 14, lineHeight: 21, maxWidth: 300, marginTop: 11 },
  heroFoot: { flexDirection: "row", alignItems: "center", gap: 9, marginTop: 26 },
  dotRow: { flexDirection: "row", gap: 4 },
  heroDot: { height: 5, width: 5, borderRadius: 3, backgroundColor: "#62DDB8" },
  heroFootText: { color: "#A7C1CE", fontSize: 11 },
  formSection: { paddingHorizontal: 25, paddingTop: 27 },
  welcome: { color: colors.ink, fontSize: 25, fontWeight: "800", letterSpacing: -0.4 },
  formIntro: { color: colors.muted, fontSize: 14, marginTop: 7, marginBottom: 23 },
  label: { color: "#344054", fontSize: 12, fontWeight: "700", marginBottom: 8, marginTop: 13 },
  inputWrap: { minHeight: 54, flexDirection: "row", alignItems: "center", gap: 11, paddingHorizontal: 15, borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 15, backgroundColor: "#FFFFFF" },
  input: { flex: 1, color: colors.ink, paddingVertical: 14, fontSize: 15 },
  signIn: { marginTop: 25, borderRadius: 15, overflow: "hidden", shadowColor: "#2457C8", shadowOpacity: 0.2, shadowRadius: 13, shadowOffset: { width: 0, height: 7 }, elevation: 4 },
  signInDisabled: { opacity: 0.8 },
  signInGradient: { minHeight: 56, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  signInText: { color: colors.white, fontSize: 15, fontWeight: "800" },
  arrow: { position: "absolute", right: 9, width: 38, height: 38, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF", borderRadius: 12 },
  errorBox: { backgroundColor: "#FFF0F1", borderColor: "#FBD0D5", borderWidth: 1, padding: 12, borderRadius: 12, marginBottom: 7 },
  errorText: { color: colors.danger, fontSize: 13, lineHeight: 18 },
  footer: { flexDirection: "row", alignItems: "center", gap: 11, justifyContent: "center", marginTop: 26 },
  footerLine: { height: 1, backgroundColor: "#E3E8EF", flex: 1 },
  footerText: { color: "#929CAD", fontSize: 11 },
});
