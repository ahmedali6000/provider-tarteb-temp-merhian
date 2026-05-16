import 'react-native-gesture-handler';
import React, { useReducer } from "react";
import {SafeAreaView,ScrollView,View,Text, Image,TextInput} from 'react-native';
import HeaderApp from "../../shared/Header";
import { useNavigation} from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Gtyles from '../../styles/Gstyle';
import styles from './style';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { domain, textColor } from '../../utils/app';
import axios from 'axios';
import EmptyResults from '../../components/empty';
import PlatformTouchable from '../../components/PlatformTouchable';
import { useTranslation } from 'react-i18next';
export default function SearchScreen(){

    const user = useSelector( state => state.auth.user);
    const tokenK = useSelector(state => state.auth.token);
    const navigation = useNavigation();
    const {t,i18n} = useTranslation();
    const [input,setInput] = React.useState('');
    const [data,setData] = React.useState([]);
    const getData = () => {
        var config = {method: 'get',url: domain + '/api/search?key='+input,headers: { 'Authorization': 'Bearer ' + tokenK, 'Content-Type': 'application/json','Accept': 'application/json'},};
        axios(config).then(res => {
            setData(res.data);
          
        })  
    }
    const updateInput = value => {
        setInput(value);
    }

    React.useEffect(()=>{
        setData([]);
        getData();
    },[input])
    
    return (
        <ScrollView contentContainerStyle={{flexGrow: 1}} >
        <SafeAreaView style={{flex:1}}> 
        <View  style={{ backgroundColor:'transparent',flex:1}} >
            <HeaderApp navigation={navigation} homeFlag={false} title={t('pricing_guide.search_placeholder')} />

            <View style={{paddingHorizontal:5,marginTop:10}}>
                <View style={[styles.card,Gtyles.shadow,{marginTop:-10,marginHorizental:50}]}>
                    <View style={{ flexDirection:'column'}}>
                        <View style={{flexDirection:'row'}}>
                            
                            <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                                <Ionicons style={{fontSize:17,marginEnd:10,color:textColor}} name='search' />
                            </View>
                            <TextInput placeholderTextColor={textColor}  placeholder={t('pricing_guide.search_placeholder') + '... '} onChangeText={updateInput} style={styles.input}  /> 
                        </View>
                    </View>
                </View>
            </View>
            <View style={{flex:1, }}>
            {(data.length==0) ?
              <EmptyResults />  
            :
           <View>
             {data.map(ser => {
                return (
                        <PlatformTouchable key={ser.id} onPress={() => {
                         navigation.navigate('ServiceScreen',{
                            service: ser
                         })
                        }}>
                        <View style={styles.res_tab}>
                            <Image style={{width:50,height:50,marginEnd:15}} source={{uri:ser.image}} />
                            <Text style={{fontSize:13,color:textColor,fontFamily:'Tajawal-Regular',}}> {ser.name} </Text>
                        </View>
                        </PlatformTouchable>
                    )
                })}
            </View>
            }
           
                
            </View>

        </View>
        </SafeAreaView>
        </ScrollView>
        
    );
}