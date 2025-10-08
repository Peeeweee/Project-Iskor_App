export const getDateFromId = (id: string, options: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: 'long', day: 'numeric'
}): string => {
    try {
        const timestamp = parseInt(id.split('-')[1], 10);
        if (isNaN(timestamp)) return 'Unknown Date';
        return new Date(timestamp).toLocaleDateString(undefined, options);
    } catch (e) {
        return 'Unknown Date';
    }
};
