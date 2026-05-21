import { useState, useRef } from "react";
import RequestHandler from "../lib/utilities/request_handler";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type ResponseState = {
	data: unknown;
	status: "success" | "error";
	duration: number;
	url: string;
} | null;

const METHODS: Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const METHOD_COLORS: Record<Method, string> = {
	GET: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
	POST: "text-sky-400 border-sky-400/40 bg-sky-400/10",
	PUT: "text-amber-400 border-amber-400/40 bg-amber-400/10",
	PATCH: "text-violet-400 border-violet-400/40 bg-violet-400/10",
	DELETE: "text-rose-400 border-rose-400/40 bg-rose-400/10",
};

const METHOD_ACTIVE: Record<Method, string> = {
	GET: "text-emerald-950 bg-emerald-400 border-emerald-400",
	POST: "text-sky-950 bg-sky-400 border-sky-400",
	PUT: "text-amber-950 bg-amber-400 border-amber-400",
	PATCH: "text-violet-950 bg-violet-400 border-violet-400",
	DELETE: "text-rose-950 bg-rose-400 border-rose-400",
};

const METHOD_BADGE: Record<Method, string> = {
	GET: "text-emerald-400 bg-emerald-400/10",
	POST: "text-sky-400 bg-sky-400/10",
	PUT: "text-amber-400 bg-amber-400/10",
	PATCH: "text-violet-400 bg-violet-400/10",
	DELETE: "text-rose-400 bg-rose-400/10",
};

type QuickTest = {
	label: string;
	method: Method;
	route: string;
	body?: string;
	description: string;
};

const QUICK_TESTS: { group: string; tests: QuickTest[] }[] = [
	{
		group: "Basic",
		tests: [
			{ label: "GET /", method: "GET", route: "test", description: "Get test (with auth)" },
			{ label: "GET /:number", method: "GET", route: "test/42", description: "Get test with number param" },
			{ label: "POST /", method: "POST", route: "test", body: '{\n  "hello": "world"\n}', description: "Post test body" },
		],
	},
	{
		group: "Email",
		tests: [
			{
				label: "POST /email",
				method: "POST",
				route: "test/email",
				body: '{\n  "to": "test@example.com",\n  "subject": "Test Email",\n  "body": "Hello from API Tester"\n}',
				description: "Send an email",
			},
		],
	},
	{
		group: "Storage",
		tests: [
			{
				label: "POST /upload",
				method: "POST",
				route: "test/upload",
				body: '{\n  "url": "https://example.com/file.png",\n  "folder": "test"\n}',
				description: "Upload via URL",
			},
			{
				label: "DELETE /upload/:folder/:id",
				method: "DELETE",
				route: "test/upload/test/file-id",
				description: "Delete uploaded file",
			},
		],
	},
	{
		group: "Cache",
		tests: [
			{
				label: "POST /cache",
				method: "POST",
				route: "test/cache",
				body: '{\n  "key": "my-key",\n  "value": "my-value",\n  "ttl": 60\n}',
				description: "Set a cache entry",
			},
			{ label: "GET /cache/:key", method: "GET", route: "test/cache/my-key", description: "Get a cache entry" },
			{ label: "DELETE /cache/:key", method: "DELETE", route: "test/cache/my-key", description: "Delete a cache entry" },
			{ label: "DELETE /cache", method: "DELETE", route: "test/cache", description: "Flush entire cache" },
		],
	},
	{
		group: "Queue",
		tests: [
			{
				label: "POST /queue",
				method: "POST",
				route: "test/queue",
				body: '{\n  "queue": "default",\n  "data": { "task": "hello" }\n}',
				description: "Add job to queue",
			},
			{
				label: "GET /queue/:queue/:jobId",
				method: "GET",
				route: "test/queue/default/job-id",
				description: "Get job status",
			},
			{
				label: "DELETE /queue/:queue/:jobId",
				method: "DELETE",
				route: "test/queue/default/job-id",
				description: "Remove a job",
			},
		],
	},
	{
		group: "Socket",
		tests: [
			{ label: "GET /socket", method: "GET", route: "test/socket", description: "Get socket info" },
			{
				label: "POST /socket/broadcast",
				method: "POST",
				route: "test/socket/broadcast",
				body: '{\n  "event": "test",\n  "data": { "message": "hello everyone" }\n}',
				description: "Broadcast to all clients",
			},
			{
				label: "POST /socket/emit",
				method: "POST",
				route: "test/socket/emit",
				body: '{\n  "socketId": "socket-id",\n  "event": "test",\n  "data": { "message": "hello you" }\n}',
				description: "Emit to specific socket",
			},
			{
				label: "POST /socket/room",
				method: "POST",
				route: "test/socket/room",
				body: '{\n  "room": "room-name",\n  "event": "test",\n  "data": { "message": "hello room" }\n}',
				description: "Emit to a room",
			},
		],
	},
];

