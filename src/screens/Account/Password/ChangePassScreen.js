import React, { useEffect } from 'react';
import {View,Text,Image, ScrollView , SafeAreaView} from 'react-native';
import styles from './../style';


 
import { domain} from './../../../../src/utils/app';
import {useDispatch , useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
 
import axios from 'axios';
import HeaderApp from '../../../shared/Header';
import AppButton from '../../../components/auth/Button';
import AppInput from '../../../components/auth/Input';
import { Done } from '../../../components/Done';
import Gtyles from '../../../styles/Gstyle';
import { useTranslation } from 'react-i18next';

function ChangePassScreen(props){
    const navigation = useNavigation();
    const [oldPassword,UpdateoldPassword] = React.useState({value:'',status:false,IncomeError:''});
    const [newPassword,UpdatenewPassword] = React.useState({value:'',status:false,IncomeError:''});        
    const [conNewPassword,UpdateconNewPassword] = React.useState({value:'',status:false,IncomeError:''});
    const dispatch = useDispatch();
    const [donebtn,changeDone] = React.useState({status:true,isloading:false});
    const tokenK = useSelector(state => state.auth.token); 
    const {t,i18n} = useTranslation();

    const PostUpdatePassword = () => {
    if(oldPassword.value == '' || oldPassword.value == null){
        UpdateoldPassword({value:'',status:false,IncomeError:t('change_pass.old_req')});
        return
    }
    
    if(newPassword.value !== conNewPassword.value){
        UpdateconNewPassword({value:'',status:true,IncomeError:t('change_pass.not_match')});
        return
    }
    changeDone({status:false,isloading:true});
    // setTimeout(() => {
    //     changeDone({status:true,isloading:false});
    // }, 1000);
    // changeDone({status:false,isloading:true})
    var config = {method: 'post',url: domain + '/api/update-password',headers: { 'Authorization': 'Bearer ' + tokenK ,'Content-Type': 'application/json','Accept': 'application/json'},data:{old_password: oldPassword.value,new_password: newPassword.value}};
    axios(config).then(res => {
        if(res.data == 'updated'){
            changeDone({status:true,isloading:false})
            changeDoneLottie(true);

            UpdateoldPassword({value:'',status:true,IncomeError:''});
                UpdatenewPassword({value:'',status:true,IncomeError:''});
                UpdateconNewPassword({value:'',status:true,IncomeError:''});

            setTimeout(() => {
                changeDoneLottie(false);
                
                navigation.goBack();
            }, 2000);
        }else{
            changeDone({status:true,isloading:false})
            UpdateoldPassword({IncomeError:t('change_pass.old_wrong')})
        }
        
    });
 }   

  const updateOldPasswordIn = oldPasswordVal => {
    UpdateoldPassword({
        ...oldPassword,
        value:oldPasswordVal,
        status:true,
    })
  }
  
  const updateNewPasswordIn = oldPasswordVal => {
    UpdatenewPassword({
        ...newPassword,
        value:oldPasswordVal,
        status:true,
    })
  }  

  const updateConNewPasswordIn = conNewPasswordVal => {
    UpdateconNewPassword({
        ...conNewPassword,
        value:conNewPasswordVal,
        status:true,
    })
  }
    const [T,changeDoneLottie] = React.useState(false);
    
    useEffect(() => {
    },[T])
    const Xdone = () => <Done done={T} />

    return (
        <SafeAreaView style={{flex:1,overflow:'scroll'}}>
        <ScrollView contentContainerStyle={{flexGrow: 1,backgroundColor:'white'}}>
        
        <HeaderApp title={t('auth.newPassword.btn')} navigation={navigation} />
        <View style={{flex:1,paddingHorizontal:30,alignItems:'center',justifyContent:'space-between'}}>
            {/* <Text style={styles.header}> My Profile </Text>  */}
            {Xdone()}
            <View style={[styles.avatarWrapper,{width:'100%'}]}>
                <Image 
                style={{width:130,height:130,marginBottom:50,marginTop:50,alignSelf:'center'}} 
                source={require('../../../../assets/images/icons/padlock.png')}
                 /> 

                <AppInput isPassword={true} onChangeText={updateOldPasswordIn}  placeholder={t('change_pass.enter_old')}/>
                { (oldPassword.IncomeError !='') &&
                        <Text style={{color:'red',fontSize:15,marginBottom:10,fontWeight:'600'}}> {oldPassword.IncomeError} </Text>
                }

                <AppInput isPassword={true} onChangeText={updateNewPasswordIn} placeholder={t('change_pass.enter_new')}/>
                { (newPassword.IncomeError !='') &&
                    <Text style={{color:'red',fontSize:15,marginBottom:10,fontWeight:'600'}}> {newPassword.IncomeError} </Text>
                }
                
                <AppInput isPassword={true} onChangeText={updateConNewPasswordIn}  placeholder={t('change_pass.confirm_new')}/>
                { (conNewPassword.IncomeError !='') &&
                    <Text style={{color:'red',fontSize:15,marginBottom:10,fontWeight:'600'}}> {conNewPassword.IncomeError} </Text>
                }
            </View>
            
           
           

           
         
            <View style={styles.btnWrapper}>
            <AppButton 
                disabled={!donebtn.status} isLoading={donebtn.isloading}
                title={t('change_pass.update_btn')} primary={true} style={[Gtyles.button,Gtyles.primaryButton,{marginVertical: 15,width:200}]} onPressP={PostUpdatePassword}/> 
            </View>
        </View>
        </ScrollView>
        </SafeAreaView>
    );
}
export default ChangePassScreen;