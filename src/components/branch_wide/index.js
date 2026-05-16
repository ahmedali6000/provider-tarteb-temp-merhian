import React from 'react';
import {View,Text,Image,TouchableNativeFeedback , ImageBackground} from 'react-native';
import styles from './style';
 
import ImageLoad from 'react-native-image-placeholder';
import { useNavigation } from '@react-navigation/native';
import PlatformTouchable from '../PlatformTouchable';
import FavHeart from '../favHeart/FavHeart';
import Gtyles from '../../styles/Gstyle';
import { cutLongText } from '../../utils/HelperFunctions';

 
export function BranchWide(props){
    const {branch} = props;
    
    const navigation = useNavigation();
    return (
        <PlatformTouchable onPress={() => {
            navigation.navigate('BranchCourtsScreen', {
                branch_id: branch.id,
                branch: branch
              });
        }}>
     <ImageBackground source={{ uri: branch.image,cache: 'default' }} resizeMode="cover" style={[Gtyles.shadowFullCard,styles.BranchWrapper,{paddingHorizontal:3}]} >
            <FavHeart id={branch.id} wished={branch.wished} />
          
            <View style={styles.textW}>
                <Text style={styles.title}> {cutLongText(branch.name,18)} </Text>
                <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                <Text style={styles.title2}> {branch.courts_num} courts </Text>
                <Text style={styles.title3}> {branch.min_price}/Hour </Text>
                </View>
                
            </View>
                 
         </ImageBackground>
        </PlatformTouchable>
    );
}