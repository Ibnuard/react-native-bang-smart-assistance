import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  SafeAreaView,
  TouchableHighlight,
  StyleSheet,
} from 'react-native';
import Voice from '@react-native-community/voice'
import Tts from 'react-native-tts'
import { env } from './env'
import { Dialogflow_V2 } from "react-native-dialogflow"
import _ from 'lodash'

const App = () => {
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [voiceStatus, setVoiceStatus] = useState('Menunggu...')
  const [ttsStatus, setTtsStatus] = useState('initiliazing')
  const [name, setName] = React.useState('')

  function greetings(userName) {
    readText(`Halo ${userName}. aku adalah Dedi. Seorang asisten sekaligus teman yang akan selalu ada untuk kamu. Katakan Halo Dedi. Lalu katakan perintah kamu. Kamu juga dapat menyurhku menyanyi dengan perintah, Dedi Nyanyi. Senang berkenalan dengan kamu ${userName}`)
  }

  function inputName() {
    readText('Halo. Untuk mulai menggunakan silahkan berkenalan terlebih dahulu. Silahkan tekan tombol yang akan muncul ditengah lalu sebutkan nama kamu dengan perintah. Halo Dedi Nama Saya adalah blablaba')
  }

  /**
   * 
   * 
   * GAP FUNCTION BETWEEN VARIABLE AND FUNCTION
   * 
   */

  useEffect(() => {
    //greetings()
    function onSpeechStart(e) {
      //console.log('onSpeechStart: ', e);
      setVoiceStatus('Mendengarkan perintah...')
    }
    function onSpeechEnd(e) {
      //console.log('onSpeechEnd: ', e);
      setVoiceStatus('Perintah didengarkan...')
    }

    function onSpeechError(e) {
      //console.log('onSpeechError: ', e.message);
      setError(e.value);
    }
    function onSpeechResults(e) {
      //console.log('onSpeechResults: ', e);
      const res = e.value[0]
      setResults(res);
      checkCommandType(res)
    }

    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;


    Dialogflow_V2.setConfiguration(env.email_service, env.private_key, Dialogflow_V2.LANG_ENGLISH, env.project_id);
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const _startRecognizing = async () => {
    setError('');
    setResults([]);
    setVoiceStatus('')
    try {
      await Voice.start('id-ID');
    } catch (e) {
      console.error(e);
    }
  };

  const _stopRecognizing = async () => {
    //Stops listening for speech
    try {
      await Voice.stop();
      setVoiceStatus('Mendengarkan selesai...')
    } catch (e) {
      console.error(e);
    }
  };

  const _cancelRecognizing = async () => {
    //Cancels the speech recognition
    try {
      await Voice.cancel();
      setVoiceStatus('Perintah dibatalkan...')
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * 
   * 
   * GAP FUNCTION BETWEEN TTS AND VOICE
   * 
   */

  useEffect(() => {

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

    Tts.getInitStatus().then(initTts)

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

  const initTts = () => {
    Tts.setDefaultLanguage('id-ID')
    Tts.setDefaultVoice('id-id-x-idd-local')
    Tts.setDefaultRate(.50)
    Tts.setDefaultPitch(0.7)
    inputName()
  }

  const checkCommandType = (cmd = '') => {
    if (cmd.toLowerCase().includes('halo dedi')) {
      if (!_.isEmpty(name)) {
        if (cmd.toLowerCase().includes('dedi nyanyi')) {
          readText('Aku sangat suka menyanyi')
        } else {
          const getCmd = cmd.toLowerCase().replace('halo dedi', '')
          getDediResponse(getCmd)
        }
      } else if (cmd.toLowerCase().includes('nama saya adalah')) {
        const getName = cmd.toLowerCase().replace('halo dedi', '').replace('nama saya adalah', '').trim()
        getName.length > 1 ? introduce(getName) : readText('Namamu aneh, Silahkan tekan tombol yang akan muncul ditengah. lalu sebutkan perintah. Halo Dedi Nama Saya adalah blablabla')
      } else {
        readText('Kamu belum berkenalan denganku, Silahkan tekan tombol yang akan muncul ditengah. lalu sebutkan perintah. Halo Dedi Nama Saya adalah blablabla')
      }
    } else {
      readText('Katakan Halo Dedi, setelah itu baru katakan perintah kamu!')
    }
  }

  function introduce(name) {
    console.log('name : ' + name)
    setName(name)
    greetings(name)
  }

  const getDediResponse = async (text) => {
    await Dialogflow_V2.requestQuery(text, result => {
      const resultResponse = result.queryResult.fulfillmentText
      readText(resultResponse ? resultResponse : 'Maaf aku tidak mengerti')
    }, error => console.log(error));
  }


  const readText = async (text) => {
    Tts.stop();
    Tts.speak(text);
  };


  /**
   * 
   * GAP FUNCTION BETWEEN RENDER
   * 
   */

  return (
    <SafeAreaView style={styles.container}>
      {
        ttsStatus !== 'started' ?
          <TouchableHighlight
            onPress={_startRecognizing}
            style={styles.button}>
            <Text>Tekan untuk mulai</Text>
          </TouchableHighlight> :
          <Text>Dedi sedang berbicara...</Text>
      }
      {
        voiceStatus == 'Mendengarkan perintah...' ?
          <>
            <TouchableHighlight
              onPress={_stopRecognizing}
              style={styles.button}>
              <Text>Berhenti mendengarkan</Text>
            </TouchableHighlight>
            <TouchableHighlight
              onPress={_cancelRecognizing}
              style={styles.button}>
              <Text>Batalkan perintah</Text>
            </TouchableHighlight>
          </> : null
      }
      <Text>Status: {voiceStatus}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  button: {
    padding: 24,
    borderWidth: .5,
    marginVertical: 20
  }
});

export default App