export default function Badge({ type }) {
    let colorClass = "bg-gray-200 text-gray-800";
    if (type === "scam") colorClass = "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
    if (type === "safe") colorClass = "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
            {type === "scam" ? "Scam" : type === "safe" ? "Safe" : type}
        </span>
    );
}
