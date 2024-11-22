// Window controls
document.getElementById('minimize').addEventListener('click', () => {
    window.electronAPI.minimizeWindow();
});

document.getElementById('close').addEventListener('click', () => {
    window.electronAPI.closeWindow();
});

// Content switching
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Update active nav link
        document.querySelector('nav a.active').classList.remove('active');
        e.target.classList.add('active');
        
        // Update content section
        const sectionId = e.target.getAttribute('data-section');
        document.querySelector('.content-section.active').classList.remove('active');
        document.getElementById(`${sectionId}-section`).classList.add('active');
    });
});

// User Preferences
async function loadPreferences() {
    logger.info('Loading user preferences...');
    try {
        const preferences = await window.electronAPI.dbGet('settings.preferences') || {
            theme: 'light',
            autoSave: false,
            refreshInterval: 30,
            openaiKey: ''
        };
        
        document.getElementById('theme-select').value = preferences.theme;
        document.getElementById('auto-save').checked = preferences.autoSave;
        document.getElementById('refresh-interval').value = preferences.refreshInterval || 30; // Set default value if not found
        document.getElementById('openai-key').value = preferences.openaiKey || '';
        
        applyTheme(preferences.theme);
        logger.success('User preferences loaded successfully');
    } catch (error) {
        logger.error(`Failed to load preferences: ${error.message}`);
    }
}

function applyTheme(theme) {
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
}

// Save preferences when changed
document.getElementById('theme-select').addEventListener('change', async (e) => {
    const theme = e.target.value;
    await savePreference('theme', theme);
    applyTheme(theme);
});

document.getElementById('auto-save').addEventListener('change', async (e) => {
    await savePreference('autoSave', e.target.checked);
});

document.getElementById('refresh-interval').addEventListener('change', async (e) => {
    const value = parseInt(e.target.value);
    if (value >= 5 && value <= 300) {
        await savePreference('refreshInterval', value);
    }
});

document.getElementById('openai-key').addEventListener('change', async (e) => {
    await savePreference('openaiKey', e.target.value.trim());
});

async function savePreference(key, value) {
    logger.info(`Saving preference: ${key}`);
    try {
        const currentPrefs = await window.electronAPI.dbGet('settings.preferences') || {};
        currentPrefs[key] = value;
        await window.electronAPI.dbSet('settings.preferences', currentPrefs);
        logger.success(`Preference ${key} saved successfully`);
    } catch (error) {
        logger.error(`Failed to save preference ${key}: ${error.message}`);
    }
}

// WordPress Settings
async function loadWordPressSettings() {
    const settings = await window.electronAPI.dbGet('settings.wordpress') || {};
    document.getElementById('wp-site-url').value = settings.siteUrl || '';
    document.getElementById('wp-username').value = settings.username || '';
    document.getElementById('wp-app-password').value = settings.appPassword || '';
}

async function saveWordPressSettings() {
    const settings = {
        siteUrl: document.getElementById('wp-site-url').value.trim(),
        username: document.getElementById('wp-username').value.trim(),
        appPassword: document.getElementById('wp-app-password').value.trim()
    };

    await window.electronAPI.dbSet('settings.wordpress', settings);
    showConnectionStatus('Settings saved successfully!', 'success');
}

