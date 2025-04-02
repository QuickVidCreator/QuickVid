export function progressBarFunction(setShowProgress, setProgressValue) {
    let progress = 0.0;
    setProgressValue(0);
    setShowProgress(true);

    const interval = setInterval(() => {
        progress += (progress < 0.7 ? 0.0015 : (progress < 0.8 ? 0.0010 : 0.0007));
        setProgressValue(progress);

        if (progress >= 1) {
            clearInterval(interval);
        }
    }, 50);

    // Stop the progress when the file is received
    setProgressValue(prev => {
        if (prev >= 1) {
            clearInterval(interval);
            return 1;
        }
        return prev;
    });
}