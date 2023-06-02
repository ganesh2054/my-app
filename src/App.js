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
      });

      if (barQueueRef.current.length > canvas.width / 3) {
        barQueueRef.current.shift();
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const middleY = canvas.height / 2;
      for (let i = 0; i < barQueueRef.current.length; i++) {
        const bar = barQueueRef.current[i];

        ctx.fillStyle = 'blue';
        ctx.fillRect(bar.x, middleY - bar.height / 2, 2, bar.height);

        ctx.fillStyle = 'blue'
        // ctx.fillRect(bar.x, middleY + bar.height / 2, 2, bar.height);

        bar.x -= 3;
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
  console.log(status, 'status')

  return (
    <div style={{ margin: 'auto', display: 'block' }}>
      <canvas ref={canvasRef} width={'800px'} height={'400px'}></canvas>
      {audioUrl && <audio controls src={audioUrl} />}
      <button onClick={status === "notStarted" ? record : status === "started" ? pause : status === 'paused' ? resume : pause}>{`${status === 'notStarted' ? 'record' : status === 'started' ? 'pause' : status === 'paused' ? 'resume' : 'pause'}`}</button>
      <button onClick={stop}>stop</button>

    </div>
  );
}

export default App;
