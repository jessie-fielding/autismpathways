/**
 * CityCountyAutocomplete
 *
 * A lightweight autocomplete text input for US cities and counties.
 * Uses a bundled dataset — no API key required.
 *
 * Uses an INLINE dropdown (not absolute-positioned) so it works correctly
 * inside ScrollViews without clipping or zIndex issues.
 *
 * Props:
 *   value          — current text value
 *   onChangeText   — called when text changes
 *   onSelect       — called when user picks a suggestion { city, county, state }
 *   placeholder    — input placeholder
 *   style          — optional extra style for the input
 *   stateFilter    — optional 2-letter state code to restrict suggestions
 *   label          — optional label above the input
 */
import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ViewStyle, TextStyle,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../lib/theme';

// ── Bundled city/county dataset (top ~300 US cities + common county names) ─────
// Format: [city, county, stateCode]
const CITIES: [string, string, string][] = [
  ['Anchorage','Anchorage','AK'],['Fairbanks','Fairbanks North Star','AK'],
  ['Birmingham','Jefferson','AL'],['Huntsville','Madison','AL'],['Mobile','Mobile','AL'],['Montgomery','Montgomery','AL'],
  ['Fayetteville','Washington','AR'],['Fort Smith','Sebastian','AR'],['Little Rock','Pulaski','AR'],
  ['Chandler','Maricopa','AZ'],['Gilbert','Maricopa','AZ'],['Glendale','Maricopa','AZ'],['Mesa','Maricopa','AZ'],['Phoenix','Maricopa','AZ'],['Scottsdale','Maricopa','AZ'],['Tempe','Maricopa','AZ'],['Tucson','Pima','AZ'],
  ['Anaheim','Orange','CA'],['Bakersfield','Kern','CA'],['Chula Vista','San Diego','CA'],['Fresno','Fresno','CA'],['Irvine','Orange','CA'],['Long Beach','Los Angeles','CA'],['Los Angeles','Los Angeles','CA'],['Oakland','Alameda','CA'],['Riverside','Riverside','CA'],['Sacramento','Sacramento','CA'],['San Bernardino','San Bernardino','CA'],['San Diego','San Diego','CA'],['San Francisco','San Francisco','CA'],['San Jose','Santa Clara','CA'],['Santa Ana','Orange','CA'],['Stockton','San Joaquin','CA'],
  ['Aurora','Arapahoe','CO'],['Colorado Springs','El Paso','CO'],['Denver','Denver','CO'],['Fort Collins','Larimer','CO'],['Lakewood','Jefferson','CO'],['Pueblo','Pueblo','CO'],
  ['Bridgeport','Fairfield','CT'],['Hartford','Hartford','CT'],['New Haven','New Haven','CT'],['Stamford','Fairfield','CT'],
  ['Dover','Kent','DE'],['Wilmington','New Castle','DE'],
  ['Cape Coral','Lee','FL'],['Clearwater','Pinellas','FL'],['Coral Springs','Broward','FL'],['Fort Lauderdale','Broward','FL'],['Gainesville','Alachua','FL'],['Hialeah','Miami-Dade','FL'],['Jacksonville','Duval','FL'],['Miami','Miami-Dade','FL'],['Miami Gardens','Miami-Dade','FL'],['Orlando','Orange','FL'],['Pembroke Pines','Broward','FL'],['Port St. Lucie','St. Lucie','FL'],['St. Petersburg','Pinellas','FL'],['Tallahassee','Leon','FL'],['Tampa','Hillsborough','FL'],
  ['Athens','Clarke','GA'],['Atlanta','Fulton','GA'],['Augusta','Richmond','GA'],['Columbus','Muscogee','GA'],['Macon','Bibb','GA'],['Savannah','Chatham','GA'],
  ['Honolulu','Honolulu','HI'],
  ['Boise','Ada','ID'],['Idaho Falls','Bonneville','ID'],['Meridian','Ada','ID'],['Nampa','Canyon','ID'],
  ['Aurora','Kane','IL'],['Chicago','Cook','IL'],['Joliet','Will','IL'],['Naperville','DuPage','IL'],['Peoria','Peoria','IL'],['Rockford','Winnebago','IL'],['Springfield','Sangamon','IL'],
  ['Evansville','Vanderburgh','IN'],['Fort Wayne','Allen','IN'],['Indianapolis','Marion','IN'],['South Bend','St. Joseph','IN'],
  ['Cedar Rapids','Linn','IA'],['Des Moines','Polk','IA'],['Iowa City','Johnson','IA'],['Sioux City','Woodbury','IA'],
  ['Kansas City','Wyandotte','KS'],['Olathe','Johnson','KS'],['Overland Park','Johnson','KS'],['Topeka','Shawnee','KS'],['Wichita','Sedgwick','KS'],
  ['Bowling Green','Warren','KY'],['Lexington','Fayette','KY'],['Louisville','Jefferson','KY'],['Owensboro','Daviess','KY'],
  ['Baton Rouge','East Baton Rouge','LA'],['Lafayette','Lafayette','LA'],['New Orleans','Orleans','LA'],['Shreveport','Caddo','LA'],
  ['Portland','Cumberland','ME'],
  ['Baltimore','Baltimore City','MD'],['Frederick','Frederick','MD'],['Rockville','Montgomery','MD'],
  ['Boston','Suffolk','MA'],['Cambridge','Middlesex','MA'],['Lowell','Middlesex','MA'],['Springfield','Hampden','MA'],['Worcester','Worcester','MA'],
  ['Ann Arbor','Washtenaw','MI'],['Detroit','Wayne','MI'],['Flint','Genesee','MI'],['Grand Rapids','Kent','MI'],['Lansing','Ingham','MI'],['Sterling Heights','Macomb','MI'],['Warren','Macomb','MI'],
  ['Bloomington','McLean','MN'],['Duluth','St. Louis','MN'],['Minneapolis','Hennepin','MN'],['Rochester','Olmsted','MN'],['St. Paul','Ramsey','MN'],
  ['Gulfport','Harrison','MS'],['Jackson','Hinds','MS'],
  ['Columbia','Boone','MO'],['Independence','Jackson','MO'],['Kansas City','Jackson','MO'],['Springfield','Greene','MO'],['St. Louis','St. Louis City','MO'],
  ['Billings','Yellowstone','MT'],['Great Falls','Cascade','MT'],['Missoula','Missoula','MT'],
  ['Lincoln','Lancaster','NE'],['Omaha','Douglas','NE'],
  ['Henderson','Clark','NV'],['Las Vegas','Clark','NV'],['North Las Vegas','Clark','NV'],['Reno','Washoe','NV'],
  ['Manchester','Hillsborough','NH'],['Nashua','Hillsborough','NH'],
  ['Elizabeth','Union','NJ'],['Jersey City','Hudson','NJ'],['Newark','Essex','NJ'],['Paterson','Passaic','NJ'],['Trenton','Mercer','NJ'],
  ['Albuquerque','Bernalillo','NM'],['Las Cruces','Doña Ana','NM'],['Santa Fe','Santa Fe','NM'],
  ['Albany','Albany','NY'],['Buffalo','Erie','NY'],['New York City','New York','NY'],['Rochester','Monroe','NY'],['Syracuse','Onondaga','NY'],['Yonkers','Westchester','NY'],
  ['Cary','Wake','NC'],['Charlotte','Mecklenburg','NC'],['Durham','Durham','NC'],['Fayetteville','Cumberland','NC'],['Greensboro','Guilford','NC'],['Raleigh','Wake','NC'],['Winston-Salem','Forsyth','NC'],
  ['Bismarck','Burleigh','ND'],['Fargo','Cass','ND'],
  ['Akron','Summit','OH'],['Cincinnati','Hamilton','OH'],['Cleveland','Cuyahoga','OH'],['Columbus','Franklin','OH'],['Dayton','Montgomery','OH'],['Toledo','Lucas','OH'],
  ['Broken Arrow','Tulsa','OK'],['Norman','Cleveland','OK'],['Oklahoma City','Oklahoma','OK'],['Tulsa','Tulsa','OK'],
  ['Eugene','Lane','OR'],['Portland','Multnomah','OR'],['Salem','Marion','OR'],
  ['Allentown','Lehigh','PA'],['Erie','Erie','PA'],['Philadelphia','Philadelphia','PA'],['Pittsburgh','Allegheny','PA'],['Reading','Berks','PA'],['Scranton','Lackawanna','PA'],
  ['Cranston','Providence','RI'],['Providence','Providence','RI'],
  ['Charleston','Charleston','SC'],['Columbia','Richland','SC'],['Greenville','Greenville','SC'],['North Charleston','Charleston','SC'],
  ['Rapid City','Pennington','SD'],['Sioux Falls','Minnehaha','SD'],
  ['Chattanooga','Hamilton','TN'],['Clarksville','Montgomery','TN'],['Knoxville','Knox','TN'],['Memphis','Shelby','TN'],['Nashville','Davidson','TN'],
  ['Abilene','Taylor','TX'],['Amarillo','Potter','TX'],['Arlington','Tarrant','TX'],['Austin','Travis','TX'],['Beaumont','Jefferson','TX'],['Corpus Christi','Nueces','TX'],['Dallas','Dallas','TX'],['El Paso','El Paso','TX'],['Fort Worth','Tarrant','TX'],['Frisco','Collin','TX'],['Garland','Dallas','TX'],['Grand Prairie','Dallas','TX'],['Houston','Harris','TX'],['Irving','Dallas','TX'],['Killeen','Bell','TX'],['Laredo','Webb','TX'],['Lubbock','Lubbock','TX'],['McAllen','Hidalgo','TX'],['McKinney','Collin','TX'],['Mesquite','Dallas','TX'],['Midland','Midland','TX'],['Plano','Collin','TX'],['San Antonio','Bexar','TX'],['Tyler','Smith','TX'],['Waco','McLennan','TX'],
  ['Provo','Utah','UT'],['Salt Lake City','Salt Lake','UT'],['West Valley City','Salt Lake','UT'],
  ['Burlington','Chittenden','VT'],
  ['Alexandria','Alexandria City','VA'],['Arlington','Arlington','VA'],['Chesapeake','Chesapeake City','VA'],['Norfolk','Norfolk City','VA'],['Richmond','Richmond City','VA'],['Virginia Beach','Virginia Beach City','VA'],
  ['Bellevue','King','WA'],['Seattle','King','WA'],['Spokane','Spokane','WA'],['Tacoma','Pierce','WA'],['Vancouver','Clark','WA'],
  ['Charleston','Kanawha','WV'],['Huntington','Cabell','WV'],
  ['Green Bay','Brown','WI'],['Madison','Dane','WI'],['Milwaukee','Milwaukee','WI'],
  ['Casper','Natrona','WY'],['Cheyenne','Laramie','WY'],
  // DC
  ['Washington','District of Columbia','DC'],
];

