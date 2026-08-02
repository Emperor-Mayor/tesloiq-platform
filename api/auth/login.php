<?php
header("Content-Type: application/json");
require_once '../../config.php'; // Reaches outside to grab the master key

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $input = json_decode(file_get_contents("php://input"), true);
    $email = filter_var(trim($input['email'] ?? ''), FILTER_SANITIZE_EMAIL);
    $password = trim($input['password'] ?? '');

    // Look for the user's email in our database box
    $stmt = $pdo->prepare("SELECT id, password_hash FROM users WHERE email = :email");
    $stmt->execute(['email' => $email]);
    $user = $stmt->fetch();

    // If the user exists and the password match is correct:
    if ($user && password_verify($password, $user['password_hash'])) {
        // Create a secret digital VIP pass (session token) for them
        $session_token = bin2hex(random_bytes(32));
        
        echo json_encode([
            "success" => true,
            "token" => $session_token,
            "message" => "Welcome back! Access granted."
        ]);
    } else {
        // If they got the password or email wrong:
        echo json_encode(["success" => false, "message" => "Wrong email or password. Try again!"]);
    }
}
?>