import React from 'react';
import { TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import AppText from '../shared/AppText';
 


const LanguageOption = ({ label, subLabel, icon, selected, onSelect }) => {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selectedContainer]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
        <View style={styles.radioCircle}>
        {selected && <View style={styles.selectedRb} />}
      </View>
    <View style={styles.content}>
       
      
         <AppText weight="bold" style={styles.label}>{label}</AppText>
           {icon && <Image source={icon} style={styles.icon} />}
      </View>
      
      
     
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
    marginBottom: 15,
    width: '100%',
  },
  selectedContainer: {
    borderColor: '#3498db',
    backgroundColor: '#F0F8FF',
    borderWidth:1.5
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3498db',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginHorizontal: 10,
    color: '#333',
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

export default LanguageOption;