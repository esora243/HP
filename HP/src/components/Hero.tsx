export default function Hero() {
  return (
    <section className="pt-16 bg-white relative overflow-hidden">
      <div className="w-full">
        <img 
          src="https://square.umin.ac.jp/yamaguchi-gakush/img/yamadai2.jpg" 
          alt="yamadai" 
          className="w-full h-auto max-h-[600px] object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 -mt-16 sm:-mt-24 pb-12">
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl inline-block border border-gray-100">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold mb-4 tracking-wider">
            Yamaguchi University
          </span>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight tracking-tight">
            山口大学医学部医学科<br />
            <span className="text-blue-700 mt-2 inline-block">学士編入生有志の会</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            異なるキャリアを歩んできた人たちの繋がりが、<br className="hidden sm:block" />
            新たな価値観の広がりへ。
          </p>
        </div>
      </div>
    </section>
  );
}
