
import React from 'react';
import {View,Text,ActivityIndicator,StyleSheet,TouchableOpacity} from 'react-native';
 
 
 
import { Ionicons } from '@react-native-vector-icons/ionicons';import { btnColor } from '../../utils/app';
import { useTranslation } from 'react-i18next';
 
 
 
export default function AppBtnSimple(props){ 
  
    const {title , iconName ,style, onPress, disabled,...otherProps} = props;
    
    return ( 
             <TouchableOpacity style={styles.button} onPress={onPress}>
                    <Ionicons name={iconName} size={14} color="#007bff" />
                    <Text style={styles.buttonText}>{title}</Text>
                  </TouchableOpacity>
        
    );
 
}

const styles = StyleSheet.create({

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#007bff',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  buttonText: {
    color: '#007bff',
    fontSize: 13,
    marginLeft: 6,
    fontFamily:'Tajawal-Bold',
  },
});