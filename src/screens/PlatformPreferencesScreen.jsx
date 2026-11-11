import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';

const STORAGE_KEY = 'konnekt-platform-preferences-v1';
const languages = [
  ['English', 'en'], ['isiZulu', 'zu'], ['isiXhosa', 'xh'], ['Afrikaans', 'af'],
  ['Sesotho', 'st'], ['Setswana', 'tn'], ['Sepedi', 'nso'], ['siSwati', 'ss'],
  ['Português', 'pt'], ['Français', 'fr'], ['Español', 'es'],
];
const defaults = { language: 'en', largeText: false, highContrast: false, reduceMotion: false };

export default function PlatformPreferencesScreen({ navigation }) {
  const [preferences, setPreferences] = useState(defaults);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    try {
      const saved = globalThis.localStorage?.getItem(STORAGE_KEY);
      if (saved) setPreferences({ ...defaults, ...JSON.parse(saved) });
    } catch { setNotice('Saved preferences could not be read on this device.'); }
  }, []);

  const update = next => {
    const value = { ...preferences, ...next };
    setPreferences(value);
    try {
      globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(value));
      setNotice('Preference saved on this device. App-wide localisation and accessibility application are still being integrated.');
    } catch { setNotice('This device could not save the preference.'); }
  };

  return <ScrollView style={s.page} contentContainerStyle={s.content}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}><Text style={s.backText}>‹ Back</Text></TouchableOpacity>
    <Text style={s.brand}>KONNEKT</Text>
    <Text style={s.title}>Language & accessibility</Text>
    <Text style={s.subtitle}>Choose your preferred language and accessibility options.</Text>
    <View style={s.card}>
      <Text style={s.heading}>Display language</Text>
      <Text style={s.help}>Your selection is saved on this device. Full translations across all screens are not yet connected.</Text>
      <View style={s.languages}>{languages.map(([label, code]) => <TouchableOpacity key={code} onPress={() => update({ language: code })} style={[s.language, preferences.language === code && s.selected]}><Text style={[s.languageText, preferences.language === code && s.selectedText]}>{label}</Text></TouchableOpacity>)}</View>
    </View>
    <View style={s.card}>
      <Text style={s.heading}>Accessibility options</Text>
      <View style={s.option}><View style={s.optionCopy}><Text style={s.optionTitle}>Larger text</Text><Text style={s.help}>Save a larger-text preference</Text></View><Switch value={preferences.largeText} onValueChange={largeText => update({ largeText })}/></View>
      <View style={s.option}><View style={s.optionCopy}><Text style={s.optionTitle}>High contrast</Text><Text style={s.help}>Save a high-contrast preference</Text></View><Switch value={preferences.highContrast} onValueChange={highContrast => update({ highContrast })}/></View>
      <View style={s.option}><View style={s.optionCopy}><Text style={s.optionTitle}>Reduce motion</Text><Text style={s.help}>Save a reduced-motion preference</Text></View><Switch value={preferences.reduceMotion} onValueChange={reduceMotion => update({ reduceMotion })}/></View>
    </View>
    {!!notice && <Text style={s.notice}>{notice}</Text>}
    <Text style={s.footer}>These preferences are stored locally. App-wide translation and accessibility behaviour must be completed and tested before launch.</Text>
  </ScrollView>;
}

const s = StyleSheet.create({page:{flex:1,backgroundColor:'#10091B'},content:{padding:18,paddingBottom:40},back:{paddingVertical:8},backText:{color:'#D8B8F5',fontSize:16,fontWeight:'700'},brand:{color:'#55B5FF',fontSize:11,fontWeight:'800',letterSpacing:3,marginTop:10},title:{color:'#FFF',fontSize:27,fontWeight:'800',marginTop:5},subtitle:{color:'#9FB2C8',fontSize:13,lineHeight:19,marginTop:8,marginBottom:18},card:{backgroundColor:'#101D30',borderColor:'#233A56',borderWidth:1,borderRadius:14,padding:15,marginBottom:14},heading:{color:'#FFF',fontSize:16,fontWeight:'800',marginBottom:6},help:{color:'#91A7C0',fontSize:11,lineHeight:16},languages:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:13},language:{borderWidth:1,borderColor:'#344B68',borderRadius:20,paddingVertical:9,paddingHorizontal:12},selected:{backgroundColor:'#123B62',borderColor:'#6A0DAD'},languageText:{color:'#C3D1E2',fontSize:12},selectedText:{color:'#FFF',fontWeight:'800'},option:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:12,borderTopWidth:1,borderTopColor:'#39244B'},optionCopy:{flex:1,paddingRight:12},optionTitle:{color:'#FFF',fontWeight:'700',fontSize:13},notice:{color:'#82DDB8',fontSize:11,lineHeight:17,marginVertical:8},footer:{color:'#7F91A8',fontSize:10,lineHeight:16,marginTop:8}});
