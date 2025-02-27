"use client";

import React, { useEffect, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadingSpinner } from "./components/common/LoadingSpinner";

const Header = React.lazy(() => import("./components/layout/Header"));
const Sidebar = React.lazy(() => import("./components/layout/Sidebar"));
const DashboardView = React.lazy(() =>
  import("./components/views/DashboardView")
);
const ProjectsView = React.lazy(() =>
  import("./components/views/ProjectsView")
);
const SymbolsView = React.lazy(() => import("./components/views/SymbolsView"));
const UnrecognizedView = React.lazy(() =>
  import("./components/views/UnrecognizedView")
);
const ResultsView = React.lazy(() => import("./components/views/ResultsView"));
const ProjectManagement = React.lazy(() =>
  import("./components/views/ProjectManagement")
);

const App = () => {
  const [selectedProject, setSelectedProject] = useState(".. Project ..");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>}>
      <BrowserRouter>
        <div className="flex h-screen">
          <Sidebar selectedProject={selectedProject} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto bg-gray-50">
              <Routes>
                <Route path="/" element={<DashboardView />} />
                <Route path="/projects" element={<ProjectsView setSelectedProject={setSelectedProject} />} />
                <Route path="/symbols" element={<SymbolsView />} />
                <Route path="/results/:projectId" element={<ResultsView />} />
                <Route path="/unrecognized/:drawingId/:runId" element={<UnrecognizedView />} />
                <Route path="/projectmanage/:projectId" element={<ProjectManagement />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </Suspense>
  );
};

export default App;
