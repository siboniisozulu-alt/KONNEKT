
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';

export default function CameraScreen({ navigation, route }) {
  const contact = route?.params?.contact || {
    name: 'KONNEKT Contact',
  };

  const [cameraMode, setCameraMode] = useState('Photo');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [cameraSide, setCameraSide] = useState('Back');

  const showCameraMessage = () => {
    Alert.alert(
      'Camera not connected yet',
      'The real Android camera, permissions and media capture will be connected during integration.'
    );
  };

  const captureMedia = () => {
    Alert.alert(
      `${cameraMode} mode`,
      `Camera capture for ${contact.name} is currently a preview. Real photo and video capture will be added later.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.topButton}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.topTitle}>KONNEKT CAMERA</Text>

        <TouchableOpacity
          onPress={() => setFlashEnabled(!flashEnabled)}
        >
          <Text style={styles.topButton}>
            {flashEnabled ? '⚡' : '⚡̸'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cameraPreview}>
        <Text style={styles.cameraIcon}>📷</Text>
        <Text style={styles.previewTitle}>
          Camera preview
        </Text>
        <Text style={styles.previewText}>
          Your camera view will appear here when camera access
          is connected.
        </Text>

        <TouchableOpacity
          style={styles.permissionButton}
          onPress={showCameraMessage}
        >
          <Text style={styles.permissionButtonText}>
            Camera setup coming soon
          </Text>
        </TouchableOpacity>

        <View style={styles.focusCircle} />
      </View>

      <View style={styles.bottomPanel}>
        <View style={styles.modeSelector}>
          <TouchableOpacity
            onPress={() => setCameraMode('Photo')}
          >
            <Text
              style={[
                styles.modeText,
                cameraMode === 'Photo' && styles.activeMode,
              ]}
            >
              PHOTO
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCameraMode('Video')}
          >
            <Text
              style={[
                styles.modeText,
                cameraMode === 'Video' && styles.activeMode,
              ]}
            >
              VIDEO
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.captureRow}>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={() =>
              navigation.navigate('MediaPicker', {
                mediaType: cameraMode === 'Video'
                  ? 'videos'
                  : 'photos',
                contact,
              })
            }
          >
            <Text style={styles.galleryIcon}>🖼️</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={captureMedia}
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flipButton}
            onPress={() =>
              setCameraSide(
                cameraSide === 'Back' ? 'Front' : 'Back'
              )
            }
          >
            <Text style={styles.flipIcon}>🔄</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.cameraSide}>
          {cameraSide} camera · {contact.name}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    height: 65,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111111',
  },
  topButton: {
    color: '#FFFFFF',
    fontSize: 25,
  },
  topTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  cameraPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#202020',
    padding: 25,
  },
  cameraIcon: {
    fontSize: 65,
    marginBottom: 18,
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  previewText: {
    color: '#BDBDBD',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 12,
    maxWidth: 280,
  },
  permissionButton: {
    backgroundColor: '#075E54',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
    marginTop: 22,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  focusCircle: {
    position: 'absolute',
    width: 115,
    height: 115,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    opacity: 0.15,
    borderRadius: 58,
  },
  bottomPanel: {
    backgroundColor: '#111111',
    paddingTop: 18,
    paddingBottom: 25,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
  },
  modeText: {
    color: '#888888',
    fontSize: 12,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  activeMode: {
    color: '#FFFFFF',
  },
  captureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  galleryButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: 10,
  },
  galleryIcon: {
    fontSize: 23,
  },
  captureButton: {
    width: 76,
    height: 76,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 58,
    height: 58,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  flipButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: 25,
  },
  flipIcon: {
    fontSize: 23,
  },
  cameraSide: {
    color: '#AAAAAA',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 18,
  },
});
