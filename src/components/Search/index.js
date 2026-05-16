import React from 'react';
import {View,TextInput,Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import Gtyles from '../../styles/Gstyle';
import PlatformTouchable from '../PlatformTouchable';
import styles from './style';
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from 'react-i18next';
import { textColor } from '../../utils/app';

export default function SearchInput(props){ 
    const navigation = useNavigation();
    const {t,i18n} = useTranslation();
    const {
        in_home,
        Tstyle,
        placeholderInput,
        real_input,
         ...rest
        } = props;
        
    

        const [hiddenPassword,changehiddenPassword] = React.useState(true);

            const [displayedText, setDisplayedText] = React.useState(''); // النص الذي سيظهر تدريجياً
           const fullText = t('pricing_guide.search_placeholder') + '... '; // النص الكامل

           React.useEffect(() => {
            // setTimeout(() => {
            //     let currentIndex = 0;

            // const interval = setInterval(() => {
            // if (currentIndex < fullText.length) {
            //     setDisplayedText((prevText) => prevText + fullText[currentIndex]);
            //     currentIndex++;
            // } else {
            //     clearInterval(interval); // عند الانتهاء من النص، أوقف المؤقت
            // }
            // }, 200); // إضافة حرف كل 200 مللي ثانية
            
            // return () => clearInterval(interval);  
            // }, 3000);
        },[]);
     return (
        
        <TouchableOpacity onPress={() => {navigation.navigate('Search')} }> 
            <View style={[styles.card,Tstyle]}>
                <View style={{ flexDirection:'column'}}>
                    <View style={{flexDirection:'row'}}>
                        {
                            !real_input && <View style={{flex:1,width:'100%',height:'100%',position:'absolute',zIndex:1111}}>
                            </View>
                        }
                        <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                            <Ionicons style={{marginEnd:5,color:'#828282'}} size={20} name='search' />
                        </View>
                        <TextInput  placeholder={t('pricing_guide.search_placeholder') + '... '} placeholderTextColor="#828282" {...rest } style={styles.input}  /> 
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

 