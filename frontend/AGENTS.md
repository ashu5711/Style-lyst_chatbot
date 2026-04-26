# Style-alyst Chatbot: Frontend Architecture & Code Structure

## Overview
This directory contains the React 18 frontend for the **Style-alyst Chatbot** project, built to run seamlessly over a mock JCPenney Product Detail Page (PDP). 

## Technical Stack
- **Framework**: React 18 (e.g., using Vite, client-rendered as per MVP constraints).
- **Styling**: Vanilla CSS or Tailwind CSS, featuring heavy use of Glassmorphism (`backdrop-filter: blur()`).
- **Animations**: Framer Motion for spring-based fluid micro-interactions (chat toggling, smooth carousels).
- **State Management**: React Context or local component state (no persistence for MVP).

## Directory Structure (Intended)
- `components/`
  - `Chatbot/` - Contains the floating widget, chat window overlay, message lists, and input areas.
  - `ProductCarousel/` - Horizontal scrollable carousel to display "Complete the Look" recommendations.
  - `SkeletonLoaders/` - Loading states replicating the shapes of carousels and chat bubbles.
  - `MockPDP/` - Components that simulate the JCPenney PDP layout (background).
- `pages/` (or `app/`)
  - `services/` - Modules or a lightweight mock server handling the backend endpoints and LLM integration.
  - `index.js` - The main mock PDP page that mounts the Chatbot widget.
- `styles/`
  - `globals.css` - Global resets, fonts (modern sans-serif), and main color variables.
- `public/`
  - Static assets like dummy product images and icons.

## Agent Responsibilities
- **AI Connectivity**: The `api/` routes handle integration with Vision-LLMs to process uploaded images and return Structured JSON outputs.
- **Frontend Widget**: Parses the Structured Outputs to render natural language and rich media product carousels simultaneously.

## Design Philosophy
- **Keep It Simple**: Avoid over-engineering.
- **Visual Excellence**: The chatbot should feel like a high-end, premium experience.
- **No Persistence**: The MVP relies on ephemeral session state.
