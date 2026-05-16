import React from "react";
import {View,Text,Image} from 'react-native'
import styles from "./style";
import Stars from "../starts";
import { Card } from "react-native-paper";
import Gtyles from "../../styles/Gstyle";


export function Review(props){
    const {name,image,rate,time,review} = props;
    return (
        <Card style={[Gtyles.shadow,{paddingVertical:20,paddingHorizontal:10}]}>
            <View style={styles.topSection}>
            <View style={{flex:1,backgroundColor:'trasparent',flexDirection:'row'}}>
                <Image 
                    source={{uri:image}}
                    style={styles.image}
                    />
                
                   <View style={{flexDirection:'column',flex:1}}>
                    <View style={{backgroundColor:'trasparent',padding:5}}>
                        <Text style={{fontSize:18,fontWeight:'bold'}}>
                            {name}
                        </Text>
                    </View>
                    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',backgroundColor:'trasparent',flex:1,paddingHorizontal:5}}>
                        <Stars rate={4} />
                        <Text style={{fontSize:13}}>
                        {time}
                    </Text>
                    </View>
                   </View>
                </View>
            </View>
            <View style={{paddingTop:10,paddingHorizontal:12}}>
                <Text style={{fontSize:16,lineHeight:23}}>
                    {review}
                </Text>
            </View>
            
        </Card>
    );
}