 <?php
session_start();
require_once '../config.php';

// --- AUTO-FIX DATABASE (Self-Healing) ---
try {
    // 1. Ensure 'slug' exists
    $checkSlug = $conn->query("SHOW COLUMNS FROM blogs LIKE 'slug'");
    if ($checkSlug->num_rows == 0) {
        $conn->query("ALTER TABLE blogs ADD COLUMN slug VARCHAR(255) NOT NULL AFTER title");
    }

    // 2. Ensure 'main_content' exists
    $checkContent = $conn->query("SHOW COLUMNS FROM blogs LIKE 'main_content'");
    if ($checkContent->num_rows == 0) {
        $checkOldContent = $conn->query("SHOW COLUMNS FROM blogs LIKE 'content'");
        if ($checkOldContent->num_rows > 0) {
            $conn->query("ALTER TABLE blogs CHANGE content main_content TEXT");
        } else {
            $conn->query("ALTER TABLE blogs ADD COLUMN main_content TEXT AFTER excerpt");
        }
    }

    // 3. Ensure 'main_image' exists
    $checkImage = $conn->query("SHOW COLUMNS FROM blogs LIKE 'main_image'");
    if ($checkImage->num_rows == 0) {
        $checkOldImage = $conn->query("SHOW COLUMNS FROM blogs LIKE 'image_path'");
        if ($checkOldImage->num_rows > 0) {
            $conn->query("ALTER TABLE blogs CHANGE image_path main_image VARCHAR(255)");
        } else {
            $conn->query("ALTER TABLE blogs ADD COLUMN main_image VARCHAR(255) AFTER author");
        }
    }
    
    // 4. Ensure 'date_posted' exists
    $checkDate = $conn->query("SHOW COLUMNS FROM blogs LIKE 'date_posted'");
    if ($checkDate->num_rows == 0) {
        $conn->query("ALTER TABLE blogs ADD COLUMN date_posted DATE DEFAULT CURRENT_DATE");
    }

    // 5. Create 'blog_sections' table
    $conn->query("CREATE TABLE IF NOT EXISTS blog_sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        blog_id INT NOT NULL,
        section_title VARCHAR(255),
        section_content TEXT,
        section_image VARCHAR(255),
        FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
    )");

} catch (Exception $e) {
    die("Database Fix Error: " . $e->getMessage());
}
// --- END AUTO-FIX ---

// Check Login
if (!isset($_SESSION['admin_logged_in'])) {
    header('Location: login.php');
    exit();
}

// Initialize Edit Variables
$is_editing = false;
$edit_id = 0;
$title = $slug = $excerpt = $content = $author = $tags = '';
$current_image = '';
$existing_sections = [];

// --- HANDLE DELETE BLOG ---
if (isset($_GET['delete_id'])) {
    $delete_id = intval($_GET['delete_id']);
    
    // Delete Main Image
    $query = $conn->query("SELECT main_image FROM blogs WHERE id = $delete_id");
    if ($query && $row = $query->fetch_assoc()) {
        if(!empty($row['main_image']) && file_exists("../" . $row['main_image'])) unlink("../" . $row['main_image']);
    }

    // Delete Section Images
    $sec_query = $conn->query("SELECT section_image FROM blog_sections WHERE blog_id = $delete_id");
    while($sec_row = $sec_query->fetch_assoc()) {
        if(!empty($sec_row['section_image']) && file_exists("../" . $sec_row['section_image'])) unlink("../" . $sec_row['section_image']);
    }

    $conn->query("DELETE FROM blogs WHERE id = $delete_id");
    header("Location: admin.php?msg=deleted");
    exit();
}

// --- HANDLE DELETE SINGLE SECTION (During Edit) ---
if (isset($_GET['delete_section_id']) && isset($_GET['edit_id'])) {
    $sec_id = intval($_GET['delete_section_id']);
    $eid = intval($_GET['edit_id']);
    
    // Get image to unlink
    $q = $conn->query("SELECT section_image FROM blog_sections WHERE id = $sec_id");
    if ($r = $q->fetch_assoc()) {
        if(!empty($r['section_image']) && file_exists("../" . $r['section_image'])) unlink("../" . $r['section_image']);
    }
    
    $conn->query("DELETE FROM blog_sections WHERE id = $sec_id");
    header("Location: admin.php?edit_id=" . $eid . "&msg=section_deleted");
    exit();
}

