<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>山口大学医学部医学科 学士編入生有志の会</title>
    <!-- Tailwind CSS CDNの読み込み -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Font Awesome (アイコン用) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <script>
        // Tailwindの設定：カスタムカラーとフォントを設定
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'y-primary': '#1f334a', // メインカラー (濃いネイビー)
                        'y-accent': '#c0392b',  // アクセントカラー (深い赤)
                        'y-background': '#f4f7f6', // 背景色
                        'y-text': '#2c3e50', // テキスト色
                    },
                    fontFamily: {
                        sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
                    },
                },
            }
        }
    </script>
    <style>
        /* 1. 基本パディング */
        .section-padding {
            padding: 4rem 1.5rem;
        }
        @media (min-width: 768px) {
            .section-padding {
                padding: 6rem 3rem;
            }
        }
        
        /* 2. 背景テクスチャ (テキストの後ろに薄く貼る) */
        .textured-section {
            background-color: #ffffff;
            position: relative;
            overflow: hidden;
        }
        .textured-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            /* 背景テクスチャのPlaceholder */
            background-image: url('https://placehold.co/1000x1000/ffffff/d1d5db?text=Subtle+Texture'); 
            background-repeat: repeat;
            opacity: 0.1;
            z-index: 0;
            pointer-events: none;
        }

        /* 3. ヒーローセクションの背景 */
        #hero {
            /* 背景画像とオーバーレイでタイトルを際立たせる */
            background-image: linear-gradient(to bottom, rgba(31, 51, 74, 0.75), rgba(31, 51, 74, 0.75)), url('https://placehold.co/1500x450/2c3e50/ffffff?text=YAMAGUCHI+U+MEDICINE+ENTRANCE+BG');
            background-size: cover;
            background-position: center center;
        }

        /* 4. セクションコンテンツレイヤー */
        .content-layer {
            position: relative;
            z-index: 10;
        }

        /* 5. タイトルヘッダーの強調と透かし (タイトルの後ろに薄い画像を貼る工夫) */
        .section-title {
            position: relative;
            padding-left: 1rem; 
            margin-bottom: 2rem;
            z-index: 10;
        }

        .section-title h2 {
            position: relative;
            z-index: 10;
            font-size: 2.25rem;
            line-height: 1;
        }
        
        .section-title::after {
            content: attr(data-title-en); 
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 8vw;
            color: rgba(22, 45, 68, 0.05); /* 非常に薄いネイビー */
            font-weight: 800;
            letter-spacing: 0.1em;
            pointer-events: none;
            white-space: nowrap;
            z-index: 0;
        }

        @media (min-width: 768px) {
             .section-title::after {
                font-size: 5vw;
            }
        }
        
        /* 記事リストアイテムのリンク領域を拡大 */
        .article-link-container {
            display: block;
            width: 100%;
            height: 100%;
            padding: 1rem 1rem 1rem 0;
        }
        
        /* 散りばめられた画像のスタイル */
        .scattered-image-card {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .scattered-image-card img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            aspect-ratio: 16 / 10;
        }
        
        /* Google Map用のコンテナ */
        .map-container {
            position: relative;
            overflow: hidden;
            width: 100%;
            /* 16:9 のアスペクト比を維持 */
            padding-top: 56.25%; 
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .map-container iframe {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            width: 100%;
            height: 100%;
            border: 0;
        }
    </style>
</head>
<body class="bg-y-background font-sans">

    <!-- ヘッダー＆ナビゲーション -->
    <header class="bg-y-primary text-white shadow-lg sticky top-0 z-50">
        <div class="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-4 py-3">
            <div class="text-xl font-bold tracking-wider">
                <a href="#hero" class="hover:text-y-accent transition duration-300">山口大学医学部医学科 学士編入生有志の会</a>
            </div>
            <!-- ナビゲーションメニュー (ホーム/記事/アクセス のみ) -->
            <nav class="mt-3 md:mt-0" id="main-nav">
                <ul class="flex space-x-4">
                    <li><a href="#about" class="px-3 py-2 rounded-lg hover:bg-y-accent transition duration-300 flex items-center text-sm font-semibold"><i class="fas fa-home mr-1"></i>ホーム</a></li>
                    <li><a href="#articles" class="px-3 py-2 rounded-lg hover:bg-y-accent transition duration-300 flex items-center text-sm font-semibold"><i class="fas fa-book-open mr-1"></i>記事</a></li>
                    <li><a href="#access" class="px-3 py-2 rounded-lg hover:bg-y-accent transition duration-300 flex items-center text-sm font-semibold"><i class="fas fa-map-marked-alt mr-1"></i>アクセス</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <!-- ヒーローセクション (キービジュアル) -->
    <section id="hero" class="h-[450px] flex items-center justify-center text-center shadow-inner">
        <div class="p-6 md:p-10 rounded-xl max-w-4xl mx-auto">
            <h2 class="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
                多様な経験が、未来の医療を創る
            </h2>
            <p class="text-xl md:text-2xl text-gray-200 italic font-medium drop-shadow-md">
                “おもしろきこともなき世を面白く<br>すみなしものは心なりけり”
            </p>
        </div>
    </section>

    <main class="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl -mt-16 relative z-10">
        
        <!-- 1. ホーム/紹介セクション (テクスチャ適用 + タイトル透かし) -->
        <section id="about" class="section-padding textured-section rounded-t-xl border-b border-gray-200">
            <div class="content-layer">
                <div class="section-title" data-title-en="ABOUT">
                    <h2 class="text-3xl font-bold text-y-text border-l-4 border-y-accent pl-4">
                        <i class="fas fa-graduation-cap text-y-accent mr-2"></i>有志の会について
                    </h2>
                </div>
                
                <div class="space-y-8 text-lg text-gray-700 mt-8">
                    <!-- 1つ目の画像とテキストの対比 -->
                    <div class="flex flex-col md:flex-row items-start gap-8">
                        <div class="md:w-1/2">
                            <h3 class="text-2xl font-semibold text-y-primary mb-4">設立の理念と背景</h3>
                            <p class="mb-4">
                                壮大な理念を述べると「異なるキャリアを歩んできた人たちの繋がりが、価値観の広がりに繋がるのではないか」という想いから当会は設立されました。
                            </p>
                            <p>
                                しかし、根底にあるのは「学士編入生は様々な経験者が集まっていて面白い。学年を超えた縦横の繋がりを築けば、より刺激的な学生生活を送れるはずだ」という、シンプルでカジュアルな期待です。
                            </p>
                        </div>
                        <div class="md:w-1/2 scattered-image-card rounded-lg overflow-hidden">
                            <!-- 画像1を散りばめる (images/画像(1).jpg) -->
                            <img src="images/画像(1).jpg" alt="多様なキャリアを持つ学生たちの様子" onerror="this.onerror=null; this.src='https://placehold.co/800x500/1f334a/ffffff?text=Image+1+PlaceHolder';" loading="lazy">
                        </div>
                    </div>

                    <!-- 2つ目の画像とテキストの対比 -->
                    <div class="flex flex-col md:flex-row-reverse items-start gap-8 pt-8 border-t border-gray-100">
                        <div class="md:w-1/2">
                            <h3 class="text-2xl font-semibold text-y-primary mb-4">会の役割と発信</h3>
                            <p class="mb-4">
                                私たちの活動は、単なる交流にとどまりません。学内の勉強会、キャリアイベントの企画、地域医療への貢献など、多様な経験値を活かした独自の活動を展開しています。
                            </p>
                            <p>
                                このウェブサイトでは、私たちが日々感じている「学士編入の魅力」や、多様な仲間との学びの深さを、皆様と共有できればと考えております。
                            </p>
                        </div>
                        <div class="md:w-1/2 scattered-image-card rounded-lg overflow-hidden">
                            <!-- 画像2を散りばめる (images/画像(2).jpg) -->
                            <img src="images/画像(2).jpg" alt="勉強会の風景または協調性のイメージ" onerror="this.onerror=null; this.src='https://placehold.co/800x500/1f334a/ffffff?text=Image+2+PlaceHolder';" loading="lazy">
                        </div>
                    </div>
                </div>
                
                <!-- 連絡先とリンク -->
                <div class="mt-10 p-6 bg-y-background rounded-lg shadow-inner border border-gray-200">
                    <h3 class="text-xl font-semibold text-y-text mb-4"><i class="fas fa-link mr-2 text-y-accent"></i>関連情報</h3>
                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <p class="font-medium text-y-text mb-1">E-mail: (連絡先)</p>
                            <p class="text-sm text-red-600 font-semibold mt-1 p-2 bg-red-50 rounded-md border border-red-200">
                                <i class="fas fa-exclamation-triangle mr-1"></i>学士編入学試験に関する質問・相談は一切受け付けておりません
                            </p>
                        </div>
                        <div>
                            <p class="font-medium text-y-text mb-1">公式リンク:</p>
                            <ul class="list-disc ml-5 text-y-accent">
                                <li><a href="http://www.med.yamaguchi-u.ac.jp/" target="_blank" class="hover:text-y-primary transition underline">山口大学医学部・医学系研究科</a></li>
                                <li><a href="https://ja.wikipedia.org/wiki/%E9%95%B7%E5%B7%9E%E4%BA%94%E5%82%91" target="_blank" class="hover:text-y-primary transition underline">長州五傑（長州ファイブ）</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        <!-- 2. 記事セクション (テクスチャ適用 + タイトル透かし) -->
        <section id="articles" class="section-padding textured-section border-b border-gray-200">
            <div class="content-layer">
                <div class="section-title" data-title-en="NEWS/BLOG">
                    <h2 class="text-3xl font-bold text-y-text border-l-4 border-y-accent pl-4">
                        <i class="fas fa-feather-alt text-y-accent mr-2"></i>記事 / お知らせ
                    </h2>
                </div>
                
                <p class="mb-8 text-gray-600 mt-8">メンバーによるコラム、学士編入の体験談、および最新の活動記録を掲載しています。</p>
                <ul class="space-y-6" id="article-list">
                    <!-- 記事はarticles.jsのデータを元にJavaScriptでここに挿入されます -->
                </ul>
            </div>
        </section>

        <!-- 3. アクセスセクション (Google Map実装) -->
        <section id="access" class="section-padding bg-gray-50 rounded-b-xl">
            <div class="section-title" data-title-en="ACCESS">
                <h2 class="text-3xl font-bold text-y-text border-l-4 border-y-accent pl-4">
                    <i class="fas fa-map-marker-alt text-y-accent mr-2"></i>アクセス
                </h2>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-xl border border-gray-200 mt-8">
                <p class="text-xl font-semibold mb-2 text-y-text">山口大学医学部</p>
                <p class="text-gray-600 mb-4">Yamaguchi University Faculty of Medicine and Health Sciences</p>
                <address class="not-italic text-lg text-gray-800">
                    〒755-8505<br>
                    山口県宇部市南小串1-1-1
                </address>
                <a href="https://www.google.com/maps?q=山口県宇部市南小串1-1-1" target="_blank" class="inline-block mt-4 text-y-accent font-semibold hover:underline transition">
                    <i class="fas fa-map-marked-alt mr-1"></i> Googleマップで確認する
                </a>
                
                <!-- Google Maps埋め込みエリア -->
                <div class="mt-6 map-container">
                    <iframe 
                        src="https://maps.google.com/maps?q=山口県宇部市南小串1-1-1&z=15&output=embed" 
                        allowfullscreen="" 
                        loading="lazy" 
                        referrerpolicy="no-referrer-when-downgrade">
                    </iframe>
                </div>
            </div>
            
            <!-- 最後に画像を2つ散りばめる -->
            <div class="mt-10 grid grid-cols-2 gap-4">
                <div class="scattered-image-card rounded-lg overflow-hidden">
                    <!-- 画像4を使用 (images/画像(4).jpg) -->
                    <img src="images/画像(4).jpg" alt="交流の様子" onerror="this.onerror=null; this.src='https://placehold.co/400x250/1f334a/ffffff?text=Image+4';" loading="lazy">
                </div>
                <div class="scattered-image-card rounded-lg overflow-hidden">
                    <!-- 画像5を使用 (images/画像(5).jpg) -->
                    <img src="images/画像(5).jpg" alt="地域活動の様子" onerror="this.onerror=null; this.src='https://placehold.co/400x250/1f334a/ffffff?text=Image+5';" loading="lazy">
                </div>
            </div>
        </section>
    </main>

    <!-- フッター -->
    <footer class="bg-y-primary py-8 mt-12">
        <div class="text-center text-gray-400 max-w-6xl mx-auto px-4">
            <p>&copy; 2022 山口大学医学部医学科学士編入生有志の会. All Rights Reserved.</p>
        </div>
    </footer>

    <!-- JavaScriptファイルは<body>の最後に配置 -->
    <script src="articles.js"></script>
    
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // --- 記事の動的生成 (articles.jsのデータを使用) ---
            const articleList = document.getElementById('article-list');
            
            if (typeof articles !== 'undefined' && Array.isArray(articles)) {
                // 日付で降順にソート（最新のものが上に来るように）
                articles.sort((a, b) => new Date(b.date.replace(/\./g, '/')) - new Date(a.date.replace(/\./g, '/')));

                articles.forEach(article => {
                    const li = document.createElement('li');
                    li.className = 'bg-white p-5 rounded-xl shadow-md border-l-4 border-y-accent hover:shadow-lg transition duration-300 transform hover:scale-[1.01]';
                    
                    // 記事全体をリンク化
                    const link = document.createElement('a');
                    link.href = article.link || '#'; // リンクがなければ#にフォールバック
                    link.className = 'block hover:text-y-accent article-link-container'; 
                    
                    link.innerHTML = `
                        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-1">
                            <h3 class="text-xl font-bold text-y-text mb-1 md:mb-0">${article.title}</h3>
                            <p class="text-sm font-semibold text-gray-500 md:text-right">${article.date}</p>
                        </div>
                        <p class="text-gray-700 text-base">${article.summary}</p>
                    `;
                    li.appendChild(link);
                    articleList.appendChild(li);
                });
            } else {
                // articles.jsが読み込まれていないか、データがない場合のメッセージ
                const li = document.createElement('li');
                li.className = 'text-center text-gray-500 p-8';
                li.textContent = '記事データ（articles.js）の読み込みに失敗しました。ファイルが正しく配置されているか確認してください。';
                articleList.appendChild(li);
            }
        });
    </script>
</body>
</html>
