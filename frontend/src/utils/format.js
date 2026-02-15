export function truncateText(text, length = 50) {
    if (!text) return "";
    return text.length > length ? text.slice(0, length) + "..." : text;
}

export function capitalizeFirst(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
}
