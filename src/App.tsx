import { Routes, Route } from "react-router-dom";
import Dashboard from "./routes/dashboard";

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<Dashboard />} />
		</Routes>
	);
}
