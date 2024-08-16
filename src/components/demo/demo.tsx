"use client";

import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { useEffect, useRef, useState } from "react";

export const Demo = () => {
    const timeout = 5_000;
    const [duration, setDuration] = useState(0);
    const [message, setMessage] = useState('');
    const nowRef = useRef(Date.now());
    const { active, timerIsRunning, reset } = useIdleTimeout((state) => {
        console.log(state);
        setMessage(state === 'active' ? 'renew api call -> reset timer' : 'show timeout modal -> continue clicked -> renew api call -> reset timer');
    }, timeout);

    useEffect(() => {
        const id = setInterval(() => {
            console.log(duration);
            setDuration(Date.now() - nowRef.current);
        }, 100);

        return () => {
            clearInterval(id);
        }
    }, []);

    const onClick = () => {
        nowRef.current = Date.now();
        reset();
    }

    return (
        <div style={{ padding: '12px', boxSizing: 'border-box', border: '1px solid grey' }}>
            <h2>Manual Reset Example</h2>
            <p>timeout: {timeout/1000}s</p>
            <p style={{color: active ? 'green' : 'red'}}>active: {`${active}`}</p>
            <p>timerIsRunning: {`${timerIsRunning}`}</p>
            <p style={{color: duration < timeout ? 'green' : 'red'}}>duration: {duration/1000}s</p>
            <button onClick={onClick}>Reset</button>
            {message && <h3>{message}</h3>}
        </div>
    );
};
