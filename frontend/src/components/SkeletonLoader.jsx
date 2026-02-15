import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useTheme } from "../context/ThemeContext";

export default function SkeletonLoader({ className }) {
    const { theme } = useTheme();

    return (
        <Skeleton
            className={className || "h-8 w-full"}
            baseColor={theme === "dark" ? "#374151" : "#e5e7eb"}
            highlightColor={theme === "dark" ? "#4b5563" : "#f3f4f6"}
        />
    );
}
