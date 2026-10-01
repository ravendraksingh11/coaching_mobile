import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { ArrowRight, Bell, BookOpenCheck, CalendarCheck, CheckCircle2, ClipboardList, CreditCard, GraduationCap, Home, Layers3, LogOut, RefreshCw, Users, Wallet } from "lucide-react-native";
import * as api from "../api/endpoints";
import { useAuthStore } from "../store/authStore";
import type { AuthUser, UserRole } from "../types/auth";
import { colors } from "../theme";

type TabKey = "dashboard" | "students" | "attendance" | "fees" | "tests" | "institutes" | "plans";
type Tab = { key: TabKey; label: string };
type Row = Record<string, unknown>;
const tabsByRole: Record<UserRole, Tab[]> = {
  INSTITUTE_ADMIN: [{ key: "dashboard", label: "Home" }, { key: "students", label: "Students" }, { key: "attendance", label: "Attendance" }, { key: "fees", label: "Fees" }, { key: "tests", label: "Tests" }],
  STUDENT: [{ key: "tests", label: "My tests" }, { key: "attendance", label: "Attendance" }, { key: "fees", label: "Fees" }],
  TEACHER: [{ key: "attendance", label: "Attendance" }],
  PARENT: [{ key: "attendance", label: "Children" }],
  SUPER_ADMIN: [{ key: "dashboard", label: "Home" }, { key: "institutes", label: "Institutes" }, { key: "plans", label: "Plans" }],
};

function TabIcon({ name, color, size = 20 }: { name: TabKey; color: string; size?: number }) {
  const props = { color, size, strokeWidth: 2 };
  switch (name) {
    case "dashboard": return <Home {...props} />;
    case "students": return <Users {...props} />;
    case "attendance": return <CalendarCheck {...props} />;
    case "fees": return <Wallet {...props} />;
    case "tests": return <BookOpenCheck {...props} />;
    case "institutes": return <Layers3 {...props} />;
    case "plans": return <CreditCard {...props} />;
  }
}

async function loadTab(tab: TabKey, role: UserRole): Promise<unknown> {
  if (tab === "dashboard") return role === "SUPER_ADMIN" ? api.getSuperAdminDashboard() : api.getInstituteDashboard();
  if (tab === "students") return api.getInstituteStudents();
  if (tab === "tests") return role === "STUDENT" ? api.getMyTests() : api.getInstituteTests();
  if (tab === "fees") return role === "STUDENT" ? api.getMyFees() : api.getPendingFees();
  if (tab === "institutes") return api.getInstitutes();
  if (tab === "plans") return api.getPlans();
  if (role === "STUDENT") return api.getMyAttendance();
  if (role === "PARENT") return api.getParentAttendance();
  return api.getAttendanceSessions();
}

