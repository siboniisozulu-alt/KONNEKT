import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../AuthContext';
import { supabase } from '../lib_supabase';
import { sendCallSignal, updateCall, watchCall, getKonnektIceServers } from '../services/calls';

export default function CallScreen({navigation,route}){
 const {user}=useAuth();const {callId,callType='voice',contact={}}=route?.params||{};
 const [status,setStatus]=useState('Preparing call…');const [seconds,setSeconds]=useState(0);const [muted,setMuted]=useState(false);const [cameraOff,setCameraOff]=useState(callType!=='video');const [notice,setNotice]=useState('');const [busy,setBusy]=useState(true);const [switchingCamera,setSwitchingCamera]=useState(false);
 const pcRef=useRef(null);const localRef=useRef(null);const remoteRef=useRef(null);const remoteVideo=useRef(null);const remoteAudio=useRef(null);const localVideo=useRef(null);const queuedIce=useRef([]);const remoteReady=useRef(false);const handled=useRef(new Set());const callerRef=useRef(false);
 const cleanup=useCallback(()=>{try{pcRef.current?.close();}catch{}pcRef.current=null;localRef.current?.getTracks?.().forEach(t=>t.stop());localRef.current=null;},[]);
 const processSignal=useCallback(async signal=>{
  if(!signal||signal.sender_id===user?.id||handled.current.has(signal.id))return;handled.current.add(signal.id);const pc=pcRef.current;if(!pc)return;
  try{
   if(signal.signal_type==='offer'&&!callerRef.current){await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));remoteReady.current=true;for(const c of queuedIce.current)await pc.addIceCandidate(new RTCIceCandidate(c));queuedIce.current=[];const answer=await pc.createAnswer();await pc.setLocalDescription(answer);await sendCallSignal(callId,'answer',pc.localDescription.toJSON());await updateCall(callId,{status:'accepted',answered_at:new Date().toISOString()});setStatus('Connected');}
   else if(signal.signal_type==='answer'&&callerRef.current){await pc.setRemoteDescription(new RTCSessionDescription(signal.payload));remoteReady.current=true;for(const c of queuedIce.current)await pc.addIceCandidate(new RTCIceCandidate(c));queuedIce.current=[];setStatus('Connected');}
   else if(signal.signal_type==='ice-candidate'){if(remoteReady.current)await pc.addIceCandidate(new RTCIceCandidate(signal.payload));else queuedIce.current.push(signal.payload);}
   else if(signal.signal_type==='hangup'){setStatus('Call ended');cleanup();navigation.goBack();}
  }catch(e){setNotice(e.message||'Call connection failed.');}
 },[callId,cleanup,navigation,user?.id]);
 useEffect(()=>{
  let active=true;let unsubscribe=null;let timer=null;
  (async()=>{try{
   if(!callId||!user?.id)throw new Error('Call details are missing. Start a call from a member profile.');
   if(!globalThis.navigator?.mediaDevices?.getUserMedia||!globalThis.RTCPeerConnection)throw new Error('Voice and video calls require a supported browser or app over HTTPS.');
   const {data:call,error}=await supabase.from('call_sessions').select('*').eq('id',callId).single();if(error)throw error;if(['ended','declined','missed'].includes(call.status))throw new Error('This call is no longer active.');
   if(call.caller_id!==user.id&&call.callee_id!==user.id)throw new Error('You are not a participant in this call.');
   callerRef.current=call.caller_id===user.id;
   const stream=await globalThis.navigator.mediaDevices.getUserMedia({audio:true,video:call.call_type==='video'});if(!active){stream.getTracks().forEach(t=>t.stop());return;}localRef.current=stream;
   const iceServers=await getKonnektIceServers();const pc=new RTCPeerConnection({iceServers});pcRef.current=pc;stream.getTracks().forEach(track=>pc.addTrack(track,stream));
   pc.onicecandidate=e=>{if(e.candidate)sendCallSignal(callId,'ice-candidate',e.candidate.toJSON()).catch(err=>setNotice(err.message));};
   pc.ontrack=e=>{remoteRef.current=e.streams?.[0]||null;if(remoteVideo.current&&remoteRef.current)remoteVideo.current.srcObject=remoteRef.current;if(remoteAudio.current&&remoteRef.current)remoteAudio.current.srcObject=remoteRef.current;};
   pc.onconnectionstatechange=()=>{if(pc.connectionState==='connected')setStatus('Connected');if(pc.connectionState==='failed')setNotice('Connection failed. Configure TURN relay settings and retry.');if(pc.connectionState==='disconnected')setStatus('Reconnecting…');};
   unsubscribe=watchCall(callId,processSignal,session=>{if(session.status==='ended'||session.status==='declined'||session.status==='missed'){setStatus(session.status==='declined'?'Call declined':'Call ended');cleanup();navigation.goBack();}else if(session.status==='accepted')setStatus('Connecting…');});
   const {data:signals,error:signalError}=await supabase.from('call_signals').select('*').eq('call_id',callId).order('created_at',{ascending:true});if(signalError)throw signalError;for(const signal of signals||[])await processSignal(signal);
   if(callerRef.current){const offer=await pc.createOffer();await pc.setLocalDescription(offer);await sendCallSignal(callId,'offer',pc.localDescription.toJSON());setStatus('Ringing…');}
   else setStatus('Incoming call · connecting…');
   timer=setInterval(()=>setSeconds(v=>v+1),1000);setBusy(false);
  }catch(e){if(active){setNotice(e.message||'Could not start the call.');setBusy(false);}cleanup();}})();
  return()=>{active=false;if(timer)clearInterval(timer);unsubscribe?.();cleanup();};
 },[callId,cleanup,navigation,processSignal,user?.id]);
 useEffect(()=>{if(localVideo.current&&localRef.current)localVideo.current.srcObject=localRef.current;},[busy]);
 const end=async()=>{setBusy(true);try{await sendCallSignal(callId,'hangup',{});await updateCall(callId,{status:'ended',ended_at:new Date().toISOString()});}catch(e){setNotice(e.message||'Could not update call status.');}finally{cleanup();navigation.goBack();}};
 const toggleMute=()=>{const next=!muted;setMuted(next);localRef.current?.getAudioTracks().forEach(t=>t.enabled=!next);};
 const toggleCamera=()=>{const next=!cameraOff;setCameraOff(next);localRef.current?.getVideoTracks().forEach(t=>t.enabled=!next);};
 const switchCamera=async()=>{if(switchingCamera||callType!=='video'||!localRef.current)return;setSwitchingCamera(true);setNotice('');try{const devices=await navigator.mediaDevices.enumerateDevices();const cameras=devices.filter(device=>device.kind==='videoinput');if(cameras.length<2)throw new Error('No second camera is available on this device.');const current=localRef.current.getVideoTracks()[0];const currentId=current?.getSettings?.().deviceId;const next=cameras.find(device=>device.deviceId!==currentId)||cameras[0];const stream=await navigator.mediaDevices.getUserMedia({video:{deviceId:{exact:next.deviceId}},audio:false});const track=stream.getVideoTracks()[0];if(track)track.enabled=!cameraOff;const sender=pcRef.current?.getSenders().find(item=>item.track?.kind==='video');if(!track||!sender)throw new Error('Could not switch the active camera.');await sender.replaceTrack(track);if(current){localRef.current.removeTrack(current);current.stop();}localRef.current.addTrack(track);if(localVideo.current)localVideo.current.srcObject=localRef.current;}catch(error){setNotice(error.message||'Could not switch camera.');}finally{setSwitchingCamera(false);}};
 const time=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
 return <View style={s.page}><Text style={s.kind}>{callType==='video'?'VIDEO CALL':'VOICE CALL'}</Text><Text style={s.name}>{contact.name||contact.full_name||'KONNEKT member'}</Text><Text style={s.status}>{status}</Text><Text style={s.timer}>{time}</Text>{callType==='video'&&<View style={s.videos}><video ref={remoteVideo} autoPlay playsInline style={{width:'100%',height:260,background:'#02050B',borderRadius:14,objectFit:'cover'}}/><video ref={localVideo} autoPlay muted playsInline style={{width:110,height:145,position:'absolute',right:12,bottom:12,background:'#241630',borderRadius:10,objectFit:'cover'}}/></View>}{callType==='voice'&&<audio ref={remoteAudio} autoPlay/>}<View style={s.controls}><TouchableOpacity style={s.control} onPress={toggleMute}><Text style={s.controlText}>{muted?'Unmute':'Mute'}</Text></TouchableOpacity>{callType==='video'&&<><TouchableOpacity style={s.control} onPress={toggleCamera}><Text style={s.controlText}>{cameraOff?'Camera on':'Camera off'}</Text></TouchableOpacity><TouchableOpacity style={s.control} onPress={switchCamera} disabled={switchingCamera}><Text style={s.controlText}>{switchingCamera?'Switching…':'Switch camera'}</Text></TouchableOpacity></>}<TouchableOpacity style={s.end} disabled={busy} onPress={end}><Text style={s.controlText}>End call</Text></TouchableOpacity></View>{busy&&<ActivityIndicator color="#6A0DAD"/>}{!!notice&&<Text style={s.notice}>{notice}</Text>}</View>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:'#10091B',padding:22,alignItems:'center',justifyContent:'center'},kind:{color:'#D8B8F5',letterSpacing:2,fontWeight:'800'},name:{color:'#FFF',fontSize:25,fontWeight:'800',marginTop:22},status:{color:'#A9B8CB',marginTop:12},timer:{color:'#FFF',fontSize:22,fontWeight:'700',marginTop:8},videos:{width:'100%',marginTop:24,position:'relative'},controls:{flexDirection:'row',gap:12,flexWrap:'wrap',justifyContent:'center',marginTop:30},control:{backgroundColor:'#30203F',padding:15,borderRadius:24},end:{backgroundColor:'#D93450',padding:15,borderRadius:24},controlText:{color:'#FFF',fontWeight:'800'},notice:{color:'#FFB6C0',textAlign:'center',marginTop:18,lineHeight:20}});
