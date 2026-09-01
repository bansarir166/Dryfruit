import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="hero">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1>Hello World</h1>
            </div>
          </div>
        </div>
      </section>
  </>
  ) 
}

export default App
