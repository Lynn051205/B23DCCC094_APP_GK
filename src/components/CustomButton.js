import React from 'react';
import {ActivityIndicator, StyleSheet, Text, TouchableOpacity} from 'react-native';

function CustomButton({title, onPress, variant = 'primary', loading = false}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      disabled={loading}
      onPress={onPress}
      style={[styles.button, variant === 'danger' ? styles.danger : null, variant === 'secondary' ? styles.secondary : null]}>
      {loading ? <ActivityIndicator color={variant === 'secondary' ? '#336397' : '#fff'} /> : <Text style={[styles.text, variant === 'secondary' ? styles.secondaryText : null]}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {alignItems: 'center', backgroundColor: '#336397', borderRadius: 10, justifyContent: 'center', minHeight: 48, paddingHorizontal: 18},
  danger: {backgroundColor: '#B790A4'},
  secondary: {backgroundColor: '#ECECF3'},
  text: {color: '#fff', fontSize: 15, fontWeight: '700'},
  secondaryText: {color: '#336397'},
});

export default CustomButton;
