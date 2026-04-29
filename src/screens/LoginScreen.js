import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    // TODO: Add auth logic here
    navigation.replace('Dashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoEmoji}>🧠</Text>
          </View>
        </View>

        <Text style={styles.brandName}>Autism Pathways</Text>
        <Text style={styles.heading}>Welcome back</Text>
        <Text style={styles.subtext}>
          Sign in to continue supporting{'\n'}your child's journey.
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email address</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#CCCCCC"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#CCCCCC"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={['#00BCD4', '#9C27B0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity>
            <Text style={styles.signupLink}>Create one here</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rainbowBar} />

        <View style={styles.footerLinks}>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Terms of Service</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  logoBox: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: '#9C7FD0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 60,
  },
  brandName: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#001F3F',
    marginBottom: 25,
  },
  heading: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#001F3F',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginBottom: 35,
    lineHeight: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#001F3F',
    marginBottom: 10,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#FFFFFF',
  },
  forgotPassword: {
    color: '#5555FF',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'right',
  },
  gradientButton: {
    borderRadius: 25,
    marginTop: 30,
    marginBottom: 20,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDDDDD',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#999999',
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  signupText: {
    color: '#999999',
    fontSize: 14,
  },
  signupLink: {
    color: '#5555FF',
    fontSize: 14,
    fontWeight: '600',
  },
  rainbowBar: {
    height: 4,
    marginBottom: 20,
    borderRadius: 2,
    backgroundColor: '#FF0000',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
  },
  footerLink: {
    color: '#999999',
    fontSize: 14,
  },
});