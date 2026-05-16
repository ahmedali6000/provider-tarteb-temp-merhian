import React from "react";
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import HomeScreen from "../screens/Home";
import AccountScreen from "../screens/Account";
import ReviewScreen from "../screens/Review";
import ChatListScreen from "../screens/Chat";
import NotificationScreen from "../screens/Notification";
import {ScaledSheet} from 'react-native-size-matters';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import {Text } from 'react-native';
import { btnColor } from "../utils/app";
import { View } from 'react-native';
import {HomeStack} from './HomeStack';
const Tab = createMaterialBottomTabNavigator();

export function HomeTabs(props){

    return (
        
        <Tab.Navigator
        labeled={false}
        initialRouteName="HomeStack"
        activeColor="red"
        inactiveColor="blue"
          barStyle={styles.AppFooter} 
          >
            <Tab.Screen name="HomeScreen" component={HomeScreen} options={{
                tabBarIcon: ({focused}) => (
                    <View>
                        {/* <View style={{backgroundColor:'blue',position:'absolute',height:'100%',width:'100%'}}></View> */}
                        <Ionicons style={[styles.tradItemIcon, ]} name="home" size={50}  />                    
                    </View>
                   
                ),
            }}/>
            <Tab.Screen name="ChatListScreen" component={ChatListScreen} options={{
                tabBarIcon: ({focused}) => (
                    <View>
                        <Ionicons style={[styles.tradItemIcon, ]} name="chat"   />                    
                    </View>
                   
                ),
            }}/>
             <Tab.Screen name="ReviewScreen" component={ReviewScreen} options={{
                tabBarIcon: ({focused}) => (
                    <View>
                        <Ionicons style={[styles.tradItemIcon, ]} name="star"   />                    
                    </View>
                   
                ),
            }}/>
            <Tab.Screen  name="NotificationScreen" component={NotificationScreen} options={{
                // tabBarLabel: null,
                tabBarIcon: ({focused}) => (
                    <View>
                        <Ionicons style={[styles.tradItemIcon, ]} name="notifications"    />
                        <Text style={{position:'absolute',color:'white',backgroundColor:'red',top:-5,right:-5}}> 5 </Text>
                    </View>
                ),
            }}/>
             <Tab.Screen name="AccountScreen" component={AccountScreen} options={{
                tabBarIcon: ({focused}) => (
                    <View>
                        <Ionicons style={[styles.tradItemIcon, ]} name="person"   />                    
                    </View>
                   
                ),
            }}/>
        </Tab.Navigator>
        
    );
}

const styles = ScaledSheet.create({
    AppFooter:{
        // borderColor:'white',
        // borderWidth:2,
        backgroundColor:'#77bced',
        borderTopEndRadius:15,
        borderTopStartRadius:15,
        height:70,
        justifyContent:'center'
    }, 
    tradItemText:{
        fontSize:13,

    },
    tradItemIcon:{ 
        fontSize:25,
        // backgroundColor:'red',
        flex:1,
        // padding:20
    },
    focusedItem:{
        // backgroundColor:'red'
        // color:btnColor
    }
});