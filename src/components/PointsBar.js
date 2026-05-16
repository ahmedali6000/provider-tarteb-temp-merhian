import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

const PointsBar = () => {
      const points = useSelector( state => state.auth.points);
    
  const maxPoints = 2000;
  const percentage = Math.min((points / maxPoints) * 100, 100);

  let barColor = '#ccc';
  let level = 'عادي';
  let nextGoal = 1000;

  if (percentage >= 80) {
    barColor = '#FFD700';
    level = 'ذهبي';
    nextGoal = null;
  } else if (percentage >= 50) {
    barColor = '#C0C0C0';
    level = 'فضي';
    nextGoal = 2000;
  } else {
    barColor = '#1E90FF';
    level = 'عادي';
    nextGoal = 1000;
  }

  const remainingPoints = nextGoal ? nextGoal - points : 0;

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${percentage}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={styles.statusText}>
        {`🔹 ${points} / ${maxPoints} نقطة (${Math.round(percentage)}%) - المستوى: ${level}`}
      </Text>
      {nextGoal && (
        <Text style={styles.tipText}>
          🎯 تبقّى لك {remainingPoints} نقطة للوصول إلى مستوى {nextGoal === 1000 ? 'فضي' : 'ذهبي'}!
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 0,
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  barBackground: {
    height: 12,
    backgroundColor: '#eee',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily:'Tajawal-Bold',
    textAlign: 'center',
    color: '#333',
  },
  tipText: {
    marginTop: 4,
    fontSize: 13,
   
    textAlign: 'center',
    color: '#666',
    fontFamily:'Tajawal-Regular',
  },
});

export default PointsBar;
