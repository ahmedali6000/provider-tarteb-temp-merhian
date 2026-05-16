import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import { backgroundColorHady, btnColor, textColor } from '../../utils/app';

const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;

const styles = ScaledSheet.create({
    image: {
        width: 37, 
        height: 37,
       
    },
    
    title:{
        fontSize: 12,
        color:textColor,
        fontFamily:'Tajawal-Bold',
        marginTop: 7,
       
        
        
        
        
    },
    
    categoryWrapper: {
        
        margin: 0,
        // borderRadius: 10,
        // width:120,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'white'
         
    },
    service_image: {
        width: 260, 
        height: 180,
    },
    serviceWrapper: {
        paddingTop: 0,
        paddingBottom: 10,
        overflow:'hidden',
        margin: 2,
        borderRadius: 10,
        width:width/2.3,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'white'
        
    },
});

export default styles;