export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h5 className="text-xl font-bold mb-6 border-b border-gray-700 pb-2 inline-block">アクセス</h5>
          <div className="text-gray-300 leading-relaxed mb-8">
            山口大学医学部<br />
            Yamaguchi University Faculty of Medicine and Health Sciences<br /><br />
            〒755-8505<br />
            山口県宇部市南小串1-1-1
          </div>
          <div className="w-full rounded-xl overflow-hidden shadow-lg">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3309.3161426460915!2d131.2464705153612!3d33.9587128806315!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x354380db53dd7787%3A0x20034d6f9d448883!2z5bGx5Y-j5aSn5a2m5Yy75a2m6YOo44O75aSn5a2m6Zmi!5e0!3m2!1sja!2sjp!4v1644318282005!5m2!1sja!2sjp"  
              width="100%" 
              height="400" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy"
              title="山口大学医学部 マップ"
            ></iframe>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">ホーム</a>
            <a href="#activities" className="text-gray-400 hover:text-white transition-colors text-sm">活動記録</a>
            <a href="#members" className="text-gray-400 hover:text-white transition-colors text-sm">メンバー</a>
            <a href="#photos" className="text-gray-400 hover:text-white transition-colors text-sm">写真</a>
            <a href="#articles" className="text-gray-400 hover:text-white transition-colors text-sm">記事</a>
          </div>
          <p className="text-gray-500 text-sm text-center">
            &copy; 2022 山口大学医学部医学科学士編入生有志の会.
          </p>
        </div>
      </div>
    </footer>
  );
}
