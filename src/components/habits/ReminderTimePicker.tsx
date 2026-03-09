import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { Bell, BellOff, X, Check } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Typography, Radius, Shadow } from "@/src/constants/theme";
import { Spacing } from "@/src/constants/spacing";

interface ReminderTimePickerProps {
  value: string | null;
  onChange: (time: string | null) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];
const pad = (n: number) => n.toString().padStart(2, "0");

const formatDisplay = (time: string | null): string => {
  if (!time) return "No reminder";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${pad(m)} ${period}`;
};

export const ReminderTimePicker = ({
  value,
  onChange,
}: ReminderTimePickerProps) => {
  const { colors } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(() =>
    !value ? 9 : parseInt(value.split(":")[0], 10),
  );
  const [selectedMinute, setSelectedMinute] = useState(() =>
    !value ? 0 : parseInt(value.split(":")[1], 10),
  );

  const handleConfirm = useCallback(() => {
    onChange(`${pad(selectedHour)}:${pad(selectedMinute)}`);
    setModalVisible(false);
  }, [selectedHour, selectedMinute, onChange]);

  const handleClear = useCallback(() => {
    onChange(null);
    setModalVisible(false);
  }, [onChange]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        triggerRow: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: colors.surfaceStrong,
          borderRadius: Radius.md,
          padding: 14,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.border,
        },
        triggerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
        iconWrap: {
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: colors.surface,
          justifyContent: "center",
          alignItems: "center",
        },
        iconWrapActive: { backgroundColor: colors.surface },
        triggerLabel: {
          ...Typography.footnote,
          color: colors.text.tertiary,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          fontWeight: "600",
        },
        triggerValue: {
          ...Typography.callout,
          color: colors.text.primary,
          fontWeight: "500",
          marginTop: 1,
        },
        triggerValueEmpty: { color: colors.text.tertiary },
        triggerEdit: {
          ...Typography.subhead,
          color: colors.text.tertiary,
          fontWeight: "500",
        },
        overlay: {
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "flex-end",
        },
        sheet: {
          backgroundColor: colors.background,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingBottom: 40,
          ...Shadow.md,
        },
        sheetHeader: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 16,
        },
        sheetTitle: {
          ...Typography.headline,
          color: colors.text.primary,
          fontWeight: "600",
        },
        closeBtn: {
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: colors.surface,
          justifyContent: "center",
          alignItems: "center",
        },
        divider: {
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.border,
        },
        preview: { alignItems: "center", paddingVertical: 24, gap: 4 },
        previewTime: {
          fontSize: 48,
          fontWeight: "200",
          color: colors.text.primary,
          letterSpacing: -2,
          fontVariant: ["tabular-nums"],
        },
        previewSub: {
          ...Typography.footnote,
          color: colors.text.tertiary,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          fontWeight: "600",
        },
        pickerLabel: {
          ...Typography.caption,
          color: colors.text.tertiary,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          fontWeight: "600",
          paddingHorizontal: 20,
          marginBottom: 8,
          marginTop: 16,
        },
        pickerRow: { paddingHorizontal: 20, gap: 6 },
        minuteRow: { flexDirection: "row", paddingHorizontal: 20, gap: 8 },
        timeChip: {
          paddingHorizontal: 14,
          paddingVertical: 9,
          borderRadius: Radius.full,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: "transparent",
        },
        minuteChip: { flex: 1, alignItems: "center" },
        timeChipActive: {
          backgroundColor: colors.primary,
          borderColor: colors.primary,
        },
        timeChipText: {
          ...Typography.subhead,
          color: colors.text.secondary,
          fontWeight: "500",
          fontVariant: ["tabular-nums"],
        },
        timeChipTextActive: { color: colors.text.inverse, fontWeight: "600" },
        actions: {
          flexDirection: "row",
          paddingHorizontal: 20,
          gap: 10,
          marginTop: 24,
        },
        clearBtn: {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderRadius: Radius.full,
          backgroundColor: colors.accent.redMuted,
          borderWidth: 1,
          borderColor: colors.accent.red + "30",
        },
        clearText: {
          ...Typography.subhead,
          color: colors.accent.red,
          fontWeight: "500",
        },
        confirmBtn: {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          backgroundColor: colors.primary,
          borderRadius: Radius.full,
          paddingVertical: 14,
          ...Shadow.sm,
        },
        confirmText: {
          ...Typography.subhead,
          color: colors.text.inverse,
          fontWeight: "600",
        },
      }),
    [colors],
  );

  return (
    <>
      <TouchableOpacity
        style={styles.triggerRow}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.triggerLeft}>
          <View style={[styles.iconWrap, value ? styles.iconWrapActive : null]}>
            {value ? (
              <Bell size={15} color={colors.text.primary} strokeWidth={1.8} />
            ) : (
              <BellOff
                size={15}
                color={colors.text.tertiary}
                strokeWidth={1.8}
              />
            )}
          </View>
          <View>
            <Text style={styles.triggerLabel}>Daily Reminder</Text>
            <Text
              style={[styles.triggerValue, !value && styles.triggerValueEmpty]}
            >
              {formatDisplay(value)}
            </Text>
          </View>
        </View>
        <Text style={styles.triggerEdit}>{value ? "Change" : "Set"}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.sheet}
            onPress={() => {}}
          >
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Set Reminder</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <X size={18} color={colors.text.secondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <View style={styles.preview}>
              <Text style={styles.previewTime}>
                {formatDisplay(`${pad(selectedHour)}:${pad(selectedMinute)}`)}
              </Text>
              <Text style={styles.previewSub}>Daily reminder</Text>
            </View>

            <Text style={styles.pickerLabel}>Hour</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pickerRow}
            >
              {HOURS.map((h) => (
                <TouchableOpacity
                  key={h}
                  style={[
                    styles.timeChip,
                    selectedHour === h && styles.timeChipActive,
                  ]}
                  onPress={() => setSelectedHour(h)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      selectedHour === h && styles.timeChipTextActive,
                    ]}
                  >
                    {pad(h)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.pickerLabel}>Minute</Text>
            <View style={styles.minuteRow}>
              {MINUTES.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.timeChip,
                    styles.minuteChip,
                    selectedMinute === m && styles.timeChipActive,
                  ]}
                  onPress={() => setSelectedMinute(m)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      selectedMinute === m && styles.timeChipTextActive,
                    ]}
                  >
                    :{pad(m)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.actions}>
              {value && (
                <TouchableOpacity
                  style={styles.clearBtn}
                  onPress={handleClear}
                  activeOpacity={0.7}
                >
                  <BellOff
                    size={15}
                    color={colors.accent.red}
                    strokeWidth={1.8}
                  />
                  <Text style={styles.clearText}>Remove</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Check
                  size={16}
                  color={colors.text.inverse}
                  strokeWidth={2.5}
                />
                <Text style={styles.confirmText}>Set Reminder</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};
