import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';
import { Language_KEY, backgroundColorHady, backgroundColorHadytop, btnColor, btnColorDark, moreHady, textColor } from '../../utils/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import React from 'react';
// import { useSelector } from 'react-redux';

const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;
//  const lang = useSelector( state => state.order);
 
const styles = ScaledSheet.create({
 
note:{
     
    paddingVertical:13,
    paddingHorizontal:15,
    flex:1,
    backgroundColor:'white',
    flexDirection:'row',
    justifyContent:'space-between',
    marginVertical:1,
    borderWidth: 0.1,
    borderColor: '#ddd',
    borderBottomWidth: 1.5,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 0.3,   
    // backgroundColor: backgroundColorHady 
},
 
noteT1:{
    fontSize: 14,
   
    marginBottom:15,
    marginTop:5,    
    fontFamily:'Tajawal-Medium' , color: textColor  
},
note2_3Wrapper:{
    flexDirection:'row',
    flex:1
},
countersW:{
    flex:1,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    // backgroundColor:'red'

},
noteT2:{
        fontSize: 13,
        fontFamily:'Tajawal-Medium' , color: textColor ,
        backgroundColor:moreHady,
        padding:5,
        width:80,
        borderRadius:5,
        textAlign:'center'
},
noteT3:{
    fontSize: 13,
    fontWeight:'bold',
    backgroundColor:btnColor,
    color:'white',
    padding:5,
    width:80,
    borderRadius:15,
    textAlign:'center'
},
 



header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchInput: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
    width: '40%',
    elevation: 2,
  },
  list: {
    paddingHorizontal: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 7,
    alignItems: 'center',
    elevation: 1,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  details: {
    flex: 1,
    flexDirection:'column',
    justifyContent:'flex-end',
    alignItems:'flex-start',
    // backgroundColor:'red'
  },
  name: {
    // marginTop:5,
    fontSize: 14,
    lineHeight:20,
    fontFamily: 'Tajawal-Bold',
    color: '#333',
  },
  type: {
    fontSize: 13.2,
    color: '#888',
    fontFamily: 'Tajawal-Medium',
    marginVertical: 4,
  },
  priceAndRating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 16,
    fontFamily: 'Tajawal-Bold',
    color: '#FF5733',
    // color: btnColor,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    color: '#333',
  },
  reviews: {
    fontSize: 12,
    color: '#888',
  },
  bookmarkButtonRatContainer:{
    position:'absolute',
    top:7,
    end:7,
    flexDirection:'row'
  },
  bookmarkButton: {
    marginStart: 5,
    // backgroundColor:'red',
//   height:'100%'
  },
  bookmarkText: {
    fontSize: 18,
    color: '#6A5ACD',
  },
  addRemoveIcon:{
    fontSize:16,
    fontWeight:'bold',
    color:btnColorDark,
   
  },
  iconContainer:{
    width:50,
    height:50,
    backgroundColor:backgroundColorHadytop,
    borderRadius:50,
    justifyContent:'center',
    alignItems:'center'
}
});

export default styles;