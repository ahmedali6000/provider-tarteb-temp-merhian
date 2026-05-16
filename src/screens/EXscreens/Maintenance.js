import { StyleSheet, Text, View ,Image ,Linking , Platform , TouchableOpacity} from 'react-native'
import React from 'react'
import { useTranslation } from 'react-i18next';
import { AppStoreLink, googlePlayLink, onelink, senColor, textColor } from '../../utils/app';
import Gtyles from '../../styles/Gstyle';
import AppButton from '../../components/auth/Button';
import { useDispatch, useSelector } from 'react-redux';
import { UPGRADE } from '../../redux/actions/ActionTypes';


export default function Maintenance() {
  const {t,i18n} = useTranslation();
  var upgrade = useSelector(state => state.myApp.upgrade);
  const dispatch = useDispatch();
  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <Image style={styles.img} source={require('./../../../assets/images/fix.png')} />
        <View>
          <Text style={styles.title}>
            {t('maintenance.title')}
          </Text>
          <Text style={styles.des}>
            {t('maintenance.des')}
          </Text>
        </View>
      
       

        
      
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
    lineHeight:26,
    marginTop:15,
    textAlign:'center'
  },
  img:{
    width:160,
    height:160
  },
  not_now:{
    fontSize:19,
    fontFamily:'Tajawal-Bold',
    color:'#7a7a7a',
    textAlign:'center'
  }
})