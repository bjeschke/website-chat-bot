export default function Spinner() {
    return (
        <span className="flex gap-1 animate-pulse">
      <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
      <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
      <span className="w-2 h-2 bg-yellow-600 rounded-full"></span>
    </span>
    );
}