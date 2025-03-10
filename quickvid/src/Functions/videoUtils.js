export const getVideoLimit = async (userId) => {
    try {
        const response = await fetch(`https://quick-vid.com/wp-json/custom/v1/videoCount/${userId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        const data = await response.json();
        console.log('Current video count:', data.videoCount); // Debug log
        return data.videoCount;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
};