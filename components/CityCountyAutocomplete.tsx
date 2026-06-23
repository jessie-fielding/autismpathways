/**
 * CityCountyAutocomplete
 *
 * Real-time address autocomplete powered by Google Places API (via the
 * Autism Pathways backend proxy). Returns full address, city, county,
 * and state — no API key required in the app.
 *
 * Falls back to the bundled city dataset if the network request fails.
 *
 * Props:
 *   value          — current text value (displayed in the input)
 *   onChangeText   — called when text changes
 *   onSelect       — called when user picks a suggestion { city, county, state, address }
 *   placeholder    — input placeholder
 *   style          — optional extra style for the input
 *   stateFilter    — optional 2-letter state code to restrict suggestions
 *   label          — optional label above the input
 */
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, FlatList, ViewStyle, TextStyle, ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, RADIUS, SHADOWS } from '../lib/theme';

const AP_API_BASE = 'https://inu3nb5lrfvftfyiwprftqshpy0zcegu.lambda-url.us-east-2.on.aws';

// ── Types ─────────────────────────────────────────────────────────────────────

export type AutocompleteResult = {
  city: string;
  county: string;
  state: string;
  address: string;   // full formatted address
  display: string;   // shown in the dropdown
};

type Prediction = {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
};

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type DropdownPosition = { top: number; left: number; width: number };

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (result: AutocompleteResult) => void;
  placeholder?: string;
  style?: ViewStyle | TextStyle | (ViewStyle | TextStyle)[];
  stateFilter?: string;
  label?: string;
};

