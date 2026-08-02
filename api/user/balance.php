<?php
header("Content-Type: application/json");
require_once '../../config.php'; // Reaches out to grab the master key

// 1. Check for the user's secret VIP pass (Session Token)
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    $token = $matches[1];

    try {
        // 2. Look up the user in the database who matches this active token
        // This ensures new deposits and old deposits are pulled fresh right now!
        $stmt = $pdo->prepare("SELECT running_balance FROM users WHERE current_session_token = :token");
        $stmt->execute(['token' => $token]);
        $user = $stmt->fetch();

        if ($user) {
            // 3. Grab the live balance (which instantly includes all past and brand-new deposits)
            $liveBalance = floatval($user['running_balance']);

            echo json_encode([
                "success" => true,
                "balance" => $liveBalance
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Session expired. Please log in again."]);
        }

    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database error checking balance."]);
    }

} else {
    // No pass? No access!
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Hey! You need to log in to see this."]);
}
?>