function asRows(value: unknown): Row[] {
  if (Array.isArray(value)) return value.filter((item): item is Row => typeof item === "object" && item !== null);
  if (typeof value !== "object" || value === null) return [];
  const object = value as Row;
  const nested = Array.isArray(object.recent) ? object.recent : Array.isArray(object.children) ? object.children : [];
  return nested.filter((item): item is Row => typeof item === "object" && item !== null);
}
function valueOf(row: Row, keys: string[], fallback: string) {
  const value = keys.map((key) => row[key]).find((item) => typeof item === "string" || typeof item === "number");
  return value == null ? fallback : String(value);
}
function money(value: unknown) { return `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`; }
function greeting() { const hour = new Date().getHours(); return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"; }
function firstName(user: AuthUser) { return user.name?.trim().split(/\s+/)[0] || "there"; }
function readableError(error: unknown) {
  if (typeof error === "object" && error && "response" in error) {
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
    if (message) return message;
  }
  return "Could not load this section. Check your connection and try again.";
}
function rowTitle(tab: TabKey, row: Row) {
  const keys = tab === "students" || tab === "institutes" ? ["student_name", "name", "institute_name"] : tab === "tests" ? ["title", "test_title"] : tab === "fees" ? ["title", "fee_title"] : tab === "attendance" ? ["batch_name", "studentName", "student_name", "session_date"] : ["name", "title"];
  return valueOf(row, keys, "Activity");
}
function rowDetail(tab: TabKey, row: Row) {
  if (tab === "students") return valueOf(row, ["admission_number", "email", "batch_name"], "Student profile");
  if (tab === "tests") return row.marks_obtained == null ? valueOf(row, ["description", "due_date"], "Assigned assessment") : `Score ${row.marks_obtained} / ${row.total_marks ?? "—"} · ${Number(row.percentage || 0).toFixed(0)}%`;
  if (tab === "fees") return `${valueOf(row, ["status"], "Pending")} · balance ${money(row.balance ?? Number(row.amount || 0) - Number(row.paid_amount || 0))}`;
  if (tab === "attendance") return `${valueOf(row, ["session_date", "date"], "Recent class")} · ${valueOf(row, ["status"], "Scheduled")}`;
  if (tab === "institutes") return `${valueOf(row, ["location", "email"], "Coaching institute")} · ${valueOf(row, ["status"], "Active")}`;
  if (tab === "plans") return `${money(row.price)} · ${valueOf(row, ["duration_months"], "1")} months`;
  return valueOf(row, ["description", "status"], "Your learning overview");
}

export function HomeScreen() {
  const user = useAuthStore((state) => state.user)!;
  const clearSession = useAuthStore((state) => state.clearSession);
  const tabs = useMemo(() => tabsByRole[user.role] || tabsByRole.STUDENT, [user.role]);
  const [activeTab, setActiveTab] = useState<TabKey>(tabs[0].key);
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try { setData(await loadTab(activeTab, user.role)); }
    catch (requestError) { setError(readableError(requestError)); }
    finally { setLoading(false); setRefreshing(false); }
  }, [activeTab, user.role]);
  useEffect(() => { void load(); }, [load]);

  const currentTab = tabs.find((tab) => tab.key === activeTab) || tabs[0];
  const rows = asRows(data);
  const payload = typeof data === "object" && data !== null ? data as Row : {};
  const stats = typeof payload.stats === "object" && payload.stats !== null ? payload.stats as Row : {};
  const metrics = Object.entries(stats).slice(0, 4);

  return <SafeAreaView style={styles.safe}><View style={styles.shell}>
    <ScrollView contentContainerStyle={styles.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={colors.blue} />} showsVerticalScrollIndicator={false}>
      <View style={styles.topline}>
        <View style={styles.brandLockup}><LinearGradient colors={["#35D5A3", "#19A77B"]} style={styles.brandIcon}><GraduationCap size={23} color="#08261F" /></LinearGradient><View><Text style={styles.brand}>Coaching</Text><Text style={styles.caption} numberOfLines={1}>{user.instituteName || "LEARNING, IN SYNC"}</Text></View></View>
        <TouchableOpacity style={styles.bell} accessibilityLabel="Notifications"><Bell size={19} color={colors.ink} /><View style={styles.bellDot} /></TouchableOpacity>
      </View>
      <LinearGradient colors={["#142642", "#1A4770", "#157766"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.welcome}>
        <View style={styles.orb} /><View style={styles.welcomeTop}><View><Text style={styles.eyebrow}>{greeting().toUpperCase()}</Text><Text style={styles.name}>{firstName(user)}.</Text></View><View style={styles.avatar}><Text style={styles.avatarText}>{firstName(user).slice(0, 1).toUpperCase()}</Text></View></View>
        <Text style={styles.welcomeText}>{user.role === "STUDENT" ? "Your learning journey is looking good. Pick up where you left off." : "Your coaching community is ready for another great day."}</Text>
        <View style={styles.pill}><View style={styles.pillDot} /><Text style={styles.pillText}>{currentTab.label.toUpperCase()} · YOUR SPACE</Text></View>
      </LinearGradient>
      <View style={styles.heading}><View><Text style={styles.sectionTitle}>{activeTab === "dashboard" ? "At a glance" : currentTab.label}</Text><Text style={styles.sectionSub}>{activeTab === "dashboard" ? "A little progress adds up." : "Your latest updates"}</Text></View><TouchableOpacity style={styles.refresh} onPress={() => load(true)} accessibilityLabel="Refresh"><RefreshCw size={17} color={colors.blue} /></TouchableOpacity></View>
      {loading ? <View style={styles.loadingCard}><ActivityIndicator color={colors.blue} /><Text style={styles.loadingText}>Getting things ready…</Text></View> : error ? <View style={styles.errorCard}><Text style={styles.emptyTitle}>We hit a small bump</Text><Text style={styles.errorText}>{error}</Text><TouchableOpacity onPress={() => load()} style={styles.retry}><Text style={styles.retryText}>Try again</Text><ArrowRight size={16} color="#fff" /></TouchableOpacity></View> : metrics.length ? <View style={styles.metrics}>{metrics.map(([label, value], index) => <View key={label} style={styles.metric}><View style={[styles.metricIcon, index % 2 ? styles.mintIcon : styles.blueIcon]}>{index % 2 ? <Users size={18} color="#12956D" /> : <ClipboardList size={18} color={colors.blue} />}</View><Text style={styles.metricLabel}>{label.replace(/([A-Z])/g, " $1")}</Text><Text style={styles.metricValue}>{typeof value === "number" ? value.toLocaleString("en-IN") : String(value ?? "—")}</Text><Text style={styles.metricHint}>Your institute</Text></View>)}</View> : activeTab === "attendance" && payload.percentage != null ? <View style={styles.attendanceCard}><View style={styles.score}><Text style={styles.percent}>{String(payload.percentage)}%</Text><Text style={styles.metricLabel}>Attendance</Text></View><View style={styles.attendanceLine}><CheckCircle2 color="#1CA879" size={17} /><Text style={styles.attendanceText}>Present  ·  {String(payload.present ?? 0)}</Text></View><View style={styles.attendanceLine}><CalendarCheck color={colors.blue} size={17} /><Text style={styles.attendanceText}>Recent classes  ·  {rows.length}</Text></View></View> : rows.length ? <View style={styles.list}>{rows.slice(0, 20).map((row, index) => <View key={String(row.id || row.studentId || index)} style={[styles.listRow, index === Math.min(rows.length, 20) - 1 && styles.lastRow]}><View style={[styles.rowIcon, activeTab === "fees" && styles.feeIcon]}><TabIcon name={activeTab} color={activeTab === "fees" ? "#15966D" : colors.blue} size={19} /></View><View style={styles.rowCopy}><Text style={styles.rowTitle} numberOfLines={1}>{rowTitle(activeTab, row)}</Text><Text style={styles.rowDetail} numberOfLines={2}>{rowDetail(activeTab, row)}</Text></View><ArrowRight size={17} color="#9AA5B4" /></View>)}</View> : <View style={styles.empty}><View style={styles.emptyIcon}><TabIcon name={activeTab} color={colors.blue} size={25} /></View><Text style={styles.emptyTitle}>You’re all caught up</Text><Text style={styles.emptyText}>There’s nothing to show here right now. Pull down to refresh later.</Text></View>}
      {user.role === "STUDENT" && activeTab === "tests" ? <View style={styles.tip}><View style={styles.tipIcon}><GraduationCap size={20} color="#168B69" /></View><View style={styles.tipCopy}><Text style={styles.tipTitle}>Keep your momentum</Text><Text style={styles.tipText}>Small steps today make big progress tomorrow.</Text></View><ArrowRight size={17} color="#168B69" /></View> : null}
      <View style={{ height: 18 }} />
    </ScrollView>
    <View style={styles.tabBar}>{tabs.map((tab) => { const active = activeTab === tab.key; return <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} style={styles.tabButton} accessibilityState={{ selected: active }}><View style={[styles.tabIcon, active && styles.tabIconOn]}><TabIcon name={tab.key} color={active ? colors.blue : "#929EAE"} size={20} /></View><Text numberOfLines={1} style={[styles.tabLabel, active && styles.tabLabelOn]}>{tab.label}</Text></TouchableOpacity>; })}<TouchableOpacity onPress={() => void clearSession()} style={styles.tabButton} accessibilityLabel="Sign out"><View style={styles.tabIcon}><LogOut size={20} color="#929EAE" /></View><Text numberOfLines={1} style={styles.tabLabel}>Sign out</Text></TouchableOpacity></View>
  </View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.canvas }, shell: { flex: 1 }, scroll: { paddingHorizontal: 20, paddingTop: 10 },
  topline: { minHeight: 48, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 17 }, brandLockup: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandIcon: { width: 39, height: 39, borderRadius: 13, alignItems: "center", justifyContent: "center" }, brand: { color: colors.ink, fontWeight: "800", fontSize: 17 }, caption: { color: colors.muted, fontSize: 9, letterSpacing: 1.1, marginTop: 3, fontWeight: "700", maxWidth: 225 },
  bell: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.white, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.line }, bellDot: { width: 7, height: 7, backgroundColor: "#F26972", borderRadius: 4, position: "absolute", top: 9, right: 10, borderWidth: 1, borderColor: colors.white },
  welcome: { minHeight: 188, borderRadius: 25, padding: 20, overflow: "hidden", marginBottom: 25 }, orb: { position: "absolute", width: 190, height: 190, borderRadius: 100, right: -70, top: -70, borderColor: "#FFFFFF18", borderWidth: 1, backgroundColor: "#FFFFFF08" }, welcomeTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eyebrow: { color: "#A7D8CC", fontSize: 9, fontWeight: "800", letterSpacing: 1.6 }, name: { color: colors.white, fontSize: 29, fontWeight: "800", marginTop: 4 }, avatar: { height: 45, width: 45, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF20", borderColor: "#FFFFFF28", borderWidth: 1 }, avatarText: { color: colors.white, fontSize: 19, fontWeight: "700" }, welcomeText: { maxWidth: 300, color: "#D1E2E8", fontSize: 12, lineHeight: 18, marginTop: 12 },
  pill: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 7, marginTop: 14, backgroundColor: "#FFFFFF16", paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 }, pillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#59E6B8" }, pillText: { color: "#E2F4F1", fontSize: 9, letterSpacing: 0.8, fontWeight: "700" },
  heading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }, sectionTitle: { fontSize: 19, color: colors.ink, fontWeight: "800" }, sectionSub: { color: colors.muted, fontSize: 12, marginTop: 4 }, refresh: { width: 40, height: 40, borderRadius: 13, backgroundColor: "#E9F0FF", alignItems: "center", justifyContent: "center" },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 11 }, metric: { width: "48%", flexGrow: 1, minWidth: 140, padding: 15, backgroundColor: colors.white, borderRadius: 19, borderWidth: 1, borderColor: colors.line }, metricIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", marginBottom: 12 }, blueIcon: { backgroundColor: "#EAF0FF" }, mintIcon: { backgroundColor: colors.mintPale }, metricLabel: { color: colors.muted, fontSize: 11, textTransform: "capitalize" }, metricValue: { color: colors.ink, fontWeight: "800", fontSize: 22, marginTop: 4 }, metricHint: { color: "#198964", fontSize: 10, marginTop: 7, fontWeight: "600" },
  list: { backgroundColor: colors.white, borderRadius: 20, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 15 }, listRow: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 73, borderBottomColor: colors.line, borderBottomWidth: 1, paddingVertical: 11 }, lastRow: { borderBottomWidth: 0 }, rowIcon: { width: 39, height: 39, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#EDF2FF" }, feeIcon: { backgroundColor: colors.mintPale }, rowCopy: { flex: 1, minWidth: 0 }, rowTitle: { color: colors.ink, fontSize: 13, fontWeight: "700" }, rowDetail: { color: colors.muted, fontSize: 11, marginTop: 5, lineHeight: 16 },
  loadingCard: { minHeight: 170, backgroundColor: colors.white, borderRadius: 20, alignItems: "center", justifyContent: "center", gap: 11, borderColor: colors.line, borderWidth: 1 }, loadingText: { color: colors.muted, fontSize: 13 }, errorCard: { padding: 20, borderRadius: 19, backgroundColor: "#FFF1F2", borderWidth: 1, borderColor: "#FAD5DA" }, errorText: { fontSize: 12, color: "#9D4551", lineHeight: 18, marginTop: 6 }, retry: { minHeight: 43, paddingHorizontal: 14, borderRadius: 12, marginTop: 15, backgroundColor: colors.blue, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, alignSelf: "flex-start" }, retryText: { color: colors.white, fontSize: 12, fontWeight: "700" },
  empty: { minHeight: 210, backgroundColor: colors.white, borderRadius: 20, alignItems: "center", justifyContent: "center", padding: 25, borderWidth: 1, borderColor: colors.line }, emptyIcon: { height: 54, width: 54, borderRadius: 18, backgroundColor: "#EAF0FF", alignItems: "center", justifyContent: "center" }, emptyTitle: { color: colors.ink, fontSize: 16, fontWeight: "800", marginTop: 13 }, emptyText: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 6, maxWidth: 260 },
  attendanceCard: { backgroundColor: colors.white, borderRadius: 20, padding: 19, borderWidth: 1, borderColor: colors.line }, score: { alignItems: "center", paddingVertical: 16 }, percent: { color: colors.blue, fontSize: 40, fontWeight: "800" }, attendanceLine: { flexDirection: "row", alignItems: "center", gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line }, attendanceText: { color: colors.ink, fontSize: 12 },
  tip: { flexDirection: "row", alignItems: "center", gap: 12, padding: 15, borderRadius: 18, backgroundColor: "#E6F7F0", marginTop: 16 }, tipIcon: { height: 38, width: 38, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#C8F0E1" }, tipCopy: { flex: 1 }, tipTitle: { color: "#166D52", fontSize: 12, fontWeight: "800" }, tipText: { color: "#42846E", fontSize: 11, marginTop: 4 },
  tabBar: { minHeight: 72, paddingTop: 8, paddingBottom: 8, paddingHorizontal: 5, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: "row", justifyContent: "space-around", alignItems: "center" }, tabButton: { flex: 1, minWidth: 0, alignItems: "center", justifyContent: "center", gap: 3 }, tabIcon: { minWidth: 44, height: 31, borderRadius: 12, alignItems: "center", justifyContent: "center" }, tabIconOn: { backgroundColor: "#EAF0FF" }, tabLabel: { color: "#8995A6", fontSize: 9, fontWeight: "600" }, tabLabelOn: { color: colors.blue, fontWeight: "800" },
});
