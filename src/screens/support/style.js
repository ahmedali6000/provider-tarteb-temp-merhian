import {ScaledSheet} from 'react-native-size-matters';
import {btnColor,senColor,AppSmallBtn, textColor} from '../../utils/app';

const styles = ScaledSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        borderRadius: 40,
        paddingHorizontal: '20@vs',
        backgroundColor: '#E0E0E0',
    },
    mesBoxWrapper:{
        marginVertical:5,
    },
    nextIMGViewWrapper:{
        flexDirection:'row',
        justifyContent:'flex-start',
         
    },
    des:{
        fontFamily:'Tajawal-Medium',
        color:textColor,
        fontSize:14,
        lineHeight:22
    },
    img:{
        width:70,
        height:70,
        marginEnd:10,
        borderRadius:7
    },
    nextIMGView:{
         
    },
    name:{
        fontFamily:'Tajawal-Bold',
        color:textColor,
        fontSize:14,
        textAlign:'left',
        marginBottom:10
    },
    info:{
        fontFamily:'Tajawal-Medium',
        color:textColor,
        fontSize:12,
    },
    date:{
        fontFamily:'Tajawal-Medium',
        color:textColor,
        fontSize:13,
        textAlign:'left',
        marginBottom:5
    },
    msg:{
        fontFamily:'Tajawal-Bold',
        color:textColor,
        fontSize:14,
        lineHeight:23,
        marginTop:10
         
    },
    header:{
        fontSize:25,
        color:'black',
        
        textAlign: 'center',
        fontFamily:'Tajawal-Bold',
        color:textColor,
        marginVertical: '20@vs',
    },
    text:{
        color:textColor,
        fontFamily:'Tajawal-Medium',
        padding: '25@s',
        textAlign:'center',
        lineHeight:27,
        fontSize: 16
    },
    textArea:{
        textAlign: 'center',
        paddingTop:20,
        borderRadius:10,
        borderColor:'#ddd',
        borderWidth:1,
        fontSize: 16,
        backgroundColor:'white',
        color:textColor,
        fontFamily:'Tajawal-Medium',
        justifyContent:'center',
        alignItems:'center',
        alignContent:'center'
    },
    btnfinish:AppSmallBtn,
    btnWrapper:{
        flexDirection: 'row',
        marginVertical: 30,
        // backgroundColor: 'red',
        justifyContent: 'center'    
    },
    helpHeader: {
        fontSize:22,
        // marginHorizontal:20,
        color:'#5B5B5B',
        fontWeight: '700',
        marginVertical: '30@vs',
    },
}); 

export default styles;