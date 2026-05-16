import { StyleSheet, Text, View , ScrollView ,Image } from 'react-native'
import React from 'react'
import { useTranslation } from 'react-i18next';
import { textColor } from '../../utils/app';
import { Ionicons } from '@react-native-vector-icons/ionicons';

export default function PaymentOptions(props) {
    const {t,i18n} = useTranslation();
    const {type} = props;
  return (
    <View horizontal={true} style={{backgroundColor:'white',padding:10,justifyContent:'flex-start',alignItems:'flex-start',flexDirection:'row'}}>
        <View style={styles.wrapper}>
           {
            (type == 'bank') &&
            <Ionicons name='checkmark-circle' style={styles.checkIcon} />
           }
            <Image source={require('./../../../assets/images/payments/credit-card.png')} style={styles.bimg}/>
            <Text style={styles.text}>{t('wallet.bank.title')}</Text>
        </View>

        <View style={styles.wrapper}>
           {
            (type == 'fawry') &&
            <Ionicons name='checkmark-circle' style={styles.checkIcon} />
           }
            <Image source={require('./../../../assets/images/payments/fawry.jpg')} style={styles.img}/>
            <Text style={styles.text}>{t('wallet.fawry.title')}</Text>
        </View>
         
    </View>
    
  )
}

const styles = StyleSheet.create({
    img:{
        height:39,
        width:39,
    },
bimg:{
    height:39,
    width:51,
},
wrapper:{
    backgroundColor:'white',
    borderColor:'#ddd',
    borderWidth:1,
    width:100,
    alignItems:'center',
    paddingVertical:10,
    borderRadius:2,
    marginHorizontal:8


},
text:{
    fontFamily:'Tajawal-Bold',
    color:textColor,
    fontSize:13,
    marginTop:8
},
checkIcon:{
    color:'green',
    fontSize:25,
    position:'absolute',
    zIndex:999,
    backgroundColor:'white',
    end:-10,
    
}
})