export type AutocompleteResult = {
  city: string;
  county: string;
  state: string;
  display: string;
};

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (result: AutocompleteResult) => void;
  placeholder?: string;
  style?: ViewStyle | TextStyle | (ViewStyle | TextStyle)[];
  stateFilter?: string;
  label?: string;
};

export default function CityCountyAutocomplete({
  value,
  onChangeText,
  onSelect,
  placeholder = 'e.g. Columbus, OH',
  style,
  stateFilter,
  label,
}: Props) {
  const [focused, setFocused] = useState(false);
  // Prevents blur from hiding the dropdown when user taps a suggestion
  const suppressBlurRef = useRef(false);

  const suggestions = useMemo<AutocompleteResult[]>(() => {
    const q = value.trim().toLowerCase();
    if (q.length < 2) return [];
    return CITIES
      .filter(([city, county, state]) => {
        if (stateFilter && state !== stateFilter.toUpperCase()) return false;
        return (
          city.toLowerCase().startsWith(q) ||
          county.toLowerCase().startsWith(q) ||
          `${city.toLowerCase()}, ${state.toLowerCase()}`.startsWith(q)
        );
      })
      .slice(0, 6)
      .map(([city, county, state]) => ({
        city,
        county,
        state,
        display: `${city}, ${state} — ${county} County`,
      }));
  }, [value, stateFilter]);

  const handleSelect = useCallback((result: AutocompleteResult) => {
    suppressBlurRef.current = false;
    onSelect(result);
    setFocused(false);
  }, [onSelect]);

  const showDropdown = focused && suggestions.length > 0;

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, style as any]}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          // Only hide if user didn't tap a suggestion
          setTimeout(() => {
            if (!suppressBlurRef.current) setFocused(false);
          }, 300);
        }}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textLight}
        autoCapitalize="words"
        autoCorrect={false}
      />
      {/* Inline dropdown — renders in normal flow so it works inside ScrollViews */}
      {showDropdown && (
        <View style={styles.dropdown}>
          {suggestions.map((s, i) => (
            <TouchableOpacity
              key={`${s.city}-${s.state}-${i}`}
              style={[styles.suggestion, i < suggestions.length - 1 && styles.suggestionBorder]}
              onPressIn={() => { suppressBlurRef.current = true; }}
              onPress={() => handleSelect(s)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionCity}>{s.city}, {s.state}</Text>
              <Text style={styles.suggestionCounty}>{s.county} County</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { },
  label: {
    fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base, color: COLORS.text, backgroundColor: COLORS.white,
  },
  dropdown: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 2,
    ...SHADOWS.md,
  },
  suggestion: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  suggestionBorder: {
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  suggestionCity: {
    fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.text,
  },
  suggestionCounty: {
    fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginTop: 1,
  },
});
