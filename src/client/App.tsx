import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/Home'
import DailyPicture from './pages/DailyPicture'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/daily-picture" element={<DailyPicture />} />
    </Routes>
  )
}

export default App
