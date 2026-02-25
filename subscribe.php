<?php

header('Content-Type: application/json');


$host = 'localhost';
$user = 'root';
$pass = '';

try {
    // 1. Connect to MySQL server (without selecting a database)
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 2. Auto-create database 'fred' if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS fred");
    $pdo->exec("USE fred");

    // 3. Auto-create 'subscribers' table if it doesn't exist
    $tableQuery = "CREATE TABLE IF NOT EXISTS subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($tableQuery);

    // 4. Handle POST request
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Read JSON payload from fetch API
        $data = json_decode(file_get_contents('php://input'), true);
        $email = trim($data['email'] ?? '');

        // Basic validation in case JS validation is bypassed
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
            exit;
        }

        // 5. Insert email into database
        $stmt = $pdo->prepare("INSERT INTO subscribers (email) VALUES (:email)");
        try {
            $stmt->execute(['email' => $email]);
            echo json_encode(['success' => true, 'message' => "You're in! Thanks for joining our newsletter."]);
        } catch (PDOException $e) {
            // Check for duplicate entry (MySQL error code 23000 / 1062)
            if ($e->getCode() == 23000 || (isset($e->errorInfo[1]) && $e->errorInfo[1] == 1062)) {
                echo json_encode(['success' => false, 'message' => 'This email is already subscribed!']);
            } else {
                echo json_encode(['success' => false, 'message' => 'An error occurred while subscribing.']);
            }
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid request method. Please use POST.']);
    }

} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed. Please ensure MySQL is running in XAMPP.']);
}
?>