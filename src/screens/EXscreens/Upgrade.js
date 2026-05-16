import { StyleSheet, Text, View ,Image ,Linking , Platform , TouchableOpacity} from 'react-native'
import React from 'react'
import { useTranslation } from 'react-i18next';
import { AppStoreLink, fontFamily, googlePlayLink, onelink, senColor, textColor } from '../../utils/app';
import Gtyles from '../../styles/Gstyle';
import AppButton from '../../components/auth/Button';
import { useDispatch, useSelector } from 'react-redux';
import { UPGRADE } from '../../redux/actions/ActionTypes';
import { Dimensions } from 'react-native';


export default function Upgrade() {
  const {t,i18n} = useTranslation();
  var upgrade = useSelector(state => state.myApp.upgrade);
  const dispatch = useDispatch();
  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <Image style={styles.img} source={require('./../../../assets/images/upgrade.png')} />
        <View>
          <Text style={styles.title}>
            {t('upgrade.title')}
          </Text>
          <Text style={styles.des}>
            {t('upgrade.des')}
          </Text>
        </View>
      
        <AppButton title={t('upgrade.update')} primary={true} style={[Gtyles.button,Gtyles.primaryButton,{marginVertical: 15,width:Dimensions.get('window').width * 0.7}]} textStyle={{fontSize:18}} onPressP={()=>{Linking.openURL(onelink)}} /> 

        {
          (upgrade == 2) &&
          <TouchableOpacity onPress={()=>{
            dispatch({type:UPGRADE,payload:0})
          }}>
             <Text style={styles.not_now}>
                {t('upgrade.not_now')}
              </Text>
          </TouchableOpacity>
        }
      
      </View>
    
    </View>
  )
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    justifyContent:'center',
    alignItems:'center'
  },
  wrapper:{
    paddingHorizontal:'5%',
    height:'70%',
    // backgroundColor:'#ddd',
    flexDirection:'column',
    justifyContent:'space-evenly',
    alignItems:'center'
  },  
  title:{
    fontSize:22,
    fontFamily:'Tajawal-Bold',
    color:textColor,
    textAlign:'center'
  },
  des:{
    fontSize:16,
    fontFamily:'Tajawal-Regular',
    color:textColor,
    lineHeight:22,
    marginTop:15,
    textAlign:'center'
  },
  img:{
    width:160,
    height:160
  },
  not_now:{
    fontSize:17,
    fontFamily:'Tajawal-Bold',
    color:'#7a7a7a',
    textAlign:'center',
 
  }
})