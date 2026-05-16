import React from 'react';
import {View,Text,Image , ImageBackground, TouchableOpacity, Dimensions} from 'react-native';
import styles from './style';
import ImageLoad from 'react-native-image-placeholder';
import { useNavigation } from '@react-navigation/native';
import PlatformTouchable from '../PlatformTouchable';
import Gtyles from '../../styles/Gstyle';
import { cutLongText, getRandomColor } from '../../utils/HelperFunctions';

 
export function CategoryBox(props){  
    const {category} = props;
    
    const navigation = useNavigation();
    return (
        <TouchableOpacity onPress={() => {
            if(category.childsCount == 0){
                navigation.navigate('CategoryScreen', {
                    category: category
                  });
            }else{
                navigation.navigate('SubCategoryScreen', {
                    category: category
                  });
            }
            
        }}>
            {/* ,backgroundColor:getRandomColor() */}
            <View style={{marginBottom:30,width:(Dimensions.get('window').width /4) - 10,}}>
            {category.bundles > 0 && (
            <View style={styles.badge}>
                    <Text style={styles.badgeText}>باقات</Text>
                </View>
           )}
        <View style={[styles.categoryWrapper,{ aspectRatio: 1, }]} >
           <View style={{backgroundColor:getRandomColor(),padding:15,borderRadius:45,justifyContent:'center',alignItems:'center',alignSelf:'center',width:'80%',height:'80%'}}>
           <ImageLoad
                isShowActivity={false}
                style={styles.image}
                loadingStyle={{ size: 'large', color: 'blue' }}
                source={{ uri: category.image,cache: 'default' }}
            />
           </View>
            
            <View style={{}}>
                <Text style={[styles.title,{textAlign:'center'}]}> {cutLongText(category.name,18)} </Text>
            </View>
                 
         </View>
         </View>
        </TouchableOpacity>
    );
}