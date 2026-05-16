import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import { backgroundColorHady, btnColor, textColor } from '../../utils/app';

const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;

const styles = ScaledSheet.create({
   newContainer:{
      backgroundColor:'white',
      flexDirection:'row',
      justifyContent:'space-between',
      paddingHorizontal:15,
      paddingVertical:15,
      alignItems:'center',
      marginHorizontal:15,
      borderBottomWidth:1,
      borderColor:'#ddd'
  },
  newIcon:{
      fontSize:20
  },
  newTextWrapper:{
      flex:1,
      // backgroundColor:'#ddd',
      paddingHorizontal:10,
      flexDirection:'column',
      alignItems:'flex-start',
      justifyContent:'space-between'
  },
  title:{
      color:textColor,
      fontFamily:'Tajawal-Bold',
      fontSize:13.2,
  //    backgroundColor:'red'
  },
  des:{
      color:'#696868',
      fontFamily:'Tajawal-Bold',
      fontSize:13,
      lineHeight:18,
      marginTop:10
  },

  new_img_icon:{
   width:40,
   height:40
},
container:{
   flex: 1,
   justifyContent: 'center',
   borderRadius: 40,
   paddingHorizontal: '28@vs',
   // paddingVertical:'10@s',
   backgroundColor: '#F3F3F3',
   
},

header:{
   fontSize:30,
   color:'black',
   fontWeight: 'bold',
   textAlign: 'center',
   // backgroundColor:'red',
   marginVertical: '15@vs',
},




      contain:{
         paddingTop:10
      },
      edit_span:{
         fontFamily:'Tajawal-Medium',
         color:'green',
          
         
      },
     image:{
         width:50,
         height:50,
     },
     title:{
      color:textColor,fontFamily:'Tajawal-Medium',
      fontSize:12,
     },
     label:{
      color:textColor,
      fontFamily:'Tajawal-Regular',
       fontSize:13,
       marginBottom:8
     },
     text_under_label:{
        fontSize:14.3,
        color:textColor,fontFamily:'Tajawal-Medium',
        marginStart:10
     },
     text_container:{
      // marginTop:10,
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        paddingVertical:8
     },
     error:{
      color:'red',
      color:textColor,fontFamily:'Tajawal-Regular',
      marginBottom:6,
      fontSize:13
  },


  laguageWrapper:{
   justifyContent:'center',
   backgroundColor:'white',
   borderWidth:1,
   borderColor:'#ddd',
   padding:10,margin:10
},
});

export default styles;