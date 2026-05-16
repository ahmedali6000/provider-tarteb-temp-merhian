import React, { Component, useEffect } from 'react';
import Accordion from 'react-native-collapsible/Accordion';
import {Text,View,Image,ScrollView , SafeAreaView} from 'react-native';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import HeaderApp from '../../shared/Header';
import {useNavigation} from '@react-navigation/native';
import styles from './style';
import { useSelector ,useDispatch} from 'react-redux';
import { getFAQ } from '../../redux/actions';
import { useTranslation } from 'react-i18next';

export default function Faq(props){

  const SECTIONS = useSelector(state => state.doc.faqs);
  const {t,i18n} = useTranslation();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getFAQ());
  },[]) 
  const [activeSections,setData] = React.useState([])
  const _renderSectionTitle = (section) => {
    return (
      <View style={styles.content}>
        <Text>{section.content}</Text>
      </View>
    );
  };

  const _renderHeader = (section) => {
    return (
      <View style={styles.header}>
        <View style={styles.qWrapper}>
          <Text style={styles.headerText}>{section.question}</Text>
        </View>
        <View style={styles.downiconWrapper}>
        <Ionicons style={styles.downIcon} name="chevron-down" />
        </View>
      </View>
    );
  };

  const _renderContent = (section) => {
    return (
      <View style={styles.content}>
        <Text style={styles.contentText}>{section.answer}</Text>
      </View>
    );
  };

  var _updateSections = (activeSections) => {
    setData( activeSections );
  };
 const navigation = useNavigation();
   
    return (
      <SafeAreaView>
      <ScrollView contentContainerStyle={{flexGrow: 1}} >
         <HeaderApp title={t('drawer.pop_question')} />
            <View> 
                <View style={{flexDirection:'column',justifyContent:'center',alignItems:'center',marginVertical:5}}>
                <Image style={styles.img} source={require('../../../assets/images/faq.png')} />  
                    {/* <Text style={{color:'black',fontSize:25,textAlign:'center',borderRadius:20,paddingVertical:25,paddingHorizontal:35 }}>
                      F.A.Q
                    </Text> */}
                </View>
            </View>
            {
              SECTIONS &&
            
            <View style={{marginHorizontal:15}}>
              <Accordion sectionContainerStyle={{marginVertical:10,}} 
                  sections={SECTIONS}
                  activeSections={activeSections}
                  renderHeader={_renderHeader}
                  renderContent={_renderContent}
                  onChange={_updateSections}
              />
            </View>
            }
            
      </ScrollView>
      </SafeAreaView>
    );
   
}

 