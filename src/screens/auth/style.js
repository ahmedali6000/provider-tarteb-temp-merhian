import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import { backgroundColorHady, btnColor, btnColorDark, moreHady, textColor } from '../../utils/app';

const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;

const styles = ScaledSheet.create({
    doneFlagIMG:{
        width:30,
        height:30,
        position:'absolute',
        zIndex:999,
        end:20,
        top:'30%'
    },
    Wrapper:{
        flex:1,
        backgroundColor:'white'
    },
    container:{
        flex: 1
    },
  
    waitTillDispatching:{
        position:'absolute',
        backgroundColor:'rgba(66, 157, 215, 0.1)',
        flex:1,
        width:'100%',
        height:'100%',
        alignItems:'center',
        justifyContent:'center',
        zIndex:9999
    },
    waitTillDispatchingBTN:{
        fontFamily:'Tajawal-Bold',
        color:'red',
       borderBottomColor:'red',
       borderBottomWidth:2,
       position:'absolute',
       bottom:'10%',
       end:'10%'
    },
    waitTillDispatchingTxt:{
        fontFamily:'Tajawal-Bold',
        color:textColor,
        lineHeight:23,
        textAlign:'center'
    },
 
     backgroundImage: {
        flex: 1,
        
        resizeMode: 'cover', // or 'stretch'
    },
    secondSection:{
        paddingTop:1,
        justifyContent:'center',
        alignItems:'flex-start',
        flex:1,
        
        zIndex:1,
        // backgroundColor:d'blue',
        // marginHorizontal:'4%',
        paddingHorizontal:25,
        
    },
    input:{
        width:width/1.4,
        
    },
    t1:{
        fontSize:16,
        color:'white',
        fontFamily:'Tajawal-Regular',
        textAlign:'center',
        marginTop:18,
        marginBottom:19
    },

    t2:{
        fontSize:19,
        color:'white',
        fontFamily:'Tajawal-Regular',
        textAlign:'center',
        marginTop:5,
        marginBottom:8
    },
    t3:{
        fontSize:12,
        color:'white',
        fontFamily:'Tajawal-Regular',
        textAlign:'center',
        marginBottom:16
    },
    blueSectionWrapper:{
        flex:3,
        // backgroundColor:'red',
        backgroundColor:'transparent',
        paddingBottom:0
    },
    blueSection:{
        backgroundColor: btnColor,
        borderBottomLeftRadius:13, 
        borderBottomRightRadius:13,
        justifyContent:'center',
        alignItems:'center',
        height:'64%'
        
    },
    imgWrapper:{
        
        // position:'absolute',
        // top:-40,
        zIndex:99999999999999,
        paddingVertical:12,
        paddingHorizontal:15,
        borderRadius:13,
        backgroundColor:'white',
        // marginBottom:'-7%',
        justifyContent:'center',
       
    },
    imgLogo:{
        width:50,
        height:50,
         
    },
    forgetSpanWrapper:{
        flexDirection:'row',
        alignItems:'flex-end',
        justifyContent:'flex-end',
        // backgroundColor:"#000000",
        width:'100%',
        marginVertical:6,
    },
    bigSpan:{
        fontSize:13.5,
       
        color:btnColor,
        fontFamily:'Tajawal-Bold'
    },
    link:{
        fontFamily:'Tajawal-Bold',
        color:btnColor,
        marginBottom:5
    },
    desWrapper:{
        marginTop:5,
        // backgroundColor:'#ddd',
        width:width-40,
        alignItems:"center"
    },

    error:{
        color:'red',
        fontFamily:'Tajawal-Regular',
        marginBottom:6,
        fontSize:13
    },
    missWrapper:{
        marginBottom:10
            },
    error2:{
        color:'red',
        fontFamily:'Tajawal-Bold',
        marginBottom:-5,
        fontSize:12
    },
    socialTitle:{
        fontFamily:'Tajawal-Bold',
        color:textColor,
        alignSelf:'flex-start',
        marginHorizontal:5
    },

    borderStyleForSocial:{
        borderWidth:1.2,
        borderColor:'#b8b8b8 ',
        backgroundColor:'white',
        marginBottom:0,
        marginTop:11,
        height:47,
        width:'auto',
        minWidth:230,
    },

    socialBtn:{
        marginTop:11,
        height:42,
        width:'auto',
        minWidth:230,
    },
    socialText:{
        fontFamily:'Tajawal-Bold',
        fontSize:12.3,
        color:'#525252'
         
    },
    //enter phone.
    lock:{
        width:150,
        height:150,
        marginTop:80,
    },
    otp:{
        width:160,
        height:160,
        marginTop:80,
    },

    //OTP
    root: {padding: 20,},
    title: {textAlign: 'center', fontSize: 30,fontFamily:'Tajawal-Regular',},
    codeFieldRoot: {
      marginTop: 20,
      width: 280,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
    cellRoot: {
      backgroundColor:moreHady,
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomColor: '#ccc',
    //   borderBottomWidth: 1,
      borderRadius:10
    },
    cellText: {
      color: textColor,
      fontSize: 30,
      textAlign: 'center',
      fontFamily:'Tajawal-Regular',
    },
    focusCell: {
    //   borderBottomColor: '#007AFF',
    //   borderBottomWidth: 2,
    },
    familyState:{
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center'
    },
    familyStateImage:{
        width:60,
        height:60,
    },
    family_checkboxContainer:{
        borderColor:'black',
        borderWidth:1,
        borderRadius:50,
        alignSelf:'center'
    },
    familyText:{
        fontFamily:'Tajawal-Regular',
        color:textColor,
        fontSize:13,
        marginVertical:7,
    },
    inviteyesno:{
        fontFamily:'Tajawal-Regular',
        color:textColor,
        fontSize:13,
        marginStart:10 
      },
    notes:{
        fontSize:17 ,
        lineHeight:24,
        
        marginTop:10,
        fontFamily:'Tajawal-Regular',
    },
    
    container: {
        padding: 20,
        justifyContent: "center",
      },
      label: {
        fontSize: 16,
        fontFamily:'Tajawal-Bold',
        marginBottom: 5,
       
      },
      countrySelector: {
        paddingVertical: 10,
      },
      countryText: {
        fontSize: 18,
        fontFamily:'Tajawal-Bold',
        color: "#007AFF",
        textAlign: "center",
      },
      statusText: {
        fontSize: 18,
        marginTop: 10,
        fontFamily:'Tajawal-Bold',
      },
      inviteyesno:{
        fontFamily:'Tajawal-Regular',
        color:textColor,
        fontSize:13,
        marginStart:10 
      },
      yesnocontainer:{
         flexDirection:'row',
         justifyContent:'center',
         alignItems:'center' ,
         paddingVertical:10
      },
      success: {
        color: "green",
      },
      error: {
        color: "red",
      },

});

export default styles;