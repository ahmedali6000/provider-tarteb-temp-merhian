import React from 'react';
import {TouchableOpacity, StyleSheet} from 'react-native';
import AppText from '../../shared/AppText';

const WalletActionButton = ({
  title,
  onPress,
  backgroundColor = '#F0830F',
  textColor = '#FFFFFF',
  style,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[styles.button, {backgroundColor}, style]}>
      <AppText weight="bold" style={[styles.text, {color: textColor}, textStyle]}>
        {title}
      </AppText>
    </TouchableOpacity>
  );
};

export default WalletActionButton;

const styles = StyleSheet.create({
  button: {
    minWidth: 88,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 14,
  },
});