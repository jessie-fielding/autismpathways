/**
 * DismissKeyboard.tsx
 *
 * Wraps the app to allow dismissing the keyboard by tapping anywhere outside
 * a text input. Uses Pressable instead of TouchableWithoutFeedback because
 * TouchableWithoutFeedback intercepts scroll gestures on iOS and prevents
 * ScrollViews from scrolling.
 *
 * Usage:
 *   import DismissKeyboard from '../../components/DismissKeyboard';
 *   <DismissKeyboard>
 *     <YourScreenContent />
 *   </DismissKeyboard>
 */

import React from 'react';
import { Keyboard, Pressable, StyleSheet } from 'react-native';

interface Props {
  children: React.ReactNode;
}

export default function DismissKeyboard({ children }: Props) {
  return (
    <Pressable
      style={styles.container}
      onPress={Keyboard.dismiss}
      accessible={false}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
