# Electron WordPress Content Generator

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![Version](https://img.shields.io/badge/version-1.0-blue)

A modern desktop application built with Electron for generating and managing WordPress content at scale.

## 📚 Table of Contents
- [Features](#features)
- [Setup](#setup)
- [WordPress Setup](#wordpress-setup)
- [Configuration](#configuration)
- [Security](#security)

## ✨ Features

- **WordPress Integration**
  - Secure connection via REST API
  - Application password support
  - Real-time connection status

- **Content Generation**
  - AI-powered content creation
  - Customizable templates
  - Batch processing

- **Keyword Research**
  - Discover relevant keywords
  - Analyze difficulty
  - Save and manage lists

- **User Interface**
  - Dark/Light theme support
  - Modern and intuitive design
  - Native desktop experience

## 🚀 Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/electron-wp-mass.git
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the application:**
   ```bash
   npm start
   ```

## 🔧 WordPress Setup

1. **Enable the REST API** on your WordPress site.
2. **Create an application password:**
   - Navigate to Users → Profile in WordPress admin.
   - Find the "Application Passwords" section.
   - Generate a new password for this app.

## ⚙️ Configuration

1. Enter your WordPress site URL.
2. Add your username and application password.
3. Test the connection to ensure everything is set up correctly.

## 🔒 Security

- Credentials are stored securely.
- All data transmission is encrypted.
- The local database is excluded from version control.
