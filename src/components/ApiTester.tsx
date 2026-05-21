import { AuthTokenInput } from "./AuthTokenInput";
import { QuickTestsPanel } from "./QuickTestsPanel";
import { RequestBar } from "./RequestBar";
import { BodyHeaderInputs } from "./BodyHeaderInputs";
import { ResponsePanel } from "./ResponsePanel";
import RequestHandler from "../lib/utilities/request_handler";
import { useApiTester } from "../hooks/useApiTester";

export function ApiTester() {
    const {
        method, setMethod,
        route, setRoute,
        body, setBody,
        headers, setHeaders,
        authToken, setAuthToken,
        loading,
        response,
        bodyError, setBodyError,
        headerError, setHeaderError,
        activeQuick,
        send,
        runQuickTest,
    } = useApiTester();

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send();
    };

    return (
        <div
            className="min-h-screen bg-[#0d0d0f] text-zinc-100 font-mono p-6 flex flex-col gap-6"
            onKeyDown={handleKeyDown}
        >
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.5)]" />
                <span className="text-xs text-zinc-500 tracking-widest uppercase">API Tester</span>
                <div className="flex items-center gap-1.5 ml-auto">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                    <span className="text-xs text-zinc-700">{RequestHandler.baseURL}</span>
                </div>
            </div>

            {/* Auth */}
            <AuthTokenInput authToken={authToken} onChange={setAuthToken} />

            {/* Quick Tests */}
            <QuickTestsPanel
                activeQuick={activeQuick}
                loading={loading}
                onRun={runQuickTest}
            />

            <div className="border-t border-zinc-800/60" />

            {/* Request */}
            <RequestBar
                method={method}
                route={route}
                loading={loading}
                onMethodChange={setMethod}
                onRouteChange={setRoute}
                onSend={() => send()}
            />

            {/* Body + Headers */}
            <BodyHeaderInputs
                method={method}
                body={body}
                headers={headers}
                bodyError={bodyError}
                headerError={headerError}
                onBodyChange={(v) => { setBody(v); setBodyError(null); }}
                onHeadersChange={(v) => { setHeaders(v); setHeaderError(null); }}
            />

            {/* Hint */}
            <p className="text-xs text-zinc-700 font-sans">
                Tip:{" "}
                <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-zinc-500 font-mono text-[10px]">
                    Ctrl+Enter
                </kbd>{" "}
                to send
            </p>

            {/* Response */}
            <ResponsePanel response={response} />
        </div>
    );
}