const crypto = require('crypto');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000';
let APP_ID = 0;
let APP_SECRET = '';
let JWT_TOKEN = '';

// Helper to make HTTP requests
function request(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : {};
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function generateSignature(appId, appSecret, body = {}, query = {}) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(16).toString('hex');

    // Sort query
    const sortedQuery = Object.keys(query).sort().map(key => `${key}=${query[key]}`).join('&');

    // Body string
    const bodyString = Object.keys(body).length ? JSON.stringify(body) : '';

    const dataToSign = `app_id=${appId}&nonce=${nonce}&timestamp=${timestamp}${sortedQuery ? '&' + sortedQuery : ''}${bodyString}`;

    const hmac = crypto.createHmac('sha256', appSecret);
    hmac.update(dataToSign);
    const signature = hmac.digest('hex');

    return {
        'x-app-id': appId.toString(),
        'x-timestamp': timestamp,
        'x-nonce': nonce,
        'x-signature': signature
    };
}

async function run() {
    try {
        console.log('1. Register/Login Admin...');
        // Try login
        let res = await request('POST', '/auth/login', { username: 'test_admin', password: 'password123' });

        // If 401/404/etc, try register
        if (res.status !== 201 && res.status !== 200) {
            console.log('Login failed (' + res.status + '), trying register...');
            await request('POST', '/users/register', { username: 'test_admin', password: 'password123' });
            res = await request('POST', '/auth/login', { username: 'test_admin', password: 'password123' });
        }

        // Extract token
        const token = (res.data.data && res.data.data.access_token) || res.data.access_token;

        if (!token) {
            console.error('Failed to get token:', res.data);
            process.exit(1);
        }
        JWT_TOKEN = token;
        console.log('Token acquired.');

        console.log('2. Create App...');
        const appName = `TestApp_${Date.now()}`;
        res = await request('POST', '/apps',
            { name: appName, app_secret: crypto.randomBytes(16).toString('hex'), version: '1.0.0' },
            { 'Authorization': `Bearer ${JWT_TOKEN}` }
        );

        // Extract App Data
        const appData = res.data.data || res.data;

        if (appData && (appData.id || res.status === 201)) {
            APP_ID = appData.id;
            APP_SECRET = appData.app_secret;
            console.log(`App ID: ${APP_ID}, Secret: ${APP_SECRET}`);
        } else {
            console.error('Failed to create app:', res.data);
            process.exit(1);
        }

        console.log('3. Test Signed Request (Heartbeat)...');
        const body = {
            hwid: 'test-hwid-123',
            app_id: APP_ID,
            app_version: '1.0.0'
        };
        const headers = generateSignature(APP_ID, APP_SECRET, body);
        res = await request('POST', '/devices/heartbeat', body, headers);

        if (res.status === 201 || res.status === 200) {
            console.log('✅ Heartbeat success:', res.data);
        } else {
            console.error('❌ Heartbeat failed:', res.status, res.data);
            process.exit(1);
        }

        console.log('4. Test Invalid Signature...');
        const badHeaders = { ...headers, 'x-signature': 'invalid' };
        res = await request('POST', '/devices/heartbeat', body, badHeaders);
        if (res.status === 401 || res.status === 403) {
            console.log('✅ Invalid signature rejected (' + res.status + ').');
        } else {
            console.error('❌ Failed to reject invalid signature (Status: ' + res.status + '):', res.data);
            process.exit(1);
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
