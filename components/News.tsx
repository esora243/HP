const newsItems = [
  {
    date: '2022.04.11',
    content: '主に２年生の女子生徒を対象に、キャリアを考える会を開催しました。',
    link: '#achievement-6'
  },
  {
    date: '2022.03.26',
    content: '令和3年度卒業の堤春菜が、令和３年度学長表彰の（学業成績優秀者の部）として推薦され、審議の結果、表彰者に決定されました。',
    link: '#achievement-5'
  },
  {
    date: '2022.02.26',
    content: '山口大学医学部学士編入生有志の会のホームページを開設しました。',
  },
  {
    date: '2022.02.09',
    content: '学年の壁を超えて、学士編入生の上級生が2年生のテュートリアル実験に被験者として参加してくれました。',
    link: '#achievement-4'
  },
  {
    date: '2022.01.11',
    content: '編入2年生の才川優輔が第2回AI勉強会を開催しました。',
    link: '#achievement-3'
  },
  {
    date: '2021.12.18',
    content: '令和4年度学士編入学試験合格者への説明会を行いました。',
    link: '#achievement-2'
  },
  {
    date: '2021.12.17',
    content: '編入6年生の追いコンを行いました。',
    link: '#photo-1'
  },
  {
    date: '2021.12.09',
    content: '編入2年生の才川優輔が第1回AI勉強会を開催しました。',
    link: '#achievement-1'
  }
];

export default function News() {
  return (
    <section id="news" className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 border-b-2 border-blue-700 pb-2 inline-block">
          お知らせ
        </h2>
        
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {newsItems.map((item, index) => (
              <li key={index} className="p-5 hover:bg-blue-50/50 transition-colors group">
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                  <time className="text-sm font-bold text-blue-700 whitespace-nowrap sm:w-28">
                    {item.date}
                  </time>
                  {item.link ? (
                    <a href={item.link} className="text-gray-800 hover:text-blue-700 hover:underline leading-relaxed flex-1">
                      {item.content}
                    </a>
                  ) : (
                    <span className="text-gray-800 leading-relaxed flex-1">{item.content}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
