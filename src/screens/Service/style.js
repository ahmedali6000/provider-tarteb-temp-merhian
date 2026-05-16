import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import { backgroundColorHady, btnColor } from '../../utils/app';

const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;

const styles = ScaledSheet.create({
  
 bannerWrapper:{

 },
 banner:{
  width:width,
  height:width/2.3
 },


 screenWrapper:{
  flex:1,
 },
 otherPage:{
  flex:1,
  backgroundColor:'#f2f2f2'
 },
 screenWrapperSon:{
  paddingHorizontal:15,
  paddingVertical:15,
  width:width-30,
  alignSelf:'center',
   
  backgroundColor:'white',
  marginBottom:20
 }
 
 
 
   
});

export default styles;