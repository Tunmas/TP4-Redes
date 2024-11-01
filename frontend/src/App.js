import logo from './logo.svg';
import Navbar from './Components/Nambar.js';
import UploadComponent from './Components/UploadComponent.js';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />      
      <main>
        <UploadComponent />
      </main>
    </div>
  );
}

export default App;
