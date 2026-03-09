import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Bell } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import { Spacing } from "@/src/constants/spacing";
import type { NextReminder } from "@/src/hooks/useDashboard";

interface UpcomingReminderCardProps {
  reminder: NextReminder | null;
}

const formatReminderTime = (date: Date): string => {
  const now = new Date();
  const diffMins = Math.round((date.getTime() - now.getTime()) / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  if (diffMins < 60) return `In ${diffMins}m · ${timeStr}`;
  if (diffHrs < 24) return `In ${diffHrs}h · ${timeStr}`;
  return `Tomorrow · ${timeStr}`;
};

export const UpcomingReminderCard = ({
  reminder,
}: UpcomingReminderCardProps) => {
  const { colors } = useTheme();
  if (!reminder) return null;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.xl,
          padding: Spacing.md,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
          gap: 12,
          ...Shadow.sm,
        },
        iconWrap: {
          width: 38,
          height: 38,
          borderRadius: 11,
          backgroundColor: colors.surface,
          justifyContent: "center",
          alignItems: "center",
        },
        content: { flex: 1, gap: 2 },
        label: {
          ...Typography.caption,
          color: colors.text.tertiary,
          fontWeight: "600",
          letterSpacing: 0.8,
        },
        title: {
          ...Typography.callout,
          color: colors.text.primary,
          fontWeight: "600",
        },
        body: { ...Typography.caption, color: colors.text.secondary },
        timeWrap: { alignItems: "flex-end" },
        time: {
          ...Typography.footnote,
          color: colors.text.secondary,
          fontWeight: "500",
          textAlign: "right",
        },
      }),
    [colors],
  );

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Bell size={16} color={colors.text.primary} strokeWidth={1.8} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>NEXT REMINDER</Text>
        <Text style={styles.title} numberOfLines={1}>
          {reminder.title}
        </Text>
        {reminder.body ? (
          <Text style={styles.body} numberOfLines={1}>
            {reminder.body}
          </Text>
        ) : null}
      </View>
      <View style={styles.timeWrap}>
        <Text style={styles.time}>
          {formatReminderTime(reminder.nextFireDate)}
        </Text>
      </View>
    </View>
  );
};
