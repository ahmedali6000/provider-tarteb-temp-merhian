import React from 'react';
import { TouchableOpacity, StyleSheet, Image, View } from 'react-native';
import AppText from '../shared/AppText';

const SocialButton = ({ title, icon, onPress, type = 'google' }) => {
  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Image 
          source={icon} 
          style={[styles.icon, type === 'apple' && styles.appleIcon]} 
          resizeMode="contain"
        />
        <AppText weight="bold" style={styles.text}>
          {title}
        </AppText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 15,
    paddingVertical: 14,
    width: '100%',
    marginBottom: 15,
    // ظل خفيف جداً
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    flexDirection: 'row-reverse', // ليتناسب مع التصميم العربي
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    marginLeft: 12,
  },
  appleIcon: {
    width: 22,
    height: 22,
    tintColor: '#000', // أيقونة أبل سوداء
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

export default SocialButton;
