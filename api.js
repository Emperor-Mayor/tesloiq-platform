const API_BASE_URL = 'https://tesloiq.onrender.com/api';

/**
 * Retrieves the logged-in user ID from localStorage.
 * Redirects to Sign_In.html if no session exists.
 */
function getAuthenticatedUserId() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        window.location.replace('./Sign_In.html');
    }
    return userId;
}

/**
 * Fetches user profile data (balance, name, email) from backend.
 */
async function fetchUserProfile(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user data');
        return await response.json();
    } catch (err) {
        console.error('Error loading user profile:', err);
        return null;
    }
}

/**
 * Fetches user transaction ledger from backend.
 */
async function fetchUserTransactions(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch transactions');
        return await response.json();
    } catch (err) {
        console.error('Error loading transactions:', err);
        return [];
    }
}

/**
 * Submits a new transaction (Deposit, Withdrawal, or Investment) to the API.
 */
async function postTransaction(userId, type, amount, description) {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                type: type, // 'deposit', 'withdrawal', or 'investment'
                amount: parseFloat(amount),
                desc: description
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Transaction failed');
        return data;
    } catch (err) {
        console.error('Transaction Error:', err);
        throw err;
    }
}