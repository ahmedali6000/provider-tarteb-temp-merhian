import React from "react";
import {View,Text,ScrollView,SafeAreaView , Image , FlatList , TouchableOpacity,ImageBackground, StyleSheet} from 'react-native';
import HeaderApp from "../../shared/Header";

 import {Card , Paragraph ,Title} from 'react-native-paper';
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { btnColor, btnColorDark, domain, textColor } from "../../utils/app";
import axios from "axios";
import Loader from '../../components/Loader';
import { CategoryBox } from "../../components/SquaredBox/Category";
import { arabic_num, cutLongText } from "../../utils/HelperFunctions";
import Gtyles from "../../styles/Gstyle";
import { useNavigation } from "@react-navigation/native";
import PlatformTouchable from "../../components/PlatformTouchable";
import { Ionicons } from '@react-native-vector-icons/ionicons';




export default function AllCategories(){
    const navigation = useNavigation()

    const rederMainCategory = ({item}) => {
      
        return ( 
            <PlatformTouchable  
            onPress={() => {
                if(item.childsCount == 0){
                    navigation.navigate('CategoryScreen', {
                        category: item
                      });
                }else{
                    navigation.navigate('SubCategoryScreen', {
                        category: item
                      });
                }
                
            }}>
            <View  style={{backgroundColor:btnColor,marginTop:10,justifyContent:'space-between',alignItems:'center',flexDirection:'row',paddingVertical:7,paddingHorizontal:20,borderRadius:10}}>
                <View style={styles.Wrapper1}> 
                    <Image style={styles.image} source={{uri: item.image,cache: 'only-if-cached'}}/>
                    <Text style={styles.title}> { item.name} </Text>
                </View>
                <View style={styles.Wrapper2}>
                     <Ionicons style={{fontSize:25,color:'white'}} name={(i18n.language == 'ar') ? 'angle-left' :'angle-right' } />
                </View>
            </View>
            </PlatformTouchable>
            )
    }
    const renderMainCategorysList = (categories) => {
        return ( 
            <FlatList data={categories} renderItem={rederMainCategory} />
        );
    }
    // numColumns={3}
    const [loaderState,changeloaderState] = React.useState(true);
    const [DATA,appendData] = React.useState(null);
    const {t,i18n} = useTranslation();
    
    const GET_DATA = () => {
        var config = {method: 'get',url: domain + '/api/view-all-parent-categories',headers: {'Content-Type': 'application/json','Accept': 'application/json'}};
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
        <SafeAreaView style={{flex:1}}>
            {/* <Loader isLoading={loaderState} />   */}
            <View style={{flex:1}} >
                <HeaderApp title={t('drawer.all_categories')} />
                    <View style={{marginVertical:20,marginBottom:100,paddingHorizontal:13,}}>
                        {renderMainCategorysList(DATA)} 
                    </View>
                     
            </View>
        </SafeAreaView>
    );
}


export const styles = StyleSheet.create({
    
    image: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        marginEnd:12
        
    },
    title:{
        fontSize: 16,
        fontFamily:'Tajawal-Bold',
        textAlign:'center',
        color:'white'
    },
    
    Wrapper1:{
        // backgroundColor:'red',
        flexDirection:'row',
        justifyContent:'flex-start',
        alignItems:'center'
    },
    Wrapper2:{
         
        // backgroundColor:'yellow',
        justifyContent:'center',
        alignItems:'center',
       
        
    },
     
    CatWrapper: {
        backgroundColor:'#F0F0F0',
        paddingVertical: 10,
        paddingHorizontal:12,
        margin: 10,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent:'space-around',
        alignItems:'center',
        borderBottomWidth:1,
        borderBottomColor:'red'
    },
    container:{
        marginVertical:20,
        marginHorizontal:10,
    },
    header:{
        fontSize:30,
        color:'black',
        fontWeight: 'bold',
        textAlign: 'center',
        // backgroundColor:'red',
        marginVertical: '8@vs',
    },
})
