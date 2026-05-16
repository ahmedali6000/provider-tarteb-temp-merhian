import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import { backgroundColorHady, btnColor, moreHady, textColor } from '../../utils/app';

const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;

const styles = ScaledSheet.create({
    methodWrapper:{
        paddingVertical:15,
        paddingHorizontal:10,
        borderRadius:10,
        flexDirection:'row',
        // flex:1,
        justifyContent:'space-between',
        alignItems:'center',
        marginVertical:6,
        backgroundColor:'white',
    },
    eyeText:{
        color:textColor,
        fontSize:14
    },
    smallBTNContainer:{borderColor: btnColor, borderWidth:1.2,padding:15,borderRadius:10,marginHorizontal:10,backgroundColor:'white'},
    // smallBTNContainer:{borderColor: btnColor, borderWidth:1,padding:10,borderRadius:10},
    eyeIcon:{
        color:textColor,
        fontSize:21
    },
   title:{
     fontFamily:'Tajawal-Bold',
     color:textColor,
     fontSize:14
   },
    secondSection:{
        flex:1,
        marginVertical:15
    },
    imgLogo:{
        width:75,
        height:75
    },

    fabsWrapper:{
        flexDirection:'row',
        justifyContent:'space-around',
        overflow:'scroll',
        paddingVertical:10,
        backgroundColor:'#c4e7ff',
        borderBottomRightRadius:20,
        borderBottomLeftRadius:20,
    },
    fab:{
        // borderColor:btnColor,
        // borderWidth:2,
        // backgroundColor:backgroundColorHady,
        // borderRadius:12,
        marginHorizontal:10,
        alignSelf:'center',
        paddingHorizontal:5,
        paddingVertical:10,
    },
    fabTxt:{
        fontSize:13.5,
        fontFamily:'Tajawal-Bold',
        color:textColor,
    },
    fabTxtSeleted:{
        fontSize:15.5,
        fontFamily:'Tajawal-Bold',
        color:btnColor,
        borderBottomColor:btnColor,
        paddingBottom:5,
        borderBottomWidth:2,
        
    },
    fabIcon:{
        borderColor:btnColor,
        borderWidth:2,
        width:50,
        height:50,
        backgroundColor:backgroundColorHady,
        borderRadius:100,
        marginHorizontal:5,
        alignItems:'center',
        justifyContent:'center',
        
    },

    //orderScreen.
    avatarWrapper:{
        flex:1,
        // borderRadius:13,
        // overflow:'hidden',
        flexDirection:'row',
        justifyContent:'space-around',
        // marginHorizontal:20,
        paddingHorizontal:15,
        backgroundColor:'white',
        marginVertical:8
        
    },
    avatar:{
        width:100,
        height:100,
        alignSelf:'center',
        borderRadius:5
    },
    btn2Text:{
        color:'white',
        fontFamily:'Tajawal-Regular',
         fontSize:14
       },
       btn_pay:{
         alignSelf:'center',
         marginVertical: 7,
         borderRadius:10,
         alignItems:'center',
         justifyContent:'center',
         flexDirection:'row',
         backgroundColor: '#61995a',
         width:200,
         paddingVertical:12,
         
         
       },
       SrWrapper:{
            backgroundColor:'white',
            // paddingBottom:20
            marginBottom:20
       },
    alertWrapper:{
        backgroundColor:'green',
        padding:20
    },
    btncall:{
        borderColor:'#732802',
        borderWidth:2,
        backgroundColor:'#9e3500',
        borderRadius:3,
        marginHorizontal:5,
        flexDirection:'row',
        paddingHorizontal:20,
        paddingVertical:10,
        justifyContent:'center',
        alignItems:'center',
     
        
    }
});

export default styles;