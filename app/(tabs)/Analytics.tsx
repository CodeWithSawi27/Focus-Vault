import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { logoutUser } from '@/src/services/authService';
import { Colors, Typography } from '@/src/constants/theme';

const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleLogout = async () => {
    setLoading(true);
    setError('');
    try {
      await logoutUser();
      console.log('✅ User logged out successfully');
      // TODO: navigate to login screen if using router
    } catch (e: any) {
      setError(e.message ?? 'Logout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analytics</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={loading}
      >
        <Text style={styles.logoutButtonText}>
          {loading ? 'Logging out...' : 'Logout'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
    gap: 16,
  },
  title: {
    ...Typography.largeTitle,
    color: Colors.text.primary,
    marginBottom: 20,
  },
  error: {
    ...Typography.footnote,
    color: Colors.accent.red,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    ...Typography.subhead,
    color: Colors.text.inverse,
    fontWeight: '600',
  },
});

export default Analytics;