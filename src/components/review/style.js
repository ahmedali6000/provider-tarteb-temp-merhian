import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import { backgroundColorHady, btnColor } from '../../utils/app';

const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;

const styles = ScaledSheet.create({
    container:{
        
    },
    topSection:{
        flex:1
    },
    lowerSection:{

    },
    image:{
        width:80,
        height:80,
        borderRadius:30,
        marginEnd:10,
    },
     
});

export default styles;