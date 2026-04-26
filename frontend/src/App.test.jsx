import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App Component', () => {
  it('renders the Mock PDP component', () => {
    render(<App />)
    expect(screen.getByText(/a.n.a Womens Crew Neck Sleeveless Vest/i)).toBeInTheDocument()
  })
})
