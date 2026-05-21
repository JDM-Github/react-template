import type { Method } from "../data/quick-tests";

type Props = {
    method: Method;
    body: string;
    headers: string;
    bodyError: string | null;
    headerError: string | null;
    onBodyChange: (v: string) => void;
    onHeadersChange: (v: string) => void;
};

export function BodyHeaderInputs({
    method,
    body,
    headers,
    bodyError,
    headerError,
    onBodyChange,
    onHeadersChange,
}: Props) {
    const isBodyless = ["GET", "DELETE"].includes(method);

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-500 tracking-wider uppercase flex items-center gap-2">
                    Body
                    {isBodyless && (
                        <span className="text-zinc-700 normal-case tracking-normal font-sans">— not used for {method}</span>
                    )}
                </label>
                <textarea
                    value={body}
                    onChange={(e) => onBodyChange(e.target.value)}
                    disabled={isBodyless}
                    rows={8}
                    placeholder={'{\n  "key": "value"\n}'}
                    spellCheck={false}
                    className={`w-full bg-zinc-900/80 border rounded-lg p-3 text-sm resize-none outline-none transition-colors placeholder:text-zinc-800 font-mono ${isBodyless
                            ? "border-zinc-900 text-zinc-700 cursor-not-allowed"
                            : bodyError
                                ? "border-rose-500/60 text-zinc-100 focus:border-rose-400"
                                : "border-zinc-800 text-zinc-100 focus:border-zinc-600"
                        }`}
                />
                {bodyError && <span className="text-xs text-rose-400">{bodyError}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-500 tracking-wider uppercase flex items-center gap-2">
                    Headers
                    <span className="text-zinc-700 normal-case tracking-normal font-sans">— optional</span>
                </label>
                <textarea
                    value={headers}
                    onChange={(e) => onHeadersChange(e.target.value)}
                    rows={8}
                    placeholder={'{\n  "X-Custom-Header": "value"\n}'}
                    spellCheck={false}
                    className={`w-full bg-zinc-900/80 border rounded-lg p-3 text-sm resize-none outline-none transition-colors placeholder:text-zinc-800 font-mono ${headerError
                            ? "border-rose-500/60 text-zinc-100 focus:border-rose-400"
                            : "border-zinc-800 text-zinc-100 focus:border-zinc-600"
                        }`}
                />
                {headerError && <span className="text-xs text-rose-400">{headerError}</span>}
            </div>
        </div>
    );
}