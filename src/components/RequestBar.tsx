import RequestHandler from "../lib/utilities/request_handler";
import { METHODS, METHOD_COLORS, METHOD_ACTIVE, type Method } from "../data/quick-tests";

type Props = {
    method: Method;
    route: string;
    loading: boolean;
    onMethodChange: (m: Method) => void;
    onRouteChange: (r: string) => void;
    onSend: () => void;
};

export function RequestBar({ method, route, loading, onMethodChange, onRouteChange, onSend }: Props) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex gap-1.5">
                {METHODS.map((m) => (
                    <button
                        key={m}
                        onClick={() => onMethodChange(m)}
                        className={`px-3 py-1.5 text-xs font-bold tracking-wider border rounded-md transition-all cursor-pointer ${method === m ? METHOD_ACTIVE[m] : METHOD_COLORS[m]
                            }`}
                    >
                        {m}
                    </button>
                ))}
            </div>

            <div className="flex items-center bg-zinc-900/80 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-zinc-600 transition-colors">
                <span className="px-3 py-3 text-zinc-600 text-sm select-none whitespace-nowrap border-r border-zinc-800 font-sans">
                    {RequestHandler.baseURL}/{RequestHandler.apiLink}/
                </span>
                <input
                    type="text"
                    value={route}
                    onChange={(e) => onRouteChange(e.target.value)}
                    placeholder="your/route"
                    className="flex-1 bg-transparent py-3 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-700 font-sans"
                />
                <button
                    onClick={onSend}
                    disabled={loading}
                    className={`px-6 py-3 text-xs font-bold tracking-widest transition-all border-l border-zinc-800 ${loading
                            ? "text-zinc-600 cursor-not-allowed bg-zinc-900"
                            : "text-zinc-900 bg-zinc-100 hover:bg-white cursor-pointer"
                        }`}
                >
                    {loading ? (
                        <span className="flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1 h-1 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </span>
                    ) : (
                        "SEND"
                    )}
                </button>
            </div>
        </div>
    );
}