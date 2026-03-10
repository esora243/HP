import { ExternalLink } from 'lucide-react';

export default function About() {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 border-b-2 border-blue-700 pb-2 inline-block">
          山口大学医学部医学科 学士編入生有志の会ついて
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8">
            <div className="bg-gray-50 p-6 md:p-10 rounded-xl border border-gray-100 mb-8 shadow-sm">
              <blockquote className="text-xl md:text-2xl font-serif text-gray-800 mb-8 text-center leading-relaxed">
                「おもしろきこともなき世を面白く<br />
                <span className="inline-block mt-2">すみなしものは心なりけり」</span>
              </blockquote>
              
              <div className="space-y-5 text-gray-700 leading-relaxed text-lg mb-8">
                <p>
                  “異なるキャリアを歩んできた人たちの繋がりが価値観の広がりに繋がるのではないか”という想いから設立されました。
                </p>
                <p>
                  大それたことをいうとこんな感じですが、“学士っていろんな人いるし、縦の繋がりをつくったら面白いんじゃない？”ってぐらいの気持ちで始めました。
                </p>
                <p>
                  このHPでは、私たちが感じた“学士編入の面白さ”を少しでも共有できていけたらなと思っています。
                </p>
              </div>

              <div className="flex items-center gap-2 mb-6 text-lg text-gray-700">
                <span className="font-semibold">E-mail:</span>
                <img 
                  src="https://square.umin.ac.jp/yamaguchi-gakush/img/info/mailaddress.png" 
                  alt="mailaddress" 
                  className="h-4 w-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r-lg">
              <p className="text-red-700 font-medium">
                ※学士編入学試験に関する質問・相談は一切受け付けておりません
              </p>
            </div>

            <div className="flex items-center">
              <a 
                href="http://www.med.yamaguchi-u.ac.jp" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-700 hover:text-blue-900 font-medium transition-colors group"
              >
                Link: 山口大学医学部・医学系研究科
                <ExternalLink className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-4">
            <figure className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
              <img 
                src="https://square.umin.ac.jp/yamaguchi-gakush/img/choshufive.jpg" 
                alt="Choshu_Five" 
                className="w-full h-auto rounded-lg mb-4"
                referrerPolicy="no-referrer"
              />
              <figcaption className="text-gray-600 font-medium text-center">
                長州五傑（長州ファイブ）
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
