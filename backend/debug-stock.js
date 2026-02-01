// Debug script for stock endpoint
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function debugStock() {
  try {
    console.log('🔍 Debugging Stock Endpoint...\n');

    // Step 1: Login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    console.log(`📝 Token: ${token.substring(0, 30)}...\n`);

    // Step 2: Get inventory items
    console.log('2️⃣ Getting inventory items...');
    const inventoryResponse = await axios.get(`${API_BASE_URL}/inventory`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const items = inventoryResponse.data.data.inventoryItems;
    console.log(`✅ Found ${items.length} items`);
    
    if (items.length === 0) {
      console.log('❌ No items found. Creating one first...');
      
      // Create a test item
      const createResponse = await axios.post(`${API_BASE_URL}/inventory`, {
        name: 'Debug Test Item',
        description: 'Item for debugging stock endpoint',
        category: 'Electronics',
        sku: 'DEBUG-001',
        quantity: 10,
        minStockLevel: 5,
        price: 99.99
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newItem = createResponse.data.data.inventoryItem;
      console.log(`✅ Created new item: ${newItem.name} (ID: ${newItem._id})`);
      console.log(`📦 Current quantity: ${newItem.quantity}\n`);
      
      // Test stock update on new item
      await testStockUpdate(newItem._id, token);
    } else {
      const firstItem = items[0];
      console.log(`📦 First item: ${firstItem.name} (ID: ${firstItem._id})`);
      console.log(`📊 Current quantity: ${firstItem.quantity}\n`);
      
      // Test stock update on existing item
      await testStockUpdate(firstItem._id, token);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

async function testStockUpdate(itemId, token) {
  try {
    console.log('3️⃣ Testing stock update...');
    
    // Test 1: Add 5 to stock
    console.log('📈 Testing ADD operation (+5)...');
    const addResponse = await axios.patch(`${API_BASE_URL}/inventory/${itemId}/stock`, {
      quantity: 5,
      operation: 'add'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ ADD operation successful');
    console.log(`📦 New quantity: ${addResponse.data.data.inventoryItem.quantity}\n`);

    // Test 2: Set stock to 20
    console.log('📊 Testing SET operation (20)...');
    const setResponse = await axios.patch(`${API_BASE_URL}/inventory/${itemId}/stock`, {
      quantity: 20,
      operation: 'set'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ SET operation successful');
    console.log(`📦 New quantity: ${setResponse.data.data.inventoryItem.quantity}\n`);

    // Test 3: Subtract 3 from stock
    console.log('📉 Testing SUBTRACT operation (-3)...');
    const subtractResponse = await axios.patch(`${API_BASE_URL}/inventory/${itemId}/stock`, {
      quantity: 3,
      operation: 'subtract'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ SUBTRACT operation successful');
    console.log(`📦 New quantity: ${subtractResponse.data.data.inventoryItem.quantity}\n`);

    console.log('🎉 All stock operations working correctly!');

  } catch (error) {
    console.error('❌ Stock update failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

debugStock();
