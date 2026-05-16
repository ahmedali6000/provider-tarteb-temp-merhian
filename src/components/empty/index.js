import { Text, StyleSheet, View ,Image} from 'react-native'
import React, { Component } from 'react'
import { useTranslation } from 'react-i18next';
import { textColor } from '../../utils/app';
 
export default function EmptyResults() {
  const {t,i18n} = useTranslation();
  
    return (
      <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
            <Image  style={styles.image} source={require("../../../assets/images/empty.png")} />
            <Text style={styles.text}>  {t('no_search_res')} </Text>
      </View>
    )
  }
 

const styles = StyleSheet.create({
    image:{
        width:90,
        height:90
    },
    text:{
      fontSize:14,
      marginTop:16,
      color:textColor,
      fontFamily:'Tajawal-Bold'
  }
})