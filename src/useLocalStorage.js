import { useState, useEffect } from "react";

export function useLocalStorage(initialState, key) {
    const [value, setValue] = useState(() => {
        const storedWatchedValue = JSON.parse(localStorage.getItem(key));
        return storedWatchedValue ? storedWatchedValue : initialState;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [value, key]);
    return [value, setValue]
}