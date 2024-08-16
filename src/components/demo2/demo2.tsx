"use client";

import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { useEffect, useState } from "react";

const mockAPICall = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ status: 200 });
        }, 300);
    });
};

export const Demo2 = () => {
    const timeout = 5_000;
    const [showPrompt, setShowPrompt] = useState(false);
    const [counter, setCounter] = useState(0);
    const { active, timerIsRunning, reset } = useIdleTimeout((state) => {
        if (state === "active") {
            renewSession();
            return;
        }

        setShowPrompt(true);
    }, timeout);

    const renewSession = async () => {
        await mockAPICall();
        setCounter(prev => prev + 1);
        setShowPrompt(false);
        reset();
    };

    return (
        <div style={{ padding: "12px", boxSizing: "border-box", border: "1px solid grey" }}>
            <h2>Renew Prompt Example</h2>
            <p>Counter will increment every 5 seconds as long as you are active</p>
            <p>Counter: {counter}</p>
            <p style={{ color: active ? "green" : "red" }}>active: {`${active}`}</p>
            <p>timerIsRunning: {`${timerIsRunning}`}</p>

            {showPrompt && (
                <>
                    <h3>Session is going to expire</h3>
                    <p>Click continue plz</p>
                    <button onClick={renewSession}>Continue</button>
                </>
            )}
        </div>
    );
};
