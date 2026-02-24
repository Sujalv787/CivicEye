import { createContext, useContext, useState, useCallback } from 'react';

const TrainLoaderContext = createContext(null);

export function TrainLoaderProvider({ children }) {
    const [visible, setVisible] = useState(false);
    const [onDoneCallback, setOnDoneCallback] = useState(null);

    // Call this to show the train loader for ~2.5s, then execute the callback
    const showLoader = useCallback((callback) => {
        setOnDoneCallback(() => callback);
        setVisible(true);
    }, []);

    const handleDone = useCallback(() => {
        setVisible(false);
        if (onDoneCallback) {
            onDoneCallback();
            setOnDoneCallback(null);
        }
    }, [onDoneCallback]);

    return (
        <TrainLoaderContext.Provider value={{ visible, showLoader, handleDone }}>
            {children}
        </TrainLoaderContext.Provider>
    );
}

export function useTrainLoader() {
    return useContext(TrainLoaderContext);
}