async function testConnection() {
    logger.info('Testing WordPress connection...');
    try {
        const statusElement = document.getElementById('connection-status');
        statusElement.className = 'connection-status';
        statusElement.style.display = 'block';
        statusElement.style.margin = '20px auto 0';
        statusElement.style.textAlign = 'center';
        statusElement.textContent = 'Testing connection...';

        const settings = {
            siteUrl: document.getElementById('wp-site-url').value.trim(),
            username: document.getElementById('wp-username').value.trim(),
            appPassword: document.getElementById('wp-app-password').value.trim()
        };

        // Test connection using IPC
        const result = await window.electronAPI.testWordPressConnection(settings);
        
        if (result.success) {
            showConnectionStatus('Successfully connected to WordPress site:\nURL: ' + settings.siteUrl, 'success');
            // Save settings if connection is successful
            await saveWordPressSettings();
            logger.success('WordPress connection test completed');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        logger.error(`WordPress connection test failed: ${error.message}`);
        showConnectionStatus(`Connection failed: ${error.message}`, 'error');
    }
}

function showConnectionStatus(message, type) {
    const statusElement = document.getElementById('connection-status');
    statusElement.textContent = message;
    statusElement.className = `connection-status ${type}`;
    statusElement.style.display = 'block';
    statusElement.style.margin = '20px auto 0';
    statusElement.style.textAlign = 'center';
}

// Toggle password visibility
document.querySelector('.toggle-password').addEventListener('click', function() {
    const passwordInput = document.getElementById('wp-app-password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.querySelector('.eye-icon').textContent = type === 'password' ? '👁️' : '🔒';
});

// Save settings button
document.getElementById('save-wp-settings')?.addEventListener('click', saveWordPressSettings);

// Test connection button
document.getElementById('test-connection').addEventListener('click', testConnection);

// WordPress initialization
async function initializeWordPress() {
    try {
        const result = await window.electronAPI.initializeWordPress();
        if (result.success) {
            // Update connection status if we're on the settings page
            const statusElement = document.getElementById('connection-status');
            if (statusElement) {
                statusElement.className = 'connection-status success';
                statusElement.style.display = 'block';
                statusElement.style.margin = '20px auto 0';
                statusElement.style.textAlign = 'center';
                statusElement.innerHTML = `
                    <div style="margin-bottom: 1px;">Successfully connected to WordPress site</div>
                `;
            }
        } else {
            throw new Error(result.error);
        }
        return result;
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Content Generation with logging
document.getElementById('generate-button')?.addEventListener('click', async () => {
    const topic = document.getElementById('content-topic').value;
    const contentType = document.getElementById('content-type').value;
    const tone = document.getElementById('content-tone').value;
    
    logger.info(`Generating ${contentType} content for topic: ${topic}`);
    
    try {
        const generatedContent = await window.electronAPI.generateContent({
            topic,
            contentType,
            tone
        });
        
        document.getElementById('generated-text').value = generatedContent;
        logger.success('Content generated successfully');
    } catch (error) {
        logger.error(`Failed to generate content: ${error.message}`);
        document.getElementById('generated-text').value = `Error: ${error.message}`;
    }
});

// Copy content with logging
document.getElementById('copy-content')?.addEventListener('click', () => {
    const content = document.getElementById('generated-text').value;
    if (content) {
        navigator.clipboard.writeText(content)
            .then(() => {
                logger.success('Content copied to clipboard');
            })
            .catch(error => {
                logger.error(`Failed to copy content: ${error.message}`);
            });
    }
});

// Publish content with logging
document.getElementById('publish-content')?.addEventListener('click', async () => {
    const content = document.getElementById('generated-text').value;
    if (!content) {
        logger.warning('No content to publish');
        return;
    }
    
    logger.info('Publishing content to WordPress...');
    try {
        const result = await window.electronAPI.publishToWordPress({
            title: document.getElementById('content-topic').value,
            content: content
        });
        if (result.success) {
            logger.success(`Content published successfully. Post ID: ${result.postId}`);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        logger.error(`Failed to publish content: ${error.message}`);
    }
});

// Keyword Research with logging
document.getElementById('find-keywords')?.addEventListener('click', async () => {
    const topic = document.getElementById('keyword-topic').value;
    if (!topic) {
        logger.warning('No topic provided for keyword research');
        return;
    }
    
    logger.info(`Starting keyword research for topic: ${topic}`);
    try {
        const keywords = await window.electronAPI.findKeywords(topic);
        displayKeywordResults(keywords);
        logger.success(`Found ${keywords.length} keywords for topic: ${topic}`);
    } catch (error) {
        logger.error(`Keyword research failed: ${error.message}`);
    }
});

function displayKeywordResults(keywords) {
    const tbody = document.querySelector('#keywords-table tbody');
    tbody.innerHTML = '';

    keywords.forEach(keyword => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <input type="checkbox" class="keyword-select">
                ${keyword.keyword}
            </td>
            <td>${keyword.searchVolume}</td>
            <td>${keyword.difficulty}</td>
            <td>${keyword.cpc}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Save keywords with logging
document.getElementById('save-keywords')?.addEventListener('click', async () => {
    const selectedKeywords = Array.from(document.querySelectorAll('#keywords-table tbody tr input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.closest('tr').dataset.keyword);
    
    if (selectedKeywords.length === 0) {
        logger.warning('No keywords selected to save');
        return;
    }
    
    logger.info(`Saving ${selectedKeywords.length} keywords`);
    try {
        await window.electronAPI.saveKeywords(selectedKeywords);
        logger.success('Keywords saved successfully');
        await updateSavedKeywords();
    } catch (error) {
        logger.error(`Failed to save keywords: ${error.message}`);
    }
});

// Export keywords with logging
document.getElementById('export-keywords')?.addEventListener('click', () => {
    const table = document.getElementById('keywords-table');
    if (!table) {
        logger.warning('No keywords available to export');
        return;
    }
    
    logger.info('Exporting keywords to CSV');
    try {
        const rows = Array.from(table.querySelectorAll('tbody tr'));
        const csvContent = [
            ['Keyword', 'Search Volume', 'Competition', 'Difficulty'],
            ...rows.map(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                return [
                    cells[1].textContent,
                    cells[2].textContent,
                    cells[3].textContent,
                    cells[4].textContent
                ];
            })
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `keywords-${new Date().toISOString()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        logger.success('Keywords exported successfully');
    } catch (error) {
        logger.error(`Failed to export keywords: ${error.message}`);
    }
});

async function updateSavedKeywords() {
    try {
        const savedKeywords = await window.electronAPI.getSavedKeywords();
        const tbody = document.querySelector('#saved-keywords-table tbody');
        tbody.innerHTML = '';

        savedKeywords.forEach(keyword => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${keyword.keyword}</td>
                <td>${keyword.searchVolume}</td>
                <td>${keyword.difficulty}</td>
                <td>${keyword.cpc}</td>
                <td>
                    <button class="btn small" onclick="useKeyword('${keyword.keyword}')">Use</button>
                    <button class="btn small danger" onclick="deleteKeyword('${keyword.keyword}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        showNotification('Failed to load saved keywords: ' + error.message, 'error');
    }
}

async function deleteKeyword(keyword) {
    try {
        await window.electronAPI.deleteSavedKeyword(keyword);
        updateSavedKeywords();
        showNotification('Keyword deleted successfully!', 'success');
    } catch (error) {
        showNotification('Failed to delete keyword: ' + error.message, 'error');
    }
}

function useKeyword(keyword) {
    document.getElementById('content-topic').value = keyword;
    document.querySelector('[data-section="generate"]').click();
    showNotification('Keyword added to content generator', 'success');
}

// Handle WordPress dashboard stats
window.electronAPI.onDashboardStats((_event, stats) => {
    // Update site information
    document.getElementById('site-name').textContent = stats.site.name;
    document.getElementById('site-description').textContent = stats.site.description;
    document.getElementById('site-url').textContent = stats.site.url;
    
    // Update content counts
    document.getElementById('post-count').textContent = stats.content.posts;
    document.getElementById('page-count').textContent = stats.content.pages;
    document.getElementById('category-count').textContent = stats.content.categories;
});

// Logging functionality
const logger = {
    textarea: document.getElementById('log-output'),
    
    formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    },
    
    info(message) {
        const formattedMessage = this.formatMessage('info', message);
        this.appendLog(formattedMessage);
    },
    
    success(message) {
        const formattedMessage = this.formatMessage('success', message);
        this.appendLog(formattedMessage);
    },
    
    warning(message) {
        const formattedMessage = this.formatMessage('warning', message);
        this.appendLog(formattedMessage);
    },
    
    error(message) {
        const formattedMessage = this.formatMessage('error', message);
        this.appendLog(formattedMessage);
    },
    
    appendLog(message) {
        if (this.textarea) {
            this.textarea.value += message;
            this.textarea.scrollTop = this.textarea.scrollHeight;
        }
    },
    
    clear() {
        if (this.textarea) {
            this.textarea.value = '';
        }
    },
    
    export() {
        const content = this.textarea.value;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `app-logs-${new Date().toISOString()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

// Logging controls event listeners
document.getElementById('clear-logs')?.addEventListener('click', () => {
    logger.clear();
    logger.info('Logs cleared');
});

document.getElementById('export-logs')?.addEventListener('click', () => {
    logger.export();
    logger.info('Logs exported');
});

document.getElementById('refresh-logs')?.addEventListener('click', () => {
    logger.info('Logs refreshed');
});

// Load preferences, WordPress settings, and saved keywords when the page loads
document.addEventListener('DOMContentLoaded', loadPreferences);

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadWordPressSettings();
        const wpResult = await initializeWordPress();
        await updateSavedKeywords();
    } catch (error) {
        showNotification('Error during initialization: ' + error.message, 'error');
    }
});
