import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

const CRIT = require('../../assets/crit.png');

export function CritAvatar({ size = 36 }: { size?: number }) {
  return <Image source={CRIT} style={{ width: size, height: size, borderRadius: size / 2 }} accessibilityLabel="Crit" />;
}

/** Avatar plus the "Crit" name above Crit's take. */
export function CritHeader() {
  return (
    <View style={styles.row}>
      <CritAvatar size={34} />
      <Text style={styles.name}>Crit</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  name: { color: colors.text, fontSize: 15, fontWeight: '700' },
});
