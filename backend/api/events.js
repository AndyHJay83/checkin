const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_FILE = path.join(__dirname, '../data/events.json');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'andyjay83';
const REPO_NAME = 'checkin';

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// Initialize events file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Function to make GitHub API request
function makeGitHubRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            path: path,
            method: method,
            headers: {
                'User-Agent': 'Node.js',
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        };

        if (data) {
            options.headers['Content-Type'] = 'application/json';
        }

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(responseData));
                } else {
                    reject(new Error(`GitHub API error: ${res.statusCode}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

module.exports = async (req, res) => {
    console.log(`Handling ${req.method} request to ${req.url}`);
    
    try {
        if (req.method === 'GET') {
            console.log('Fetching events...');
            const events = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            console.log(`Found ${events.length} events`);
            res.status(200).json(events);
        } else if (req.method === 'POST') {
            console.log('Saving events...');
            console.log('Request body:', req.body);
            
            if (!Array.isArray(req.body)) {
                throw new Error('Request body must be an array of events');
            }
            
            // Ensure each event has a guests array and required fields
            const events = req.body.map(event => ({
                id: event.id || Date.now().toString(),
                name: event.name || 'Unnamed Event',
                guests: event.guests || []
            }));
            
            // Save to local file
            fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2));
            
            // Save to GitHub
            try {
                // Get current file SHA if it exists
                let sha = null;
                try {
                    const fileData = await makeGitHubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/events.json`);
                    sha = fileData.sha;
                } catch (error) {
                    console.log('File does not exist yet');
                }

                // Create or update file
                await makeGitHubRequest(
                    `/repos/${REPO_OWNER}/${REPO_NAME}/contents/events.json`,
                    'PUT',
                    {
                        message: 'Update events data',
                        content: Buffer.from(JSON.stringify(events)).toString('base64'),
                        sha: sha
                    }
                );
            } catch (error) {
                console.error('Error saving to GitHub:', error);
                // Continue even if GitHub save fails - at least we have local data
            }
            
            console.log('Events saved successfully');
            res.status(200).json({ success: true });
        } else {
            console.log(`Method ${req.method} not allowed`);
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Error handling events:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message
        });
    }
}; 