// --- HANDLE FETCH FOR EDIT ---
if (isset($_GET['edit_id'])) {
    $is_editing = true;
    $edit_id = intval($_GET['edit_id']);
    $query = $conn->query("SELECT * FROM blogs WHERE id = $edit_id");
    
    if ($row = $query->fetch_assoc()) {
        $title = $row['title'];
        $slug = $row['slug'];
        $excerpt = $row['excerpt'];
        $content = $row['main_content'];
        $author = $row['author'];
        $tags = $row['tags'];
        $current_image = $row['main_image'];
        
        // Fetch Sections
        $sec_res = $conn->query("SELECT * FROM blog_sections WHERE blog_id = $edit_id");
        while($s = $sec_res->fetch_assoc()) {
            $existing_sections[] = $s;
        }
    }
}

// --- HANDLE FORM SUBMISSION (CREATE & UPDATE) ---
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $title_in = $conn->real_escape_string($_POST['title']);
    $content_in = $conn->real_escape_string($_POST['content']); 
    $excerpt_in = $conn->real_escape_string($_POST['excerpt']);
    $author_in = $conn->real_escape_string($_POST['author']);
    $tags_in = $conn->real_escape_string($_POST['tags']);
    
    // Slug Generation
    if (!empty($_POST['slug'])) {
        $slug_in = strtolower(str_replace(' ', '-', preg_replace('/[^a-zA-Z0-9\s-]/', '', $_POST['slug'])));
    } else {
        $slug_in = strtolower(str_replace(' ', '-', preg_replace('/[^a-zA-Z0-9\s-]/', '', $title_in)));
    }
    
    // Handle Main Image Upload
    $target_dir = "../uploads/blog_images/";
    if (!is_dir($target_dir)) mkdir($target_dir, 0777, true);
    
    $final_image_path = $_POST['current_image_path'] ?? ''; // Default to existing image

    if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
        $image_name = time() . '_main_' . basename($_FILES['image']['name']);
        $target_file = $target_dir . $image_name;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
            $final_image_path = "uploads/blog_images/" . $image_name;
        }
    }

    if (isset($_POST['update_mode']) && $_POST['update_mode'] == '1') {
        // --- UPDATE LOGIC ---
        $blog_id_update = intval($_POST['blog_id']);
        
        $stmt = $conn->prepare("UPDATE blogs SET title=?, slug=?, main_content=?, excerpt=?, main_image=?, author=?, tags=? WHERE id=?");
        $stmt->bind_param("sssssssi", $title_in, $slug_in, $content_in, $excerpt_in, $final_image_path, $author_in, $tags_in, $blog_id_update);
        
        if ($stmt->execute()) {
            $blog_id = $blog_id_update; // Set for section saving
            $success = "Blog updated successfully!";
            // Refresh variables
            $is_editing = false; $title = ''; $content = ''; $current_image = '';
        } else {
            $error = "Update failed: " . $stmt->error;
        }

    } else {
        // --- CREATE LOGIC ---
        // Unique Slug Check only for Create
        $checkSlug = $conn->query("SELECT id FROM blogs WHERE slug = '$slug_in'");
        if($checkSlug->num_rows > 0) $slug_in .= '-' . time();

        $stmt = $conn->prepare("INSERT INTO blogs (title, slug, main_content, excerpt, main_image, author, tags, date_posted) VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())");
        $stmt->bind_param("sssssss", $title_in, $slug_in, $content_in, $excerpt_in, $final_image_path, $author_in, $tags_in);
        
        if ($stmt->execute()) {
            $blog_id = $conn->insert_id;
            $success = "Blog created successfully!";
        } else {
            $error = "Create failed: " . $stmt->error;
        }
    }

    // --- SAVE NEW SECTIONS (Common for Create & Update) ---
    if (isset($blog_id) && isset($_POST['section_title'])) {
        $section_titles = $_POST['section_title'];
        $section_contents = $_POST['section_content'];
        
        for ($i = 0; $i < count($section_titles); $i++) {
            $s_title = $conn->real_escape_string($section_titles[$i]);
            $s_content = $conn->real_escape_string($section_contents[$i]);
            $s_image_path = '';

            if (isset($_FILES['section_image']['name'][$i]) && $_FILES['section_image']['error'][$i] == 0) {
                $s_img_name = time() . "_sec{$i}_" . basename($_FILES['section_image']['name'][$i]);
                $s_target = $target_dir . $s_img_name;
                if (move_uploaded_file($_FILES['section_image']['tmp_name'][$i], $s_target)) {
                    $s_image_path = "uploads/blog_images/" . $s_img_name;
                }
            }

            if(!empty($s_title) || !empty($s_content) || !empty($s_image_path)){
                $sec_stmt = $conn->prepare("INSERT INTO blog_sections (blog_id, section_title, section_content, section_image) VALUES (?, ?, ?, ?)");
                $sec_stmt->bind_param("isss", $blog_id, $s_title, $s_content, $s_image_path);
                $sec_stmt->execute();
            }
        }
    }
}

