import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import { textColor } from '../../utils/app';
const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;

const styles = ScaledSheet.create({
    item_wrapper:{
        marginVertical:10,
        borderBottomWidth:0.2,
        borderBottomColor:'#ddd',
        padding:20,
       
        backgroundColor:'white'
    },
    top_text : {
        lineHeight:25,
        fontSize: 15,
        marginBottom:6,
        fontFamily:'Tajawal-Medium' , color:textColor,
    },
    down_text : {
        
        fontSize: 12,
        
        fontFamily:'Tajawal-Regular' , color:textColor,
    },
    input:{
        fontFamily:'Tajawal-Regular' , color:textColor,
        flex:1,
        fontSize:14,
         padding:10,
    }
});

export default styles;