import React from 'react';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import AppText from '../../shared/AppText';

const WalletTabButton = ({
  title,
  onPress,
  iconName,
  iconColor = '#F0830F',
  backgroundColor = '#F5EBDD',
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.button, {backgroundColor}, style]}>
      <View style={styles.row}>
        <Ionicons name={iconName} size={18} color={iconColor} />
        <AppText weight="medium" style={styles.title}>
          {title}
        </AppText>
      </View>
    </TouchableOpacity>
  );
};

export default WalletTabButton;

const styles = StyleSheet.create({
  button: {
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    color: '#1F1F1F',
    marginStart: 6,
  },
});