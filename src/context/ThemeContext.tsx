import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { useColorScheme, Appearance } from "react-native";
import { useThemeStore } from "@/src/store/themeStore";
import {
  resolveColors,
  type AppColors,
  type ThemePreference,
} from "@/src/constants/theme";

interface ThemeContextValue {
  colors: AppColors;
  preference: ThemePreference;
  isDark: boolean;
  setPreference: (p: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { preference, setPreference, hydrated, hydrate } = useThemeStore();

  // useColorScheme() can return null on first render in Expo Go.
  // Appearance.getColorScheme() is synchronous and reflects the real
  // OS value immediately — use it as the null-safe fallback.
  const rnScheme = useColorScheme();
  const systemScheme = rnScheme ?? Appearance.getColorScheme() ?? "light";

  useEffect(() => {
    hydrate();
  }, []);

  const colors = useMemo(
    () => resolveColors(preference, systemScheme),
    [preference, systemScheme],
  );

  // Derive isDark logically — avoids reference equality fragility.
  const isDark = useMemo(() => {
    if (preference === "dark") return true;
    if (preference === "light") return false;
    return systemScheme === "dark"; // preference === "system"
  }, [preference, systemScheme]);

  const value = useMemo(
    () => ({ colors, preference, isDark, setPreference }),
    [colors, preference, isDark, setPreference],
  );

  if (!hydrated) return null;

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
