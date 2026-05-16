import React from 'react';
import {View,Text,Image , ImageBackground} from 'react-native';
import styles from './style';
import ImageLoad from 'react-native-image-placeholder';
import { useNavigation } from '@react-navigation/native';
import PlatformTouchable from '../PlatformTouchable';
import Gtyles from '../../styles/Gstyle';
import { arabic_num, cutLongText, getRandomColor } from '../../utils/HelperFunctions';
import { btnColorDark, textColor } from '../../utils/app';
import FavHeart from '../favHeart/FavHeart';
import { useTranslation } from 'react-i18next';

 
export function ServiceBox(props){
    const {service} = props;
    const {t,i18n} = useTranslation();
    const navigation = useNavigation();
    return (
        <PlatformTouchable onPress={() => { 
            navigation.navigate('ServiceScreen', {
                service: service
              });
        }}>
            {/* ,backgroundColor:getRandomColor() */}
        <View style={[styles.serviceWrapper,{paddingHorizontal:3}]} >
       
            <ImageLoad
                isShowActivity={false}
                style={styles.service_image}
                loadingStyle={{ size: 'large', color: 'blue' }}
                source={{ uri: service.image}}
            />
             <View style={{position:'absolute',zIndex:99999,top:7,end:7}}>
             <FavHeart id={service.id} wished={service.wished} />
             </View>
            <View style={{width:'100%',height:55,justifyContent:'space-around'}}>
                <Text style={[styles.title,(i18n.language == 'ar') &&  {alignSelf:'flex-start'}]}> {cutLongText(service.name,23)} </Text>
                <View style={{flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>
                    <Text style={{fontSize:11,color:textColor,fontFamily:'Tajawal-Regular'}}> {t('start_from')} </Text>
                    <Text style={{fontSize:14,color:textColor,fontFamily:'Tajawal-Regular',color:btnColorDark}}> {arabic_num(service.price)} {t('cur')} </Text>
                </View>
                
            </View>
          
         </View>
        </PlatformTouchable>
    );
}