import dayjs from "dayjs";

export function formatDate(dateStr, format = "DD MMM YYYY, HH:mm") {
    return dayjs(dateStr).format(format);
}

export function formatShortDate(dateStr) {
    return dayjs(dateStr).format("DD MMM");
}
