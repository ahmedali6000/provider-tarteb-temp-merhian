import React from 'react';
import {TouchableOpacity,TouchableNativeFeedback , Platform} from 'react-native';


export default function PlatformTouchable(props) {

    const {disabledProp,...rest} = props;
    // const Touchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;
    const Touchable = Platform.select({
        android: TouchableNativeFeedback,
        ios: TouchableOpacity
    });
    return (
        <Touchable disabledProp {...rest} />
        /**
         * you may face aproblem in ios version so at this time use this code
         * <Touchable {...rest}>
            <View style={style}>
                {children}
            </View>
        </Touchable>
            */
    ); 
}