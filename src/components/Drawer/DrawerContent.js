import React from 'react';
import { View, StyleSheet , Image } from 'react-native';
import {
    useTheme,
    Avatar,
    Title,
    Caption,
    Paragraph,
    Drawer,
    Text,
    TouchableRipple,
    Switch
} from 'react-native-paper';
import {
    DrawerContentScrollView,
    DrawerItem
} from '@react-navigation/drawer';
import { Ionicons } from '@react-native-vector-icons/ionicons';

import {useDispatch , useSelector} from 'react-redux'
import PlatformTouchable from '../PlatformTouchable';
import { backgroundColorHady, btnColor, btnColorDark, domain, Language_KEY, textColor } from '../../utils/app';
import {changeLanguage, logout} from '../../redux/actions';
import ImageLoad from 'react-native-image-placeholder';
import { useTranslation } from 'react-i18next';
import SwitchSelector from "react-native-switch-selector";
import RNRestart from 'react-native-restart';
import AsyncStorage from '@react-native-async-storage/async-storage';

const user = 1;
export function DrawerContent(props) {
    const user_image = useSelector( state => state.auth.user_image);
    const dispatch = useDispatch();
    const paperTheme = useTheme();
    const user = useSelector( state => state.auth.user);
    const wallet = useSelector( state => state.auth.wallet);
    const {t,i18n} = useTranslation();
    const Logout = () => { 
        dispatch(logout());
    };
    const changeLang = (lang) => {
        AsyncStorage.setItem(Language_KEY,lang);
        i18n.changeLanguage(lang)
        setTimeout(() => {
            RNRestart.Restart();
        }, 500);
        
      }
    React.useEffect(() => {
        
    },[])
    
       
   
    // const { signOut, toggleTheme } = React.useContext(AuthContext);

    return(
        user &&
        <View style={{flex:1}}>
            <DrawerContentScrollView {...props}>
                <View style={styles.drawerContent}>
                    <View style={{position:'absolute',zIndex:1000,right:20,top:10}}> 
                        <PlatformTouchable onPress={() => { props.navigation.closeDrawer(); }}  >
                            <Ionicons name="close" style={{fontSize:25}}  />
                        </PlatformTouchable>
                    </View>
                    <View style={[styles.userInfoSection]}>
                        <View style={{paddingVertical:13,flexDirection:'column',justifyContent:'center',alignItems:'center',backgroundColor:backgroundColorHady}}>
                            
                            <View>
                                <Image
                                    style={{height:70,width:70,borderRadius:10}}
                                    source={(user_image) ? {  uri:user_image}: require('../../../assets/images/placeholde2.jpg')}
                                />
                           

                           <View style={{ 
                                    position: 'absolute', 
                                    top: -10, 

                                    right: -10, 
                                     
                                    borderRadius: 30, 
                                    backgroundColor: 'white', 
                                    justifyContent: 'center', 
                                    alignItems: 'center' 
                                    }}>
                                    <Ionicons name='checkmark-circle' style={{ fontSize: 30, color: 'green' }} />
                                </View>
                            </View>
                            <View style={{marginLeft:3, flexDirection:'column'}}>
                                <Title style={[styles.title]}> {user.name} </Title>
                            </View>
                        </View>

                        
                    </View>

                    <Drawer.Section style={styles.drawerSection}>
                        <DrawerItem 
                            icon={({color, size}) => (
                                <Ionicons 
                                name="home-outline" 
                                color={color}
                                size={size}
                                />
                            )}
                            labelStyle={[styles.drawerLabel,(i18n.language == 'ar') &&  {textAlign: 'left'}]}
                            label={t('drawer.home')}
                            onPress={() => {props.navigation.navigate('HomeTabs')}}
                        />
                         <DrawerItem 
                            icon={({color, size}) => (
                                <Ionicons 
                                name="briefcase-outline" 
                                color={color}
                                size={size}
                                />
                            )}
                            labelStyle={[styles.drawerLabel,(i18n.language == 'ar') &&  {textAlign: 'left'}]}
                            label={t('drawer.all_categories')}
                            onPress={() => props.navigation.navigate('AllCategories')}
                        />
                        {
                            (user.paymentAva == '1') &&
                            <DrawerItem 
                            icon={({color, size}) => (
                                <Ionicons 
                                name="wallet-outline" 
                                color={color}
                                size={size}
                                />
                            )}
                            labelStyle={[styles.drawerLabel,(i18n.language == 'ar') &&  {textAlign: 'left'}]}
                            label={ t('drawer.wallet' ) +' ( ' + wallet + ' ' + t('cur' ) + ' ) '}
                            onPress={() => {props.navigation.navigate('Wallet')}}
                        />
                        }
                        
                        <DrawerItem 
                            icon={({color, size}) => (
                                <Ionicons 
                                name="pricetags-outline" 
                                color={color}
                                size={size}
                                />
                            )}
                            labelStyle={[styles.drawerLabel,(i18n.language == 'ar') &&  {textAlign: 'left'}]}
                            label={t('drawer.pricing_guide')}
                            onPress={() => {props.navigation.navigate('PricingGuide')}}
                        />
                        
                        <DrawerItem 
                            icon={({color, size}) => (
                                <Ionicons 
                                name="information-circle-outline" 
                                color={color}
                                size={size}
                                />
                            )}
                            labelStyle={[styles.drawerLabel,(i18n.language == 'ar') &&  {textAlign: 'left'}]}
                            label={t('drawer.about')}
                            onPress={() => {props.navigation.navigate('AboutScreen')}}
                        />
                        <DrawerItem 
                            icon={({color, size}) => (
                                <Ionicons 
                                name="help-circle-outline" 
                                color={color}
                                size={size}
                                />
                            )}
                            labelStyle={[styles.drawerLabel,(i18n.language == 'ar') &&  {textAlign: 'left'}]}
                            label={t('drawer.pop_question')}
                            onPress={() => {props.navigation.navigate('faq')}}
                        />
                        <DrawerItem 
                            icon={({color, size}) => (
                                <Ionicons 
                                name="document-outline" 
                                color={color}
                                size={size}
                                />
                            )}
                            labelStyle={[styles.drawerLabel,(i18n.language == 'ar') &&  {textAlign: 'left'}]}
                            label={t('drawer.privacy_policy')}
                            onPress={() => {props.navigation.navigate('PrivacyScreen')}}
                        />
                        <DrawerItem 
                            icon={({color, size}) => (
                                <Ionicons 
                                name="document-text-outline" 
                                color={color}
                                size={size}
                                />
                            )}
                            labelStyle={[styles.drawerLabel,(i18n.language == 'ar') &&  {textAlign: 'left'}]}
                            label={t('drawer.terms_condition')}
                            onPress={() => {props.navigation.navigate('TermsScreen')}}
                        />
                          
                    </Drawer.Section>
                    
                    <Drawer.Section style={styles.bottomDrawerSection}>
                    <DrawerItem 
                        icon={({color, size}) => (
                            <Ionicons 
                            name="log-out-outline" 
                            color={color}
                            size={size}
                            />
                        )}
                        labelStyle={[styles.drawerLabel,(i18n.language == 'ar') &&  {textAlign: 'left'}]}
                        label={t('drawer.logout')}
                        onPress={Logout}
                />
            </Drawer.Section>

                </View>
            </DrawerContentScrollView>
         
        </View>
        
    );
}

const styles = StyleSheet.create({
    drawerContent: {
      flex: 1, 
    },
    drawerLabel: {
        fontFamily:'Tajawal-Bold' , color:textColor,
        fontSize:14
    },
    title: {
      fontSize: 16,
      marginTop: 3,
     
      fontFamily:'Tajawal-Bold' , color:textColor,
     
    },
    caption: {
      fontSize: 14,
      marginTop:5,
      fontFamily:'Tajawal-Regular' , color:textColor,
    },
    row: {
      marginTop: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    section: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 15,
    },
    paragraph: {
        fontFamily:'Tajawal-Regular' , color:textColor,
      marginRight: 3,
    },
    drawerSection: {
      marginTop: 15,
    },
    bottomDrawerSection: {
        marginBottom: 15,
        borderTopColor: '#f4f4f4',
        borderTopWidth: 1
    },
    preference: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
  });