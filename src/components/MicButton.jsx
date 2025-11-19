import React, { useState, useRef } from 'react';
import { parseLocal } from '../utils/parseLocal.js';
import { useNavigate } from 'react-router-dom';
import { saveTransaction } from '../services/firestoreService.js';
import { auth } from '../firebase.js';

export default function MicButton() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const retryCountRef = useRef(0);
  const finalTextRef = useRef('');
  const isStoppedRef = useRef(false);
  const micPermissionGrantedRef = useRef(false);
  const navigate = useNavigate();

  async function startRecognition() {
    setError('');
    isStoppedRef.current = false;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice input not supported in this browser. Please use Chrome on desktop or Android.');
      return;
    }

    // Proactively request mic permission only once, on first use, with timeout
    if (!micPermissionGrantedRef.current) {
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          setStatus('Check your browser for microphone permission prompt...');
          
          // Add timeout to prevent infinite hang
          const permissionPromise = navigator.mediaDevices.getUserMedia({ audio: true });
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Permission timeout')), 10000)
          );
          
          await Promise.race([permissionPromise, timeoutPromise]);
          micPermissionGrantedRef.current = true;
          setStatus('Permission granted! Starting...');
        }
      } catch (err) {
        console.error('getUserMedia error', err);
        if (err.message === 'Permission timeout') {
          setError('Permission request timed out. Check browser address bar for permission prompt, or use manual entry below.');
        } else if (err.name === 'NotAllowedError') {
          setError('Microphone permission denied. Click the lock/camera icon in address bar to allow.');
        } else {
          setError('Could not access microphone: ' + err.message);
        }
        setStatus('');
        return;
      }
    }

    const rec = new SpeechRecognition();
    rec.lang = 'en-US';
    rec.continuous = true;
    rec.interimResults = true;
    
    // Disable network-dependent features to work offline
    // Some browsers support this; gracefully degrades if not
    if ('grammars' in rec) {
      rec.grammars = null;
    }
    
    if (retryCountRef.current === 0) {
      finalTextRef.current = '';
    }

    rec.onstart = () => { 
      setStatus('Listening...'); 
      setListening(true); 
    };
    
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          finalTextRef.current += r[0].transcript + ' ';
        } else {
          interim += r[0].transcript;
        }
      }
      setTranscript((finalTextRef.current + interim).trim());
    };
    
    rec.onerror = (e) => {
      console.error('SpeechRecognition error', e);
      
      // Network errors are often false positives - ignore them if we got some speech
      if (e.error === 'network') {
        if (finalTextRef.current.trim().length > 0 || transcript.trim().length > 0) {
          // We have captured speech, ignore the network error and let user stop manually
          console.warn('Network error but speech captured, ignoring');
          setStatus('Listening... (offline mode)');
          return;
        }
        // Only retry if we haven't captured anything yet
        if (retryCountRef.current < 2 && !isStoppedRef.current) {
          retryCountRef.current += 1;
          setStatus(`Retrying (${retryCountRef.current}/2)...`);
          setTimeout(() => {
            if (!isStoppedRef.current) {
              startRecognition();
            }
          }, 1000);
          return;
        }
        // After retries, show error but still allow manual fallback
        setError('Voice service unavailable. Use manual entry below or try again.');
        stopRecording();
        return;
      }
      
      // Handle other errors normally
      const errorMessages = {
        'not-allowed': 'Permission denied – enable microphone access.',
        'service-not-allowed': 'Browser blocked speech service.',
        'no-speech': 'No speech detected – try speaking louder.',
        'audio-capture': 'Microphone not found – check device.',
        'aborted': 'Stopped.'
      };
      
      setError(errorMessages[e.error] || ('Error: ' + e.error));
      stopRecording();
    };
    
    rec.onend = () => { 
      if (!isStoppedRef.current && retryCountRef.current < 3) {
        // Ended unexpectedly, don't reset state
        return;
      }
      setListening(false); 
      setStatus(''); 
    };

    try {
      rec.start();
      recognitionRef.current = rec;
    } catch (err) {
      console.error('Recognition start error:', err);
      setError('Failed to start – try again.');
      setListening(false);
    }
  }

  async function stopRecording() {
    isStoppedRef.current = true;
    recognitionRef.current?.stop();
    setListening(false);
    retryCountRef.current = 0;
    
    const finalText = (finalTextRef.current || transcript || '').trim();
    if (!finalText) {
      setError('No speech captured. Try again.');
      setStatus('');
      return;
    }
    
    // Parse and auto-save directly
    setStatus('Processing...');
    try {
      const parsed = parseLocal(finalText);
      console.log('Parsed expense:', parsed);
      
      if (!auth.currentUser) {
        setError('Please login first.');
        setStatus('');
        setTimeout(() => navigate('/login'), 1500);
        return;
      }
      
      await saveTransaction({
        amount: parsed.amount || 0,
        currency: parsed.currency || 'LKR',
        category: parsed.category || 'Other',
        merchant: parsed.merchant || null,
        note: parsed.note || finalText,
        date: new Date(parsed.date || new Date()).toISOString(),
        source: 'voice'
      });
      
      console.log('Transaction saved successfully');
      
      // Success feedback
      setStatus('✓ Saved!');
      setTranscript('');
      finalTextRef.current = '';
      
      // Clear success message and reload after delay
      setTimeout(() => {
        setStatus('');
        // Reload to show updated data
        window.location.reload();
      }, 1500);
      
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save: ' + (err.message || 'Unknown error'));
      setStatus('');
    }
  }

  return (
    <div className='mic-floating' style={{zIndex:1000}}>
      <button 
        onClick={listening ? stopRecording : startRecognition} 
        style={{
          width:90,
          height:90,
          borderRadius:'50%',
          fontSize:'0.9rem',
          background:listening?'#dc2626':status.includes('✓')?'#16a34a':'#2563eb',
          color:'#fff',
          border:'none',
          boxShadow:'0 4px 14px rgba(0,0,0,0.25)',
          cursor:'pointer',
          transition:'all 0.3s'
        }}
      >
        {listening ? '🎤 Stop' : status.includes('✓') ? '✓' : '🎤'}
      </button>
      {(listening || status) && (
        <div style={{
          marginTop:'0.5rem',
          textAlign:'center',
          fontSize:'0.75rem',
          maxWidth:240,
          background:'rgba(255,255,255,0.95)',
          padding:'0.5rem',
          borderRadius:'8px',
          boxShadow:'0 2px 8px rgba(0,0,0,0.15)'
        }}>
          {status.includes('✓') ? (
            <strong style={{color:'#16a34a'}}>{status}</strong>
          ) : (
            transcript || status || 'Listening...'
          )}
        </div>
      )}
      {error && (
        <div style={{
          marginTop:'0.5rem',
          textAlign:'center',
          fontSize:'0.75rem',
          color:'#dc2626',
          maxWidth:240,
          background:'rgba(255,255,255,0.95)',
          padding:'0.5rem',
          borderRadius:'8px',
          boxShadow:'0 2px 8px rgba(0,0,0,0.15)'
        }}>
          {error}
        </div>
      )}
      {!listening && !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
        <div style={{marginTop:'0.5rem',textAlign:'center',fontSize:'0.75rem',maxWidth:220}}>
          Voice not supported. Use Add page.
        </div>
      )}
    </div>
  );
}
