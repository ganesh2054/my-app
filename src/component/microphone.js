import { useRef, useState, useEffect } from 'react';


const Microphone = async () => {
    let microphone
    const [started, setStarted] = useState(false)
    let normSamples
    let analyser
    let audioContext = new (window.AudioContext || window.webkitAudioContext)();
    navigator.mediaDevices.getUserMedia({ audio: true })
    .then(function(stream){
        microphone = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512
        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        microphone.connect(analyser)
    
        analyser.getByteTimeDomainData(dataArray)
         normSamples = [...dataArray].map(e => e / 128 - 1)
        let sum = 0
        for (let i = 0; i < normSamples.length; i++) {
            sum += normSamples[i] * normSamples[i]
        }
    });

    return { normSamples }
}
export default Microphone
