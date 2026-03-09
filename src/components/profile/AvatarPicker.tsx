import { useCallback, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "lucide-react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { Shadow } from "@/src/constants/theme";

interface AvatarPickerProps {
  currentBase64: string | null;
  displayName: string;
  onPick: (base64: string) => void;
  size?: number;
}

export const AvatarPicker = ({
  currentBase64,
  displayName,
  onPick,
  size = 96,
}: AvatarPickerProps) => {
  const { colors } = useTheme();
  const [processing, setProcessing] = useState(false);

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handlePick = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library in Settings.",
      );
      return;
    }
    let result: ImagePicker.ImagePickerResult;
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.2,
        base64: true,
        exif: false,
      });
    } catch {
      Alert.alert("Error", "Could not open photo library.");
      return;
    }
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert("Error", "Could not read image data. Please try again.");
      return;
    }
    const estimatedKB = Math.round((asset.base64.length * 0.75) / 1024);
    if (estimatedKB > 500) {
      Alert.alert(
        "Image Too Large",
        `This image is ~${estimatedKB}KB. Please crop tighter or choose a different photo.`,
      );
      return;
    }
    setProcessing(true);
    try {
      onPick(`data:image/jpeg;base64,${asset.base64}`);
    } finally {
      setProcessing(false);
    }
  }, [onPick]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrapper: { position: "relative", alignSelf: "center" },
        avatar: {
          backgroundColor: colors.surface,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 3,
          borderColor: colors.background,
          ...Shadow.md,
        },
        image: { resizeMode: "cover" },
        initials: {
          fontWeight: "600",
          color: colors.text.secondary,
          letterSpacing: -0.5,
        },
        badge: {
          position: "absolute",
          bottom: 2,
          right: 2,
          backgroundColor: colors.primary,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 2,
          borderColor: colors.background,
          ...Shadow.sm,
        },
      }),
    [colors],
  );

  return (
    <TouchableOpacity
      onPress={handlePick}
      activeOpacity={0.8}
      style={styles.wrapper}
      disabled={processing}
    >
      <View
        style={[
          styles.avatar,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        {processing ? (
          <ActivityIndicator color={colors.text.tertiary} />
        ) : currentBase64 ? (
          <Image
            source={{ uri: currentBase64 }}
            style={[
              styles.image,
              { width: size, height: size, borderRadius: size / 2 },
            ]}
          />
        ) : (
          <Text style={[styles.initials, { fontSize: size * 0.32 }]}>
            {initials || "?"}
          </Text>
        )}
      </View>

      <View
        style={[
          styles.badge,
          {
            width: size * 0.28,
            height: size * 0.28,
            borderRadius: size * 0.14,
          },
        ]}
      >
        {processing ? (
          <ActivityIndicator size="small" color={colors.text.inverse} />
        ) : (
          <Camera
            size={size * 0.14}
            color={colors.text.inverse}
            strokeWidth={2}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};
