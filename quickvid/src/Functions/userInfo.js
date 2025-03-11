export let userData = null;

export const setUserData = (data) => {
    userData = data;
};

export const getVideoLimit = async () => {
    try {
        const response = await fetch(`https://quick-vid.com/wp-json/custom/v1/videoCount/${userData.id}`, {
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