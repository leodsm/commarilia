import { useEffect, useRef } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;

export const useKeyboardNavigation = (handler: KeyHandler, priorityDeps: any[] = []) => {
    const savedHandler = useRef(handler);

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const eventListener = (event: KeyboardEvent) => {
            // We can call savedHandler.current to always get the latest version
            // without re-binding the event listener on every render
            savedHandler.current(event);
        };

        window.addEventListener('keydown', eventListener);
        return () => {
            window.removeEventListener('keydown', eventListener);
        };
    }, priorityDeps); // verify if we really need deps here or if empty dependency is enough with ref
};
