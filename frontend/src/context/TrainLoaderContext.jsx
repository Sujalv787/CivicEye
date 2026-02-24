import { createContext, useContext, useState, useCallback } from 'react';

const TrainLoaderContext = createContext(null);

export function TrainLoaderProvider({ children }) {
    const [visible, setVisible] = useState(false);
    const [onDoneCallback, setOnDoneCallback] = useState(null);

    const [customText, setCustomText] = useState(null);

    // Call this to show the train loader for ~2s, passing optional custom text
    const showLoader = useCallback((callback, textOverride = null) => {
        setOnDoneCallback(() => callback);
        setCustomText(textOverride);
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
        <TrainLoaderContext.Provider value={{ visible, showLoader, handleDone, customText }}>
            {children}
        </TrainLoaderContext.Provider>
    );
}

export function useTrainLoader() {
    return useContext(TrainLoaderContext);
}
