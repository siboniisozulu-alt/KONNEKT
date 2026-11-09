import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib_supabase';
import { getCallSignals, sendCallSignal, updateCall, watchCall, getKonnektIceServers } from '../services/calls';

export default function CallScreen({ navigation, route }) {
  const { user } = useAuth();
  const { callId, isCaller = false, callType = 'voice', contact = {}, incoming = false } = route?.params || {};
  const [status, setStatus] = useState(incoming ? 'Incoming call' : 'Connecting…');
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(callType !== 'video');
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(!!isCaller);
  const [connected, setConnected] = useState(false);
  const pcRef = useRef(null);
  const streamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const queuedCandidates = useRef([]);
  const handledSignals = useRef(new Set());

  const cleanup = useCallback(() => {
    try { pcRef.current?.close(); } catch {}
    pcRef.current = null;
    streamRef.current?.getTracks?.().forEach(track => track.stop());
    streamRef.current = null;
  }, []);

  const finish = useCallback(async (nextStatus = 'ended') => {
    try { await sendCallSignal(callId, 'hangup', { status: nextStatus }); } catch {}
    try { await updateCall(callId, { status: nextStatus, ended_at: new Date().toISOString() }); } catch {}
    cleanup();
    navigation.goBack();
  }, [callId, cleanup, navigation]);

  const applySignal = useCallback(async signal => {
    if (!signal || signal.sender_id === user?.id || handledSignals.current.has(signal.id)) return;
    const pc = pcRef.current;
    if (!pc) return;
    handledSignals.current.add(signal.id);
    try {
      if (signal.signal_type === 'offer' && !isCaller) {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
        for (const candidate of queuedCandidates.current.splice(0)) await pc.addIceCandidate(new RTCIceCandidate(candidate));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await sendCallSignal(callId, 'answer', pc.localDescription.toJSON());
        await updateCall(callId, { status: 'accepted', answered_at: new Date().toISOString() });
        setStatus('Connecting…');
      } else if (signal.signal_type === 'answer' && isCaller) {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));
        for (const candidate of queuedCandidates.current.splice(0)) await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else if (signal.signal_type === 'ice-candidate') {
        if (pc.remoteDescription) await pc.addIceCandidate(new RTCIceCandidate(signal.payload));
        else queuedCandidates.current.push(signal.payload);
      } else if (signal.signal_type === 'hangup') {
        setStatus('Call ended'); cleanup(); navigation.goBack();
      }
    } catch (e) { setError(e?.message || 'Call connection failed.'); }
  }, [callId, cleanup, isCaller, navigation, user?.id]);

  const startMedia = useCallback(async () => {
    if (!globalThis.RTCPeerConnection || !globalThis.navigator?.mediaDevices?.getUserMedia) {
      throw new Error('This device/browser does not expose WebRTC microphone and camera access. Use the HTTPS KONNEKT website in a supported browser; native Android calling needs a WebRTC native module.');
    }
    const stream = await globalThis.navigator.mediaDevices.getUserMedia({ audio: true, video: callType === 'video' });
    streamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    const iceServers = await getKonnektIceServers();
    const pc = new globalThis.RTCPeerConnection({ iceServers });
    pcRef.current = pc;
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    pc.ontrack = event => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = event.streams[0];
      setConnected(true); setStatus('Connected');
    };
    pc.onicecandidate = event => { if (event.candidate) sendCallSignal(callId, 'ice-candidate', event.candidate.toJSON()).catch(e => setError(e.message)); };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') { setConnected(true); setStatus('Connected'); }
      if (['failed', 'disconnected'].includes(pc.connectionState)) setStatus('Connection interrupted');
    };
    return pc;
  }, [callId, callType]);

  const accept = async () => {
    try {
      setError(''); setAccepted(true); setStatus('Requesting microphone…');
      await startMedia();
      const signals = await getCallSignals(callId);
      for (const signal of signals) await applySignal(signal);
    } catch (e) { setError(e?.message || 'Could not accept call.'); setAccepted(false); }
  };

  useEffect(() => {
    if (!callId) return undefined;
    let alive = true;
    const unsubscribe = watchCall(callId, signal => { if (alive) applySignal(signal); }, session => {
      if (!alive) return;
      if (session.status === 'ended' || session.status === 'declined' || session.status === 'missed') { setStatus(session.status === 'declined' ? 'Call declined' : 'Call ended'); cleanup(); navigation.goBack(); }
    });
    return () => { alive = false; unsubscribe(); cleanup(); };
  }, [callId, applySignal, cleanup, navigation]);

  useEffect(() => {
    if (!isCaller || !accepted || !callId) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const pc = await startMedia();
        if (cancelled) return;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await sendCallSignal(callId, 'offer', pc.localDescription.toJSON());
        setStatus('Ringing…');
      } catch (e) { setError(e?.message || 'Could not start call.'); }
    })();
    return () => { cancelled = true; };
  }, [isCaller, accepted, callId, startMedia]);

  useEffect(() => {
    if (!connected) return undefined;
    const timer = setInterval(() => setSeconds(value => value + 1), 1000);
    return () => clearInterval(timer);
  }, [connected]);

  const toggleMute = () => {
    const next = !muted; setMuted(next);
    streamRef.current?.getAudioTracks?.().forEach(track => { track.enabled = !next; });
  };
  const toggleCamera = () => {
    const next = !cameraOff; setCameraOff(next);
    streamRef.current?.getVideoTracks?.().forEach(track => { track.enabled = !next; });
  };
  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return <View style={s.container}>
    <Text style={s.kind}>{callType === 'video' ? 'KONNEKT VIDEO CALL' : 'KONNEKT VOICE CALL'}</Text>
    <View style={s.person}><View style={s.avatar}><Text style={s.avatarText}>{(contact.name || 'K').slice(0, 1).toUpperCase()}</Text></View><Text style={s.name}>{contact.name || 'KONNEKT member'}</Text><Text style={s.status}>{status}</Text><Text style={s.timer}>{time}</Text></View>
    <audio ref={remoteAudioRef} autoPlay />
    {callType === 'video' && <View style={s.videos}><video ref={remoteVideoRef} autoPlay playsInline style={{ width: '100%', height: 220, background: '#02050B', borderRadius: 14, objectFit: 'cover' }}/><video ref={localVideoRef} autoPlay muted playsInline style={{ width: 100, height: 130, position: 'absolute', right: 12, bottom: 12, borderRadius: 10, objectFit: 'cover', background: '#14243A' }}/></View>}
    {!!error && <Text style={s.error}>{error}</Text>}
    <View style={s.controls}>
      {accepted && <TouchableOpacity style={s.control} onPress={toggleMute}><Text style={s.controlIcon}>{muted ? '🔇' : '🎤'}</Text><Text style={s.controlLabel}>{muted ? 'Unmute' : 'Mute'}</Text></TouchableOpacity>}
      {callType === 'video' && accepted && <TouchableOpacity style={s.control} onPress={toggleCamera}><Text style={s.controlIcon}>{cameraOff ? '📷' : '📹'}</Text><Text style={s.controlLabel}>{cameraOff ? 'Camera off' : 'Camera on'}</Text></TouchableOpacity>}
      {incoming && !accepted ? <><TouchableOpacity style={s.accept} onPress={accept}><Text style={s.endText}>Accept</Text></TouchableOpacity><TouchableOpacity style={s.decline} onPress={() => finish('declined')}><Text style={s.endText}>Decline</Text></TouchableOpacity></> : <TouchableOpacity style={s.end} onPress={() => finish('ended')}><Text style={s.endText}>End call</Text></TouchableOpacity>}
    </View>
    {!connected && !incoming && <Text style={s.footnote}>Calls use peer-to-peer WebRTC. Configure VITE_TURN_CREDENTIALS_URL with a trusted short-lived TURN credentials endpoint for reliable connections across restrictive mobile networks.</Text>}
  </View>;
}
const s = StyleSheet.create({ container: { flex: 1, backgroundColor: '#080812', alignItems: 'center', justifyContent: 'space-between', padding: 24 }, kind: { color: '#8CCBFF', letterSpacing: 2, fontSize: 12, fontWeight: 'bold', marginTop: 22 }, person: { alignItems: 'center', justifyContent: 'center', flex: 1 }, avatar: { width: 108, height: 108, borderRadius: 54, backgroundColor: '#1D3E64', alignItems: 'center', justifyContent: 'center' }, avatarText: { color: '#FFF', fontSize: 42, fontWeight: 'bold' }, name: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginTop: 20 }, status: { color: '#9AB0C8', marginTop: 10 }, timer: { color: '#FFF', fontSize: 20, marginTop: 8 }, videos: { width: '100%', maxWidth: 480, position: 'relative' }, controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }, control: { backgroundColor: '#17263D', padding: 14, borderRadius: 18, alignItems: 'center', minWidth: 78 }, controlIcon: { fontSize: 22 }, controlLabel: { color: '#DDEBFA', fontSize: 10, marginTop: 4 }, end: { backgroundColor: '#D93450', borderRadius: 25, paddingVertical: 15, paddingHorizontal: 28 }, accept: { backgroundColor: '#168BFF', borderRadius: 25, paddingVertical: 15, paddingHorizontal: 24 }, decline: { backgroundColor: '#D93450', borderRadius: 25, paddingVertical: 15, paddingHorizontal: 24 }, endText: { color: '#FFF', fontWeight: 'bold' }, error: { color: '#FF9CA8', textAlign: 'center', marginVertical: 10 }, footnote: { color: '#778BA4', fontSize: 10, lineHeight: 15, textAlign: 'center', maxWidth: 360 } });
