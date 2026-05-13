import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../lib/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { fontSize: 20, color: COLORS.purple, marginRight: SPACING.md },
  headerTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: COLORS.text },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
  },
  mainTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.purple,
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  applicationCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  waiverName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.text,
  },
  navButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navButton: {
    flex: 1,
    padding: SPACING.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  navButtonPrimary: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  navButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  navButtonTextPrimary: {
    color: COLORS.white,
  },
});

interface WaitlistApplication {
  id: string;
  name: string;
  state: string;
  agency: string;
  appliedDate: string;
  checkInDate: string;
  status: string;
}

export default function WaitlistTrackerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [applications, setApplications] = useState<WaitlistApplication[]>([]);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const saved = await AsyncStorage.getItem('waitlist_applications');
      if (saved) {
        setApplications(JSON.parse(saved));
      } else {
        const defaultApps: WaitlistApplication[] = [
          {
            id: 'hcbs-tx',
            name: 'HCBS Waiver',
            state: 'Texas',
            agency: 'HHSC',
            appliedDate: 'Mar 14, 2023',
            checkInDate: 'Mar 2026',
            status: 'on-list',
          },
          {
            id: 'hcs-tx',
            name: 'HCS Waiver',
            state: 'Texas',
            agency: 'DADS',
            appliedDate: 'Mar 14, 2023',
            checkInDate: 'in 47 days',
            status: 'coming-soon',
          },
        ];
        setApplications(defaultApps);
        await AsyncStorage.setItem('waitlist_applications', JSON.stringify(defaultApps));
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const handleOffWaitlist = () => {
    Alert.alert(
      'Mark as Off Waitlist',
      'Confirm: Your child is now approved and off the waitlist?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            await AsyncStorage.setItem('off_waitlist_date', new Date().toISOString());
            router.replace('/(tabs)/dashboard');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Waiver Applications</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.mainTitle}>Track Your Applications</Text>
          <Text style={styles.sectionLabel}>YOUR APPLICATIONS</Text>
          <Text style={styles.sectionTitle}>{applications.length} active waivers</Text>

          {applications.map((app) => (
            <View key={app.id} style={styles.applicationCard}>
              <Text style={styles.waiverName}>{app.name}</Text>
              <Text>{app.state} - {app.agency}</Text>
              <Text>Applied: {app.appliedDate}</Text>
              <Text>Status: {app.status}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.navButtons}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.back()} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
          <Text style={styles.navButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={handleOffWaitlist}
        >
          <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>Off Waitlist</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}