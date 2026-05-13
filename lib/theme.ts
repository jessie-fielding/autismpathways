import { StyleSheet } from 'react-native';

export const COLORS = {
  // Brand palette
  blue: '#DCEEFF',
  lavender: '#E9E3FF',
  mint: '#E3F7F1',
  peach: '#FFE8DC',
  yellow: '#FFF6D8',
  bg: '#FAFAFC',
  white: '#FFFFFF',
  border: '#E8E8F0',
  
  // Accent borders
  blueAccent: '#A8CFFF',
  lavenderAccent: '#C5B8F0',
  mintAccent: '#7DD9C0',
  peachAccent: '#FFBB9A',
  yellowAccent: '#FFD97A',
  
  // Teal
  teal: '#3BBFA3',
  tealAccent: '#7DD9C0',

  // Brand purple
  purple: '#7C5CBF',
  purpleDark: '#5C3EA8',
  purpleLight: '#B8A0E8',
  
  // Text
  text: '#2F2F3A',
  textMid: '#5A5A72',
  textLight: '#9090A8',
  
  // Feedback
  successBg: '#E3F7F1',
  successBorder: '#99EDD8',
  successText: '#0A7A5A',
  warningBg: '#FFF6D8',
  warningBorder: '#FFE58A',
  warningText: '#7A6020',
  errorBg: '#FFF0EE',
  errorBorder: '#FFCFCA',
  errorText: '#C0392B',
  infoBg: '#DCEEFF',
  infoBorder: '#A8CFFF',
  infoText: '#2C5F8A',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  xs: 6,
  sm: 10,
  md: 18,
  lg: 24,
  pill: 99,
};

export const FONT_SIZES = {
  xs: 12,
  sm: 13,
  base: 14,
  md: 15,
  lg: 16,
  xl: 19,
  xxl: 24,
};

export const SHADOWS = {
  sm: {
    shadowColor: 'rgba(80, 60, 120, 0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 2,
  },
  md: {
    shadowColor: 'rgba(80, 60, 120, 0.1)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 5,
  },
  lg: {
    shadowColor: 'rgba(124, 92, 191, 0.35)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 8,
  },
};

export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  screenContent: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxxl,
  },
  heading1: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xl,
  },
  heading2: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  heading3: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  body: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMid,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 19,
  },
});

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 4,
    borderTopColor: 'transparent',
    ...SHADOWS.sm,
  },
  cardBlue: {
    borderTopColor: COLORS.blueAccent,
  },
  cardLavender: {
    borderTopColor: COLORS.lavenderAccent,
  },
  cardMint: {
    borderTopColor: COLORS.mintAccent,
  },
  cardPeach: {
    borderTopColor: COLORS.peachAccent,
  },
  cardYellow: {
    borderTopColor: COLORS.yellowAccent,
  },
  cardHeader: {
    marginBottom: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  cardDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
  },
  cardBody: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textMid,
    lineHeight: 22,
  },
});

export const buttonStyles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.lg,
  },
  buttonPrimary: {
    backgroundColor: COLORS.purple,
  },
  buttonPrimaryText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },
  buttonSecondary: {
    backgroundColor: COLORS.lavender,
    ...SHADOWS.sm,
  },
  buttonSecondaryText: {
    color: COLORS.purple,
    fontWeight: '600',
    fontSize: FONT_SIZES.md,
  },
  buttonSmall: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
});

export const inputStyles = StyleSheet.create({
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  inputFocused: {
    borderColor: COLORS.purple,
  },
});

export const noteBoxStyles = StyleSheet.create({
  noteBox: {
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    flexDirection: 'row',
  },
  noteBoxInfo: {
    backgroundColor: COLORS.infoBg,
    borderWidth: 1,
    borderColor: COLORS.infoBorder,
  },
  noteBoxSuccess: {
    backgroundColor: COLORS.successBg,
    borderWidth: 1,
    borderColor: COLORS.successBorder,
  },
  noteBoxWarning: {
    backgroundColor: COLORS.warningBg,
    borderWidth: 1,
    borderColor: COLORS.warningBorder,
  },
  noteBoxError: {
    backgroundColor: COLORS.errorBg,
    borderWidth: 1,
    borderColor: COLORS.errorBorder,
  },
  noteBoxContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  noteBoxTitle: {
    fontWeight: '700',
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.xs,
  },
  noteBoxText: {
    fontSize: FONT_SIZES.sm,
    lineHeight: 19,
  },
});
