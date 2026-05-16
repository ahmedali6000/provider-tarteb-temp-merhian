
import {ScaledSheet} from 'react-native-size-matters';
import {Dimensions} from 'react-native';

const {width} = Dimensions.get('window');
const ContainerWidth = width/2;
const ContainerHeight = ContainerWidth;

const styles = ScaledSheet.create({
   lottie: {
    width: 190,
    height: 170
  }
});

export default styles;