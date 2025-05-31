import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const CustomButton = ({ text, onPress, buttonStyle, textStyle }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, buttonStyle]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.buttonText, textStyle]}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CustomButton;
