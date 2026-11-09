import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '../AuthContext';
import { createCall, sendCallSignal, watchCall, updateCall, getIceServers } from '../services/calls';

export default function CallScreen({ navigation, route }) {
  const { user } = useAuth();
  const params = route?.params || {};
  const contact = params.contact || { name: params.contactName || 'KONNEKT member', username: '' };
  const callType = params.callType === 'video' ? 'video' : 'voice';
  const incoming = Boolean(params.incoming);
  const suppliedCallId = params.callId || null;
  const pcRef = useRef(null);
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const streamRef = useRef(null);
  const seenSignals = useRef(new Set());
  const pendingCandidates = useRef([]);
  const [callId, setCallId] = useState(suppliedCallId);
  const [status, setStatus] = useState(incoming ? 'Incoming call' : 'Starting call…');
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(callType === 'video');
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  const endCall = useCallback(async () => {
    try { if (callId) await updateCall(callId, { status: 'ended', ended_at: new Date().toISOString() }); } catch {}
    try { if (callId) await sendCallSignal(callId, 'hangup', {}); } catch {}
    if (pcRef.current) pcRef.current.close();
    streamRef.current?.getTracks().forEach(track => track.stop());
    navigation.goBack();
  }, [callId, navigation]);

  useEffect(() => {
    if (!callId || status !== 'Connected') return;
    const timer = setInterval(() => setSeconds(v => v + 1), 1000);
    return () => clearInterval(timer);
  }, [callId, status]);

  useEffect(() => {
    let active = true;
    let unsubscribe = null;
    const setup = async () => {
      try {
        if (!user?.id) throw new Error('Please sign in before calling.');
        if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) {
          throw new Error('This browser or device does not support WebRTC calling. Use the installed Android app or a modern HTTPS browser.');
        }
        const media = await navigator.mediaDevices.getUserMedia({
          audio: true, video: callType === 'video' ? { facingMode: 'user' } : false
        });
        if (!active) { media.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = media;
        if (localRef.current) localRef.current.srcObject = media;
        let sessionId = suppliedCallId;
        if (!sessionId && !incoming) {
          const session = await createCall({ calleeId: params.calleeId, conversationId: params.conversationId, callType });
          sessionId = session.id;
          if (active) setCallId(sessionId);
        }
        if (!sessionId) throw new Error('The call session is missing.');
        const pc = new RTCPeerConnection({ iceServers: await getIceServers() });
        pcRef.current = pc;
        media.getTracks().forEach(track => pc.addTrack(track, media));
        pc.ontrack = event => {
          const remote = event.streams?.[0];
          if (remote && remoteRef.current) remoteRef.current.srcObject = remote;
          setStatus('Connected');
          setBusy(false);
        };
        pc.onicecandidate = event => {
          if (event.candidate) sendCallSignal(sessionId, 'ice', { candidate: event.candidate.toJSON() }).catch(e => setError(e.message));
        };
        pc.onconnectionstatechange = () => {
          if (pc.connectionState === 'connected') { setStatus('Connected'); setBusy(false); }
          if (['failed', 'disconnected'].includes(pc.connectionState)) setStatus('Connection interrupted');
          if (pc.connectionState === 'closed') setStatus('Call ended');
        };
        unsubscribe = watchCall(sessionId, async signal => {
          if (!active || signal.sender_id === user.id || seenSignals.current.has(signal.id)) return;
          seenSignals.current.add(signal.id);
          try {
            if (signal.signal_type === 'offer' && incoming && !pc.currentRemoteDescription) {
              await pc.setRemoteDescription(new RTCSessionDescription(signal.payload.description));
              for (const candidate of pendingCandidates.current.splice(0)) await pc.addIceCandidate(new RTCIceCandidate(candidate));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              await sendCallSignal(sessionId, 'answer', { description: pc.localDescription });
              await updateCall(sessionId, { status: 'accepted', answered_at: new Date().toISOString() });
              setStatus('Connecting…');
            } else if (signal.signal_type === 'answer' && !incoming && !pc.currentRemoteDescription) {
              await pc.setRemoteDescription(new RTCSessionDescription(signal.payload.description));
              for (const candidate of pendingCandidates.current.splice(0)) await pc.addIceCandidate(new RTCIceCandidate(candidate));
              setStatus('Connecting…');
            } else if (signal.signal_type === 'ice' && signal.payload?.candidate) {
              if (pc.remoteDescription) await pc.addIceCandidate(new RTCIceCandidate(signal.payload.candidate));
              else pendingCandidates.current.push(signal.payload.candidate);
            } else if (signal.signal_type === 'hangup' || signal.signal_type === 'reject') {
              setStatus('Call ended');
              media.getTracks().forEach(t => t.stop());
              pc.close();
              navigation.goBack();
            }
          } catch (e) { setError(e.message || 'Call signalling failed.'); }
        }, session => {
          if (session.status === 'rejected' || session.status === 'missed' || session.status === 'ended' || session.status === 'failed') {
            setStatus(session.status === 'rejected' ? 'Call declined' : 'Call ended');
            media.getTracks().forEach(t => t.stop());
            pc.close();
            navigation.goBack();
          }
        });
        if (!incoming) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await sendCallSignal(sessionId, 'offer', { description: pc.localDescription });
          setStatus('Ringing…');
        } else {
          setStatus('Connecting…');
          setBusy(false);
        }
      } catch (e) {
        setError(e.message || 'Could not start the call.');
        setStatus('Call unavailable');
        setBusy(false);
      }
    };
    setup();
    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
      pcRef.current?.close();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [user?.id, suppliedCallId, incoming, callType, params.calleeId, params.conversationId, navigation]);

  const toggleMute = () => {
    const next = !muted; setMuted(next);
    streamRef.current?.getAudioTracks().forEach(track => { track.enabled = !next; });
  };
  const toggleCamera = () => {
    const next = !cameraEnabled; setCameraEnabled(next);
    streamRef.current?.getVideoTracks().forEach(track => { track.enabled = next; });
  };
  const accept = async () => {
    if (!callId) return;
    setStatus('Connecting…');
    setBusy(true);
    // The incoming call setup automatically answers once its offer is received.
  };
  const reject = async () => {
    try { if (callId) { await sendCallSignal(callId, 'reject', {}); await updateCall(callId, { status: 'rejected', ended_at: new Date().toISOString() }); } } catch {}
    navigation.goBack();
  };
  const time = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return <View style={s.container}>
    <Text style={s.type}>{callType.toUpperCase()} CALL</Text>
    <View style={s.person}><Text style={s.avatar}>{(contact.name || 'K').charAt(0).toUpperCase()}</Text></View>
    <Text style={s.name}>{contact.name || 'KONNEKT member'}</Text>
    <Text style={s.username}>{contact.username || ''}</Text>
    <Text style={s.status}>{status}</Text>
    {status === 'Connected' ? <Text style={s.timer}>{time}</Text> : null}
    {callType === 'video' ? <View style={s.videoArea}>
      <video ref={remoteRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 14, background: '#000' }} />
      <video ref={localRef} autoPlay muted playsInline style={{ position: 'absolute', right: 10, bottom: 10, width: 105, height: 140, objectFit: 'cover', borderRadius: 10, background: '#26364A' }} />
    </View> : <audio ref={remoteRef} autoPlay />}
    {!!error && <Text style={s.error}>{error}</Text>}
    {busy ? <ActivityIndicator color="#65B8FF" style={{ margin: 16 }} /> : null}
    <View style={s.controls}>
      <TouchableOpacity style={[s.control, muted && s.selected]} onPress={toggleMute}><Text style={s.controlIcon}>{muted ? '🔇' : '🎤'}</Text><Text style={s.controlText}>{muted ? 'Unmute' : 'Mute'}</Text></TouchableOpacity>
      {callType === 'video' ? <TouchableOpacity style={[s.control, !cameraEnabled && s.selected]} onPress={toggleCamera}><Text style={s.controlIcon}>📷</Text><Text style={s.controlText}>Camera</Text></TouchableOpacity> : null}
    </View>
    {incoming && status === 'Incoming call' ? <View style={s.actions}>
      <TouchableOpacity style={[s.end, { backgroundColor: '#D94352' }]} onPress={reject}><Text style={s.endText}>Decline</Text></TouchableOpacity>
      <TouchableOpacity style={[s.end, { backgroundColor: '#168BFF' }]} onPress={accept}><Text style={s.endText}>Answer</Text></TouchableOpacity>
    </View> : <TouchableOpacity style={s.end} onPress={endCall}><Text style={s.endText}>End call</Text></TouchableOpacity>}
  </View>;
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:'#07111F',alignItems:'center',justifyContent:'center',padding:22},
  type:{color:'#8BBBEA',letterSpacing:2,fontWeight:'bold',fontSize:12,marginBottom:20},
  person:{width:94,height:94,borderRadius:47,backgroundColor:'#173D61',alignItems:'center',justifyContent:'center'},
  avatar:{color:'#FFF',fontSize:38,fontWeight:'bold'},
  name:{color:'#FFF',fontSize:24,fontWeight:'bold',marginTop:16},
  username:{color:'#9BB0C7',marginTop:4},
  status:{color:'#B9C9D9',marginTop:18},
  timer:{color:'#FFF',fontSize:19,marginTop:7,fontWeight:'bold'},
  videoArea:{width:'100%',height:260,marginTop:20,position:'relative'},
  controls:{flexDirection:'row',gap:16,marginTop:22,marginBottom:24},
  control:{backgroundColor:'#19324D',padding:15,borderRadius:16,alignItems:'center',minWidth:82},
  selected:{backgroundColor:'#36516F'},
  controlIcon:{fontSize:23},
  controlText:{color:'#FFF',fontSize:11,marginTop:5},
  end:{backgroundColor:'#D94352',paddingHorizontal:34,paddingVertical:15,borderRadius:28,minWidth:130,alignItems:'center'},
  endText:{color:'#FFF',fontWeight:'bold'},
  actions:{flexDirection:'row',gap:16},
  error:{color:'#FF9DA7',textAlign:'center',marginVertical:8},
});
