import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import { backgroundColorHady, btnColor, btnColorDark, textColor } from '../../utils/app';

const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;

const styles = ScaledSheet.create({
  
 
 
 popupText:{
  fontFamily:'Tajawal-Medium',
  fontSize:14,
  lineHeight:22,
  color:textColor,
  marginBottom:5,
  // backgroundColor: 'red',
  paddingHorizontal:10,
  textAlign:'center'
 },
 
  sliderIcon:{
    color:'blue',
    fontSize:25,
    fontWeight:'bold',
    backgroundColor:"rgba(255,255,255,0.5)",
    borderRadius:5
    
  },

    //home
    wrapper: {
      marginVertical:10,
      paddingHorizontal:10,
      // backgroundColor:'white'
    },
    headerWrapper:{
      flexDirection:'row',
      justifyContent:'space-between',
      alignItems:'center',
      marginBottom:4,
      // backgroundColor:'#ddd',
      paddingHorizontal:10
    },
    header:{
      fontFamily:'Tajawal-Bold',
      fontSize:16,
      
      color:btnColorDark,
      marginBottom:5
    },
    slide1: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: '#9DD6EB'
    },
 

   
});

export default styles;