import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from "react-native";
import { Target, Check } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import { Spacing } from "@/src/constants/spacing";

interface WeeklyGoalCardProps {
  goalMinutes: number;
  completedMinutes: number;
  progress: number;
  onUpdateGoal: (minutes: number) => void;
}

export const WeeklyGoalCard = ({
  goalMinutes,
  completedMinutes,
  progress,
  onUpdateGoal,
}: WeeklyGoalCardProps) => {
  const { colors } = useTheme();
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState("");

  const goalHours = (goalMinutes / 60).toFixed(1);
  const completedHours = (completedMinutes / 60).toFixed(1);
  const pct = Math.round(progress * 100);

  const handleConfirm = useCallback(() => {
    const hrs = parseFloat(inputVal);
    if (!isNaN(hrs) && hrs > 0) onUpdateGoal(Math.round(hrs * 60));
    setEditing(false);
    setInputVal("");
    Keyboard.dismiss();
  }, [inputVal, onUpdateGoal]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          alignSelf: "stretch",
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.lg,
          padding: Spacing.md,
          gap: 10,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          ...Shadow.sm,
        },
        topRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
        label: {
          ...Typography.footnote,
          color: colors.text.secondary,
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        },
        editBtn: {
          ...Typography.footnote,
          color: colors.text.tertiary,
          textDecorationLine: "underline",
        },
        editRow: { flexDirection: "row", alignItems: "center", gap: 6 },
        input: {
          ...Typography.subhead,
          color: colors.text.primary,
          borderBottomWidth: 1,
          borderColor: colors.text.primary,
          paddingVertical: 2,
          minWidth: 40,
          textAlign: "center",
        },
        inputUnit: { ...Typography.caption, color: colors.text.tertiary },
        confirmBtn: {
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: colors.text.primary,
          justifyContent: "center",
          alignItems: "center",
        },
        barTrack: {
          height: 6,
          backgroundColor: colors.surface,
          borderRadius: 3,
          overflow: "hidden",
        },
        barFill: {
          height: "100%",
          backgroundColor: colors.accent.blue,
          borderRadius: 3,
          maxWidth: "100%",
        },
        statsRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        statsText: { ...Typography.caption, color: colors.text.tertiary },
        statsHighlight: { color: colors.text.primary, fontWeight: "600" },
        pctText: {
          ...Typography.caption,
          color: colors.text.tertiary,
          fontWeight: "600",
        },
        pctDone: { color: colors.accent.green },
      }),
    [colors],
  );

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <Target size={14} color={colors.text.secondary} strokeWidth={2} />
          <Text style={styles.label}>Weekly Goal</Text>
        </View>
        {editing ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.input}
              value={inputVal}
              onChangeText={(t) => setInputVal(t.replace(/[^0-9.]/g, ""))}
              placeholder={goalHours}
              placeholderTextColor={colors.text.tertiary}
              keyboardType="decimal-pad"
              autoFocus
              maxLength={4}
              returnKeyType="done"
              onSubmitEditing={handleConfirm}
            />
            <Text style={styles.inputUnit}>hrs</Text>
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmBtn}>
              <Check size={14} color={colors.text.inverse} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setEditing(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.editBtn}>Edit goal</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${Math.min(pct, 100)}%` }]} />
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.statsText}>
          <Text style={styles.statsHighlight}>{completedHours}h</Text> of{" "}
          {goalHours}h completed this week
        </Text>
        <Text style={[styles.pctText, progress >= 1 && styles.pctDone]}>
          {progress >= 1 ? "🎯 Goal met!" : `${pct}%`}
        </Text>
      </View>
    </View>
  );
};
