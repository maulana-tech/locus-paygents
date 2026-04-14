import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { Simulation } from "./pages/Simulation";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/simulation" element={<Simulation />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
