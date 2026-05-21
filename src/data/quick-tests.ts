export type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type QuickTest = {
	label: string;
	method: Method;
	route: string;
	body?: string;
	description: string;
};

export type QuickTestGroup = {
	group: string;
	tests: QuickTest[];
};

export const METHODS: Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

export const METHOD_COLORS: Record<Method, string> = {
	GET: "text-emerald-400 border-emerald-400/40 bg-emerald-400/10",
	POST: "text-sky-400 border-sky-400/40 bg-sky-400/10",
	PUT: "text-amber-400 border-amber-400/40 bg-amber-400/10",
	PATCH: "text-violet-400 border-violet-400/40 bg-violet-400/10",
	DELETE: "text-rose-400 border-rose-400/40 bg-rose-400/10",
};

export const METHOD_ACTIVE: Record<Method, string> = {
	GET: "text-emerald-950 bg-emerald-400 border-emerald-400",
	POST: "text-sky-950 bg-sky-400 border-sky-400",
	PUT: "text-amber-950 bg-amber-400 border-amber-400",
	PATCH: "text-violet-950 bg-violet-400 border-violet-400",
	DELETE: "text-rose-950 bg-rose-400 border-rose-400",
};

export const METHOD_BADGE: Record<Method, string> = {
	GET: "text-emerald-400 bg-emerald-400/10",
	POST: "text-sky-400 bg-sky-400/10",
	PUT: "text-amber-400 bg-amber-400/10",
	PATCH: "text-violet-400 bg-violet-400/10",
	DELETE: "text-rose-400 bg-rose-400/10",
};

export const QUICK_TESTS: QuickTestGroup[] = [
	{
		group: "Basic",
		tests: [
			{ label: "GET /", method: "GET", route: "test", description: "Get test (with auth)" },
			{ label: "GET /:number", method: "GET", route: "test/42", description: "Get test with number param" },
			{
				label: "POST /",
				method: "POST",
				route: "test",
				body: '{\n  "hello": "world"\n}',
				description: "Post test body",
			},
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
				body: '{\n  "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8cBmaB6Tq0EktMnOSvEMeHMI2rG6DNwSiNQ&s",\n  "folder": "test"\n}',
				description: "Upload via URL",
			},
			{
				label: "DELETE /upload/:folder/:id",
				method: "DELETE",
				route: "test/upload/test/f6dd5420-4ea5-4e51-95bf-cabccd7dcc9f.png",
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
				body: '{\n  "name": "my-job",\n  "queue": "default",\n  "data": { "task": "hello" }\n}',
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