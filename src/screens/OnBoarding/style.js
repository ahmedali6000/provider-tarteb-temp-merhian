import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  bg: {
    flex: 1,
    width,
    height,
  },

  skip: {
    position: 'absolute',
    zIndex: 10,
    start:30
  },

  skipText: {
    color: '#fff',
    fontSize: 17,
  },

  gradient: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.5,
  },

  content: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    paddingHorizontal: 25,
  },

  title: {
    color: '#fff',
    fontSize: 24,
    marginBottom: 10,
    
  },

  desc: {
    color: '#ddd',
    fontSize: 15,
    marginBottom: 20,
  },

  button: {
    backgroundColor: '#2E86C1',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
  },

  dot: {
    backgroundColor: '#777',
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  activeDot: {
    backgroundColor: '#2E86C1',
    width: 8,
    height: 8,
    borderRadius: 4,
  },

});