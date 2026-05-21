import { useState, useRef } from "react";
import RequestHandler from "../lib/utilities/request_handler";
import type { Method, QuickTest } from "../data/quick-tests";

export type ResponseState = {
    data: unknown;
    status: "success" | "error";
    duration: number;
    url: string;
} | null;

function parseJSON(value: string, label: string): [Record<string, unknown> | null, string | null] {
    if (!value.trim()) return [{}, null];
    try {
        const parsed = JSON.parse(value);
        if (typeof parsed !== "object" || Array.isArray(parsed))
            return [null, `${label} must be a JSON object`];
        return [parsed as Record<string, unknown>, null];
    } catch {
        return [null, `Invalid JSON in ${label}`];
    }
}

export function useApiTester() {
    const [method, setMethod] = useState<Method>("GET");
    const [route, setRoute] = useState("test");
    const [body, setBody] = useState("");
    const [headers, setHeaders] = useState("");
    const [authToken, setAuthTokenState] = useState(() =>
        typeof window !== "undefined" ? localStorage.getItem("authToken") ?? "" : ""
    );
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<ResponseState>(null);
    const [bodyError, setBodyError] = useState<string | null>(null);
    const [headerError, setHeaderError] = useState<string | null>(null);
    const [activeQuick, setActiveQuick] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const isBodyless = ["GET", "DELETE"].includes(method);

    const setAuthToken = (token: string) => {
        setAuthTokenState(token);
        if (typeof window !== "undefined") {
            if (token) localStorage.setItem("authToken", token);
            else localStorage.removeItem("authToken");
        }
    };

    const send = async (overrideMethod?: Method, overrideRoute?: string, overrideBody?: string) => {
        const m = overrideMethod ?? method;
        const r = overrideRoute ?? route;
        const b = overrideBody ?? body;
        const bodyless = ["GET", "DELETE"].includes(m);

        const [parsedBody, bodyErr] = bodyless ? [{}, null] : parseJSON(b, "Body");
        const [parsedHeaders, headerErr] = parseJSON(headers, "Headers");

        setBodyError(bodyErr);
        setHeaderError(headerErr);
        if (bodyErr || headerErr) return;

        abortRef.current?.abort();
        abortRef.current = new AbortController();

        setLoading(true);
        setResponse(null);
        const start = performance.now();

        try {
            const data = await RequestHandler.fetchData(
                m,
                r.replace(/^\/+/, ""),
                (parsedBody ?? {}) as Record<string, unknown>,
                (parsedHeaders ?? {}) as Record<string, string>
            );
            const duration = Math.round(performance.now() - start);
            const url = `${RequestHandler.baseURL}/${RequestHandler.apiLink}/${r.replace(/^\/+/, "")}`;
            const isError = data && typeof data === "object" && "success" in data && data.success === false;
            setResponse({ data, status: isError ? "error" : "success", duration, url });
        } catch (err) {
            setResponse({
                data: { message: err instanceof Error ? err.message : "Unknown error" },
                status: "error",
                duration: Math.round(performance.now() - start),
                url: `${RequestHandler.baseURL}/${RequestHandler.apiLink}/${r}`,
            });
        } finally {
            setLoading(false);
        }
    };

    const runQuickTest = (test: QuickTest, groupLabel: string) => {
        const key = `${groupLabel}:${test.label}`;
        setActiveQuick(key);
        setMethod(test.method);
        setRoute(test.route);
        setBody(test.body ?? "");
        setBodyError(null);
        setHeaderError(null);
        send(test.method, test.route, test.body ?? "");
    };

    return {
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
        isBodyless,
        send,
        runQuickTest,
    };
}