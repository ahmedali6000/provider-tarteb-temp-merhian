import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';

const {width} = Dimensions.get('window');
const ContainerWidth = width - 50;
const ContainerHeight = ContainerWidth;


const styles = ScaledSheet.create({
    image: {
        width: 180,
        height: 120,
        // resizeMode: 'contain',
        borderRadius:10,
        overflow:'hidden'

    },
    title:{
        fontSize: 19,
        color:'white',
        marginTop: 15,
        fontWeight: '600'
    },
    title2:{
        color:'white',
        fontSize: 16,
        marginTop: 7,
        fontWeight: '600'
    },
    title3:{
        color:'white',
        fontSize: 16,
        marginTop: 7,
        fontWeight: '600'
    },
    BranchWrapper: {
        paddingTop: 5,
        margin: 5,
        borderRadius: 10,
        height:width/2.2,
         width:width-20
        
    },
    textW:{
        borderTopEndRadius:15,
        borderTopStartRadius:15,
        paddingHorizontal:10,
        width:'100%',
        padding:5,
        backgroundColor:'#00000099',
        position:'absolute',
        bottom:0,
        alignSelf:'center'
    },

});

export default styles;