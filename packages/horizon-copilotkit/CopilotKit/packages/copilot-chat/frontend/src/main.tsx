import React from 'react'
import { render } from 'react-dom'
import App from './App.tsx'
import './index.css'

let rootElement = document.getElementById('copilot-container')
if (!rootElement) {
  rootElement = document.createElement('div')
  rootElement.id = 'copilot-container'
  document.body.appendChild(rootElement)
}

render(<App />, rootElement)