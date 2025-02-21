export const createSafeResizeObserver = (callback: ResizeObserverCallback): ResizeObserver | null => {
    // Check if ResizeObserver is supported
    if (typeof ResizeObserver === 'undefined') {
        return null;
    }

    let frames = 0;
    const debouncedCallback: ResizeObserverCallback = (entries, observer) => {
        // Skip every other frame to reduce notifications
        frames += 1;
        if (frames % 2 === 0) {
            callback(entries, observer);
        }
    };

    return new ResizeObserver(debouncedCallback);
}; 