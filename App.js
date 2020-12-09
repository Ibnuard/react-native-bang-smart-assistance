import * as React from 'react'
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native'
import Voice from 'react-native-voice'
import Tts from 'react-native-tts'

const App = () => {
  const [ttsStatus, setTtsStatus] = React.useState('initiliazing');
  const [voiceStatus, setVoiceStatus] = React.useState('Tidur')
  const [commandText, setCommandText] = React.useState('')

  Voice._onSpeechStart(onSpeechStartHandler)
  Voice._onSpeechEnd(onSpeechEndHandler)
  Voice._onSpeechResults(onSpeechResultHandler)
  Tts.setDefaultLanguage('id-ID')
  Tts.setDefaultRate(.52)
  Tts.setDefaultPitch(1)

  function onSpeechStartHandler() {
    setVoiceStatus('Mendengarakan...')
  }

  function onSpeechEndHandler() {
    setVoiceStatus('Suara didengarkan!')
  }

  function onSpeechResultHandler(result) {
    setCommandText(result.value[0])
  }

  function onStartButtonPress(e) {
    Voice.start('id-ID')
  }

  function onStopButtonPress(e) {
    Voice.stop()
    Tts.stop()
  }

  React.useEffect(() => {
    Tts.addEventListener(
      'tts-start',
      (_event) => setTtsStatus('started')
    );
    Tts.addEventListener(
      'tts-finish',
      (_event) => setTtsStatus('finished')
    );
    Tts.addEventListener(
      'tts-cancel',
      (_event) => setTtsStatus('cancelled')
    );

    //Tts.speak('Halo, ini adalah Bang, Asisten pribadi anda. Katakan Bang!, lalu katakan perintah anda')

    return () => {
      Tts.removeEventListener(
        'tts-start',
        (_event) => setTtsStatus('started')
      );
      Tts.removeEventListener(
        'tts-finish',
        (_event) => setTtsStatus('finished'),
      );
      Tts.removeEventListener(
        'tts-cancel',
        (_event) => setTtsStatus('cancelled'),
      );
    }
  }, [])



  return (
    <View style={styles.container}>
      <Text>{voiceStatus}</Text>
      <Text>{commandText}</Text>
      <TouchableHighlight
        style={{ padding: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
        onPressIn={e => onStartButtonPress(e)}
        onPressOut={e => onStopButtonPress(e)}>
        <Text>Bicara</Text>
      </TouchableHighlight>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default App;
