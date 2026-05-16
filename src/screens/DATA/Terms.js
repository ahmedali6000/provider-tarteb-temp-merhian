import React from "react";
import {View,Text,ScrollView,SafeAreaView , Image} from 'react-native';
import HeaderApp from "../../shared/Header";
import styles from "./style";
 import {Card , Paragraph ,Title} from 'react-native-paper';
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { domain } from "../../utils/app";
import axios from "axios";

export default function TermsScreen(){
    const show_alert = useSelector( state => state.myApp.urgentPopUp);

    const [loaderState,changeloaderState] = React.useState(true);
    const [DATAT,appendData] = React.useState(null);
    const {t,i18n} = useTranslation();
    const GET_DATA = () => {
        
        var config = {method: 'get',url: domain + '/api/data/terms',headers: {'Content-Type': 'application/json','Accept': 'application/json'}};
        axios(config).then(res => {
            appendData(res.data);
          
            changeloaderState(false)
            
        }).catch(err=>{
                 
        }).finally(res=> {
             
        });
    }
    React.useEffect(() => {
        
       if(DATAT == null){
        GET_DATA()
       }
    },[DATAT])

    return (
        <SafeAreaView>
            <ScrollView contentContainerStyle={{flexGrow: 1}} >
                <HeaderApp title={t('drawer.terms_condition')} />
                    <View>
                        <View style={styles.topIMGsection}>
                            <Image style={styles.img} source={require('../../../assets/images/3.jpg')} />  
                        </View>
                        <View style={styles.secondSection}> 
                            <Card style={styles.cardData}>
                                <Title style={styles.title}>
                                {DATAT?.name}
                                </Title>
                                <Paragraph style={styles.des}>
                                {DATAT?.des} 
                                </Paragraph>
                            </Card>
                        </View>
                    </View>
            </ScrollView>
            
        </SafeAreaView>
    );
}