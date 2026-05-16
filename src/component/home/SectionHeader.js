import React from 'react';
import {View, StyleSheet} from 'react-native';
import AppText from '../../shared/AppText';

const SectionHeader = ({title}) => {
  return (
    <View style={styles.container}>
      <AppText weight="bold" style={styles.title}>
        {title}
      </AppText>
    </View>
  );
};

export default SectionHeader;

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
   
     
  },
  title: {
    fontSize: 18,
    color: '#222',
    textAlign:'justify'
    
  },
});