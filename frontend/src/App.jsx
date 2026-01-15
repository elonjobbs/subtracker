import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  // In a real app, this would come from authentication
  const userId = 'user123';

  return (
    <div className="app">
      <Dashboard userId={userId} />
    </div>
  )
}

export default App
