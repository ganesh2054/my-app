import React, { useEffect, useRef, useState } from 'react';

function App() {
  const canvasRef = useRef();
  const barQueueRef = useRef([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const animationRef = useRef();
  const [isPause, setIsPause] = useState(false)
  const [status, setStatus] = useState('notStarted')
  const record = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let mediaRecorder = null;

    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(function (stream) {
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        // Start recording
        if (status === 'notStarted') {
          mediaRecorder = new MediaRecorder(stream);
          setMediaRecorder(mediaRecorder)
          mediaRecorder.start();
          setStatus("started")
        }
        draw();

        mediaRecorder.onstop = function (e) {
          const blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        };
        // intervalRef.current = setInterval(() => draw(analyser, dataArray, canvas, ctx), 1000/60);
        let chunks = [];
        mediaRecorder.ondataavailable = function (e) {
          chunks.push(e.data);
        };
      })

      .catch(function (err) {
        console.log('The following error occurred: ' + err);
      });



   function draw() {
  animationRef.current = requestAnimationFrame(draw);

  analyser.getByteFrequencyData(dataArray);
  const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

  const maxHeight = 30;  // change this value as needed
  const barHeight = Math.min(average * 2, maxHeight);

  barQueueRef.current.push({
    height: barHeight,
    x: canvas.width,
    shake: Math.random() * 2 - 1,  // initial shake value, between -5 and 5
    shakeDirection: Math.random() < 0.5 ? -0.1 : 0.1  // initial shake direction, either -1 or 1
  });

  if (barQueueRef.current.length > canvas.width / 3) {
    barQueueRef.current.shift();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const middleY = canvas.height / 2;
  for (let i = 0; i < barQueueRef.current.length; i++) {
    const bar = barQueueRef.current[i];

    // change shake direction if shake value exceeds a certain limit
    if (bar.shake > 1 || bar.shake < -1) {
      bar.shakeDirection *= -1;
    }

    bar.shake += bar.shakeDirection;  // change shake value

    ctx.fillStyle = 'blue';
    ctx.fillRect(bar.x, middleY - bar.height / 2 + bar.shake, 2.5, bar.height);  // apply shake value to y position

    bar.x -= 6;
  }
}

    
  
    



  }
  const stop = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      cancelAnimationFrame(animationRef.current);
    }
  }
  const pause = () => {
    if (mediaRecorder) {
      mediaRecorder.pause();
      cancelAnimationFrame(animationRef.current);
      // setIsPause(true)
      setStatus('paused')
    }
  }
  const resume = () => {
    if (mediaRecorder) {
      mediaRecorder.resume();
      setStatus('resume')
      record()

    }
  }
  useEffect(() => {
    return () => {
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);

  return (
    <div style={{ margin: '50px', display: 'block' }}>
      <canvas ref={canvasRef} width={'900px'} height={'100px'}></canvas>
      {audioUrl && <audio controls src={audioUrl} />}
      <button onClick={status === "notStarted" ? record : status === "started" ? pause : status === 'paused' ? resume : pause}>{`${status === 'notStarted' ? 'record' : status === 'started' ? 'pause' : status === 'paused' ? 'resume' : 'pause'}`}</button>
      <button onClick={stop}>stop</button>

    </div>
  );
}

export default App;
