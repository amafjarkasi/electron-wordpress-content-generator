const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')
const { initDb, getDb } = require('./db/config')
const axios = require('axios')

// WordPress API helper functions
async function initializeWordPressApi(settings, event) {
    try {
        if (!settings?.url || !settings?.username || !settings?.password) {
            throw new Error('WordPress settings are incomplete. Please check your settings.');
        }

        const apiUrl = settings.url.replace(/\/$/, '');
        const authString = Buffer.from(`${settings.username}:${settings.password}`).toString('base64');

        // Get the root response
        const response = await axios.get(`${apiUrl}`, {
            headers: {
                'Authorization': `Basic ${authString}`
            }
        });

        // Format the response data
        const wpData = {
            success: true,
            namespaces: response.data?.namespaces || [],
            name: response.data?.name || '-',
            description: response.data?.description || '-',
            url: response.data?.url || settings.url
        };

        // Get counts for posts, pages, and categories
        const [posts, pages, categories] = await Promise.all([
            axios.get(`${apiUrl}/wp-json/wp/v2/posts`, { headers: { 'Authorization': `Basic ${authString}` } }),
            axios.get(`${apiUrl}/wp-json/wp/v2/pages`, { headers: { 'Authorization': `Basic ${authString}` } }),
            axios.get(`${apiUrl}/wp-json/wp/v2/categories`, { headers: { 'Authorization': `Basic ${authString}` } })
        ]);

        // Send dashboard stats to renderer if event is provided
        if (event?.sender) {
            event.sender.send('wp:dashboard-stats', {
                site: {
                    name: wpData.name,
                    description: wpData.description,
                    url: wpData.url,
                    apiUrl: apiUrl
                },
                content: {
                    posts: posts.data?.length || 0,
                    pages: pages.data?.length || 0,
                    categories: categories.data?.length || 0
                }
            });
        }

        return { 
            success: true, 
            data: wpData,
            namespaces: wpData.namespaces,
            name: wpData.name,
            description: wpData.description,
            url: wpData.url,
            apiUrl: apiUrl
        };
    } catch (error) {
        return { 
            success: false, 
            error: error.response 
                ? `HTTP error! status: ${error.response.status}` 
                : error.message 
        };
    }
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 650,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        frame: false,
        resizable: false
    });

    mainWindow.loadFile('index.html');
}

ipcMain.on('minimize-window', () => {
    BrowserWindow.getFocusedWindow().minimize();
});

ipcMain.on('close-window', () => {
    BrowserWindow.getFocusedWindow().close();
});

// Database operations
ipcMain.handle('db:get', async (event, key) => {
    const db = getDb();
    await db.read();
    return key.split('.').reduce((obj, prop) => obj?.[prop], db.data);
});

ipcMain.handle('db:set', async (event, key, value) => {
    const db = getDb();
    await db.read();
    const keys = key.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, prop) => obj[prop] = obj[prop] || {}, db.data);
    target[lastKey] = value;
    await db.write();
    return value;
});

ipcMain.handle('db:push', async (event, key, value) => {
    const db = getDb();
    await db.read();
    const target = key.split('.').reduce((obj, prop) => obj[prop] = obj[prop] || [], db.data);
    if (Array.isArray(target)) {
        target.push(value);
        await db.write();
        return target;
    }
    throw new Error('Target is not an array');
});

// Keyword-related handlers
ipcMain.handle('get-saved-keywords', async () => {
    const db = getDb();
    await db.read();
    return db.data.keywords || [];
});

ipcMain.handle('save-keywords', async (event, keywords) => {
    const db = getDb();
    await db.read();
    if (!db.data.keywords) {
        db.data.keywords = [];
    }
    // Add only unique keywords
    keywords.forEach(keyword => {
        if (!db.data.keywords.includes(keyword)) {
            db.data.keywords.push(keyword);
        }
    });
    await db.write();
    return db.data.keywords;
});

ipcMain.handle('delete-saved-keyword', async (event, keyword) => {
    const db = getDb();
    await db.read();
    if (db.data.keywords) {
        db.data.keywords = db.data.keywords.filter(k => k !== keyword);
        await db.write();
    }
    return db.data.keywords || [];
});

// WordPress API handlers
ipcMain.handle('wp:testConnection', async (event, settings) => {
    try {
        // Basic validation
        if (!settings.siteUrl || !settings.username || !settings.appPassword) {
            throw new Error('Please fill in all fields');
        }

        // Ensure the URL ends with /wp-json/
        const apiUrl = settings.siteUrl.replace(/\/?$/, '/wp-json/');
        
        // Create authentication header
        const authString = Buffer.from(`${settings.username}:${settings.appPassword}`).toString('base64');
        
        // Test connection by fetching users endpoint
        const response = await axios.get(`${apiUrl}wp/v2/users/me`, {
            headers: {
                'Authorization': `Basic ${authString}`
            }
        });

        return { success: true, data: response.data };
    } catch (error) {
        const errorMessage = error.response 
            ? `HTTP error! status: ${error.response.status}` 
            : error.message;
        return { success: false, error: errorMessage };
    }
});

// Initialize WordPress API handler
ipcMain.handle('wp:initialize', async (event) => {
    const db = getDb();
    await db.read();
    const settings = db.data?.settings?.wordpress;
    
    // Map the old settings structure to the new one
    const mappedSettings = {
        url: settings?.siteUrl,
        username: settings?.username,
        password: settings?.appPassword
    };
    
    return await initializeWordPressApi(mappedSettings, event);
});

// Initialize database when app is ready
app.whenReady().then(async () => {
    await initDb();
    createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
