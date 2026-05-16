import React, { useEffect } from 'react';
import {TextInput,ScrollView,View,Text , SafeAreaView  ,Image} from 'react-native';

import styles from './style';
 
import HeaderApp from '../../shared/Header';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import { btnColor, domain } from '../../utils/app';
import axios from 'axios';
import AppButton from '../../components/auth/Button';
import { useTranslation } from 'react-i18next';
import Gtyles from '../../styles/Gstyle';


export default function SupportSendScreen() {
     const navigation = useNavigation();
     const [msg,changMsg] = React.useState('');
     const tokenK = useSelector(state => state.auth.token);
     const {t,i18n} = useTranslation();

     const sendNow = () => {
         if(msg !== '' && msg !== null){
            var config = {method: 'post',url: domain + '/api/send-support',headers: { 'Authorization': 'Bearer ' + tokenK,'Content-Type': 'application/json','Accept': 'application/json'},data:{msg:msg}};
            axios(config).then(res => {
                changMsg('');
                changeDone(true)
                
            })
         }else{
           
         }
     }
     const updateMsg = msg => {
         changMsg(msg);
     }
     const [done,changeDone] = React.useState(false);

     useEffect(() => {
        return () => {
         
        changMsg('');
        }    
     },[done])
     
    return (
        <SafeAreaView style={{flex:1}}>
            <ScrollView>
                <HeaderApp title={t('support.addbtn')} />
                <View style={{flex:1,paddingHorizontal:10}}>
                <Text style={styles.header}> {t('support.addbtn')} </Text>
                {
                    !done ? 
                    <View>
                   
                    
                        <Text style={styles.text}> 
                        {t('support.des2')}
                        </Text>

                            <TextInput 
                            onChangeText={updateMsg}
                            multiline={true} 
                            numberOfLines={Platform.OS === 'ios' ? null : 8}
                            minHeight={(Platform.OS === 'ios' && 8) ? (20 * 8) : null}
                            placeholder={t('support.addbtn') + " ... "} 
                            value={msg}
                            style={styles.textArea} />
                    

                        <View style={styles.btnWrapper}>
                            <AppButton onPressP={sendNow} title={t('support.addbtn')} primary={true} style={[Gtyles.button,Gtyles.primaryButton,{marginVertical: 15,width:200,maxWidth:300,alignSelf:'center'}]} />
                        </View>
                    </View>
                :
                <View style={{justifyContent:'center',alignItems:'center',backgroundColor:'white',paddingVertical:50}}>


                    <Image source={require('./../../../assets/images/icons/check.png')} />
                    <Text style={styles.text}> 
                    {t('support.donemssage')}
                    </Text>

                    <View style={styles.btnWrapper}>
                        <AppButton onPressP={() => navigation.goBack()} title={t('support.backbtn')} primary={true} style={[Gtyles.button,Gtyles.primaryButton,{marginVertical: 15,width:'85%',maxWidth:300,alignSelf:'center'}]} />
                    </View>
                </View>
                }
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

 