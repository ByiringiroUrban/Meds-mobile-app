// Bundled country flags (no emoji dependence, renders the same on every platform).
import React from 'react';
import { Image, StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { SupportedCountry, THEME } from '../../constants/theme';

export const COUNTRY_FLAGS: Record<SupportedCountry, number> = {
  RW: require('../../../assets/flags/rw.png'),
  KE: require('../../../assets/flags/ke.png'),
  TZ: require('../../../assets/flags/tz.png'),
  UG: require('../../../assets/flags/ug.png'),
  BI: require('../../../assets/flags/bi.png'),
  SS: require('../../../assets/flags/ss.png'),
};

interface FlagProps {
  country: SupportedCountry;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export const Flag: React.FC<FlagProps> = ({ country, size = 'sm', style }) => (
  <View style={[styles.frame, size === 'md' ? styles.frameMd : styles.frameSm, style]}>
    <Image source={COUNTRY_FLAGS[country]} style={styles.image} resizeMode="cover" />
  </View>
);

const styles = StyleSheet.create({
  frame: {
    borderRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: THEME.colors.border,
    overflow: 'hidden',
    backgroundColor: THEME.colors.surface,
  },
  frameSm: {
    width: 21,
    height: 14,
  },
  frameMd: {
    width: 27,
    height: 18,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
