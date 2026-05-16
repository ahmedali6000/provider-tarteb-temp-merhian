
import { useNavigation } from '@react-navigation/native';
import React from 'react'
import {View} from 'react-native'
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { textColor } from '../../utils/app';
import PlatformTouchable from '../PlatformTouchable';


export default function BackArraw(props){
    const navigation = useNavigation();
    const {st} = props;

return (
    <View style={{paddingEnd:15,paddingTop:10}}>
    <PlatformTouchable onPress={() => {navigation.goBack()}}>
      <Ionicons style={[{color:textColor,fontWeight:'bold',fontSize:20},st]} name="arrow-back-ios" />
    </PlatformTouchable>
  </View>
);
}