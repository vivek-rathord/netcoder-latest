 <?php
require_once 'config.php';

// 1. Get the slug from the URL
if (isset($_GET['slug'])) {
    $slug = $conn->real_escape_string($_GET['slug']);

    // 2. Fetch Main Blog Post
    $sql = "SELECT * FROM blogs WHERE slug = '$slug'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $blog = $result->fetch_assoc();
        $blog_id = $blog['id'];

        // 3. Fetch Additional Content Sections
        $section_sql = "SELECT * FROM blog_sections WHERE blog_id = $blog_id";
        $sections = $conn->query($section_sql);
    } else {
        // Redirect to blog list if slug not found
        header("Location: blog.php");
        exit();
    }
} else {
    header("Location: blog.php");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($blog['title']); ?> | Netcoder Technology</title>
    <meta name="description" content="<?php echo htmlspecialchars($blog['excerpt']); ?>">
    
    <link rel="shortcut icon" href="images/net-coder-logo icon.png">
    <link rel="stylesheet" href="style.css"> <style>
        /* --- Blog Detail Specific Styles --- */
        .blog-detail-page {
            background-color: #f9f9f9;
            padding: 40px 0;
            min-height: 80vh;
        }

        .blog-content-wrapper {
            max-width: 900px;
            margin: 0 auto;
            background: #fff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.05);
        }

        /* Back Button */
        .back-btn {
            display: inline-flex;
            align-items: center;
            text-decoration: none;
            color: #555;
            font-weight: 600;
            margin-bottom: 25px;
            transition: 0.3s;
            background: #f0f0f0;
            padding: 8px 16px;
            border-radius: 30px;
        }
        .back-btn:hover {
            background: #ff6600;
            color: #fff;
            transform: translateX(-5px);
        }
        .back-btn svg { margin-right: 8px; }

        /* Blog Header */
        .article-header h1 {
            font-size: 2.5rem;
            color: #222;
            margin-bottom: 15px;
            line-height: 1.3;
        }
        .article-meta {
            color: #777;
            font-size: 0.95rem;
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
        }
        .article-meta span { display: inline-flex; align-items: center; }
        .article-meta svg { width: 16px; height: 16px; margin-right: 5px; }

        /* Images */
        .main-featured-image {
            width: 100%;
            height: auto;
            max-height: 500px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 30px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .section-image {
            width: 100%;
            border-radius: 8px;
            margin-top: 20px;
        }

        /* Content Typography */
        .article-body {
            font-size: 1.1rem;
            line-height: 1.8;
            color: #333;
        }
        .article-body p { margin-bottom: 20px; }
        
        /* Dynamic Sections */
        .content-block {
            margin-top: 40px;
            padding-top: 20px;
        }
        .content-block h2 {
            color: #ff6600;
            font-size: 1.8rem;
            margin-bottom: 15px;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .blog-content-wrapper { padding: 20px; }
            .article-header h1 { font-size: 1.8rem; }
        }
    </style>
</head>
<body>

    <header class="header">
        <nav class="nav container">
            <div class="nav-data">
                <a href="index.html" class="nav-logo">
                    <img src="images/logo.png" alt="Netcoder Technology Logo">
                </a>

                <div class="nav-toggle" id="nav-toggle">
                    <svg class="nav-toggle-menu" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 12H21M3 6H21M9 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <svg class="nav-toggle-close" width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
            </div>

            <div class="nav-menu" id="nav-menu">
                <ul class="nav-list container">
                    <li><a href="index.html" class="nav-link">Home</a></li>
                    <li><a href="about.html" class="nav-link">About</a></li>
                    <li class="dropdown-item">
                        <div class="nav-link dropdown-button">
                            Courses <svg class="dropdown-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 5.39565C4.88131 5.39565 4.78239 5.35608 4.68348 5.27695L0.133531 0.806133C-0.0445104 0.628091 -0.0445104 0.351138 0.133531 0.173096C0.311573 -0.00494545 0.588526 -0.00494545 0.766568 0.173096L5 4.30762L9.23343 0.133531C9.41147 -0.0445104 9.68843 -0.0445104 9.86647 0.133531C10.0445 0.311573 10.0445 0.588526 9.86647 0.766568L5.31652 5.23739C5.21761 5.3363 5.11869 5.39565 5 5.39565Z" fill="#222222" /></svg>
                        </div>
                        <div class="dropdown-container container">
                            <div class="dropdown-content">
                                <div>
                                    <ul>
                                        <li><h5>Design & Multimedia Courses</h5></li>
                                        <li><a href="foundation-graphic.html">Graphic Designing</a></li>
                                        <li><a href="web-designing.html">Web Designing</a></li>
                                        <li><a href="ui&ux.html">UI & UX Design</a></li>
                                    </ul>
                                </div>
                                <div>
                                    <ul>
                                        <li><h5>CMS & Web Technologies</h5></li>
                                        <li><a href="web-development.html">Web Development</a></li>
                                        <li><a href="fullstack-web-development.html">Full Stack Development</a></li>
                                        <li><a href="mern-stack.html">MERN Stack</a></li>
                                    </ul>
                                </div>
                                <div>
                                    <ul>
                                        <li><h5>Professional Training</h5></li>
                                        <li><a href="machine-learning.html">Data Science</a></li>
                                        <li><a href="cyber-security.html">Cyber Security</a></li>
                                        <li><a href="ethical-hacking.html">Ethical Hacking</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </li>
                    <li><a href="services.html" class="nav-link">Services</a></li>
                    <li><a href="gallery.html" class="nav-link">Gallery</a></li>
                    <li><a href="blog.php" class="nav-link active">Blogs</a></li>
                    <li><a href="career.html" class="nav-link">Career</a></li>
                    <li><a href="contact.html" class="nav-link">Contact</a></li>
                </ul>
            </div>
        </nav>
    </header>

    <div class="blog-detail-page">
        <div class="container">
            <div class="blog-content-wrapper">
                
                <a href="blog.php" class="back-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to All Blogs
                </a>

                <article>
                    <header class="article-header">
                        <h1><?php echo htmlspecialchars($blog['title']); ?></h1>
                        
                        <div class="article-meta">
                            <span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                <?php echo htmlspecialchars($blog['author']); ?>
                            </span>
                            <span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                <?php echo date('F d, Y', strtotime($blog['date_posted'])); ?>
                            </span>
                            <?php if(!empty($blog['tags'])): ?>
                            <span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                                <?php echo htmlspecialchars($blog['tags']); ?>
                            </span>
                            <?php endif; ?>
                        </div>
                    </header>

                    <?php if (!empty($blog['main_image'])): ?>
                        <img src="<?php echo htmlspecialchars($blog['main_image']); ?>" alt="<?php echo htmlspecialchars($blog['title']); ?>" class="main-featured-image">
                    <?php endif; ?>

                    <div class="article-body">
                        <?php echo nl2br($blog['main_content']); ?>
                    </div>

                    <?php while($sec = $sections->fetch_assoc()): ?>
                        <div class="content-block">
                            <?php if (!empty($sec['section_title'])): ?>
                                <h2><?php echo htmlspecialchars($sec['section_title']); ?></h2>
                            <?php endif; ?>

                            <?php if (!empty($sec['section_content'])): ?>
                                <div class="article-body">
                                    <?php echo nl2br($sec['section_content']); ?>
                                </div>
                            <?php endif; ?>

                            <?php if (!empty($sec['section_image'])): ?>
                                <img src="<?php echo htmlspecialchars($sec['section_image']); ?>" alt="Section visual" class="section-image">
                            <?php endif; ?>
                        </div>
                    <?php endwhile; ?>

                </article>
            </div>
        </div>
    </div>

    <footer>
        <div class="container">
            <div class="newsletter">
                <h2><span>Keep Up With Our Latest Updates</span></h2>
                <p>Stay connected with our latest news and updates. Be the first to know about new courses, exclusive offers, and exciting announcements by subscribing to our newsletter.</p>
                <form action="#">
                    <input type="email" name="newsletter" id="newsletter" placeholder="Email Address">
                    <input type="submit" value="Subscribe">
                </form>
            </div>
            
            <div class="foot-links">
                <ul>
                    <li><h5>Quick Links</h5></li>
                    <li><a href="index.html">Home</a></li>
                    <li><a href="about.html">About</a></li>
                    <li><a href="gallery.html">Gallery</a></li>
                    <li><a href="contact.html">Contact</a></li>
                </ul>
                <ul>
                    <li><h5>Top Courses</h5></li>
                    <li><a href="fullstack-web-development.html">Full Stack Development</a></li>
                    <li><a href="mern-stack.html">MERN Stack</a></li>
                    <li><a href="software-engineering.html">Python Course</a></li>
                </ul>
                <ul>
                    <li><h5>Features</h5></li>
                    <li><a href="foundation-graphic.html">Graphic Designing</a></li>
                    <li><a href="digital-marketing.html">Digital Marketing</a></li>
                    <li><a href="ui&ux.html">UI & UX Design</a></li>
                </ul>
                <ul>
                    <li><h5>Professional Training</h5></li>
                    <li><a href="machine-learning.html">Data Science</a></li>
                    <li><a href="cyber-security.html">Cyber Security</a></li>
                    <li><a href="ethical-hacking.html">Ethical Hacking</a></li>
                </ul>
            </div>
        </div>
        <div class="copyright">
            <div class="container">
                <p>Copyright &copy;2025 All rights reserved by &hearts; <a href="index.html">Netcoder Technology</a></p>
                <div class="social-icons">
                    <a href="#"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg></a>
                    <a href="#"><svg width="20" height="20" viewBox="0 0 24 24" fill="white"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
                </div>
            </div>
        </div>
    </footer>
    
    <script src="main.js"></script>
</body>
</html>