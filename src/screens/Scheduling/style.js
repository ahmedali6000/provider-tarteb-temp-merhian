import {ScaledSheet} from 'react-native-size-matters';
import {btnColor,senColor,AppSmallBtn, textColor, btnColorDark} from '../../utils/app';

const styles = ScaledSheet.create({
    graphical_icon:{
        paddingHorizontal:4,
        width:103.2,
        height:117.6,
        marginEnd:15,
        alignSelf:'center' 
    },
    title1:{
        fontSize:19,
        marginHorizontal:10,
        color:btnColorDark,
        // backgroundColor:'red',
        marginTop:20,
        fontFamily:'Tajawal-Regular',
        // borderBottomColor:btnColor,
        // borderBottomWidth:2,
        alignSelf:'flex-start',
        paddingBottom:5,
        marginBottom:13,
        // textDecorationLine:'underline'
    },
    title:{
        fontSize:15,
        marginHorizontal:10,
        color:btnColorDark,
        // backgroundColor:'red',
        marginTop:20,
        fontFamily:'Tajawal-Bold',
        // borderBottomColor:btnColor,
        // borderBottomWidth:2,
        alignSelf:'flex-start',
        paddingBottom:5,
        marginBottom:13,
        // textDecorationLine:'underline'
    },
    wrapper:{
        paddingHorizontal:10,
        paddingBottom:30,
        backgroundColor:'white',
        marginHorizontal:0,
        marginTop:2,
        flex:1,
        justifyContent:'space-around'
    },
    check:{
        color:'green',
        fontSize:22,
        fontWeight:'bold',
       marginTop:-35,

       marginHorizontal:10
    },
    icon1:{
        color:textColor,
        fontSize:25,
        fontWeight:'bold',
        marginEnd:20
    },
    t1:{
        color:textColor,
        fontSize:15,
        fontFamily:'Tajawal-Bold',
        marginBottom:5
    },
    t1help:{
        color:'grey',
        fontSize:13,
        lineHeight:20,
        fontFamily:'Tajawal-Regular',
    },
    clickableWrapperWhite:{
        backgroundColor:'white',
        paddingVertical:15,
        flexDirection:'row',
        alignItems:'center',
        marginHorizontal:0,
        minHeight:100
    }
}); 

export default styles;