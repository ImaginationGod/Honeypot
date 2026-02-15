export default function MessageBubble({ role, content }) {
    const baseClass = "p-2 rounded-md max-w-full break-words";
    const styleClass = role === "assistant"
        ? "bg-indigo-50 dark:bg-indigo-900 text-gray-800 dark:text-gray-100 self-start"
        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 self-end";

    return (
        <div className={`flex ${role === "assistant" ? "justify-start" : "justify-end"}`}>
            <div className={`${baseClass} ${styleClass}`}>
                <span className="font-medium capitalize">{role}: </span>
                {content}
            </div>
        </div>
    );
}
