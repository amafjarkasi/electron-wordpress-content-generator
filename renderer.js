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
    const preferences = await window.electronAPI.dbGet('settings.preferences') || {
        theme: 'light',
        autoSave: false,
        refreshInterval: 30,
        openaiKey: ''
    };
    
    document.getElementById('theme-select').value = preferences.theme;
    document.getElementById('auto-save').checked = preferences.autoSave;
    document.getElementById('refresh-interval').value = preferences.refreshInterval;
    document.getElementById('openai-key').value = preferences.openaiKey || '';
    
    applyTheme(preferences.theme);
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
    const currentPrefs = await window.electronAPI.dbGet('settings.preferences') || {};
    currentPrefs[key] = value;
    await window.electronAPI.dbSet('settings.preferences', currentPrefs);
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
    const statusElement = document.getElementById('connection-status');
    statusElement.className = 'connection-status';
    statusElement.style.display = 'block';
    statusElement.textContent = 'Testing connection...';

    try {
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
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showConnectionStatus(`Connection failed: ${error.message}`, 'error');
    }
}

function showConnectionStatus(message, type) {
    const statusElement = document.getElementById('connection-status');
    statusElement.textContent = message;
    statusElement.className = `connection-status ${type}`;
    statusElement.style.display = 'block';
}

// Toggle password visibility
document.querySelector('.toggle-password').addEventListener('click', function() {
    const passwordInput = document.getElementById('wp-app-password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.querySelector('.eye-icon').textContent = type === 'password' ? '👁️' : '🔒';
});

// Save settings button
document.getElementById('save-wp-settings').addEventListener('click', saveWordPressSettings);

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
                statusElement.innerHTML = `
                    <div style="margin-bottom: 1px;">Successfully connected to WordPress site:</div>
                    <div class="connection-details">
                        <div class="detail-item">
                            <span class="detail-label">URL:</span>
                            <span class="detail-value">${result.url}</span>
                        </div>
                    </div>
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

// Content Generation
document.getElementById('generate-button')?.addEventListener('click', async () => {
    const topic = document.getElementById('content-topic').value;
    const contentType = document.getElementById('content-type').value;
    const tone = document.getElementById('content-tone').value;
    const generatedTextArea = document.getElementById('generated-text');

    if (!topic) {
        showNotification('Please enter a topic or keywords', 'error');
        return;
    }

    try {
        generatedTextArea.value = 'Generating content...';
        const response = await window.api.generateContent({ topic, contentType, tone });
        generatedTextArea.value = response;
        showNotification('Content generated successfully!', 'success');
    } catch (error) {
        generatedTextArea.value = '';
        showNotification('Failed to generate content: ' + error.message, 'error');
    }
});

document.getElementById('copy-content')?.addEventListener('click', () => {
    const generatedText = document.getElementById('generated-text');
    generatedText.select();
    document.execCommand('copy');
    showNotification('Content copied to clipboard!', 'success');
});

document.getElementById('publish-content')?.addEventListener('click', async () => {
    const generatedText = document.getElementById('generated-text').value;
    
    if (!generatedText) {
        showNotification('No content to publish', 'error');
        return;
    }

    try {
        await window.api.publishToWordPress({
            title: document.getElementById('content-topic').value,
            content: generatedText
        });
        showNotification('Content published to WordPress successfully!', 'success');
    } catch (error) {
        showNotification('Failed to publish: ' + error.message, 'error');
    }
});

// Keyword Research
document.getElementById('find-keywords')?.addEventListener('click', async () => {
    const seedKeyword = document.getElementById('seed-keyword').value;
    const language = document.getElementById('keyword-language').value;

    if (!seedKeyword) {
        showNotification('Please enter a seed keyword', 'error');
        return;
    }

    try {
        const keywords = await window.api.findKeywords({ seedKeyword, language });
        displayKeywordResults(keywords);
        showNotification('Keywords found successfully!', 'success');
    } catch (error) {
        showNotification('Failed to find keywords: ' + error.message, 'error');
    }
});

function displayKeywordResults(keywords) {
    const tbody = document.querySelector('#keywords-table tbody');
    tbody.innerHTML = '';

    keywords.forEach(keyword => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <input type="checkbox" class="keyword-select" value="${keyword.keyword}">
                ${keyword.keyword}
            </td>
            <td>${keyword.searchVolume}</td>
            <td>
                <span class="keyword-badge difficulty-${keyword.difficulty.toLowerCase()}">
                    ${keyword.difficulty}
                </span>
            </td>
            <td>$${keyword.cpc.toFixed(2)}</td>
            <td>
                <button class="btn small" onclick="useKeyword('${keyword.keyword}')">Use</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('export-keywords')?.addEventListener('click', () => {
    const table = document.getElementById('keywords-table');
    const rows = Array.from(table.querySelectorAll('tbody tr'));
    const csvContent = [
        ['Keyword', 'Search Volume', 'Difficulty', 'CPC'],
        ...rows.map(row => {
            const cells = Array.from(row.cells);
            return [
                cells[0].textContent.trim(),
                cells[1].textContent,
                cells[2].textContent.trim(),
                cells[3].textContent
            ];
        })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keywords.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    showNotification('Keywords exported to CSV', 'success');
});

document.getElementById('save-keywords')?.addEventListener('click', async () => {
    const selectedKeywords = Array.from(document.querySelectorAll('.keyword-select:checked'))
        .map(checkbox => {
            const row = checkbox.closest('tr');
            return {
                keyword: checkbox.value,
                searchVolume: row.cells[1].textContent,
                difficulty: row.cells[2].textContent.trim(),
                cpc: row.cells[3].textContent,
                addedDate: new Date().toISOString()
            };
        });

    if (selectedKeywords.length === 0) {
        showNotification('Please select keywords to save', 'error');
        return;
    }

    try {
        await window.api.saveKeywords(selectedKeywords);
        updateSavedKeywords();
        showNotification('Keywords saved successfully!', 'success');
    } catch (error) {
        showNotification('Failed to save keywords: ' + error.message, 'error');
    }
});

async function updateSavedKeywords() {
    try {
        const savedKeywords = await window.api.getSavedKeywords();
        const tbody = document.querySelector('#saved-keywords-table tbody');
        tbody.innerHTML = '';

        savedKeywords.forEach(keyword => {
            const tr = document.createElement('tr');
            const date = new Date(keyword.addedDate).toLocaleDateString();
            tr.innerHTML = `
                <td>${keyword.keyword}</td>
                <td>${keyword.searchVolume}</td>
                <td>${date}</td>
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
        await window.api.deleteSavedKeyword(keyword);
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

// Load preferences, WordPress settings, and saved keywords when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadPreferences();
        await loadWordPressSettings();
        const wpResult = await initializeWordPress();
        await updateSavedKeywords();
    } catch (error) {
        showNotification('Error during initialization: ' + error.message, 'error');
    }
});
