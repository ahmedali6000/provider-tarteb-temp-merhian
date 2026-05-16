import { StyleSheet, Text, View ,Image} from 'react-native'
import React from 'react'
import Gtyles from '../../styles/Gstyle';
import { arabic_num, cutLongText } from '../../utils/HelperFunctions';
import FavHeart from '../favHeart/FavHeart';
import { btnColorDark, textColor } from '../../utils/app';
import PlatformTouchable from '../PlatformTouchable';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

export default function ServiceWide(props) {
const {service} = props;
const {t,i18n} = useTranslation();
const navigation = useNavigation();

  return (
    <PlatformTouchable onPress={() => {
        navigation.navigate('ServiceScreen', {
            service: service
          });
    }}>
    <View style={[Gtyles.shadowFullCard,{flexDirection:'row',paddingHorizontal:5,flexDirection:'column',justifyContent:'center'}]}>
    
        <View style={{flexDirection:'row'}}>
           <View style={{position:'absolute',zIndex:99999,top:7,end:7}}>
            <FavHeart id={service.id} wished={service.wished} />
        </View>
        <View style={{flexDirection:'column',justifyContent:'center'}}> 
            <Image style={styles.image} source={{uri: service.image}} />    
        
        </View>
        <View style={{flex:1,justifyContent:'center'}}>
            <View style={{paddingStart:8,paddingVertical:8, }}>
                <Text style={{fontSize:14,color:'black',fontFamily:'Tajawal-Regular',alignSelf:'flex-start'}}> {cutLongText(service.name,26)} </Text>
            </View>
            <View style={{ }}>
                <View style={{justifyContent:'space-between',flexDirection:'row',flex:1,padding:5}}>
                    <View style={{borderWidth:1,borderColor:'#808080',alignSelf:'flex-start',paddingVertical:6,paddingHorizontal:10,borderRadius:40,marginStart:5}}>
                        <Text style={{fontSize:12,color:textColor,fontFamily:'Tajawal-Regular'}}>
                        {service.category_name}
                    </Text>
                    </View>
                    
                    <Text style={{alignSelf:'flex-start',paddingHorizontal:10,fontSize:14,color:btnColorDark,fontFamily:'Tajawal-Regular'}}>
                        { arabic_num(service.price) } {t('cur')}
                    </Text>
                </View>
                
                
            </View>
        </View>
        </View>
    </View>
    </PlatformTouchable>
  )
}

const styles = StyleSheet.create({
    image:{
        width: 100,
        height: 100,
        borderRadius:4
    }
})