export default function ApiTester() {
	const [method, setMethod] = useState<Method>("GET");
	const [route, setRoute] = useState("test");
	const [body, setBody] = useState("");
	const [headers, setHeaders] = useState("");
	const [authToken, setAuthToken] = useState(() =>
		typeof window !== "undefined" ? localStorage.getItem("authToken") ?? "" : ""
	);
	const [loading, setLoading] = useState(false);
	const [response, setResponse] = useState<ResponseState>(null);
	const [bodyError, setBodyError] = useState<string | null>(null);
	const [headerError, setHeaderError] = useState<string | null>(null);
	const [activeQuick, setActiveQuick] = useState<string | null>(null);
	const abortRef = useRef<AbortController | null>(null);

	const isBodyless = ["GET", "DELETE"].includes(method);

	const parseJSON = (value: string, label: string): [Record<string, unknown> | null, string | null] => {
		if (!value.trim()) return [{}, null];
		try {
			const parsed = JSON.parse(value);
			if (typeof parsed !== "object" || Array.isArray(parsed)) {
				return [null, `${label} must be a JSON object`];
			}
			return [parsed as Record<string, unknown>, null];
		} catch {
			return [null, `Invalid JSON in ${label}`];
		}
	};

	const saveAuthToken = (token: string) => {
		setAuthToken(token);
		if (typeof window !== "undefined") {
			if (token) localStorage.setItem("authToken", token);
			else localStorage.removeItem("authToken");
		}
	};

	const handleSend = async (overrideMethod?: Method, overrideRoute?: string, overrideBody?: string) => {
		const activeMethod = overrideMethod ?? method;
		const activeRoute = overrideRoute ?? route;
		const activeBody = overrideBody ?? body;
		const activeBodyless = ["GET", "DELETE"].includes(activeMethod);

		const [parsedBody, bodyErr] = activeBodyless ? [{}, null] : parseJSON(activeBody, "Body");
		const [parsedHeaders, headerErr] = parseJSON(headers, "Headers");

		setBodyError(bodyErr);
		setHeaderError(headerErr);
		if (bodyErr || headerErr) return;

		if (abortRef.current) abortRef.current.abort();
		abortRef.current = new AbortController();

		setLoading(true);
		setResponse(null);

		const start = performance.now();

		try {
			const data = await RequestHandler.fetchData(
				activeMethod,
				activeRoute.replace(/^\/+/, ""),
				(parsedBody ?? {}) as Record<string, unknown>,
				(parsedHeaders ?? {}) as Record<string, string>
			);
			const duration = Math.round(performance.now() - start);
			const url = `${RequestHandler.baseURL}/${RequestHandler.apiLink}/${activeRoute.replace(/^\/+/, "")}`;
			const isError = data && typeof data === "object" && "success" in data && data.success === false;

			setResponse({ data, status: isError ? "error" : "success", duration, url });
		} catch (err) {
			setResponse({
				data: { message: err instanceof Error ? err.message : "Unknown error" },
				status: "error",
				duration: Math.round(performance.now() - start),
				url: `${RequestHandler.baseURL}/${RequestHandler.apiLink}/${activeRoute}`,
			});
		} finally {
			setLoading(false);
		}
	};

	const handleQuickTest = (test: QuickTest, groupLabel: string) => {
		const key = `${groupLabel}:${test.label}`;
		setActiveQuick(key);
		setMethod(test.method);
		setRoute(test.route);
		setBody(test.body ?? "");
		setBodyError(null);
		setHeaderError(null);
		handleSend(test.method, test.route, test.body ?? "");
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSend();
	};

	const formatted = (() => {
		try {
			return JSON.stringify(response?.data, null, 2);
		} catch {
			return String(response?.data);
		}
	})();

	return (
		<div
			className="min-h-screen bg-[#0d0d0f] text-zinc-100 font-mono p-6 flex flex-col gap-6"
			onKeyDown={handleKeyDown}
		>
			{/* Header */}
			<div className="flex items-center gap-3">
				<div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.5)]" />
				<span className="text-xs text-zinc-500 tracking-widest uppercase">API Tester</span>
				<span className="text-xs text-zinc-700 ml-auto">{RequestHandler.baseURL}</span>
			</div>

			{/* Auth Token */}
			<div className="flex flex-col gap-1.5">
				<label className="text-xs text-zinc-500 tracking-wider uppercase flex items-center gap-2">
					Authorization
					<span className="text-zinc-700 normal-case tracking-normal">— stored in localStorage as authToken</span>
				</label>
				<div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-zinc-600 transition-colors">
					<span className="px-3 text-zinc-600 text-xs select-none whitespace-nowrap">Bearer</span>
					<input
						type="text"
						value={authToken}
						onChange={(e) => saveAuthToken(e.target.value)}
						placeholder="your-jwt-token"
						className="flex-1 bg-transparent py-2.5 pr-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-700"
					/>
					{authToken && (
						<button
							onClick={() => saveAuthToken("")}
							className="px-3 py-2.5 text-xs text-zinc-600 hover:text-rose-400 transition-colors cursor-pointer"
						>
							clear
						</button>
					)}
				</div>
			</div>

			{/* Quick Tests */}
			<div className="flex flex-col gap-3">
				<span className="text-xs text-zinc-500 tracking-wider uppercase">Quick Tests</span>
				<div className="flex flex-col gap-3">
					{QUICK_TESTS.map(({ group, tests }) => (
						<div key={group} className="flex flex-col gap-1.5">
							<span className="text-[10px] text-zinc-600 tracking-widest uppercase">{group}</span>
							<div className="flex flex-wrap gap-1.5">
								{tests.map((test) => {
									const key = `${group}:${test.label}`;
									const isActive = activeQuick === key;
									return (
										<button
											key={test.label}
											onClick={() => handleQuickTest(test, group)}
											disabled={loading}
											title={test.description}
											className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${isActive
													? "border-zinc-500 bg-zinc-800 text-zinc-100"
													: "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
												}`}
										>
											<span className={`font-bold text-[10px] ${METHOD_BADGE[test.method]}`}>
												{test.method}
											</span>
											<span className="text-zinc-500">{test.label.replace(`${test.method} `, "")}</span>
										</button>
									);
								})}
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="border-t border-zinc-800/60" />

			{/* Method + Route */}
			<div className="flex flex-col gap-3">
				<div className="flex gap-2">
					{METHODS.map((m) => (
						<button
							key={m}
							onClick={() => setMethod(m)}
							className={`px-3 py-1 text-xs font-bold tracking-wider border rounded transition-all cursor-pointer ${method === m ? METHOD_ACTIVE[m] : METHOD_COLORS[m]
								}`}
						>
							{m}
						</button>
					))}
				</div>

				<div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden focus-within:border-zinc-600 transition-colors">
					<span className="px-3 text-zinc-600 text-sm select-none whitespace-nowrap">
						{RequestHandler.baseURL}/{RequestHandler.apiLink}/
					</span>
					<input
						type="text"
						value={route}
						onChange={(e) => setRoute(e.target.value)}
						placeholder="your/route"
						className="flex-1 bg-transparent py-3 pr-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-700"
					/>
					<button
						onClick={() => handleSend()}
						disabled={loading}
						className={`px-5 py-3 text-xs font-bold tracking-widest transition-all ${loading ? "text-zinc-600 cursor-not-allowed" : "text-zinc-900 bg-zinc-100 hover:bg-white cursor-pointer"
							}`}
					>
						{loading ? "..." : "SEND"}
					</button>
				</div>
			</div>

			{/* Body + Headers */}
			<div className="grid grid-cols-2 gap-4">
				<div className="flex flex-col gap-1.5">
					<label className="text-xs text-zinc-500 tracking-wider uppercase flex items-center gap-2">
						Body
						{isBodyless && (
							<span className="text-zinc-700 normal-case tracking-normal">— not used for {method}</span>
						)}
					</label>
					<textarea
						value={body}
						onChange={(e) => {
							setBody(e.target.value);
							setBodyError(null);
						}}
						disabled={isBodyless}
						rows={8}
						placeholder={'{\n  "key": "value"\n}'}
						className={`w-full bg-zinc-900 border rounded-lg p-3 text-sm resize-none outline-none transition-colors placeholder:text-zinc-800 ${isBodyless
								? "border-zinc-900 text-zinc-700 cursor-not-allowed"
								: bodyError
									? "border-rose-500/60 text-zinc-100 focus:border-rose-400"
									: "border-zinc-800 text-zinc-100 focus:border-zinc-600"
							}`}
					/>
					{bodyError && <span className="text-xs text-rose-400">{bodyError}</span>}
				</div>

				<div className="flex flex-col gap-1.5">
					<label className="text-xs text-zinc-500 tracking-wider uppercase">
						Headers <span className="text-zinc-700 normal-case tracking-normal">— optional</span>
					</label>
					<textarea
						value={headers}
						onChange={(e) => {
							setHeaders(e.target.value);
							setHeaderError(null);
						}}
						rows={8}
						placeholder={'{\n  "X-Custom-Header": "value"\n}'}
						className={`w-full bg-zinc-900 border rounded-lg p-3 text-sm resize-none outline-none transition-colors placeholder:text-zinc-800 ${headerError
								? "border-rose-500/60 text-zinc-100 focus:border-rose-400"
								: "border-zinc-800 text-zinc-100 focus:border-zinc-600"
							}`}
					/>
					{headerError && <span className="text-xs text-rose-400">{headerError}</span>}
				</div>
			</div>

			{/* Hint */}
			<p className="text-xs text-zinc-700">
				Tip: <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-zinc-500">Ctrl+Enter</kbd> to send
			</p>

			{/* Response */}
			{response && (
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-3">
						<div
							className={`w-1.5 h-1.5 rounded-full ${response.status === "success" ? "bg-emerald-400" : "bg-rose-400"
								}`}
						/>
						<span className="text-xs text-zinc-500 tracking-wider uppercase">Response</span>
						<span
							className={`text-xs font-bold ${response.status === "success" ? "text-emerald-400" : "text-rose-400"
								}`}
						>
							{response.status.toUpperCase()}
						</span>
						<span className="text-xs text-zinc-600 ml-auto">
							{response.duration}ms — {response.url}
						</span>
					</div>
					<pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-300 overflow-auto max-h-80 leading-relaxed">
						{formatted}
					</pre>
				</div>
			)}
		</div>
	);
}