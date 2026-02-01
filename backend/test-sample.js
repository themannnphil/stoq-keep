// Sample test file to verify API endpoints for Stoq-Keep
// Run with: node test-sample.js (after starting the server)

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
};

const testInventoryItem = {
  name: 'Test Laptop',
  description: 'A test laptop for inventory',
  category: 'Electronics',
  sku: 'TEST-LAP-001',
  quantity: 25,
  minStockLevel: 5,
  price: 899.99,
  supplier: {
    name: 'Test Supplier',
    email: 'supplier@test.com',
    phone: '+1234567890'
  },
  location: {
    warehouse: 'Test Warehouse',
    aisle: 'A1',
    shelf: 'S1'
  }
};

let authToken = '';
let inventoryItemId = '';

async function runTests() {
  try {
    console.log('🚀 Starting API Tests...\n');

    // Test 1: Register User
    console.log('1️⃣ Testing User Registration...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    console.log('✅ User registered successfully');
    authToken = registerResponse.data.data.token;
    console.log(`📝 Token: ${authToken.substring(0, 20)}...\n`);

    // Test 2: Login User
    console.log('2️⃣ Testing User Login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ User logged in successfully');
    authToken = loginResponse.data.data.token;
    console.log(`📝 New Token: ${authToken.substring(0, 20)}...\n`);

    // Test 3: Get Current User
    console.log('3️⃣ Testing Get Current User...');
    const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Current user retrieved successfully');
    console.log(`👤 User: ${userResponse.data.data.user.username}\n`);

    // Test 4: Create Inventory Item
    console.log('4️⃣ Testing Create Inventory Item...');
    const createResponse = await axios.post(`${API_BASE_URL}/inventory`, testInventoryItem, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Inventory item created successfully');
    inventoryItemId = createResponse.data.data.inventoryItem._id;
    console.log(`📦 Item ID: ${inventoryItemId}\n`);

    // Test 5: Get All Inventory Items
    console.log('5️⃣ Testing Get All Inventory Items...');
    const getAllResponse = await axios.get(`${API_BASE_URL}/inventory`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ All inventory items retrieved successfully');
    console.log(`📊 Total items: ${getAllResponse.data.data.pagination.totalItems}\n`);

    // Test 6: Get Single Inventory Item
    console.log('6️⃣ Testing Get Single Inventory Item...');
    const getSingleResponse = await axios.get(`${API_BASE_URL}/inventory/${inventoryItemId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Single inventory item retrieved successfully');
    console.log(`📦 Item: ${getSingleResponse.data.data.inventoryItem.name}\n`);

    // Test 7: Update Inventory Item
    console.log('7️⃣ Testing Update Inventory Item...');
    const updateResponse = await axios.put(`${API_BASE_URL}/inventory/${inventoryItemId}`, {
      quantity: 30,
      price: 849.99
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Inventory item updated successfully');
    console.log(`📦 New quantity: ${updateResponse.data.data.inventoryItem.quantity}\n`);

    // Test 8: Update Stock Quantity
    console.log('8️⃣ Testing Update Stock Quantity...');
    const stockResponse = await axios.patch(`${API_BASE_URL}/inventory/${inventoryItemId}/stock`, {
      quantity: 5,
      operation: 'add'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Stock quantity updated successfully');
    console.log(`📦 New stock: ${stockResponse.data.data.inventoryItem.quantity}\n`);

    // Test 9: Get Low Stock Alerts
    console.log('9️⃣ Testing Low Stock Alerts...');
    const alertsResponse = await axios.get(`${API_BASE_URL}/inventory/alerts/low-stock`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Low stock alerts retrieved successfully');
    console.log(`⚠️  Low stock items: ${alertsResponse.data.data.count}\n`);

    // Test 10: Health Check
    console.log('🔟 Testing Health Check...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check successful');
    console.log(`💚 Status: ${healthResponse.data.status}\n`);

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Check if server is running before running tests
async function checkServer() {
  try {
    await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Server is running, starting tests...\n');
    runTests();
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first:');
    console.log('   npm run dev');
    console.log('   or');
    console.log('   npm start\n');
  }
}

// Run the test
checkServer();
