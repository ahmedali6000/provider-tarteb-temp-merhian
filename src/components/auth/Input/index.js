import React from 'react';
import { useTranslation } from 'react-i18next';
import {View,TextInput,Text,Image, Platform } from 'react-native';
import { Card } from 'react-native-paper';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Gtyles from '../../../styles/Gstyle';
import PlatformTouchable from '../../PlatformTouchable';
import styles from './style';
import { placeholder_color } from '../../../utils/app';


export default function AppInput(props){ 
    // const dispatch = useDispatch();
    // const recieved_countries = useSelector(state => state.auth.countries_arr);
    // const selected_coutntry = useSelector(state => state.auth.selected_coutntry);
    const {
        icon,
        image,
        gift,
        showVlidationfeedback,
        isValid,
        country_key,
        touchUser,
        span,
        style,
        disabled,
        err,
        phone_key,
        traditionalInput,
        isphoneKeyStyle,
        isPassword,
        placeholderInput,
        placeholderTextColor,
         ...rest
        } = props;
        
        React.useEffect(() => {
            
        },[]);

        const [hiddenPassword,changehiddenPassword] = React.useState(true);
        const {t,i18n} = useTranslation();
         
     return (
        
            <View style={[styles.inputbody,style,(err) && styles.cardErr,(gift) && {backgroundColor:'rgba(183, 255, 168,0.5)'}]}>
                <View style={{ flexDirection:'column',paddingVertical:5 }}>
                     

                    <View style={{flexDirection:'row'}}>
                        
                        {traditionalInput
                        &&
                         <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                        <Ionicons style={{fontSize:17,marginEnd:8,fontWeight:'bold'}} name={icon} />
                          
                         </View>
                        }

                        {isphoneKeyStyle
                        &&
                         <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                            {
                                <Ionicons style={{fontSize:17,marginEnd:8}} name='phone-portrait-outline' />
                            }
                         
                            <Text> {phone_key} </Text>
                         </View>
                        }
                        {
                            isPassword && 
                            <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center', }}>
                            <Ionicons style={{fontSize:17,marginEnd:8}} name='lock-closed-outline' />
                            </View>
                        }
                        {/* placeholderTextColor={placeholder_color}  */}
                        <TextInput editable={(disabled) ? false : true} secureTextEntry={isPassword && hiddenPassword} placeholderTextColor={(placeholderTextColor) ? placeholderTextColor : '#9c9c9c'} placeholder={placeholderInput} {...rest } style={[styles.input,(i18n.language == 'ar') && {textAlign:'right'},]}  />
            
                        {showVlidationfeedback && touchUser &&  (
                            <View style={{padding:6,flexDirection:'column',justifyContent:'center'}}>
                                <Ionicons name={isValid ? 'checkmark-circle-outline' : 'close'} style={{color: isValid ? 'green' : 'red',fontSize:17}} />
                            </View>
                        )}

                        {
                            isPassword && 
                            <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                            <PlatformTouchable onPress={() => changehiddenPassword(!hiddenPassword)}>
                                <Ionicons style={{fontSize:20,marginEnd:0}} name={hiddenPassword ? 'eye' : 'eye-off' } />
                            </PlatformTouchable>
                            </View>
                        }
                    </View>
                </View>
                </View>
                
            
        
    );
}

 