import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Login from "@/pages/Login";
import ChildSelect from "@/pages/ChildSelect";
import KidHome from "@/pages/KidHome";
import LetterDrill from "@/pages/LetterDrill";
import WordLearn from "@/pages/WordLearn";
import MemoryGame from "@/pages/MemoryGame";
import Coloring from "@/pages/Coloring";
import Arcade from "@/pages/Arcade";
import FindTheKey from "@/pages/FindTheKey";
import SaveRoyal from "@/pages/SaveRoyal";
import ParentPortal from "@/pages/ParentPortal";
import VoiceStudio from "@/pages/VoiceStudio";
import StoryTime from "@/pages/StoryTime";
import MathQuest from "@/pages/MathQuest";
import ScienceQuest from "@/pages/ScienceQuest";

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="text-6xl animate-float-slow">📚</div>
    </div>
  );
}

function Protected({ children, needChild }) {
  const { user, child } = useAuth();
  if (user === null) return <Loader />;
  if (!user) return <Navigate to="/" replace />;
  if (needChild && !child) return <Navigate to="/children" replace />;
  return children;
}

function Public() {
  const { user } = useAuth();
  if (user === null) return <Loader />;
  if (user) return <Navigate to="/children" replace />;
  return <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Public />} />
          <Route path="/children" element={<Protected><ChildSelect /></Protected>} />
          <Route path="/parent" element={<Protected><ParentPortal /></Protected>} />
          <Route path="/voice" element={<Protected><VoiceStudio /></Protected>} />
          <Route path="/play" element={<Protected needChild><KidHome /></Protected>} />
          <Route path="/stories" element={<Protected needChild><StoryTime /></Protected>} />
          <Route path="/math" element={<Protected needChild><MathQuest /></Protected>} />
          <Route path="/science" element={<Protected needChild><ScienceQuest /></Protected>} />
          <Route path="/letters" element={<Protected needChild><LetterDrill /></Protected>} />
          <Route path="/words" element={<Protected needChild><WordLearn /></Protected>} />
          <Route path="/memory" element={<Protected needChild><MemoryGame /></Protected>} />
          <Route path="/coloring" element={<Protected needChild><Coloring /></Protected>} />
          <Route path="/arcade" element={<Protected needChild><Arcade /></Protected>} />
          <Route path="/game/key" element={<Protected needChild><FindTheKey /></Protected>} />
          <Route path="/game/royal" element={<Protected needChild><SaveRoyal /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}