// ── Fallback bundled dataset (top ~300 US cities) ─────────────────────────────
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
  ['Washington','District of Columbia','DC'],
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractFromComponents(
  components: AddressComponent[]
): { city: string; county: string; state: string; stateAbbr: string } {
  let city = '';
  let county = '';
  let state = '';
  let stateAbbr = '';
  for (const c of components) {
    if (c.types.includes('locality')) city = c.long_name;
    else if (c.types.includes('sublocality_level_1') && !city) city = c.long_name;
    if (c.types.includes('administrative_area_level_2')) {
      county = c.long_name.replace(/ County$/i, '').trim();
    }
    if (c.types.includes('administrative_area_level_1')) {
      state = c.long_name;
      stateAbbr = c.short_name;
    }
  }
  return { city, county, state, stateAbbr };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CityCountyAutocomplete({
  value,
  onChangeText,
  onSelect,
  placeholder = 'Start typing an address…',
  style,
  stateFilter,
  label,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<DropdownPosition | null>(null);
  const inputRef = useRef<View>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch predictions from backend proxy ──────────────────────────────────
  const fetchPredictions = useCallback(async (text: string) => {
    if (text.trim().length < 2) { setPredictions([]); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams({ input: text.trim() });
      if (stateFilter) params.set('components', `country:us|administrative_area:${stateFilter}`);
      const res = await fetch(`${AP_API_BASE}/api/places/autocomplete?${params.toString()}`);
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      setPredictions(data.predictions || []);
    } catch {
      // Fallback to bundled dataset
      const q = text.trim().toLowerCase();
      const fallback: Prediction[] = CITIES
        .filter(([city, , state]) => {
          if (stateFilter && state !== stateFilter.toUpperCase()) return false;
          return city.toLowerCase().startsWith(q) || `${city.toLowerCase()}, ${state.toLowerCase()}`.startsWith(q);
        })
        .slice(0, 6)
        .map(([city, county, state]) => ({
          place_id: `fallback-${city}-${state}`,
          description: `${city}, ${state}, USA`,
          structured_formatting: { main_text: city, secondary_text: `${state} — ${county} County` },
          _fallback: { city, county, state },
        } as Prediction & { _fallback?: { city: string; county: string; state: string } }));
      setPredictions(fallback);
    } finally {
      setLoading(false);
    }
  }, [stateFilter]);

  // ── Debounce input ────────────────────────────────────────────────────────
  const handleChangeText = useCallback((text: string) => {
    onChangeText(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(text), 300);
    setTimeout(measureInput, 50);
  }, [onChangeText, fetchPredictions]);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  // ── Measure input position for dropdown ──────────────────────────────────
  const measureInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.measureInWindow((x, y, width, height) => {
        setDropdownPos({ top: y + height + 2, left: x, width });
      });
    }
  }, []);

  const handleFocus = useCallback(() => {
    setFocused(true);
    measureInput();
    if (value.trim().length >= 2) fetchPredictions(value);
  }, [measureInput, value, fetchPredictions]);

  const handleBlur = useCallback(() => {
    setTimeout(() => setFocused(false), 200);
  }, []);

  // ── Select a prediction — fetch details to get county ────────────────────
  const handleSelect = useCallback(async (prediction: Prediction & { _fallback?: { city: string; county: string; state: string } }) => {
    setFocused(false);
    onChangeText(prediction.description);

    // Fallback prediction — no place_id to fetch
    if (prediction._fallback) {
      const { city, county, state } = prediction._fallback;
      const stateAbbr = prediction.description.match(/, ([A-Z]{2}),/)?.[1] || '';
      onSelect({ city, county, state, address: prediction.description, display: prediction.description });
      return;
    }

    // Fetch full details to extract county
    try {
      const res = await fetch(`${AP_API_BASE}/api/places/details?place_id=${encodeURIComponent(prediction.place_id)}`);
      if (!res.ok) throw new Error('Details fetch failed');
      const data = await res.json();
      const components: AddressComponent[] = data.result?.address_components || [];
      const { city, county, state, stateAbbr } = extractFromComponents(components);
      const formatted = data.result?.formatted_address || prediction.description;
      onSelect({
        city,
        county,
        state,
        address: formatted,
        display: formatted,
      });
    } catch {
      // Best-effort parse from description
      const parts = prediction.description.split(', ');
      const city = parts[0] || '';
      const stateAbbr = parts[1] || '';
      onSelect({ city, county: '', state: stateAbbr, address: prediction.description, display: prediction.description });
    }
  }, [onChangeText, onSelect]);

  const showDropdown = focused && predictions.length > 0 && dropdownPos !== null;

  return (
    <View ref={inputRef} collapsable={false} style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, style as any]}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          autoCapitalize="words"
          autoCorrect={false}
        />
        {loading && <ActivityIndicator size="small" color={COLORS.purple} style={styles.spinner} />}
      </View>

      {showDropdown && dropdownPos && (
        <Modal
          visible
          transparent
          animationType="none"
          onRequestClose={() => setFocused(false)}
        >
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setFocused(false)}
          />
          <View
            style={[
              styles.dropdown,
              { position: 'absolute', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width },
            ]}
            pointerEvents="box-none"
          >
            <FlatList
              data={predictions}
              keyExtractor={(item, i) => `${item.place_id}-${i}`}
              keyboardShouldPersistTaps="always"
              scrollEnabled={false}
              renderItem={({ item: p, index: i }) => (
                <TouchableOpacity
                  style={[styles.suggestion, i < predictions.length - 1 && styles.suggestionBorder]}
                  onPress={() => handleSelect(p as any)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.suggestionMain} numberOfLines={1}>
                    {p.structured_formatting?.main_text || p.description}
                  </Text>
                  <Text style={styles.suggestionSub} numberOfLines={1}>
                    {p.structured_formatting?.secondary_text || ''}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <View style={styles.poweredBy}>
              <Text style={styles.poweredByText}>powered by Google</Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  label: {
    fontSize: FONT_SIZES.sm, fontWeight: '600', color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base, color: COLORS.text, backgroundColor: COLORS.white,
  },
  spinner: {
    position: 'absolute', right: SPACING.md,
  },
  backdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  dropdown: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    zIndex: 9999,
    ...SHADOWS.md,
  },
  suggestion: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  suggestionBorder: {
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  suggestionMain: {
    fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.purple,
  },
  suggestionSub: {
    fontSize: FONT_SIZES.xs, color: COLORS.textMid, marginTop: 1,
  },
  poweredBy: {
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  poweredByText: {
    fontSize: 10, color: COLORS.textLight,
  },
});
