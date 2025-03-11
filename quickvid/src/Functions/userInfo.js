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

export const updateVideoLimit = async () => {
    try {
        const response = await fetch(`https://quick-vid.com/wp-json/custom/v1/videoCount/${userData.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        const data = await response.json();

        if (data.success) {
            console.log('Videos remaining:', data.videoCount);
            return data.videoCount;
        } else {
            console.error('Error updating count:', data.error);
            return null;
        }
    } catch (error) {
        console.error('Error updating video count:', error);
        return null;
    }
};