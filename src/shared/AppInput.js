import React from 'react';
import {TextInput, StyleSheet} from 'react-native';
import useAppFont from '../hooks/useAppFont';
 
const AppInput = props => {
  const {fontFamily} = useAppFont();

  return (
    <TextInput
      {...props}
      style={[styles.input, {fontFamily}, props.style]}
      placeholderTextColor="#9B9B9B"
    />
  );
};

export default AppInput;

const styles = StyleSheet.create({
  input: {
    fontSize: 14,
    color: '#222',
  },
});