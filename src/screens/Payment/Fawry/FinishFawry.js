import { StyleSheet, Text, SafeAreaView ,View  , Image} from 'react-native'
import React from 'react'
import Gtyles from '../../../styles/Gstyle'
import AppButton from '../../../components/auth/Button'
import { Paragraph, Title } from 'react-native-paper'
 

export default function FinishFawry() {
  return (
    <SafeAreaView style={{flex:1}}>
          <View style={[Gtyles.MROW,{marginVertical:15,justifyContent:'center'}]}>
            <Image style={{width:100,height:100,alignSelf:'center'}} source={require('./../../../../assets/images/logo_t.png')} />
          </View>
            <Title>Successfully Task</Title>
            <Paragraph style={{textAlign:'center'}}>Thank you for charging your wallet using Fawry referance number , if you face any problem contact us as soon as possible .. TARTEB</Paragraph>
          <View style={{marginTop:10,flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
            <AppButton  title="View Order Again" btn_style={[Gtyles.authBtnStyle,Gtyles.btn_shadow,{marginVertical: 15,backgroundColor:'green'}]} onPressP={() => {navigation.navigate('RequestView')}}/> 
          </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({})