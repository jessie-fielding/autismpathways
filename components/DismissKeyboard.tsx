/**
 * DismissKeyboard.tsx
 *
 * Wrap any screen (or the root layout) with this component to allow users to
 * dismiss the keyboard by tapping anywhere outside a text input.
 *
 * Usage:
 *   import DismissKeyboard from '../../components/DismissKeyboard';
 *   <DismissKeyboard>
 *     <YourScreenContent />
 *   </DismissKeyboard>
 */

import React from 'react';
import { Keyboard, TouchableWithoutFeedback, View, StyleSheet } from 'react-native';

interface Props {
  children: React.ReactNode;
}

export default function DismissKeyboard({ children }: Props) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {children}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
