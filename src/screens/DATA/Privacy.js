import React from "react";
import {View,Text,ScrollView,SafeAreaView , Image} from 'react-native';
import HeaderApp from "../../shared/Header";
import styles from "./style";
 import {Card , Paragraph ,Title} from 'react-native-paper';
import { useSelector } from "react-redux";
import { domain } from "../../utils/app";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function PrivacyScreen(){
    const show_alert = useSelector( state => state.myApp.urgentPopUp);

    const [loaderState,changeloaderState] = React.useState(true);
    const [DATA,appendData] = React.useState(null);
    const {t,i18n} = useTranslation();
    const GET_DATA = () => {
        var config = {method: 'get',url: domain + '/api/data/privacy',headers: {'Content-Type': 'application/json','Accept': 'application/json'}};
        axios(config).then(res => {
            appendData(res.data);
          
            changeloaderState(false)
            
        }).catch(err=>{
                 
        }).finally(res=> {
            alert(DATA.des)
        });
    }
    React.useEffect(() => {
       if(DATA == null){
        GET_DATA()
       }
    },[DATA])

    return (
        <SafeAreaView>
            <ScrollView contentContainerStyle={{flexGrow: 1}} >
                <HeaderApp title={t('drawer.privacy_policy')} />
                    <View>
                        <View style={styles.topIMGsection}>
                            <Image style={styles.img} source={require('../../../assets/images/4.jpg')} />  
                        </View>
                        <View style={styles.secondSection}> 
                            <Card style={styles.cardData}>
                                <Title style={styles.title}>
                                {DATA?.name} 
                                </Title>
                                <Paragraph  style={styles.des}>
                                {DATA?.des} 
                                </Paragraph>
                            </Card>
                        </View>
                    </View>
            </ScrollView>
           
        </SafeAreaView>
    );
}