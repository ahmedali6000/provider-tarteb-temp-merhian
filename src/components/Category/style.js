import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import { backgroundColorHady, btnColor } from '../../utils/app';

const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;

const styles = ScaledSheet.create({
 
note:{
    paddingVertical:13,
    paddingHorizontal:15,
    flex:1,
    backgroundColor:'white',
    flexDirection:'row',
    justifyContent:'space-between',
    marginVertical:5,
    borderWidth: 0.1,
    borderColor: '#ddd',
    borderBottomWidth: 1.5,
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    
    elevation: 5,  
},
 
noteT1:{
    fontSize: 17,
    fontWeight:'bold',
    marginBottom:5        
},
noteT2:{
        fontSize: 12,
        lineHeight:17,
        fontWeight:'bold'
},
 
 
  
});

export default styles;