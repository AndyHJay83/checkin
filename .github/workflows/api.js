// This is a serverless function that will handle GitHub API requests
export default async function handler(req, res) {
    const { method, body } = req;
    const REPO_OWNER = 'andyjay83';
    const REPO_NAME = 'checkin';
    const DATA_FILE = 'events.json';

    const token = process.env.CHECKIN_TOKEN;
    if (!token) {
        res.status(500).json({ error: 'GitHub token not configured' });
        return;
    }

    try {
        switch (method) {
            case 'GET':
                const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE}`, {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (response.status === 404) {
                    res.status(200).json([]);
                    return;
                }
                
                const data = await response.json();
                const content = atob(data.content);
                res.status(200).json(JSON.parse(content));
                break;

            case 'POST':
                let sha;
                try {
                    const getResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE}`, {
                        headers: {
                            'Authorization': `token ${token}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    });
                    if (getResponse.ok) {
                        const getData = await getResponse.json();
                        sha = getData.sha;
                    }
                } catch (error) {
                    console.log('File does not exist yet');
                }

                const putResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_FILE}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: 'Update events data',
                        content: btoa(JSON.stringify(body)),
                        sha: sha
                    })
                });

                if (!putResponse.ok) {
                    throw new Error('Failed to save events');
                }

                res.status(200).json({ success: true });
                break;

            default:
                res.setHeader('Allow', ['GET', 'POST']);
                res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message });
    }
} 