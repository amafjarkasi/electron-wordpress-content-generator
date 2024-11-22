# Electron WordPress Content Generator

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![Version](https://img.shields.io/badge/version-1.0-blue)

A modern desktop application built with Electron for generating and managing WordPress content at scale.

## 📚 Table of Contents
- [Features](#features)
- [Setup](#setup)
- [WordPress Setup](#wordpress-setup)
- [Configuration](#configuration)
- [Security](#security)
- [Logging](#logging)
- [Keyword Management](#keyword-management)
- [Debugging Features](#debugging-features)

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
  - Save and manage keyword lists
  - Quick keyword-to-content generation
  - Export keywords to CSV
  - Persistent keyword storage

- **User Interface**
  - Dark/Light theme support
  - Modern and intuitive design
  - Native desktop experience

- **Application Logging**
  - Real-time operation logging
  - Multiple log levels (info, success, warning, error)
  - Log export functionality
  - Clear and refresh capabilities

- **UI Enhancements**
    - Improved spacing and alignment for connection status messages.
    - Reduced spacing between elements in user preferences for a more compact layout.

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

## 📝 Logging

The application includes a comprehensive logging system to help track operations and troubleshoot issues:

### Log Levels
- **Info**: General operation information
- **Success**: Successful completion of operations
- **Warning**: Non-critical issues that require attention
- **Error**: Critical issues that need immediate attention

### Logging Features
- Real-time logging of all major operations
- Timestamp for each log entry
- Export logs to file for external analysis
- Clear logs functionality
- Automatic scrolling to latest logs

### Logged Operations
- WordPress connectivity
- Content generation and publishing
- Keyword research and management
  - Keyword saving
  - Keyword deletion
  - Keyword usage in content
- User preference changes
- File operations

### Accessing Logs
1. Navigate to the "Logging" section in the sidebar
2. View real-time logs in the logging textarea
3. Use the control buttons to:
   - Clear log history
   - Export logs to file

## 🔍 Keyword Management

The application provides comprehensive keyword management capabilities:

### Features
- Save important keywords for future use
- View all saved keywords in a dedicated table
- Delete keywords you no longer need
- Quick "Use" button to instantly start content generation with a saved keyword
- Export keyword lists to CSV format
- Automatic duplicate prevention when saving keywords

### Using Keywords
1. **Finding Keywords**
   - Use the keyword research tool to discover relevant keywords
   - Select keywords you want to save
   - Click "Save Selected" to store them

2. **Managing Saved Keywords**
   - View all saved keywords in the keyword management section
   - Use the "Delete" button to remove unwanted keywords
   - Click "Use" to instantly populate the content generator with a keyword

3. **Exporting Keywords**
   - Use the "Export" button to download your keyword list as a CSV file
   - CSV includes all relevant keyword data and metrics

4. **Content Generation**
   - Click "Use" on any saved keyword to automatically:
     - Switch to the content generation section
     - Populate the topic field with the selected keyword
     - Prepare for content generation

## 🔍 Debugging Features

### Console Logging
The application includes comprehensive console logging for WordPress site information:
- Basic site information (name, description, URL)
- Complete WordPress API response data
- Content statistics (posts, pages, categories)
- API namespaces
- Connection status and errors

To view the logs:
1. Open Developer Tools (Ctrl+Shift+I)
2. Navigate to the Console tab
3. Connect to your WordPress site or refresh the connection
