import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';

const styles = ScaledSheet.create({

    btn:{
        backgroundColor:'#2783c4',
        borderRadius:13,
        width:190
        
        
    },
    btnLable:{
        color:'white',
        paddingVertical:10,
        paddingHorizontal:10
    },
    disable : {
        opacity:0.6
    }
});

export default styles;