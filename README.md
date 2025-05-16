# Backend API Documentation

## Project Overview
This project is a backend service built using Node.js with an MVC (Model-View-Controller) architecture. It provides API endpoints for various functionalities and integrates with external services like Ollma and Gemini.

## Table of Contents
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Installation](#installation)
- [API Endpoints](#api-endpoints)
- [Services](#services)
- [Testing](#testing)
- [Configuration](#configuration)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

## Project Structure
src/
├── controllers/ # Handles request logic
├── models/ # Data models (schemas)
├── routes/ # API endpoint definitions
├── services/ # External/internal service integrations (Ollama, Gemini, etc.)
├── index.js # Application entry point
tests/
├── rest/ # REST API test scripts


---

## ⚙️ Architecture Overview

This project follows the **MVC pattern**:

- **Models:** Define the structure of data and communicate with the database.
- **Controllers:** Handle the core logic for each endpoint.
- **Routes:** Define HTTP endpoints and connect them to controllers.
- **Services:** Manage communication with external APIs (AI models, etc.).
-

