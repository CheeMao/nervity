
async function reproduce() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin123'
            })
        });

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.status} ${loginRes.statusText}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.access_token;
        console.log('Login successful. Token obtained.');

        // 2. Create User (simulate frontend payload)
        console.log('Attempting to create user...');
        // Based on typical frontend form data
        const payload = {
            username: 'testu_' + Math.floor(Date.now() / 1000),
            password: 'password123',
            role: 'agent',
            email: 'test' + Date.now() + '@example.com',
            balance: 100,
            is_active: true,
            remark: 'Test remark',
            level: 1,
            discount_rate: 90
        };

        const createRes = await fetch('http://localhost:3000/api/users/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const createData = await createRes.json();

        if (!createRes.ok) {
            console.error('Error Status:', createRes.status);
            console.error('Error Data:', JSON.stringify(createData, null, 2));
        } else {
            console.log('User created successfully:', createData);
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

reproduce();
