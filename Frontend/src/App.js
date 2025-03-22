import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import ResumeAnalysis from "./pages/ResumeAnalysis";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home2 from "./pages/Home2";
import ResumeCreator from "./pages/ResumeCreator";
import ResumePreview from "./pages/ResumePreview";


function App() {
  return (
    <Router>
      <div className="tailwind-enabled">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<ResumeAnalyzer />} />
          <Route path="/resume-analysis" element={<ResumeAnalysis />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home2 />} />
          
        </Routes>
      </div>
      <Routes>
        <Route path="/resume" element={<ResumeCreator />} />
        <Route path="/preview" element={<ResumePreview />} />
      </Routes>
    </Router>
  );
}

export default App;
