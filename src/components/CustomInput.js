import React from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';

function CustomInput({label, error, ...props}) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholderTextColor="#94a3b8"
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {marginBottom: 14},
  label: {color: '#336397', fontSize: 14, fontWeight: '600', marginBottom: 6},
  input: {
    backgroundColor: '#fff', borderColor: '#B790A4', borderRadius: 10,
    borderWidth: 1, color: '#336397', fontSize: 15, minHeight: 46, paddingHorizontal: 14,
  },
  inputError: {borderColor: '#dc5a5a'},
  error: {color: '#B790A4', fontSize: 12, marginTop: 4},
});

export default CustomInput;
