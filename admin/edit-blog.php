<?php
session_start();
require_once '../config.php';

if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit();
}

$id = $_GET['id'] ?? 0;
$blog = $conn->query("SELECT * FROM blogs WHERE id = $id")->fetch_assoc();
$images = $conn->query("SELECT * FROM blog_images WHERE blog_id = $id ORDER BY display_order")->fetch_all(MYSQLI_ASSOC);

// Handle update logic here...
?>