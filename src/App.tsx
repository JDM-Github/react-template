import { Routes, Route } from "react-router-dom";
import Dashboard from "./routes/dashboard";
import RequestHandler from "./lib/utilities/request_handler";

export default function App() {
	RequestHandler.init();
	return (
		<Routes>
			<Route path="/" element={<Dashboard />} />
		</Routes>
	);
}
