<?php
require_once '../config.php';

echo "<h2>Starting Database Repair...</h2>";

// 1. Add 'slug' column if it doesn't exist
$check = $conn->query("SHOW COLUMNS FROM blogs LIKE 'slug'");
if ($check->num_rows == 0) {
    $conn->query("ALTER TABLE blogs ADD COLUMN slug VARCHAR(255) NOT NULL AFTER title");
    echo "✅ Added 'slug' column.<br>";
} else {
    echo "info: 'slug' column already exists.<br>";
}

// 2. Rename 'content' to 'main_content' OR add 'main_content'
$check_main = $conn->query("SHOW COLUMNS FROM blogs LIKE 'main_content'");
if ($check_main->num_rows == 0) {
    // Check if old 'content' column exists to rename it
    $check_old = $conn->query("SHOW COLUMNS FROM blogs LIKE 'content'");
    if ($check_old->num_rows > 0) {
        $conn->query("ALTER TABLE blogs CHANGE content main_content TEXT");
        echo "✅ Renamed old 'content' to 'main_content'.<br>";
    } else {
        $conn->query("ALTER TABLE blogs ADD COLUMN main_content TEXT AFTER excerpt");
        echo "✅ Created 'main_content' column.<br>";
    }
} else {
    echo "info: 'main_content' column already exists.<br>";
}

// 3. Rename 'image_path' to 'main_image' OR add 'main_image'
$check_img = $conn->query("SHOW COLUMNS FROM blogs LIKE 'main_image'");
if ($check_img->num_rows == 0) {
    $check_old_img = $conn->query("SHOW COLUMNS FROM blogs LIKE 'image_path'");
    if ($check_old_img->num_rows > 0) {
        $conn->query("ALTER TABLE blogs CHANGE image_path main_image VARCHAR(255)");
        echo "✅ Renamed old 'image_path' to 'main_image'.<br>";
    } else {
        $conn->query("ALTER TABLE blogs ADD COLUMN main_image VARCHAR(255) AFTER author");
        echo "✅ Created 'main_image' column.<br>";
    }
} else {
    echo "info: 'main_image' column already exists.<br>";
}

// 4. Create the 'blog_sections' table
$sql_sections = "CREATE TABLE IF NOT EXISTS blog_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blog_id INT NOT NULL,
    section_title VARCHAR(255),
    section_content TEXT,
    section_image VARCHAR(255),
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
)";

if ($conn->query($sql_sections) === TRUE) {
    echo "✅ Table 'blog_sections' is ready.<br>";
} else {
    echo "❌ Error creating table: " . $conn->error . "<br>";
}

echo "<hr><h3>🎉 Database Fixed Successfully!</h3>";
echo "<p>You can now delete this file and go back to <a href='admin.php'>admin.php</a>.</p>";
?>