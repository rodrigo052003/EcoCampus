import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import MaterialDetails from "./pages/MaterialDetails";
import AddMaterial from "./pages/AddMaterial";
import Profile from "./pages/Profile";
import MyMaterials from "./pages/MyMaterials";
import EditMaterial from "./pages/EditMaterial";
import Requests from "./pages/Requests";
import Notifications from "./pages/Notifications";
import History from "./pages/History";
import Reputation from "./pages/Reputation";
import About from "./pages/About";
import Help from "./pages/Help";
import Gamification from "./pages/Gamification";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/gamification" element={<Gamification />} />

        <Route path="/" element={<AuthPage />} />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/marketplace"
          element={<Marketplace />}
        />

        <Route
          path="/material/:id"
          element={<MaterialDetails />}
        />

        <Route
          path="/material/new"
          element={<AddMaterial />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/my-materials"
          element={<MyMaterials />}
        />

        <Route
         path="/material/edit/:id"
         element={<EditMaterial />}
        />

        <Route
         path="/requests"
         element={<Requests />}
        />

        <Route
          path="/notifications"
          element={<Notifications />}
        />

        <Route
          path="/history"
          element={<History />}
        />

        <Route
          path="/reputation"
          element={<Reputation />}
        />

        <Route
         path="/about"
         element={<About />}
        />

        <Route
          path="/help"
          element={<Help />}
        />


      </Routes>

    </BrowserRouter>
  );
}

export default App;