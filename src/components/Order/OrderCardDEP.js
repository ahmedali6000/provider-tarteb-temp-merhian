import React from 'react'
import {View,Text,Image} from 'react-native'
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Card, Title, Paragraph } from 'react-native-paper';
import { cutLongText } from '../../utils/HelperFunctions';


export default function OrderCard(props){

    const {title, address, time,image} = props;

    return (
        <Card style={{paddingVertical:6,marginVertical:3}}>
            <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-around',paddingVertical:20}}>
                <View>
                    <Text style={{fontSize:19,fontWeight:'bold'}}> {cutLongText(title,20)} </Text>
                    <View style={{flexDirection:'row',alignItems:"center",marginTop:10}}>
                        <Ionicons style={{fontSize:20}} name='room' />
                        <Text style={{fontSize:17}}> {cutLongText(address,28)} </Text>
                    </View>
                    <View style={{flexDirection:'row',alignItems:"center",marginTop:5,paddingHorizontal:5}}>
                        {/* <Ionicons style={{fontSize:13}} name='schedule' /> */}
                        <Text style={{fontSize:13}}>{time}</Text>
                    </View>
                    
                    {/* <Text>12:45:12 AM</Text> */}
                </View>
                <Image style={{height:80,width:80,borderRadius:10,marginHorizontal:20}}
                    source={{uri:image}}
                />
                
            </View>
        </Card>
    );
}
