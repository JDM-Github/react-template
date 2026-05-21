import RequestHandler from "../lib/utilities/request_handler";

type Props = {
    authToken: string;
    onChange: (token: string) => void;
};

export function AuthTokenInput({ authToken, onChange }: Props) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs text-zinc-500 tracking-wider uppercase flex items-center gap-2">
                Authorization
                <span className="text-zinc-700 normal-case tracking-normal font-sans">
                    — stored in localStorage
                </span>
            </label>
            <div className="flex items-center bg-zinc-900/80 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-zinc-600 transition-colors">
                <span className="px-3 text-zinc-600 text-xs select-none whitespace-nowrap border-r border-zinc-800">
                    Bearer
                </span>
                <input
                    type="text"
                    value={authToken}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="your-jwt-token"
                    className="flex-1 bg-transparent py-2.5 px-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-700 font-sans"
                />
                <span className="px-3 text-[10px] text-zinc-700 select-none whitespace-nowrap border-l border-zinc-800 font-sans">
                    {RequestHandler.baseURL}
                </span>
                {authToken && (
                    <button
                        onClick={() => onChange("")}
                        className="px-3 py-2.5 text-xs text-zinc-600 hover:text-rose-400 transition-colors cursor-pointer border-l border-zinc-800"
                    >
                        ✕
                    </button>
                )}
            </div>
        </div>
    );
}