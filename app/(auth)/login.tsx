import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '@/constants/theme';

// Placeholder — full implementation in auth feature phase
export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FocusVault</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  title: { ...Typography.largeTitle, color: Colors.text.primary },
});