import React from 'react';
import {View } from 'react-native';
 import { Ionicons } from '@react-native-vector-icons/ionicons';
import PlatformTouchable from "../PlatformTouchable";


export default function SocialButton(props){
    return (
        // <PlatformTouchable >
            <View  >
                <Ionicons name='facebook' /> 
            </View>
        // </PlatformTouchable>
    );

}