// Fetch Blogs for List
$blogs = $conn->query("SELECT * FROM blogs ORDER BY id DESC");
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: sans-serif; }
        body { background: #0a0a0a; color: #fff; display: flex; }
        .sidebar { width: 250px; background: #111; padding: 20px; border-right: 1px solid #333; min-height: 100vh; }
        .main-content { flex: 1; padding: 30px; }
        .form-container { background: #1a1a1a; padding: 20px; border-radius: 8px; border: 1px solid #333; }
        input, textarea { width: 100%; padding: 10px; margin-bottom: 15px; background: #222; border: 1px solid #444; color: #fff; border-radius: 4px; }
        label { display: block; margin-bottom: 5px; color: #ccc; }
        .submit-btn { background: #ff6600; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 4px; }
        .btn-cancel { background: #555; color: white; text-decoration: none; padding: 10px 20px; border-radius: 4px; margin-left: 10px; }
        
        .content-section { border: 1px dashed #555; padding: 15px; margin-bottom: 15px; position: relative; }
        .existing-section { border: 1px solid #333; background: #111; padding: 10px; margin-bottom: 10px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; }
        
        .add-sec-btn { background: #333; color: white; border: 1px solid #555; padding: 8px; width: 100%; cursor: pointer; margin-bottom: 20px; }
        .remove-btn { position: absolute; top: 5px; right: 5px; background: red; color: white; border: none; padding: 2px 8px; cursor: pointer; }
        
        .alert { padding: 10px; margin-bottom: 20px; border-radius: 4px; }
        .success { background: #1e3a29; color: #4ade80; border: 1px solid #22c55e; }
        .error { background: #3f1a1a; color: #f87171; border: 1px solid #ef4444; }
        
        .blog-item { padding: 15px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; }
        .actions a { padding: 5px 10px; border-radius: 4px; text-decoration: none; font-size: 0.9rem; margin-left: 5px; }
        .edit-btn { background: #2563eb; color: white; }
        .delete-btn { background: #dc2626; color: white; }
    </style>
</head>
<body>
    <div class="sidebar">
        <h2 style="color: #ff6600; margin-bottom: 20px;">Admin</h2>
        <a href="admin.php" style="color: white; text-decoration: none;">Dashboard</a><br><br>
        <a href="logout.php" style="color: #888; text-decoration: none;">Logout</a>
    </div>

    <div class="main-content">
        <h1><?php echo $is_editing ? 'Edit Blog' : 'Add New Blog'; ?></h1>
        <br>

        <?php if(isset($success)) echo "<div class='alert success'>$success</div>"; ?>
        <?php if(isset($error)) echo "<div class='alert error'>$error</div>"; ?>
        <?php if(isset($_GET['msg']) && $_GET['msg']=='section_deleted') echo "<div class='alert success'>Section deleted successfully.</div>"; ?>

        <div class="form-container">
            <form method="POST" enctype="multipart/form-data">
                
                <?php if($is_editing): ?>
                    <input type="hidden" name="update_mode" value="1">
                    <input type="hidden" name="blog_id" value="<?php echo $edit_id; ?>">
                    <input type="hidden" name="current_image_path" value="<?php echo $current_image; ?>">
                <?php endif; ?>

                <label>Blog Title *</label>
                <input type="text" name="title" value="<?php echo htmlspecialchars($title); ?>" required id="titleInput" onkeyup="generateSlug()">

                <label>Slug (URL) - Optional</label>
                <input type="text" name="slug" value="<?php echo htmlspecialchars($slug); ?>" id="slugInput">

                <label>Excerpt (Short Description)</label>
                <textarea name="excerpt" rows="3"><?php echo htmlspecialchars($excerpt); ?></textarea>

                <label>Main Content *</label>
                <textarea name="content" rows="6" required><?php echo htmlspecialchars($content); ?></textarea>

                <label>Main Image</label>
                <?php if($is_editing && !empty($current_image)): ?>
                    <div style="margin-bottom:10px;">
                        <img src="../<?php echo $current_image; ?>" style="height:80px; border-radius:4px;">
                        <br><small style="color:#888;">Current Image</small>
                    </div>
                <?php endif; ?>
                <input type="file" name="image">

                <?php if($is_editing && !empty($existing_sections)): ?>
                    <h3 style="margin: 20px 0;">Existing Content Sections</h3>
                    <?php foreach($existing_sections as $es): ?>
                        <div class="existing-section">
                            <div>
                                <strong><?php echo htmlspecialchars($es['section_title']); ?></strong><br>
                                <small><?php echo substr(htmlspecialchars($es['section_content']), 0, 50); ?>...</small>
                            </div>
                            <a href="admin.php?edit_id=<?php echo $edit_id; ?>&delete_section_id=<?php echo $es['id']; ?>" 
                               onclick="return confirm('Delete this section?')" 
                               style="color:red; text-decoration:none;">Delete</a>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>

                <h3 style="margin: 20px 0;">Add New Content Sections</h3>
                <div id="sections-container"></div>
                <button type="button" class="add-sec-btn" onclick="addSection()">+ Add Another Section (Image & Text)</button>

                <label>Author</label>
                <input type="text" name="author" value="<?php echo !empty($author) ? htmlspecialchars($author) : 'Admin'; ?>">
                
                <label>Tags</label>
                <input type="text" name="tags" value="<?php echo htmlspecialchars($tags); ?>">

                <button type="submit" class="submit-btn"><?php echo $is_editing ? 'Update Blog' : 'Publish Blog'; ?></button>
                <?php if($is_editing): ?>
                    <a href="admin.php" class="btn-cancel">Cancel Edit</a>
                <?php endif; ?>
            </form>
        </div>

        <br><hr><br>
        <h2>Recent Blogs</h2>
        <?php if($blogs): ?>
            <?php while($row = $blogs->fetch_assoc()): ?>
                <div class="blog-item">
                    <div>
                        <strong><?php echo htmlspecialchars($row['title']); ?></strong><br>
                        <small style="color: #888;">Slug: <?php echo $row['slug']; ?></small>
                    </div>
                    <div class="actions">
                        <a href="admin.php?edit_id=<?php echo $row['id']; ?>" class="edit-btn">Edit</a>
                        <a href="admin.php?delete_id=<?php echo $row['id']; ?>" class="delete-btn" onclick="return confirm('Are you sure?');">Delete</a>
                    </div>
                </div>
            <?php endwhile; ?>
        <?php endif; ?>
    </div>

    <script>
        function generateSlug() {
            // Optional auto-fill
        }
        function addSection() {
            const container = document.getElementById('sections-container');
            const div = document.createElement('div');
            div.className = 'content-section';
            div.innerHTML = `
                <button type="button" class="remove-btn" onclick="this.parentElement.remove()">X</button>
                <label>Section Title</label>
                <input type="text" name="section_title[]">
                <label>Section Content</label>
                <textarea name="section_content[]" rows="4"></textarea>
                <label>Section Image</label>
                <input type="file" name="section_image[]">
            `;
            container.appendChild(div);
        }
    </script>
</body>
</html>