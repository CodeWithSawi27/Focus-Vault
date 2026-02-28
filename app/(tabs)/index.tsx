import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../src/constants/theme';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dashboard</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  text: { ...Typography.title2, color: Colors.text.primary },
});