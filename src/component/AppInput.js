import React from 'react';
import { View, TextInput, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AppText from '../shared/AppText'; // Assuming AppText is in a 'shared' folder
import useAppFont from '../hooks/useAppFont';
 
const AppInput = ({ label, placeholder, value, onChangeText, icon, keyboardType = 'default', autoCapitalize = 'none', secureTextEntry = false, error, onClear, style, inputStyle, labelStyle, iconStyle, showClearButton = false, ...props }) => {
    const {fontFamily} = useAppFont();
  return (
    <View style={[styles.container, style]}>
      {label && <AppText style={[styles.label, labelStyle]}>{label}</AppText>}
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        {icon && (
          typeof icon === 'string' ? (
            <AppText style={[styles.iconText, iconStyle]}>{icon}</AppText>
          ) : (
            <Image source={icon} style={[styles.iconImage, iconStyle]} />
          )
        )}
        <TextInput
          style={[styles.textInput, inputStyle,{fontFamily}]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          placeholderTextColor="#999"
          {...props}
        />
        {showClearButton && value !== '' && (
          <TouchableOpacity onPress={onClear} style={styles.clearButton}>
            <AppText style={styles.clearButtonText}>x</AppText>
          </TouchableOpacity>
        )}
        
      </View>
      {error && <AppText style={styles.errorText}>{error}</AppText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    textAlign: 'left',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E6E7',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#ffffff',
    height: 50,
  },
  inputWrapperError: {
    borderColor: 'red',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    textAlign: 'auto', // Default for RTL
    writingDirection: 'ltr', // Force LTR for input content (especially numbers)
    paddingVertical: 0,
  },
  iconText: {
    fontSize: 16,
    color: '#999',
    marginEn: 10,
  },
  iconImage: {
    width: 20,
    height: 20,
    marginEn: 10,
    resizeMode: 'contain',
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#999',
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginTop: 5,
    textAlign: 'left',
  },
});

export default AppInput;