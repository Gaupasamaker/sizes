import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { LanguageProvider } from './hooks/useLanguage';
import Profiles from './pages/Profiles';
import Brands from './pages/Brands';
import BrandDetail from './pages/BrandDetail';
import Settings from './pages/Settings';
import SizeGuide from './pages/SizeGuide';
import SharedProfile from './pages/SharedProfile';

export default function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Profiles />} />
            <Route path="/profile/:profileId" element={<Brands />} />
            <Route path="/brand/:brandId" element={<BrandDetail />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/size-guide" element={<SizeGuide />} />
            <Route path="/share/:data" element={<SharedProfile />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </LanguageProvider>
  );
}
