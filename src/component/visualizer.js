import { useRef, useState, useEffect } from 'react';
import Microphone from './microphone';
import { create } from 'wavesurfer.js';

const Visualizer = () => {
    let { normSamples } = Microphone()
    const canvasRef = useRef(null);

    let ctx

    useEffect(() => {
        const canvas = canvasRef.current;
        ctx = canvas.getContext("2d");
    }, []);

    // canvas.width = window.innerWidth
    // canvas.height = window.innerHeight


    const bar = (x, y, width, height, color) => {

        const update = (micInput) => {
            height = micInput * 20
        }
        const draw = (context) => {
            context.fillRect(x, y, width, height)
        }
        return { update, draw }
    }


    let bars = []
    let barWidth = 600 / 256
    const createBar = () => {
        for (let i = 0; i < 256; i++) {
            bars.push(bar(i * barWidth, 400 / 2, 1, 20, 'blue'))
        }
    }
    createBar()

    const animate = () => {
        ctx.clearRect(0, 0, 600, 400)
        bars.forEach(function (bar,i) {
            bar.update(normSamples[i])
            bar.draw(ctx)
        })
        requestAnimationFrame(animate)
    }
    animate()
    return (
        <>
            <canvas ref={canvasRef} width="600" height="400"></canvas>
        </>

    );
}
export default Visualizer