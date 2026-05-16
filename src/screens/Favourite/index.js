import 'react-native-gesture-handler';
import React, { useReducer } from "react";
import {SafeAreaView,View,Text, Image,FlatList , ScrollView}  from 'react-native';
import HeaderApp from "../../shared/Header";
import { useNavigation} from '@react-navigation/native';
import styles from './style';
import {  domain, LOADER_TIME_DELAY_PLUS } from '../../utils/app';

import { useSelector } from 'react-redux';
import Loader from '../../components/Loader';
import axios from 'axios';
import { MySnakeBar } from '../../components/SnakeBar/MySnakeBar';
import ServiceWide from '../../components/ServiceWide/ServiceWide';
import { useTranslation } from 'react-i18next';

function rederService({item}){
    return <ServiceWide service={item} />
}
function renderFavServicesList(services){
    return (
        <FlatList data={services} renderItem={rederService}   />
    );
}


export default function FavouriteScreen(){
   
    const user = useSelector( state => state.auth.user);
    const navigation = useNavigation();
     
    const {t,i18n} = useTranslation();
    const [load,changeLoaded] = React.useState(true);
    const tokenK = useSelector(state => state.auth.token);
    const [DATA,appendData] = React.useState(null);
    const GET_HOME_DATA = () => {
        var config = {method: 'get',url: domain + '/api/favourites',headers: {'Authorization': 'Bearer ' + tokenK,'Content-Type': 'application/json','Accept': 'application/json'}};
        axios(config).then(res => {
            appendData(res.data);
        }).catch(err=>{
        }).finally(()=> {
            setTimeout(() => {
                changeLoaded(false);
            }, LOADER_TIME_DELAY_PLUS);
        });
         
    }
    
    React.useEffect(()=>{
       
        GET_HOME_DATA();
    },[])

    return (

        <SafeAreaView style={{flex:1}}>
            
            {
                DATA && 
                <View style={{flex:1,paddingBottom:150}}>
                    <HeaderApp navigation={navigation} homeFlag={true} title={t('drawer.favs')}  />
                    {
                        (DATA.length > 0) ? 
                    
                    <View style={styles.sectioWrapper}>
                        
                        {renderFavServicesList(DATA)}
                    </View>
                    :
                    <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
  
                    <Image  style={styles.image} source={require("../../../assets/images/ufo.png")} />
                    <Text style={styles.text}>  {t('favourite.no')} </Text>
                    </View>
                    }
                    
                    </View>
            }
       
        <Loader isLoading={load} />
        <MySnakeBar />
        </SafeAreaView>
        
    );
}
 
