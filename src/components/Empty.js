import { StyleSheet, Text, View , Image} from 'react-native'
import React from 'react'
import { useTranslation } from 'react-i18next';
import { textColor } from '../utils/app';

export default function Empty(props) {
    const {tex} = props;
    const {t,i18n} = useTranslation();
  return (
    <View style={styles.wrapper}>
        <Image style={styles.image} source={require('../../assets/images/empty.png')} />
        <Text style={styles.tex}>{(tex) ? tex : t('nodata')}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    wrapper:{
        flex:1,
        
        justifyContent:'center',
        alignItems:'center',
        
    },
    image:{
        width:90,
        height:90,
    },
    tex:{
        fontSize:14,
        marginTop:16,
        color:textColor,
        fontFamily:'Tajawal-Bold'
    }
})