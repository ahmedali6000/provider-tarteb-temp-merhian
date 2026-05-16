import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import AppText from '../shared/AppText';
 
const AppButton = ({ title, onPress, style, textStyle }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <AppText weight="bold" style={[styles.text, textStyle]}>
        {title}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2D93D2',
    paddingVertical: 12, // تقليل الارتفاع ليكون أقل ضخامة
    paddingHorizontal: 20,
    borderRadius: 12, // حواف دائرية متوسطة كما في الصورة
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // يحافظ على العرض الكامل مع مراعاة الـ padding في الشاشة
    marginTop: 15,
    // إضافة ظل خفيف ليعطي مظهر احترافي
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    color: '#FFF',
    fontSize: 16, // حجم خط أنسب للزر الأصغر
  },
});

export default AppButton;