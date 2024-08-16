import { useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export type UseIdleTimeoutState = "active" | "idle";

export interface UseIdleTimeout {
    active: boolean;
    setActive: Dispatch<SetStateAction<boolean>>
    timerIsRunning: boolean;
    setTimerIsRunning: Dispatch<SetStateAction<boolean>>
    reset: () => void;
}

export const useIdleTimeout = (callback: (state: UseIdleTimeoutState) => void, timeout?: number): UseIdleTimeout => {
    const [timerIsRunning, setTimerIsRunning] = useState(true);
    const [__internalCounter, __getInternalCounter] = useState(0);
    const [active, setActive] = useState(false);
    const activeRef = useRef(active);// Used to avoid resetting timeout
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        activeRef.current = active;
    }, [active]);

    useEffect(() => {
        if (!timerIsRunning || active) {
            return;
        }

        const onEvent = () => {
            setActive(true);
        };

        // TODO confirm which events based on docs
        const eventTypes: (keyof DocumentEventMap)[] = ['click', 'focus', 'keydown'];

        const removeEventListeners = eventTypes.map((eventType) => {
            document.addEventListener(eventType, onEvent, {
                capture: true,// TODO review what capture does for addEventListener
                passive: true,// TODO doesn't this just involve scroll events?
            });

            return () => {
                document.removeEventListener(eventType, onEvent, {
                    capture: true,// TODO review what capture does for removeEventListener
                });
            };
        });

        return () => {
            removeEventListeners.forEach((removeEventListener) => removeEventListener());
        };
    }, [active, timerIsRunning]);

    useEffect(() => {
        setTimerIsRunning(true);

        const timeoutId = window.setTimeout(() => {
            callbackRef.current(activeRef.current ? "active" : "idle");
            setTimerIsRunning(false);
        }, timeout);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [timeout, __internalCounter]);

    return { active, setActive, timerIsRunning, setTimerIsRunning, reset: () => {
        setActive(false);
        __getInternalCounter(prev => prev + 1);
    } };
};
