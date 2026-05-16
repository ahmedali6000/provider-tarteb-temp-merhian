import {StyleSheet} from 'react-native';
import { btnColor } from '../../utils/app';
import {Dimensions} from 'react-native';

const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;

const styles = StyleSheet.create({
  container: {
   
    justifyContent: 'center',
    backgroundColor: '#EDEDED',
    marginVertical: 20
     
  },
  title: {
    textAlign: 'left',
    fontSize: 22,
    fontWeight: '300',
    marginBottom: 20,
  },
  header: {
    backgroundColor: btnColor,
    overflow: 'hidden',
    padding: 15,
    flexDirection:'row',
    borderRadius:5,
  },
  downIcon:{
    color:'white',
    fontSize: 20
   
  },
  downiconWrapper:{
    paddingHorizontal:10,
    // backgroundColor:'blue',
    flexDirection: 'column',
    justifyContent:'center',
    alignContent:'center'
  },
  qWrapper: {
    flex:1,
    
  },
  headerText: {
    textAlign: 'justify',
    fontSize: 14,
    fontFamily:'Tajawal-Regular',
    color: 'white'
  },
  content: {
    padding: 20,
     
    backgroundColor: '#fff',
  },
  contentText: {
    textAlign: 'justify',
    lineHeight:24,
    fontSize: 15,
    fontFamily:'Tajawal-Regular',
    color: 'black'
  },
  active: {
    backgroundColor: 'red',
  },
  inactive: {
    backgroundColor: 'blue',
  },
  selectors: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  selector: {
    backgroundColor: 'red',
    padding: 10,
  },
  activeSelector: {
    fontWeight: 'bold',
  },
  selectTitle: {
    fontSize: 14,
    fontFamily:'Tajawal-Regular',
    padding: 10,
  },
  multipleToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 30,
    alignItems: 'center',
  },
  multipleToggle__title: {
    fontFamily:'Tajawal-Regular',
    marginRight: 8,
  },




  img:{
    width:90,
    height:90,
    borderRadius:20,
    marginVertical:10,
},
});
export default styles;