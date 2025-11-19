import React from 'react';

export default function VoicePreview({ transcript }) {
  return (
    <div style={{background:'#fff',padding:'1rem',borderRadius:'8px',boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
      <h4>Transcript</h4>
      <p style={{fontSize:'0.9rem'}}>{transcript || 'No speech captured yet.'}</p>
    </div>
  );
}
