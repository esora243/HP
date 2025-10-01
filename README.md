<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>山口大学医学部医学科 学士編入生有志の会</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --primary-color: #2c3e50;
            --secondary-color: #3498db;
            --background-color: #f4f7f6;
            --container-bg-color: #ffffff;
            --text-color: #333;
            --light-text-color: #7f8c8d;
            --border-color: #e0e0e0;
        }
        body {
            font-family: 'Noto Sans JP', sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            color: var(--text-color);
            background-color: var(--background-color);
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: var(--container-bg-color);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
            padding: 20px;
        }
        header {
            text-align: center;
            padding: 40px 20px;
            background: var(--primary-color);
            color: #fff;
        }
        header h1 {
            margin: 0;
            font-size: 2.5rem;
        }
        header p {
            margin: 10px 0 0;
            color: #bdc3c7;
        }
        nav {
            background: var(--primary-color);
            position: sticky;
            top: 0;
            z-index: 1000;
        }
        nav ul {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
        }
        nav ul li a {
            color: #fff;
            text-decoration: none;
            font-weight: 700;
            display: flex;
            align-items: center;
            padding: 15px 25px;
            transition: background-color 0.3s ease;
        }
        nav ul li a:hover {
            background-color: #34495e;
        }
        nav ul li a i {
            margin-right: 8px;
        }
        section {
            padding: 60px 20px;
            border-bottom: 1px solid var(--border-color);
        }
        section h2 {
            border-left: 4px solid var(--secondary-color);
            padding-left: 15px;
            font-size: 2rem;
            color: var(--primary-color);
            margin-bottom: 30px;
        }
        .about-section blockquote {
            font-style: italic;
            font-size: 1.2rem;
            color: var(--light-text-color);
            border-left: 3px solid var(--secondary-color);
            padding-left: 20px;
            margin: 30px 0;
        }
        .contact-info {
            background: var(--background-color);
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .contact-info a {
            color: var(--secondary-color);
            text-decoration: none;
            transition: color 0.3s;
        }
        .contact-info a:hover {
            color: var(--primary-color);
        }
        .news-list {
            list-style: none;
            padding: 0;
        }
        .news-item {
            display: flex;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid var(--border-color);
        }
        .news-item:last-child {
            border-bottom: none;
        }
        .news-date {
            background: var(--secondary-color);
            color: #fff;
            padding: 8px 12px;
            border-radius: 5px;
            font-weight: 700;
            font-size: 0.9rem;
            margin-right: 20px;
        }
        .news-text {
            flex-grow: 1;
        }
        .access-info p {
            margin: 5px 0;
        }
        .access-info a {
            color: var(--secondary-color);
            text-decoration: none;
        }
        /* Photo Gallery */
        .photo-gallery {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
        }
        .photo-gallery img {
            width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            object-fit: cover;
            aspect-ratio: 1/1;
            transition: transform 0.3s ease;
        }
        .photo-gallery img:hover {
            transform: scale(1.05);
        }
        /* Article list */
        .article-list {
            list-style: none;
            padding: 0;
        }
        .article-list li {
            padding: 15px 0;
            border-bottom: 1px solid var(--border-color);
        }
        .article-list li:last-child {
            border-bottom: none;
        }
        .article-list h3 {
            margin: 0 0 5px 0;
            font-size: 1.2rem;
        }
        .article-list p {
            margin: 0;
            font-size: 0.9rem;
            color: var(--light-text-color);
        }
        footer {
            text-align: center;
            padding: 20px;
            border-top: 1px solid var(--border-color);
            color: var(--light-text-color);
            font-size: 0.9rem;
        }
        @media (max-width: 768px) {
            nav ul {
                flex-direction: column;
            }
            nav ul li {
                width: 100%;
                text-align: center;
            }
            .news-item {
                flex-direction: column;
                align-items: flex-start;
            }
            .news-date {
                margin-bottom: 10px;
            }
        }
    </style>
</head>
<body>

    <header>
        <h1>山口大学医学部医学科 学士編入生有志の会</h1>
        <p>YAMAGUCHI UNIVERSITY FACULTY OF MEDICINE</p>
    </header>

    <nav>
        <ul>
            <li><a href="#about"><i class="fas fa-home"></i>ホーム</a></li>
            <li><a href="#activities"><i class="fas fa-list"></i>活動記録</a></li>
            <li><a href="#members"><i class="fas fa-users"></i>メンバー</a></li>
            <li><a href="#photos"><i class="fas fa-image"></i>写真</a></li>
            <li><a href="#articles"><i class="fas fa-newspaper"></i>記事</a></li>
        </ul>
    </nav>

    <main class="container">
        <section id="about" class="about-section">
            <h2>山口大学医学部医学科 学士編入生有志の会について</h2>
            <blockquote>
                おもしろきこともなき世を面白く<br>すみなしものは心なりけり
            </blockquote>
            <p>
                異なるキャリアを歩んできた人たちの繋がりが価値観の広がりに繋がるのではないか”という想いから設立されました。大それたことをいうとこんな感じですが、“学士っていろんな人いるし、縦の繋がりをつくったら面白いんじゃない？”ってぐらいの気持ちで始めました。
            </p>
            <p>
                このHPでは、私たちが感じた“学士編入の面白さ”を少しでも共有できていけたらなと思っています。
            </p>
            <div class="contact-info">
                <p><strong>E-mail:</strong> <a href="#">-</a></p>
                <p><strong>Link:</strong></p>
                <ul>
                    <li><a href="http://www.med.yamaguchi-u.ac.jp/" target="_blank">山口大学医学部・医学系研究科</a></li>
                    <li><a href="https://ja.wikipedia.org/wiki/%E9%95%B7%E5%B7%9E%E4%BA%94%E5%82%91" target="_blank">長州五傑（長州ファイブ）</a></li>
                </ul>
            </div>
        </section>

        <section id="activities" class="news-section">
            <h2>お知らせ</h2>
            <ul class="news-list">
                <li class="news-item">
                    <span class="news-date">2022.04.11</span>
                    <span class="news-text">主に２年生の女子生徒を対象に、キャリアを考える会を開催しました。</span>
                </li>
                <li class="news-item">
                    <span class="news-date">2022.03.26</span>
                    <span class="news-text">令和3年度卒業の堤春菜が、令和３年度学長表彰の（学業成績優秀者の部）として推薦され、審議の結果、表彰者に決定されました。</span>
                </li>
                <li class="news-item">
                    <span class="news-date">2022.02.26</span>
                    <span class="news-text">山口大学医学部学士編入生有志の会のホームページを開設しました。</span>
                </li>
                <li class="news-item">
                    <span class="news-date">2022.02.09</span>
                    <span class="news-text">学年の壁を超えて、学士編入生の上級生が2年生のテュートリアル実験に被験者として参加してくれました。</span>
                </li>
                <li class="news-item">
                    <span class="news-date">2022.01.11</span>
                    <span class="news-text">編入2年生の才川優輔が第2回AI勉強会を開催しました。</span>
                </li>
                <li class="news-item">
                    <span class="news-date">2021.12.18</span>
                    <span class="news-text">令和4年度学士編入学試験合格者への説明会を行いました。</span>
                </li>
                <li class="news-item">
                    <span class="news-date">2021.12.17</span>
                    <span class="news-text">編入6年生の追いコンを行いました。</span>
                </li>
                <li class="news-item">
                    <span class="news-date">2022.12.09</span>
                    <span class="news-text">編入2年生の才川優輔が第1回AI勉強会を開催しました。</span>
                </li>
            </ul>
        </section>

        <section id="photos">
            <h2>写真</h2>
            <div class="photo-gallery" id="photo-gallery">
                </div>
        </section>
        
        <section id="articles">
            <h2>記事</h2>
            <ul class="article-list" id="article-list">
                </ul>
        </section>

        <section id="access" class="access-info">
            <h2>アクセス</h2>
            <p><strong>山口大学医学部</strong></p>
            <p>Yamaguchi University Faculty of Medicine and Health Sciences</p>
            <p>〒755-8505<br>山口県宇部市南小串1-1-1</p>
            <a href="https://www.google.com/maps?q=山口県宇部市南小串1-1-1" target="_blank">
                <i class="fas fa-map-marker-alt"></i> Googleマップで見る
            </a>
        </section>
    </main>

    <footer>
        <p>© 2022 山口大学医学部医学科学士編入生有志の会.</p>
    </footer>

    <script src="articles.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // 写真を動的に生成
            const photoGallery = document.getElementById('photo-gallery');
            const photoCount = 30; // 写真の枚数を指定
            for (let i = 1; i <= photoCount; i++) {
                const img = document.createElement('img');
                img.src = `photos/画像(${i}).jpg`; // 写真のパスを修正
                img.alt = `活動写真 ${i}`;
                photoGallery.appendChild(img);
            }

            // articles.jsのデータを読み込んで記事を表示
            const articleList = document.getElementById('article-list');
            articles.forEach(article => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <h3>${article.title}</h3>
                    <p>${article.date} | ${article.summary}</p>
                `;
                articleList.appendChild(li);
            });
        });
    </script>
</body>
</html>
