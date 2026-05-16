import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import { backgroundColorHady, btnColor, moreHady, textColor } from '../../utils/app';

const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;

const styles = ScaledSheet.create({
    confirmSenWrapper:{
        flexDirection:'row',
        alignItems:'center',
        marginBottom:10,
        paddingStart:10
    },
    Wrapper:{
        flex:1
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
        justifyContent:'flex-start',
        alignItems:'center',
        flex:7,
        backgroundColor:'#f7f9f8',
        zIndex:1,
        // backgroundColor:'blue',
        marginHorizontal:'4%',
        paddingHorizontal:4,
        
    },
    input:{
        width:width/1.4,
        backgroundColor:'yellow'
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
        fontSize:22,
        color:'white',
        fontFamily:'Tajawal-Regular',
        textAlign:'center',
        marginTop:5,
        marginBottom:10
    },

    t3:{
        fontSize:13,
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
        height:'70%'
        
    },
    imgWrapper:{
        
        // position:'absolute',
        // top:-40,
        zIndex:99999999999999,
        paddingVertical:12,
        paddingHorizontal:15,
        borderRadius:13,
        backgroundColor:'white',
        marginBottom:'-11%',
        justifyContent:'center',
       
    },
    imgLogo:{
        width:60,
        height:60,
         
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
        fontSize:15.5,
        fontFamily:'Tajawal-Regular',
        color:btnColor
    },
    link:{
        fontFamily:'Tajawal-Regular',
        color:btnColor,
        marginVertical:2
    },
    desWrapper:{
        marginTop:5,
        // backgroundColor:'#ddd',
        width:width-40,
        alignItems:"center"
    },

    error:{
        color:'red',
        fontFamily:'Tajawal-Medium',
        marginBottom:6,
        fontSize:12
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
    title: {textAlign: 'center', fontSize: 30},
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
      borderRadius:50
    },
    cellText: {
      color: '#000',
      fontSize: 30,
      textAlign: 'center',
    },
    focusCell: {
    //   borderBottomColor: '#007AFF',
    //   borderBottomWidth: 2,
    },
    notes:{
        fontSize:17 ,
        lineHeight:24,
        fontFamily:'Tajawal-Regular',
        marginTop:10
    },
    error:{
        color:'red',
        color:textColor,fontFamily:'Tajawal-Regular',
        marginBottom:6,
        fontSize:13
    },
});

export default styles;