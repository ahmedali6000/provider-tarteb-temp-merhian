
import React from 'react';
import {View,Text,ActivityIndicator,StyleSheet} from 'react-native';
import PlatformTouchable from '../../PlatformTouchable';
import { Button  } from 'react-native-paper';
import styles from './style';
 import { Ionicons } from '@react-native-vector-icons/ionicons';

 
import Gtyles from '../../../styles/Gstyle';
import { btnColorDark } from '../../../utils/app';
 
export default function AppButton(props){ 
  
    const {title , primary ,style, otherName , onPressP , btn_style , isLoading ,textStyle, disabled,...otherProps} = props;

    return ( 
        <PlatformTouchable  {...otherProps} onPress={onPressP}> 
            <View style={style}>
            {isLoading ?
             (<ActivityIndicator size="large" color={primary ? "#FFFFFF" : btnColorDark} style={[btn_style,disabled?platStyle.disable:null]} />) 
             : 
             (<Text style={[(primary) ? Gtyles.primaryButtonText : Gtyles.secondaryButtonText,disabled?platStyle.disable:null,textStyle]}> {title} </Text>)

            }
            </View>
        </PlatformTouchable> 
        
    );
 
}

const platStyle = StyleSheet.create({
    disable : {
        opacity:0.6
    }
})