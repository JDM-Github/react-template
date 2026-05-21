import { ResponseState } from "../hooks/useApiTester";

type Props = {
    response: ResponseState;
};

export function ResponsePanel({ response }: Props) {
    if (!response) return null;

    const formatted = (() => {
        try {
            return JSON.stringify(response.data, null, 2);
        } catch {
            return String(response.data);
        }
    })();

    const isSuccess = response.status === "success";

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <div
                    className={`w-1.5 h-1.5 rounded-full ${isSuccess ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" : "bg-rose-400 shadow-[0_0_6px_rgba(251,113,133,0.6)]"}`}
                />
                <span className="text-xs text-zinc-500 tracking-wider uppercase">Response</span>
                <span className={`text-xs font-bold ${isSuccess ? "text-emerald-400" : "text-rose-400"}`}>
                    {response.status.toUpperCase()}
                </span>
                <span className="text-xs text-zinc-600 ml-auto font-sans">
                    <span className={`mr-2 font-mono ${response.duration > 500 ? "text-amber-400" : "text-zinc-500"}`}>
                        {response.duration}ms
                    </span>
                    <span className="text-zinc-700">{response.url}</span>
                </span>
            </div>
            <pre className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-300 overflow-auto max-h-80 leading-relaxed scrollbar-thin">
                {formatted}
            </pre>
        </div>
    );
}