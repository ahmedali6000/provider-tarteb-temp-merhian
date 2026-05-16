import React from 'react';
import {ScrollView,Text, View,SafeAreaView,Image ,FlatList} from "react-native";
import AppButton from "../../../components/auth/Button";
import AppInput from '../../../components/auth/Input';
 
import {validate} from '../../../utils/Validate';
import Gtyles from '../../../styles/Gstyle';
import { btnColor, btnColorDark, domain } from '../../../utils/app';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Card, Paragraph, RadioButton, Title } from "react-native-paper";
import PlatformTouchable from '../../../components/PlatformTouchable';
import { StyleSheet } from 'react-native';
import AuthHeader from '../../../shared/AuthHeader';
import { useDispatch } from 'react-redux';
import { SET_CATEGORY_ID } from '../../../redux/actions/ActionTypes';


export default function SelectCategoryScreen(){

    const navigation = useNavigation();
    const [val , changeVal] = React.useState(null);
    const [isLoading,changeisLoading] = React.useState(false);
    const [donebtn,changeDone] = React.useState({status:!isLoading,isloading:isLoading});
    const {t,i18n} = useTranslation();
    const [DATA,appendData] = React.useState([]);
    const dispatch = useDispatch();

    const GET_DATA = () => {
     
        var config = {method: 'get',url: domain + `/api/view-all-parent-categories`,headers: {'Content-Type': 'application/json','Accept': 'application/json'}};
        axios(config).then(res => {
          appendData(res.data)
        }).catch(err=>{
         
        }).finally(()=> {
           
        });
    }
   
    React.useEffect(()=>{
          GET_DATA();
    },[])

    const setCategory = (category_id) => {
        changeVal(category_id);
    }

    const Handler = () => {
        dispatch({
            type: SET_CATEGORY_ID,
            payload: val,
        });
        navigation.navigate('SelectImageScreen')
    }
    const rederRecord = ({item}) => {
        return (
            <View key={item.id} style={[Gtyles.shadowFullCard,{flexDirection:"row",alignItems:'center',justifyContent:'space-between',marginVertical:5,paddingVertical:10}]}>
               <View style={{flexDirection:"row",alignItems:'center',}}>
               <RadioButton.Android
                    value={item.id}
                    color={btnColorDark}
                    status={ item.id === val ? 'checked' : 'unchecked' }
                    onPress={() =>  {
                        setCategory(item.id)
                    }}
                />
                    <PlatformTouchable onPress={() => setCategory(item.id)}>
                    <Text style={styles.lang_text}>{item.name}</Text>
                    </PlatformTouchable>

               </View>
                     
                    <Image cache='reload' source={{uri: item.image}}  style={{width:30,height:30,alignSelf:'flex-end'}} />
                    
                </View>
        )
    }
    return (
         
        <SafeAreaView style={[styles.Wrapper]}>
        <AuthHeader text={t('auth.titles.select_category')} bar={0.4} />
        
            <View style={{flex:1,justifyContent:'space-around'}}>
                <View style={{flexDirection:'row',justifyContent:'space-around'}}>
                    <FlatList
                        data={DATA}
                        renderItem={rederRecord}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
            </View>
             <AppButton disabled={(val == null) ? true : false} isLoading={isLoading} title={t('next')} btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginVertical: 15,alignSelf:'center'}]} onPressP={() => Handler()}   /> 
         
        </SafeAreaView>
      
        
    );
} 

 

const styles = StyleSheet.create({
    lang_text:{
        fontSize:16,
        color:'black',
        fontWeight:'600'
    },
    Wrapper:{
        flex:1
    },
})