import { useEffect, useState } from "react";
import { StatusBar } from "react-native";
import { LaunchScreen } from "./src/components/LaunchScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { useAuthStore } from "./src/store/authStore";

export default function App() {
  const token = useAuthStore((state) => state.token);
  const hydrate = useAuthStore((state) => state.hydrate);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    async function boot() {
      await hydrate();
      await new Promise((resolve) => setTimeout(resolve, 900));
      if (alive) setReady(true);
    }
    void boot();
    return () => { alive = false; };
  }, [hydrate]);

  if (!ready) return <><StatusBar barStyle="light-content" /><LaunchScreen /></>;
  return <><StatusBar barStyle="dark-content" />{token ? <HomeScreen /> : <LoginScreen />}</>;
}
