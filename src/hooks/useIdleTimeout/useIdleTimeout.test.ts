import { act, fireEvent, renderHook } from "@testing-library/react";
import { useIdleTimeout } from "./useIdleTimeout";

const TIMEOUT = 5_000;

jest.mock("worker-timers", () => ({
    ...jest.requireActual("worker-timers"),
    setTimeout: (...args: Parameters<typeof window.setTimeout>) => {
        window.setTimeout(...args);
    },
    clearTimeout: (...args: Parameters<typeof window.clearTimeout>) => {
        window.clearTimeout(...args);
    },
}));

describe("useIdleTimeout", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it("should call callback with idle state if no user action", () => {
        const spy = jest.fn();
        const { result } = renderHook(() => useIdleTimeout(spy, TIMEOUT));

        expect(result.current.active).toBe(false);
        expect(result.current.timerIsRunning).toBe(true);
        expect(spy).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(TIMEOUT);
        });

        expect(result.current.active).toBe(false);
        expect(result.current.timerIsRunning).toBe(false);
        expect(spy).toHaveBeenCalledWith('idle');
    });

    it("should call callback with active state if user action", () => {
        const spy = jest.fn();
        const { result } = renderHook(() => useIdleTimeout(spy, TIMEOUT));

        expect(result.current.active).toBe(false);
        expect(result.current.timerIsRunning).toBe(true);
        expect(spy).not.toHaveBeenCalled();

        fireEvent.focus(document);
        act(() => {
            jest.advanceTimersByTime(TIMEOUT);
        });

        expect(result.current.active).toBe(true);
        expect(result.current.timerIsRunning).toBe(false);
        expect(spy).toHaveBeenCalledWith('active');
    });

    it("should allow for reset", () => {
        const spy = jest.fn();
        const { result } = renderHook(() => useIdleTimeout(spy, TIMEOUT));

        expect(result.current.active).toBe(false);
        expect(result.current.timerIsRunning).toBe(true);
        expect(spy).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(TIMEOUT);
        });

        expect(result.current.active).toBe(false);
        expect(result.current.timerIsRunning).toBe(false);
        expect(spy).toHaveBeenNthCalledWith(1, 'idle');

        act(() => {
            result.current.reset();
        });
        expect(result.current.active).toBe(false);
        expect(result.current.timerIsRunning).toBe(true);

        fireEvent.focus(document);
        act(() => {
            jest.advanceTimersByTime(TIMEOUT);
        });

        expect(result.current.active).toBe(true);
        expect(result.current.timerIsRunning).toBe(false);
        expect(spy).toHaveBeenNthCalledWith(2, 'active');
        
        act(() => {
            result.current.reset();
        });
        expect(result.current.active).toBe(false);
        expect(result.current.timerIsRunning).toBe(true);

        act(() => {
            jest.advanceTimersByTime(TIMEOUT);
        });

        expect(result.current.active).toBe(false);
        expect(result.current.timerIsRunning).toBe(false);
        expect(spy).toHaveBeenNthCalledWith(3, 'idle');
    });
});
