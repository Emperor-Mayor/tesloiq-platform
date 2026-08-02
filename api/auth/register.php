<?php
header("Content-Type: application/json");
require_once '../../config.php'; // Reaches outside the folder to grab the master key

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $input = json_decode(file_get_contents("php://input"), true);
    $email = filter_var(trim($input['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $password = trim($input['password'] ?? '');

    // Is the email real? Is the password at least 8 characters long?
    if (!$email || strlen($password) < 8) {
        echo json_encode(["success" => false, "message" => "Oops! That email is invalid or the password is too short."]);
        exit;
    }

    // This scrambles the password into an unreadable secret code
    $hashed_password = password_hash($password, PASSWORD_ARGON2ID);

    try {
        // Drop the new user into the database starting with $0.00
        $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, running_balance) VALUES (:email, :password, 0.00)");
        $stmt->execute(['email' => $email, 'password' => $hashed_password]);
        echo json_encode(["success" => true, "message" => "Awesome! Your account is created!"]);
    } catch(PDOException $e) {
        echo json_encode(["success" => false, "message" => "Uh oh! That email might already be taken."]);
    }
}
?>