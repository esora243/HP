<!DOCTYPE html>
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
                        'y-primary': '#1f334a', // より濃いネイビー (メインカラー)
                        'y-accent': '#e74c3c',  // 情熱的な赤系 (アクセント)
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
        /* カスタムスタイル */
        .section-padding {
            padding: 4rem 1.5rem;
        }
        @media (min-width: 768px) {
            .section-padding {
                padding: 6rem 3rem;
            }
        }
        /* テキストの背景に薄いテクスチャ/画像を適用するためのクラス */
        .textured-section {
            background-color: #ffffff; /* ベースの背景色 */
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
            /* 薄いテクスチャのPlaceholder画像 */
            background-image: url('https://placehold.co/1000x1000/f0f4f7/d1d5db?text=Subtle+Texture'); 
            background-repeat: repeat;
            opacity: 0.15; /* 透過度を調整 */
            z-index: 0;
            pointer-events: none; /* テキストの選択を邪魔しないように */
        }

        /* ヒーローセクションの背景をよりドラマチックに */
        #hero {
            /* 背景画像に濃いネイビーと透明のグラデーションをオーバーレイ */
            background-image: linear-gradient(to bottom, rgba(31, 51, 74, 0.7), rgba(31, 51, 74, 0.7)), url('https://placehold.co/1500x450/2c3e50/ffffff?text=YAMAGUCHI+U+MEDICINE+ENTRANCE+BG');
            background-size: cover;
            background-position: center center;
            transition: background-image 0.5s ease;
        }

        /* セクションコンテンツをテクスチャの上に配置 */
        .content-layer {
            position: relative;
            z-index: 10;
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
            <!-- ナビゲーションメニュー (整理済) -->
            <nav class="mt-3 md:mt-0" id="main-nav">
                <ul class="flex space-x-4">
                    <li><a href="#about" class="px-3 py-2 rounded-lg hover:bg-y-accent transition duration-300 flex items-center text-sm font-semibold"><i class="fas fa-home mr-1"></i>ホーム</a></li>
                    <li><a href="#members" class="px-3 py-2 rounded-lg hover:bg-y-accent transition duration-300 flex items-center text-sm font-semibold"><i class="fas fa-users mr-1"></i>メンバー</a></li>
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
                異なるキャリアが、未来を拓く
            </h2>
            <p class="text-xl md:text-2xl text-gray-200 italic font-medium drop-shadow-md">
                “おもしろきこともなき世を面白く<br>すみなしものは心なりけり”
            </p>
        </div>
    </section>

    <main class="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl -mt-16 relative z-10">
        
        <!-- 1. ホーム/紹介セクション (テクスチャ適用) -->
        <section id="about" class="section-padding textured-section rounded-t-xl border-b border-gray-200">
            <div class="content-layer">
                <h2 class="text-3xl font-bold text-y-text mb-8 border-l-4 border-y-accent pl-4">
                    <i class="fas fa-graduation-cap text-y-accent mr-2"></i>有志の会について
                </h2>
                <div class="space-y-6 text-lg text-gray-700">
                    <p>
                        当会は、“異なるキャリアを歩んできた人たちの繋がりが価値観の広がりに繋がるのではないか”という想いから設立されました。大それたことをいうとこのような理念ですが、実際は「学士編入生って色々な人がいるから、縦横の繋がりを作ったらきっと面白いよね？」という、よりカジュアルな気持ちでスタートしています。
                    </p>
                    <p>
                        このウェブサイトを通じて、私たち有志の会が実際に感じている「学士編入の面白さ」や、多様なバックグラウンドを持つ仲間との学びの深さを少しでも共有できたら幸いです。
                    </p>
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
        
        <!-- 2. 記事セクション (activitiesの内容を統合し、全てを動的ロード) (テクスチャ適用) -->
        <section id="articles" class="section-padding textured-section border-b border-gray-200">
            <div class="content-layer">
                <h2 class="text-3xl font-bold text-y-text mb-8 border-l-4 border-y-accent pl-4">
                    <i class="fas fa-feather-alt text-y-accent mr-2"></i>記事 / お知らせ
                </h2>
                <p class="mb-8 text-gray-600">メンバーによるコラム、学士編入の体験談、および最新の活動記録を掲載しています。</p>
                <ul class="space-y-6" id="article-list">
                    <!-- 記事はarticles.jsのデータを元にJavaScriptでここに挿入されます -->
                </ul>
            </div>
        </section>

        <!-- 3. メンバーセクション (仮) -->
        <section id="members" class="section-padding bg-gray-50 border-b border-gray-200">
            <h2 class="text-3xl font-bold text-y-text mb-8 border-l-4 border-y-accent pl-4">
                <i class="fas fa-users text-y-accent mr-2"></i>メンバー
            </h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <!-- メンバーカードのプレースホルダー -->
                <div class="bg-white p-6 rounded-lg shadow-md text-center">
                    <img src="https://placehold.co/100x100/3498db/ffffff?text=M.A" alt="メンバーA" class="rounded-full w-24 h-24 mx-auto mb-4 border-4 border-y-accent">
                    <h3 class="text-xl font-bold text-y-text">メンバー A</h3>
                    <p class="text-gray-600">所属学年: 4年生</p>
                    <p class="text-sm text-gray-500 mt-2">（前職：ITエンジニア）</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-md text-center">
                    <img src="https://placehold.co/100x100/3498db/ffffff?text=M.B" alt="メンバーB" class="rounded-full w-24 h-24 mx-auto mb-4 border-4 border-y-accent">
                    <h3 class="text-xl font-bold text-y-text">メンバー B</h3>
                    <p class="text-gray-600">所属学年: 2年生</p>
                    <p class="text-sm text-gray-500 mt-2">（前職：教師）</p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow-md text-center">
                    <img src="https://placehold.co/100x100/3498db/ffffff?text=M.C" alt="メンバーC" class="rounded-full w-24 h-24 mx-auto mb-4 border-4 border-y-accent">
                    <h3 class="text-xl font-bold text-y-text">メンバー C</h3>
                    <p class="text-gray-600">所属学年: 6年生</p>
                    <p class="text-sm text-gray-500 mt-2">（前職：製薬研究者）</p>
                </div>
            </div>
            <p class="text-center text-gray-600 mt-8">※メンバー構成は毎年変動します。</p>
        </section>


        <!-- 4. アクセスセクション -->
        <section id="access" class="section-padding bg-gray-50 rounded-b-xl">
            <h2 class="text-3xl font-bold text-y-text mb-8 border-l-4 border-y-accent pl-4">
                <i class="fas fa-map-marker-alt text-y-accent mr-2"></i>アクセス
            </h2>
            <div class="bg-white p-6 rounded-lg shadow-xl border border-gray-200">
                <p class="text-xl font-semibold mb-2 text-y-text">山口大学医学部</p>
                <p class="text-gray-600 mb-4">Yamaguchi University Faculty of Medicine and Health Sciences</p>
                <address class="not-italic text-lg text-gray-800">
                    〒755-8505<br>
                    山口県宇部市南小串1-1-1
                </address>
                <a href="https://www.google.com/maps?q=山口県宇部市南小串1-1-1" target="_blank" class="inline-block mt-4 text-y-accent font-semibold hover:underline transition">
                    <i class="fas fa-map-marked-alt mr-1"></i> Googleマップで確認する
                </a>
                <!-- 地図のプレースホルダー -->
                <div class="mt-6 w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 overflow-hidden">
                    <img src="https://placehold.co/800x400/ccd9e6/34495e?text=Google+Map+Embed" alt="Google Map Placeholder" class="w-full h-full object-cover">
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
    <!-- 記事データファイル -->
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
                    link.className = 'block hover:text-y-accent'; 
                    
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
