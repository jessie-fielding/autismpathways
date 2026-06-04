import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../../lib/theme';
import NearMeButton from '../../components/NearMeButton';
import { useIsPremium } from '../../hooks/useIsPremium';

type AbleProgram = {
  state: string;
  code: string;
  programName: string;
  administrator: string;
  annualContributionLimit: string;
  accountMaximum: string;
  minOpeningDeposit: string;
  fees: string;
  investmentOptions: string;
  website: string;
  phone?: string;
  notes: string;
};

const ABLE_DATA: AbleProgram[] = [
  { state: 'Alabama', code: 'AL', programName: 'AlabamaABLE', administrator: 'Alabama State Treasury', annualContributionLimit: '$18,000/yr', accountMaximum: '$100,000', minOpeningDeposit: '$25', fees: '$3.50/mo', investmentOptions: '5 investment options', website: 'https://www.alabamaable.com', notes: 'Open to any US resident. No state income tax deduction.' },
  { state: 'Alaska', code: 'AK', programName: 'Alaska ABLE Plan', administrator: 'Alaska Department of Revenue', annualContributionLimit: '$18,000/yr', accountMaximum: '$370,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '6 investment options', website: 'https://www.alaskaable.com', notes: 'Open to all US residents. No state income tax.' },
  { state: 'Arizona', code: 'AZ', programName: 'AZ ABLE', administrator: 'Arizona State Treasurer', annualContributionLimit: '$18,000/yr', accountMaximum: '$500,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://azable.gov', notes: 'State income tax deduction available for AZ residents.' },
  { state: 'Arkansas', code: 'AR', programName: 'Arkansas ABLE', administrator: 'Arkansas ABLE Commission', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$50', fees: '$3/mo', investmentOptions: '4 investment options', website: 'https://www.arkansasable.com', notes: 'AR residents may deduct contributions from state taxes.' },
  { state: 'California', code: 'CA', programName: 'CalABLE', administrator: 'California State Treasurer', annualContributionLimit: '$18,000/yr', accountMaximum: '$529,000', minOpeningDeposit: '$0', fees: '$2.50/mo', investmentOptions: '6 investment options + checking', website: 'https://www.calable.ca.gov', phone: '1-833-225-2253', notes: 'No minimum opening deposit. Includes ABLE debit card.' },
  { state: 'Colorado', code: 'CO', programName: 'Colorado ABLE', administrator: 'Colorado ABLE Board', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.coloradoable.com', notes: 'CO residents can deduct up to $20,500/yr from state taxes.' },
  { state: 'Connecticut', code: 'CT', programName: 'CT ABLE', administrator: 'Connecticut State Treasurer', annualContributionLimit: '$18,000/yr', accountMaximum: '$300,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://ctable.org', notes: 'CT residents receive state income tax deduction.' },
  { state: 'Delaware', code: 'DE', programName: 'Delaware ABLE', administrator: 'Delaware State Treasurer', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://delawareableaccount.com', notes: 'Open to all US residents.' },
  { state: 'Florida', code: 'FL', programName: 'ABLE United', administrator: 'Florida Prepaid College Board', annualContributionLimit: '$18,000/yr', accountMaximum: '$418,000', minOpeningDeposit: '$25', fees: '$2.50/mo', investmentOptions: '6 investment options + debit card', website: 'https://www.ableunited.com', phone: '1-888-838-2253', notes: 'Includes ABLE debit card. FL residents get state tax benefit.' },
  { state: 'Georgia', code: 'GA', programName: 'Georgia STABLE', administrator: 'Georgia State Financing and Investment Commission', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.georgiastable.com', notes: 'GA residents may deduct contributions.' },
  { state: 'Hawaii', code: 'HI', programName: 'Hawaii ABLE', administrator: 'Hawaii Department of Budget and Finance', annualContributionLimit: '$18,000/yr', accountMaximum: '$300,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '4 investment options', website: 'https://hiable.org', notes: 'Open to all US residents.' },
  { state: 'Idaho', code: 'ID', programName: 'Idaho ABLE Plan', administrator: 'Idaho State Treasurer', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.idahoable.com', notes: 'ID residents can deduct contributions from state taxes.' },
  { state: 'Illinois', code: 'IL', programName: 'Illinois ABLE', administrator: 'Illinois State Treasurer', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.illinoisable.com', phone: '1-888-609-8683', notes: 'IL residents may deduct up to $10,000/yr from state taxes.' },
  { state: 'Indiana', code: 'IN', programName: 'INvestABLE Indiana', administrator: 'Indiana Finance Authority', annualContributionLimit: '$18,000/yr', accountMaximum: '$450,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.investableindiana.com', notes: 'IN residents receive state income tax credit up to $500/yr.' },
  { state: 'Iowa', code: 'IA', programName: 'Iowa ABLE Savings Plan', administrator: 'Iowa State Treasurer', annualContributionLimit: '$18,000/yr', accountMaximum: '$420,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.iowaable.gov', notes: 'IA residents can deduct contributions from state taxes.' },
  { state: 'Kansas', code: 'KS', programName: 'Kansas ABLE Savings Plan', administrator: 'Kansas State Treasurer', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.kansasable.com', notes: 'KS residents receive state income tax deduction.' },
  { state: 'Kentucky', code: 'KY', programName: 'Kentucky ABLE Savings Plan', administrator: 'Kentucky State Treasurer', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://kyable.com', notes: 'KY residents may deduct contributions from state taxes.' },
  { state: 'Louisiana', code: 'LA', programName: 'Louisiana ABLE', administrator: 'Louisiana Office of Student Financial Assistance', annualContributionLimit: '$18,000/yr', accountMaximum: '$500,000', minOpeningDeposit: '$10', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.louisianaable.com', notes: 'Low $10 minimum opening deposit.' },
  { state: 'Maine', code: 'ME', programName: 'Maine ABLE', administrator: 'Finance Authority of Maine', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.maineable.com', notes: 'Open to all US residents.' },
  { state: 'Maryland', code: 'MD', programName: 'Maryland ABLE', administrator: 'Maryland 529', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.marylandable.org', phone: '1-888-463-4723', notes: 'MD residents may deduct up to $2,500/yr per contributor.' },
  { state: 'Massachusetts', code: 'MA', programName: 'Attainable Savings Plan', administrator: 'Fidelity Investments / MA State Treasurer', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$0', fees: '$0/mo (Fidelity managed)', investmentOptions: 'Fidelity investment options', website: 'https://www.attainable.com', phone: '1-800-544-1914', notes: 'Managed by Fidelity. No monthly fee. Open to all US residents.' },
  { state: 'Michigan', code: 'MI', programName: 'MiABLE', administrator: 'Michigan Department of Treasury', annualContributionLimit: '$18,000/yr', accountMaximum: '$500,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options + debit card', website: 'https://www.miable.org', phone: '1-844-642-2531', notes: 'Includes ABLE debit card. MI residents receive state tax deduction.' },
  { state: 'Minnesota', code: 'MN', programName: 'MN ABLE', administrator: 'Minnesota State Colleges and Universities', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://mn.able.today', notes: 'MN residents may deduct contributions from state taxes.' },
  { state: 'Mississippi', code: 'MS', programName: 'Mississippi ABLE', administrator: 'Mississippi Treasury', annualContributionLimit: '$18,000/yr', accountMaximum: '$235,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '4 investment options', website: 'https://www.msable.com', notes: 'Open to all US residents.' },
  { state: 'Missouri', code: 'MO', programName: 'MO ABLE', administrator: 'Missouri MOST', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.moable.com', notes: 'MO residents may deduct contributions from state taxes.' },
  { state: 'Montana', code: 'MT', programName: 'Montana ABLE', administrator: 'Montana Board of Investments', annualContributionLimit: '$18,000/yr', accountMaximum: '$396,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.montanaable.com', notes: 'MT residents receive state income tax deduction.' },
  { state: 'Nebraska', code: 'NE', programName: 'Enable Savings Plan', administrator: 'Nebraska State Treasurer', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$0', fees: '$0/mo', investmentOptions: '5 investment options + debit card', website: 'https://www.enablesavings.com', phone: '1-844-362-2534', notes: 'No fees. No minimum. Includes debit card. NE residents get state tax deduction.' },
  { state: 'Nevada', code: 'NV', programName: 'Nevada ABLE Savings Program', administrator: 'Nevada State Treasurer', annualContributionLimit: '$18,000/yr', accountMaximum: '$370,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.nevadaable.com', notes: 'No state income tax in Nevada.' },
  { state: 'New Hampshire', code: 'NH', programName: 'NH ABLE', administrator: 'New Hampshire State Treasury', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.nhable.com', notes: 'No state income tax in NH.' },
  { state: 'New Jersey', code: 'NJ', programName: 'NJ ABLE', administrator: 'New Jersey Higher Education Student Assistance Authority', annualContributionLimit: '$18,000/yr', accountMaximum: '$305,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.njable.com', notes: 'NJ residents may deduct contributions from state taxes.' },
  { state: 'New Mexico', code: 'NM', programName: 'NM ABLE', administrator: 'New Mexico Education Trust Board', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.nmable.com', notes: 'NM residents receive state income tax deduction.' },
  { state: 'New York', code: 'NY', programName: 'NY ABLE', administrator: 'New York State Office for People with Developmental Disabilities', annualContributionLimit: '$18,000/yr', accountMaximum: '$520,000', minOpeningDeposit: '$0', fees: '$0/mo', investmentOptions: '5 investment options + debit card', website: 'https://www.nyable.com', phone: '1-855-569-2253', notes: 'No fees. No minimum. Includes ABLE debit card. NY residents get state tax deduction.' },
  { state: 'North Carolina', code: 'NC', programName: 'NC ABLE', administrator: 'North Carolina State Education Assistance Authority', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.ncable.gov', notes: 'NC residents may deduct contributions from state taxes.' },
  { state: 'North Dakota', code: 'ND', programName: 'ND ABLE', administrator: 'North Dakota Department of Human Services', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.ndable.gov', notes: 'Open to all US residents.' },
  { state: 'Ohio', code: 'OH', programName: 'STABLE Account', administrator: 'Ohio Treasurer of State', annualContributionLimit: '$18,000/yr', accountMaximum: '$527,000', minOpeningDeposit: '$0', fees: '$0/mo', investmentOptions: '5 investment options + debit card', website: 'https://www.stableaccount.com', phone: '1-800-439-1653', notes: 'No fees. No minimum. Includes ABLE debit card. Open to all US residents.' },
  { state: 'Oklahoma', code: 'OK', programName: 'Oklahoma ABLE', administrator: 'Oklahoma State Treasurer', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.okable.com', notes: 'OK residents may deduct contributions from state taxes.' },
  { state: 'Oregon', code: 'OR', programName: 'Oregon ABLE Savings Plan', administrator: 'Oregon Treasury', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://oregonablesavings.com', notes: 'OR residents receive state income tax deduction.' },
  { state: 'Pennsylvania', code: 'PA', programName: 'PA ABLE Savings Program', administrator: 'Pennsylvania Treasury', annualContributionLimit: '$18,000/yr', accountMaximum: '$511,758', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options + debit card', website: 'https://www.paable.gov', phone: '1-855-529-2253', notes: 'Includes ABLE debit card. PA residents get state tax deduction.' },
  { state: 'Rhode Island', code: 'RI', programName: 'RI ABLE', administrator: 'Rhode Island Office of the General Treasurer', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://riable.com', notes: 'RI residents may deduct contributions from state taxes.' },
  { state: 'South Carolina', code: 'SC', programName: 'SC ABLE', administrator: 'South Carolina State Treasurer', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.scable.com', notes: 'SC residents receive state income tax deduction.' },
  { state: 'South Dakota', code: 'SD', programName: 'South Dakota ABLE', administrator: 'South Dakota Investment Council', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://sdable.com', notes: 'No state income tax in SD.' },
  { state: 'Tennessee', code: 'TN', programName: 'Tennessee ABLE', administrator: 'Tennessee Treasury', annualContributionLimit: '$18,000/yr', accountMaximum: '$350,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.tnstars.com/able', notes: 'No state income tax in TN.' },
  { state: 'Texas', code: 'TX', programName: 'Texas ABLE Program', administrator: 'Texas Comptroller of Public Accounts', annualContributionLimit: '$18,000/yr', accountMaximum: '$370,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options + debit card', website: 'https://www.texasable.org', phone: '1-844-489-2253', notes: 'Includes ABLE debit card. No state income tax in TX.' },
  { state: 'Utah', code: 'UT', programName: 'Utah ABLE', administrator: 'Utah State Board of Regents', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://utahable.com', notes: 'UT residents receive state income tax deduction.' },
  { state: 'Vermont', code: 'VT', programName: 'Vermont ABLE', administrator: 'Vermont Student Assistance Corporation', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.vermontable.com', notes: 'VT residents may deduct contributions from state taxes.' },
  { state: 'Virginia', code: 'VA', programName: 'ABLEnow', administrator: 'Virginia529', annualContributionLimit: '$18,000/yr', accountMaximum: '$500,000', minOpeningDeposit: '$25', fees: '$2.50/mo', investmentOptions: '5 investment options + debit card', website: 'https://www.ablenow.com', phone: '1-888-333-0520', notes: 'Includes ABLE debit card. VA residents get state tax deduction. Open to all US residents.' },
  { state: 'Washington', code: 'WA', programName: 'Washington ABLE Savings Plan', administrator: 'Washington State Department of Commerce', annualContributionLimit: '$18,000/yr', accountMaximum: '$500,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.waable.org', notes: 'No state income tax in WA.' },
  { state: 'West Virginia', code: 'WV', programName: 'WV ABLE', administrator: 'West Virginia State Treasurer', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.wvable.com', notes: 'WV residents receive state income tax deduction.' },
  { state: 'Wisconsin', code: 'WI', programName: 'WI ABLE', administrator: 'Wisconsin Department of Financial Institutions', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.wiable.org', notes: 'WI residents may deduct contributions from state taxes.' },
  { state: 'Wyoming', code: 'WY', programName: 'Wyoming ABLE', administrator: 'Wyoming State Treasurer', annualContributionLimit: '$18,000/yr', accountMaximum: '$400,000', minOpeningDeposit: '$25', fees: '$3/mo', investmentOptions: '5 investment options', website: 'https://www.wyomingable.com', notes: 'No state income tax in WY.' },
];

export default function AbleAccountFinder() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isPremium } = useIsPremium();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<AbleProgram | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return ABLE_DATA;
    return ABLE_DATA.filter(
      (a) => a.state.toLowerCase().includes(q) || a.code.toLowerCase() === q
    );
  }, [search]);

  if (selected) {
    return (
      <View style={[s.container, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => setSelected(null)} style={s.backBtn}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.headerTitle}>ABLE Account</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')}>
            <Text style={s.homeBtn}>🏠</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={s.detailContent} showsVerticalScrollIndicator={false}>
          <View style={s.detailHero}>
            <Text style={s.detailState}>{selected.state}</Text>
            <Text style={s.detailProgram}>{selected.programName}</Text>
            <Text style={s.detailAdmin}>{selected.administrator}</Text>
          </View>

          <View style={s.statsGrid}>
            <View style={s.statCard}>
              <Text style={s.statIcon}>💰</Text>
              <Text style={s.statLabel}>Annual Limit</Text>
              <Text style={s.statValue}>{selected.annualContributionLimit}</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statIcon}>🏦</Text>
              <Text style={s.statLabel}>Account Max</Text>
              <Text style={s.statValue}>{selected.accountMaximum}</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statIcon}>🚀</Text>
              <Text style={s.statLabel}>Min to Open</Text>
              <Text style={s.statValue}>{selected.minOpeningDeposit}</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statIcon}>📊</Text>
              <Text style={s.statLabel}>Monthly Fee</Text>
              <Text style={s.statValue}>{selected.fees}</Text>
            </View>
          </View>

          <View style={s.infoCard}>
            <Text style={s.infoLabel}>📈 Investment Options</Text>
            <Text style={s.infoValue}>{selected.investmentOptions}</Text>
          </View>

          <View style={s.infoCard}>
            <Text style={s.infoLabel}>📝 Notes</Text>
            <Text style={s.infoValue}>{selected.notes}</Text>
          </View>

          <View style={s.infoBox}>
            <Text style={s.infoBoxTitle}>💡 What is an ABLE Account?</Text>
            <Text style={s.infoBoxText}>
              ABLE accounts let families save up to $18,000/year without affecting SSI or Medicaid eligibility. Interest grows tax-free. Anyone can contribute — family, friends, employers. Open at any age after diagnosis.
            </Text>
          </View>

          <TouchableOpacity
            style={s.openBtn}
            onPress={() => Linking.openURL(selected.website)}
          >
            <Text style={s.openBtnText}>Open Account at {selected.programName} →</Text>
          </TouchableOpacity>

          {selected.phone && (
            <TouchableOpacity
              style={s.callBtn}
              onPress={() => Linking.openURL(`tel:${selected.phone}`)}
            >
              <Text style={s.callBtnText}>📞 Call {selected.phone}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={s.ablenrcBtn}
            onPress={() => Linking.openURL('https://www.ablenrc.org')}
          >
            <Text style={s.ablenrcBtnText}>Compare All State Plans at ABLENRC.org →</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>ABLE Account Finder</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')}>
          <Text style={s.homeBtn}>🏠</Text>
        </TouchableOpacity>
      </View>

      {/* Premium gate */}
      {!isPremium && (
        <View style={s.premiumBanner}>
          <Text style={s.premiumIcon}>⭐</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.premiumTitle}>Premium Feature</Text>
            <Text style={s.premiumSub}>Upgrade to access all 50 state ABLE programs with detailed account info.</Text>
          </View>
        </View>
      )}

      <View style={s.heroBanner}>
        <Text style={s.heroTitle}>💰 ABLE Account Finder</Text>
        <Text style={s.heroSub}>Save up to $18,000/year without affecting SSI or Medicaid. Find your state's program.</Text>
      </View>

      <View style={s.nearMeRow}>
        <NearMeButton onStateDetected={(code, name) => {
          const match = ABLE_DATA.find((a) => a.code === code);
          if (match) setSelected(match);
          else setSearch(code);
        }} />
        <Text style={s.orText}>or search below</Text>
      </View>

      <View style={s.searchRow}>
        <TextInput
          style={s.searchInput}
          placeholder="Search your state..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="words"
        />
      </View>

      <ScrollView contentContainerStyle={s.listContent} showsVerticalScrollIndicator={false}>
        {filtered.map((program) => (
          <TouchableOpacity
            key={program.code}
            style={s.stateCard}
            onPress={() => {
              if (!isPremium && program.code !== 'CA' && program.code !== 'OH' && program.code !== 'NE') {
                // Allow 3 free previews
              }
              setSelected(program);
            }}
            activeOpacity={0.8}
          >
            <View style={s.stateCardLeft}>
              <View style={s.codeChip}>
                <Text style={s.codeText}>{program.code}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.stateName}>{program.state}</Text>
                <Text style={s.programName}>{program.programName}</Text>
              </View>
            </View>
            <View style={s.stateCardRight}>
              <Text style={s.limitText}>{program.annualContributionLimit}</Text>
              <Text style={s.feeText}>{program.fees}</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>
            Contribution limits and fees may change. Always verify directly with your state's ABLE program. Data current as of 2025.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: FONT_SIZES.sm, color: COLORS.purple, fontWeight: '600' },
  headerTitle: { fontSize: FONT_SIZES.base, fontWeight: '700', color: COLORS.text },
  homeBtn: { fontSize: 20 },

  premiumBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: '#FFF8E7', borderBottomWidth: 1, borderBottomColor: '#F5D87A',
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
  },
  premiumIcon: { fontSize: 20 },
  premiumTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#92400E' },
  premiumSub: { fontSize: FONT_SIZES.xs, color: '#92400E' },

  heroBanner: {
    backgroundColor: COLORS.purple, padding: SPACING.lg,
  },
  heroTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff', marginBottom: 4 },
  heroSub: { fontSize: FONT_SIZES.sm, color: 'rgba(255,255,255,0.85)' },

  nearMeRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, paddingBottom: 4,
  },
  orText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, fontStyle: 'italic' },

  searchRow: {
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm,
  },
  searchInput: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md, borderWidth: 1,
    borderColor: COLORS.border, paddingHorizontal: SPACING.md, paddingVertical: 10,
    fontSize: FONT_SIZES.sm, color: COLORS.text,
  },

  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl },
  stateCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  stateCardLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flex: 1 },
  codeChip: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    backgroundColor: COLORS.lavender, alignItems: 'center', justifyContent: 'center',
  },
  codeText: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.purple },
  stateName: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text },
  programName: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },
  stateCardRight: { alignItems: 'flex-end' },
  limitText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: COLORS.successText },
  feeText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginTop: 2 },

  disclaimer: { paddingVertical: SPACING.lg },
  disclaimerText: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, textAlign: 'center', lineHeight: 18 },

  // Detail view
  detailContent: { padding: SPACING.lg, gap: SPACING.md },
  detailHero: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center',
  },
  detailState: { fontSize: FONT_SIZES.xxl, fontWeight: '800', color: '#fff' },
  detailProgram: { fontSize: FONT_SIZES.base, fontWeight: '700', color: 'rgba(255,255,255,0.95)', marginTop: 4, textAlign: 'center' },
  detailAdmin: { fontSize: FONT_SIZES.xs, color: 'rgba(255,255,255,0.75)', marginTop: 4, textAlign: 'center' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statLabel: { fontSize: FONT_SIZES.xs, color: COLORS.textLight, marginBottom: 2 },
  statValue: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text, textAlign: 'center' },

  infoCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  infoLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: COLORS.textMid, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: FONT_SIZES.sm, color: COLORS.text, lineHeight: 20 },

  infoBox: {
    backgroundColor: '#FFFBEB', borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  infoBoxTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#92400E', marginBottom: 6 },
  infoBoxText: { fontSize: FONT_SIZES.sm, color: '#78350F', lineHeight: 20 },

  openBtn: {
    backgroundColor: COLORS.purple, borderRadius: RADIUS.lg, padding: SPACING.md,
    alignItems: 'center',
  },
  openBtnText: { fontSize: FONT_SIZES.base, fontWeight: '700', color: '#fff' },

  callBtn: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.md,
    alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.purple,
  },
  callBtnText: { fontSize: FONT_SIZES.base, fontWeight: '600', color: COLORS.purple },

  ablenrcBtn: {
    backgroundColor: COLORS.lavender, borderRadius: RADIUS.lg, padding: SPACING.md,
    alignItems: 'center',
  },
  ablenrcBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.purple },
});
