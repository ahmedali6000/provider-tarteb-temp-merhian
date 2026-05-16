// import React from 'react';
// import { View, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
// import AppText from '../shared/AppText';

import React from 'react';
import { View, TextInput, StyleSheet, Image, TouchableOpacity, Platform, I18nManager } from 'react-native';
import AppText from '../shared/AppText';

const PhoneInput = ({ 
  value, 
  onChangeText, 
  country, 
  onOpenSheet, 
  error, 
  onClear 
}) => {
  return (
    <View style={styles.container}>
      <View style={[
        styles.inputWrapper, 
        error && styles.errorBorder // حواف حمراء عند الخطأ
      ]}>
        {/* الجزء الخاص باختيار الدولة */}
        <TouchableOpacity 
          style={styles.countryPicker} 
          activeOpacity={0.7}
          onPress={onOpenSheet}
        >
          <Image source={require('./../../assets/app/images/icons/arrow-down.png')} style={styles.arrowIcon} />
          <Image source={country.flag} style={styles.flagIcon} />
          <AppText style={styles.countryCode}>{country.code}</AppText>
        </TouchableOpacity>

        {/* خط فاصل عمودي خفيف */}
        <View style={styles.divider} />

        {/* حقل إدخال الرقم */}
        <TextInput
          style={styles.input}
          placeholder="100 000 000"
          placeholderTextColor="#C0C0C0"
          
          keyboardType="phone-pad"
          value={value}
          onChangeText={onChangeText}
          textAlign="left"
          writingDirection="ltr"
        />

        {/* أيقونة المسح عند الخطأ */}
        {error && (
          <TouchableOpacity onPress={onClear} style={styles.clearIconWrapper}>
            <Image source={require('./../../assets/app/images/icons/close-circle.png')}style={styles.errorIcon} />
          </TouchableOpacity>
        )}
      </View>
      
      {/* رسالة الخطأ تحت الحقل */}
      {error && (
        <AppText style={styles.errorText}>{error}</AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 10,
    
  },
 inputWrapper: {
  flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
  alignItems: 'center',
  backgroundColor: '#FFF',
  borderWidth: 1,
  borderColor: '#E8E8E8',
  borderRadius: 12,
  height: 55,
  overflow: 'hidden',
},

countryPicker: {
   flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
  alignItems: 'center',
  paddingHorizontal: 12,
  backgroundColor: '#F9F9F9',
  height: '100%',
},
  errorBorder: {
    borderColor: '#FF4D4D', // لون أحمر للحدود عند الخطأ
  },
 
  flagIcon: {
    width: 24,
    height: 16,
    marginHorizontal: 8,
    borderRadius: 2,
  },
  arrowIcon: {
    width: 10,
    height: 6,
    tintColor: '#333',
  },
  countryCode: {
    fontSize: 16,
    color: '#666',
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: '#E8E8E8',
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    fontSize: 18,
    color: '#333',
    // textAlign:'left'
    
  },
  clearIconWrapper: {
    paddingHorizontal: 10,
  },
  errorIcon: {
    width: 20,
    height: 20,
    tintColor: '#FF4D4D',
  },
  errorText: {
    color: '#FF4D4D',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
    marginRight: 5,
  },
});

export default PhoneInput;
