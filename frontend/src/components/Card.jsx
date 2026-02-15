export default function Card({ title, value }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    );
}
