export default function Table({ columns, data }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} scope="col" className="px-4 py-2 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.map((row, idx) => (
                        <tr key={idx}>
                            {columns.map((col, cidx) => (
                                <td key={cidx} className="px-4 py-2 text-sm text-gray-900 dark:text-gray-200">
                                    {row[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
