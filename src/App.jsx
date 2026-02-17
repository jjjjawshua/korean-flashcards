import React, { useState, useEffect } from 'react';
import { RotateCcw, ChevronLeft, ChevronRight, Volume2, Star, Shuffle, BookOpen, Trophy, Target, CheckCircle, X, Search, Filter } from 'lucide-react';

const KoreanFlashcards = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('greetings');
  const [knownCards, setKnownCards] = useState(new Set());
  const [learningCards, setLearningCards] = useState(new Set());
  const [shuffled, setShuffled] = useState(false);
  const [cardOrder, setCardOrder] = useState([]);
  const [streak, setStreak] = useState(0);
  const [totalReviewed, setTotalReviewed] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAllCards, setShowAllCards] = useState(false);
  const [mode, setMode] = useState('flashcard'); // 'flashcard', 'typing', or 'spaced'
  const [typingInput, setTypingInput] = useState('');
  const [typingResult, setTypingResult] = useState(null); // 'correct', 'incorrect', null
  const [typingStats, setTypingStats] = useState({ correct: 0, incorrect: 0, attempted: 0 });
  const [showHint, setShowHint] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState(false);
  
  // Spaced Repetition State
  const [spacedRepData, setSpacedRepData] = useState({}); // { cardId: { interval: 1, easeFactor: 2.5, nextReview: Date, repetitions: 0 } }
  const [spacedQueue, setSpacedQueue] = useState([]);
  const [spacedCurrentIndex, setSpacedCurrentIndex] = useState(0);
  const [spacedShowAnswer, setSpacedShowAnswer] = useState(false);
  const [todayReviewed, setTodayReviewed] = useState(0);
  const [spacedSessionCards, setSpacedSessionCards] = useState([]);

  const categories = {
    greetings: {
      name: 'Greetings & Basics',
      icon: '👋',
      cards: [
        { korean: '안녕하세요', romanization: 'annyeonghaseyo', english: 'Hello (formal)' },
        { korean: '안녕', romanization: 'annyeong', english: 'Hi (informal)' },
        { korean: '감사합니다', romanization: 'gamsahamnida', english: 'Thank you (formal)' },
        { korean: '고마워요', romanization: 'gomawoyo', english: 'Thanks (polite)' },
        { korean: '고마워', romanization: 'gomawo', english: 'Thanks (informal)' },
        { korean: '천만에요', romanization: 'cheonmaneyo', english: "You're welcome" },
        { korean: '죄송합니다', romanization: 'joesonghamnida', english: "I'm sorry (formal)" },
        { korean: '미안해요', romanization: 'mianhaeyo', english: 'Sorry (polite)' },
        { korean: '실례합니다', romanization: 'sillyehamnida', english: 'Excuse me' },
        { korean: '안녕히 가세요', romanization: 'annyeonghi gaseyo', english: 'Goodbye (to one leaving)' },
        { korean: '안녕히 계세요', romanization: 'annyeonghi gyeseyo', english: 'Goodbye (to one staying)' },
        { korean: '잘 가', romanization: 'jal ga', english: 'Bye (informal)' },
        { korean: '네', romanization: 'ne', english: 'Yes' },
        { korean: '아니요', romanization: 'aniyo', english: 'No' },
        { korean: '좋아요', romanization: 'joayo', english: 'Good / I like it' },
        { korean: '싫어요', romanization: 'sireoyo', english: "I don't like it" },
        { korean: '괜찮아요', romanization: 'gwaenchanayo', english: "It's okay" },
        { korean: '잠시만요', romanization: 'jamsimanyo', english: 'Just a moment' },
        { korean: '여보세요', romanization: 'yeoboseyo', english: 'Hello (phone)' },
        { korean: '만나서 반갑습니다', romanization: 'mannaseo bangapseumnida', english: 'Nice to meet you' },
      ]
    },
    pronouns: {
      name: 'Pronouns & People',
      icon: '👤',
      cards: [
        { korean: '저', romanization: 'jeo', english: 'I (formal)' },
        { korean: '나', romanization: 'na', english: 'I (informal)' },
        { korean: '저희', romanization: 'jeohui', english: 'We (formal)' },
        { korean: '우리', romanization: 'uri', english: 'We / Our' },
        { korean: '너', romanization: 'neo', english: 'You (informal)' },
        { korean: '당신', romanization: 'dangsin', english: 'You (formal)' },
        { korean: '그', romanization: 'geu', english: 'He / That' },
        { korean: '그녀', romanization: 'geunyeo', english: 'She' },
        { korean: '그들', romanization: 'geudeul', english: 'They' },
        { korean: '사람', romanization: 'saram', english: 'Person' },
        { korean: '남자', romanization: 'namja', english: 'Man' },
        { korean: '여자', romanization: 'yeoja', english: 'Woman' },
        { korean: '아이', romanization: 'ai', english: 'Child' },
        { korean: '아기', romanization: 'agi', english: 'Baby' },
        { korean: '친구', romanization: 'chingu', english: 'Friend' },
        { korean: '선생님', romanization: 'seonsaengnim', english: 'Teacher' },
        { korean: '학생', romanization: 'haksaeng', english: 'Student' },
        { korean: '의사', romanization: 'uisa', english: 'Doctor' },
        { korean: '경찰', romanization: 'gyeongchal', english: 'Police' },
        { korean: '손님', romanization: 'sonnim', english: 'Guest / Customer' },
      ]
    },
    family: {
      name: 'Family',
      icon: '👨‍👩‍👧‍👦',
      cards: [
        { korean: '가족', romanization: 'gajok', english: 'Family' },
        { korean: '부모님', romanization: 'bumonim', english: 'Parents' },
        { korean: '아버지', romanization: 'abeoji', english: 'Father' },
        { korean: '아빠', romanization: 'appa', english: 'Dad' },
        { korean: '어머니', romanization: 'eomeoni', english: 'Mother' },
        { korean: '엄마', romanization: 'eomma', english: 'Mom' },
        { korean: '형', romanization: 'hyeong', english: 'Older brother (male speaking)' },
        { korean: '오빠', romanization: 'oppa', english: 'Older brother (female speaking)' },
        { korean: '누나', romanization: 'nuna', english: 'Older sister (male speaking)' },
        { korean: '언니', romanization: 'eonni', english: 'Older sister (female speaking)' },
        { korean: '남동생', romanization: 'namdongsaeng', english: 'Younger brother' },
        { korean: '여동생', romanization: 'yeodongsaeng', english: 'Younger sister' },
        { korean: '할아버지', romanization: 'harabeoji', english: 'Grandfather' },
        { korean: '할머니', romanization: 'halmeoni', english: 'Grandmother' },
        { korean: '아들', romanization: 'adeul', english: 'Son' },
        { korean: '딸', romanization: 'ttal', english: 'Daughter' },
        { korean: '남편', romanization: 'nampyeon', english: 'Husband' },
        { korean: '아내', romanization: 'anae', english: 'Wife' },
        { korean: '삼촌', romanization: 'samchon', english: 'Uncle' },
        { korean: '이모', romanization: 'imo', english: 'Aunt (maternal)' },
      ]
    },
    numbers: {
      name: 'Numbers',
      icon: '🔢',
      cards: [
        { korean: '영/공', romanization: 'yeong/gong', english: 'Zero' },
        { korean: '일', romanization: 'il', english: 'One (Sino)' },
        { korean: '이', romanization: 'i', english: 'Two (Sino)' },
        { korean: '삼', romanization: 'sam', english: 'Three (Sino)' },
        { korean: '사', romanization: 'sa', english: 'Four (Sino)' },
        { korean: '오', romanization: 'o', english: 'Five (Sino)' },
        { korean: '육', romanization: 'yuk', english: 'Six (Sino)' },
        { korean: '칠', romanization: 'chil', english: 'Seven (Sino)' },
        { korean: '팔', romanization: 'pal', english: 'Eight (Sino)' },
        { korean: '구', romanization: 'gu', english: 'Nine (Sino)' },
        { korean: '십', romanization: 'sip', english: 'Ten (Sino)' },
        { korean: '백', romanization: 'baek', english: 'Hundred' },
        { korean: '천', romanization: 'cheon', english: 'Thousand' },
        { korean: '만', romanization: 'man', english: 'Ten thousand' },
        { korean: '하나', romanization: 'hana', english: 'One (Native)' },
        { korean: '둘', romanization: 'dul', english: 'Two (Native)' },
        { korean: '셋', romanization: 'set', english: 'Three (Native)' },
        { korean: '넷', romanization: 'net', english: 'Four (Native)' },
        { korean: '다섯', romanization: 'daseot', english: 'Five (Native)' },
        { korean: '여섯', romanization: 'yeoseot', english: 'Six (Native)' },
        { korean: '일곱', romanization: 'ilgop', english: 'Seven (Native)' },
        { korean: '여덟', romanization: 'yeodeol', english: 'Eight (Native)' },
        { korean: '아홉', romanization: 'ahop', english: 'Nine (Native)' },
        { korean: '열', romanization: 'yeol', english: 'Ten (Native)' },
        { korean: '첫 번째', romanization: 'cheot beonjjae', english: 'First' },
      ]
    },
    time: {
      name: 'Time & Days',
      icon: '🕐',
      cards: [
        { korean: '시간', romanization: 'sigan', english: 'Time / Hour' },
        { korean: '분', romanization: 'bun', english: 'Minute' },
        { korean: '초', romanization: 'cho', english: 'Second' },
        { korean: '오늘', romanization: 'oneul', english: 'Today' },
        { korean: '내일', romanization: 'naeil', english: 'Tomorrow' },
        { korean: '어제', romanization: 'eoje', english: 'Yesterday' },
        { korean: '모레', romanization: 'more', english: 'Day after tomorrow' },
        { korean: '지금', romanization: 'jigeum', english: 'Now' },
        { korean: '나중에', romanization: 'najunge', english: 'Later' },
        { korean: '아침', romanization: 'achim', english: 'Morning' },
        { korean: '점심', romanization: 'jeomsim', english: 'Lunch / Noon' },
        { korean: '저녁', romanization: 'jeonyeok', english: 'Evening' },
        { korean: '밤', romanization: 'bam', english: 'Night' },
        { korean: '월요일', romanization: 'woryoil', english: 'Monday' },
        { korean: '화요일', romanization: 'hwayoil', english: 'Tuesday' },
        { korean: '수요일', romanization: 'suyoil', english: 'Wednesday' },
        { korean: '목요일', romanization: 'mogyoil', english: 'Thursday' },
        { korean: '금요일', romanization: 'geumyoil', english: 'Friday' },
        { korean: '토요일', romanization: 'toyoil', english: 'Saturday' },
        { korean: '일요일', romanization: 'iryoil', english: 'Sunday' },
        { korean: '주', romanization: 'ju', english: 'Week' },
        { korean: '달/월', romanization: 'dal/wol', english: 'Month' },
        { korean: '년', romanization: 'nyeon', english: 'Year' },
        { korean: '매일', romanization: 'maeil', english: 'Every day' },
        { korean: '항상', romanization: 'hangsang', english: 'Always' },
      ]
    },
    food: {
      name: 'Food & Drinks',
      icon: '🍜',
      cards: [
        { korean: '음식', romanization: 'eumsik', english: 'Food' },
        { korean: '밥', romanization: 'bap', english: 'Rice / Meal' },
        { korean: '빵', romanization: 'ppang', english: 'Bread' },
        { korean: '국', romanization: 'guk', english: 'Soup' },
        { korean: '찌개', romanization: 'jjigae', english: 'Stew' },
        { korean: '김치', romanization: 'gimchi', english: 'Kimchi' },
        { korean: '고기', romanization: 'gogi', english: 'Meat' },
        { korean: '소고기', romanization: 'sogogi', english: 'Beef' },
        { korean: '돼지고기', romanization: 'dwaejigogi', english: 'Pork' },
        { korean: '닭고기', romanization: 'dakgogi', english: 'Chicken' },
        { korean: '생선', romanization: 'saengseon', english: 'Fish' },
        { korean: '야채', romanization: 'yachae', english: 'Vegetables' },
        { korean: '과일', romanization: 'gwail', english: 'Fruit' },
        { korean: '사과', romanization: 'sagwa', english: 'Apple' },
        { korean: '바나나', romanization: 'banana', english: 'Banana' },
        { korean: '라면', romanization: 'ramyeon', english: 'Ramen' },
        { korean: '비빔밥', romanization: 'bibimbap', english: 'Mixed rice' },
        { korean: '불고기', romanization: 'bulgogi', english: 'Bulgogi' },
        { korean: '삼겹살', romanization: 'samgyeopsal', english: 'Pork belly' },
        { korean: '떡볶이', romanization: 'tteokbokki', english: 'Spicy rice cakes' },
        { korean: '만두', romanization: 'mandu', english: 'Dumplings' },
        { korean: '김밥', romanization: 'gimbap', english: 'Seaweed rice roll' },
        { korean: '치킨', romanization: 'chikin', english: 'Fried chicken' },
        { korean: '피자', romanization: 'pija', english: 'Pizza' },
        { korean: '계란', romanization: 'gyeran', english: 'Egg' },
      ]
    },
    drinks: {
      name: 'Beverages',
      icon: '🥤',
      cards: [
        { korean: '물', romanization: 'mul', english: 'Water' },
        { korean: '차', romanization: 'cha', english: 'Tea' },
        { korean: '커피', romanization: 'keopi', english: 'Coffee' },
        { korean: '우유', romanization: 'uyu', english: 'Milk' },
        { korean: '주스', romanization: 'juseu', english: 'Juice' },
        { korean: '맥주', romanization: 'maekju', english: 'Beer' },
        { korean: '소주', romanization: 'soju', english: 'Soju' },
        { korean: '와인', romanization: 'wain', english: 'Wine' },
        { korean: '콜라', romanization: 'kolla', english: 'Cola' },
        { korean: '술', romanization: 'sul', english: 'Alcohol' },
      ]
    },
    places: {
      name: 'Places',
      icon: '🏢',
      cards: [
        { korean: '집', romanization: 'jip', english: 'House / Home' },
        { korean: '학교', romanization: 'hakgyo', english: 'School' },
        { korean: '회사', romanization: 'hoesa', english: 'Company' },
        { korean: '병원', romanization: 'byeongwon', english: 'Hospital' },
        { korean: '은행', romanization: 'eunhaeng', english: 'Bank' },
        { korean: '공항', romanization: 'gonghang', english: 'Airport' },
        { korean: '역', romanization: 'yeok', english: 'Station' },
        { korean: '호텔', romanization: 'hotel', english: 'Hotel' },
        { korean: '식당', romanization: 'sikdang', english: 'Restaurant' },
        { korean: '카페', romanization: 'kape', english: 'Cafe' },
        { korean: '가게', romanization: 'gage', english: 'Store / Shop' },
        { korean: '마트', romanization: 'mateu', english: 'Mart / Supermarket' },
        { korean: '편의점', romanization: 'pyeonuijeom', english: 'Convenience store' },
        { korean: '공원', romanization: 'gongwon', english: 'Park' },
        { korean: '화장실', romanization: 'hwajangsil', english: 'Bathroom' },
        { korean: '방', romanization: 'bang', english: 'Room' },
        { korean: '거리', romanization: 'geori', english: 'Street' },
        { korean: '시장', romanization: 'sijang', english: 'Market' },
        { korean: '영화관', romanization: 'yeonghwagwan', english: 'Movie theater' },
        { korean: '도서관', romanization: 'doseogwan', english: 'Library' },
      ]
    },
    verbs: {
      name: 'Common Verbs',
      icon: '🏃',
      cards: [
        { korean: '하다', romanization: 'hada', english: 'To do' },
        { korean: '가다', romanization: 'gada', english: 'To go' },
        { korean: '오다', romanization: 'oda', english: 'To come' },
        { korean: '보다', romanization: 'boda', english: 'To see / watch' },
        { korean: '먹다', romanization: 'meokda', english: 'To eat' },
        { korean: '마시다', romanization: 'masida', english: 'To drink' },
        { korean: '자다', romanization: 'jada', english: 'To sleep' },
        { korean: '일어나다', romanization: 'ireonada', english: 'To wake up' },
        { korean: '앉다', romanization: 'anda', english: 'To sit' },
        { korean: '서다', romanization: 'seoda', english: 'To stand' },
        { korean: '걷다', romanization: 'geotda', english: 'To walk' },
        { korean: '뛰다', romanization: 'ttwida', english: 'To run' },
        { korean: '말하다', romanization: 'malhada', english: 'To speak' },
        { korean: '듣다', romanization: 'deutda', english: 'To listen' },
        { korean: '읽다', romanization: 'ikda', english: 'To read' },
        { korean: '쓰다', romanization: 'sseuda', english: 'To write' },
        { korean: '배우다', romanization: 'baeuda', english: 'To learn' },
        { korean: '가르치다', romanization: 'gareuchida', english: 'To teach' },
        { korean: '알다', romanization: 'alda', english: 'To know' },
        { korean: '모르다', romanization: 'moreuda', english: 'To not know' },
        { korean: '생각하다', romanization: 'saenggakada', english: 'To think' },
        { korean: '사다', romanization: 'sada', english: 'To buy' },
        { korean: '팔다', romanization: 'palda', english: 'To sell' },
        { korean: '주다', romanization: 'juda', english: 'To give' },
        { korean: '받다', romanization: 'batda', english: 'To receive' },
        { korean: '만나다', romanization: 'mannada', english: 'To meet' },
        { korean: '사랑하다', romanization: 'saranghada', english: 'To love' },
        { korean: '좋아하다', romanization: 'joahada', english: 'To like' },
        { korean: '싫어하다', romanization: 'sireohada', english: 'To dislike' },
        { korean: '기다리다', romanization: 'gidarida', english: 'To wait' },
      ]
    },
    adjectives: {
      name: 'Adjectives',
      icon: '🎨',
      cards: [
        { korean: '좋다', romanization: 'jota', english: 'Good' },
        { korean: '나쁘다', romanization: 'nappeuda', english: 'Bad' },
        { korean: '크다', romanization: 'keuda', english: 'Big' },
        { korean: '작다', romanization: 'jakda', english: 'Small' },
        { korean: '많다', romanization: 'manta', english: 'Many / Much' },
        { korean: '적다', romanization: 'jeokda', english: 'Few / Little' },
        { korean: '새롭다', romanization: 'saeropda', english: 'New' },
        { korean: '오래되다', romanization: 'oraedoeda', english: 'Old (things)' },
        { korean: '젊다', romanization: 'jeomda', english: 'Young' },
        { korean: '빠르다', romanization: 'ppareuda', english: 'Fast' },
        { korean: '느리다', romanization: 'neurida', english: 'Slow' },
        { korean: '쉽다', romanization: 'swipda', english: 'Easy' },
        { korean: '어렵다', romanization: 'eoryeopda', english: 'Difficult' },
        { korean: '비싸다', romanization: 'bissada', english: 'Expensive' },
        { korean: '싸다', romanization: 'ssada', english: 'Cheap' },
        { korean: '맛있다', romanization: 'masitda', english: 'Delicious' },
        { korean: '맛없다', romanization: 'madeopda', english: 'Not tasty' },
        { korean: '덥다', romanization: 'deopda', english: 'Hot (weather)' },
        { korean: '춥다', romanization: 'chupda', english: 'Cold (weather)' },
        { korean: '예쁘다', romanization: 'yeppeuda', english: 'Pretty' },
        { korean: '멋있다', romanization: 'meositda', english: 'Cool / Handsome' },
        { korean: '행복하다', romanization: 'haengbokada', english: 'Happy' },
        { korean: '슬프다', romanization: 'seulpeuda', english: 'Sad' },
        { korean: '피곤하다', romanization: 'pigonhada', english: 'Tired' },
        { korean: '바쁘다', romanization: 'bappeuda', english: 'Busy' },
      ]
    },
    colors: {
      name: 'Colors',
      icon: '🌈',
      cards: [
        { korean: '색', romanization: 'saek', english: 'Color' },
        { korean: '빨간색', romanization: 'ppalgansaek', english: 'Red' },
        { korean: '주황색', romanization: 'juhwangsaek', english: 'Orange' },
        { korean: '노란색', romanization: 'noransaek', english: 'Yellow' },
        { korean: '초록색', romanization: 'choroksaek', english: 'Green' },
        { korean: '파란색', romanization: 'paransaek', english: 'Blue' },
        { korean: '보라색', romanization: 'borasaek', english: 'Purple' },
        { korean: '분홍색', romanization: 'bunhongsaek', english: 'Pink' },
        { korean: '갈색', romanization: 'galsaek', english: 'Brown' },
        { korean: '검은색', romanization: 'geomeunsaek', english: 'Black' },
        { korean: '하얀색', romanization: 'hayansaek', english: 'White' },
        { korean: '회색', romanization: 'hoesaek', english: 'Gray' },
      ]
    },
    questions: {
      name: 'Question Words',
      icon: '❓',
      cards: [
        { korean: '뭐/무엇', romanization: 'mwo/mueot', english: 'What' },
        { korean: '누구', romanization: 'nugu', english: 'Who' },
        { korean: '어디', romanization: 'eodi', english: 'Where' },
        { korean: '언제', romanization: 'eonje', english: 'When' },
        { korean: '왜', romanization: 'wae', english: 'Why' },
        { korean: '어떻게', romanization: 'eotteoke', english: 'How' },
        { korean: '얼마', romanization: 'eolma', english: 'How much' },
        { korean: '몇', romanization: 'myeot', english: 'How many' },
        { korean: '어느', romanization: 'eoneu', english: 'Which' },
        { korean: '무슨', romanization: 'museun', english: 'What kind of' },
      ]
    },
    phrases: {
      name: 'Essential Phrases',
      icon: '💬',
      cards: [
        { korean: '이름이 뭐예요?', romanization: 'ireumi mwoyeyo?', english: "What's your name?" },
        { korean: '제 이름은...입니다', romanization: 'je ireumeun...imnida', english: 'My name is...' },
        { korean: '어디에서 왔어요?', romanization: 'eodieseo wasseoyo?', english: 'Where are you from?' },
        { korean: '한국어 공부해요', romanization: 'hangugeo gongbuhaeyo', english: "I'm studying Korean" },
        { korean: '이해해요', romanization: 'ihaehaeyo', english: 'I understand' },
        { korean: '이해 못 해요', romanization: 'ihae mot haeyo', english: "I don't understand" },
        { korean: '다시 말해 주세요', romanization: 'dasi malhae juseyo', english: 'Please say it again' },
        { korean: '천천히 말해 주세요', romanization: 'cheoncheonhi malhae juseyo', english: 'Please speak slowly' },
        { korean: '이거 뭐예요?', romanization: 'igeo mwoyeyo?', english: 'What is this?' },
        { korean: '얼마예요?', romanization: 'eolmayeyo?', english: 'How much is it?' },
        { korean: '어디예요?', romanization: 'eodiyeyo?', english: 'Where is it?' },
        { korean: '화장실 어디예요?', romanization: 'hwajangsil eodiyeyo?', english: 'Where is the bathroom?' },
        { korean: '도와주세요', romanization: 'dowajuseyo', english: 'Please help me' },
        { korean: '물 주세요', romanization: 'mul juseyo', english: 'Water please' },
        { korean: '계산해 주세요', romanization: 'gyesanhae juseyo', english: 'Bill please' },
        { korean: '맛있어요', romanization: 'masisseoyo', english: "It's delicious" },
        { korean: '배고파요', romanization: 'baegopayo', english: "I'm hungry" },
        { korean: '목말라요', romanization: 'mongmallayo', english: "I'm thirsty" },
        { korean: '피곤해요', romanization: 'pigonhaeyo', english: "I'm tired" },
        { korean: '아파요', romanization: 'apayo', english: 'It hurts / I\'m sick' },
        { korean: '잘 먹겠습니다', romanization: 'jal meokgesseumnida', english: 'Thanks for the food (before)' },
        { korean: '잘 먹었습니다', romanization: 'jal meogeosseumnida', english: 'Thanks for the food (after)' },
        { korean: '축하해요', romanization: 'chukahaeyo', english: 'Congratulations' },
        { korean: '생일 축하해요', romanization: 'saengil chukahaeyo', english: 'Happy birthday' },
        { korean: '사랑해요', romanization: 'saranghaeyo', english: 'I love you' },
      ]
    },
    travel: {
      name: 'Travel & Transport',
      icon: '✈️',
      cards: [
        { korean: '여행', romanization: 'yeohaeng', english: 'Travel' },
        { korean: '비행기', romanization: 'bihaenggi', english: 'Airplane' },
        { korean: '기차', romanization: 'gicha', english: 'Train' },
        { korean: '버스', romanization: 'beoseu', english: 'Bus' },
        { korean: '지하철', romanization: 'jihacheol', english: 'Subway' },
        { korean: '택시', romanization: 'taeksi', english: 'Taxi' },
        { korean: '차', romanization: 'cha', english: 'Car' },
        { korean: '자전거', romanization: 'jajeongeo', english: 'Bicycle' },
        { korean: '표', romanization: 'pyo', english: 'Ticket' },
        { korean: '여권', romanization: 'yeogwon', english: 'Passport' },
        { korean: '짐', romanization: 'jim', english: 'Luggage' },
        { korean: '지도', romanization: 'jido', english: 'Map' },
        { korean: '왼쪽', romanization: 'oenjjok', english: 'Left' },
        { korean: '오른쪽', romanization: 'oreunjjok', english: 'Right' },
        { korean: '직진', romanization: 'jikjin', english: 'Straight' },
      ]
    },
    body: {
      name: 'Body Parts',
      icon: '🫀',
      cards: [
        { korean: '몸', romanization: 'mom', english: 'Body' },
        { korean: '머리', romanization: 'meori', english: 'Head / Hair' },
        { korean: '얼굴', romanization: 'eolgul', english: 'Face' },
        { korean: '눈', romanization: 'nun', english: 'Eye' },
        { korean: '코', romanization: 'ko', english: 'Nose' },
        { korean: '입', romanization: 'ip', english: 'Mouth' },
        { korean: '귀', romanization: 'gwi', english: 'Ear' },
        { korean: '손', romanization: 'son', english: 'Hand' },
        { korean: '발', romanization: 'bal', english: 'Foot' },
        { korean: '다리', romanization: 'dari', english: 'Leg' },
        { korean: '팔', romanization: 'pal', english: 'Arm' },
        { korean: '배', romanization: 'bae', english: 'Stomach' },
        { korean: '등', romanization: 'deung', english: 'Back' },
        { korean: '목', romanization: 'mok', english: 'Neck / Throat' },
        { korean: '마음', romanization: 'maeum', english: 'Heart / Mind' },
      ]
    },
    weather: {
      name: 'Weather & Nature',
      icon: '🌤️',
      cards: [
        { korean: '날씨', romanization: 'nalssi', english: 'Weather' },
        { korean: '비', romanization: 'bi', english: 'Rain' },
        { korean: '눈', romanization: 'nun', english: 'Snow' },
        { korean: '바람', romanization: 'baram', english: 'Wind' },
        { korean: '해/태양', romanization: 'hae/taeyang', english: 'Sun' },
        { korean: '달', romanization: 'dal', english: 'Moon' },
        { korean: '별', romanization: 'byeol', english: 'Star' },
        { korean: '하늘', romanization: 'haneul', english: 'Sky' },
        { korean: '구름', romanization: 'gureum', english: 'Cloud' },
        { korean: '산', romanization: 'san', english: 'Mountain' },
        { korean: '바다', romanization: 'bada', english: 'Sea / Ocean' },
        { korean: '강', romanization: 'gang', english: 'River' },
        { korean: '나무', romanization: 'namu', english: 'Tree' },
        { korean: '꽃', romanization: 'kkot', english: 'Flower' },
        { korean: '봄', romanization: 'bom', english: 'Spring' },
        { korean: '여름', romanization: 'yeoreum', english: 'Summer' },
        { korean: '가을', romanization: 'gaeul', english: 'Fall / Autumn' },
        { korean: '겨울', romanization: 'gyeoul', english: 'Winter' },
      ]
    },
    shopping: {
      name: 'Shopping & Money',
      icon: '🛒',
      cards: [
        { korean: '돈', romanization: 'don', english: 'Money' },
        { korean: '원', romanization: 'won', english: 'Won (currency)' },
        { korean: '카드', romanization: 'kadeu', english: 'Card' },
        { korean: '현금', romanization: 'hyeongeum', english: 'Cash' },
        { korean: '영수증', romanization: 'yeongsujeung', english: 'Receipt' },
        { korean: '가격', romanization: 'gagyeok', english: 'Price' },
        { korean: '할인', romanization: 'harin', english: 'Discount' },
        { korean: '세일', romanization: 'seil', english: 'Sale' },
        { korean: '옷', romanization: 'ot', english: 'Clothes' },
        { korean: '신발', romanization: 'sinbal', english: 'Shoes' },
        { korean: '가방', romanization: 'gabang', english: 'Bag' },
        { korean: '선물', romanization: 'seonmul', english: 'Gift' },
      ]
    },
    tech: {
      name: 'Technology',
      icon: '📱',
      cards: [
        { korean: '전화', romanization: 'jeonhwa', english: 'Phone / Call' },
        { korean: '핸드폰', romanization: 'haendeupon', english: 'Cell phone' },
        { korean: '컴퓨터', romanization: 'keompyuteo', english: 'Computer' },
        { korean: '인터넷', romanization: 'inteonet', english: 'Internet' },
        { korean: '와이파이', romanization: 'waipai', english: 'WiFi' },
        { korean: '이메일', romanization: 'imeil', english: 'Email' },
        { korean: '사진', romanization: 'sajin', english: 'Photo' },
        { korean: '동영상', romanization: 'dongyeongsang', english: 'Video' },
        { korean: '음악', romanization: 'eumak', english: 'Music' },
        { korean: '게임', romanization: 'geim', english: 'Game' },
      ]
    }
  };

  useEffect(() => {
    localStorage.setItem('knownCards', JSON.stringify([...knownCards]));
  }, [knownCards]);

  useEffect(() => {
    localStorage.setItem('learningCards', JSON.stringify([...learningCards]));
  }, [learningCards]);

  useEffect(() => {
    localStorage.setItem('srData', JSON.stringify(spacedRepData));
  }, [spacedRepData]);

  useEffect(() => {
    localStorage.setItem('streak', streak);
  }, [streak]);

  const allCards = Object.entries(categories).flatMap(([catKey, cat]) => 
    cat.cards.map((card, idx) => ({ ...card, category: catKey, categoryName: cat.name, id: `${catKey}-${idx}` }))
  );

  const currentCards = showAllCards 
    ? allCards.filter(card => 
        card.korean.includes(searchTerm) || 
        card.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.romanization.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : categories[selectedCategory].cards;

  useEffect(() => {
    setCardOrder([...Array(currentCards.length).keys()]);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedCategory, showAllCards, searchTerm]);

  const currentCardIndex = cardOrder[currentIndex] ?? currentIndex;
  const currentCard = currentCards[currentCardIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cardOrder.length);
    }, 150);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cardOrder.length) % cardOrder.length);
    }, 150);
  };

  const markAsKnown = () => {
    const cardKey = showAllCards ? currentCard.id : `${selectedCategory}-${currentCardIndex}`;
    setKnownCards(prev => new Set([...prev, cardKey]));
    setLearningCards(prev => { const n = new Set(prev); n.delete(cardKey); return n; });
    setStreak(prev => prev + 1);
    setTotalReviewed(prev => prev + 1);
    handleNext();
  };

  const markAsLearning = () => {
    const cardKey = showAllCards ? currentCard.id : `${selectedCategory}-${currentCardIndex}`;
    setLearningCards(prev => new Set([...prev, cardKey]));
    setKnownCards(prev => { const n = new Set(prev); n.delete(cardKey); return n; });
    setStreak(0);
    setTotalReviewed(prev => prev + 1);
    handleNext();
  };

  const shuffleCards = () => {
    const newOrder = [...cardOrder];
    for (let i = newOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]];
    }
    setCardOrder(newOrder);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShuffled(true);
  };

  const speakKorean = (text) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ko-KR';
      u.rate = 0.8;
      speechSynthesis.speak(u);
    }
  };

  const checkTypingAnswer = () => {
    const isCorrect = typingInput.trim() === currentCard.korean;
    setTypingResult(isCorrect ? 'correct' : 'incorrect');
    setTypingStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1),
      attempted: prev.attempted + 1
    }));
    if (isCorrect) {
      speakKorean(currentCard.korean);
      const cardKey = showAllCards ? currentCard.id : `${selectedCategory}-${currentCardIndex}`;
      setKnownCards(prev => new Set([...prev, cardKey]));
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const nextTypingCard = () => {
    setTypingInput('');
    setTypingResult(null);
    setShowHint(false);
    setRevealAnswer(false);
    handleNext();
  };

  const skipTypingCard = () => {
    const cardKey = showAllCards ? currentCard.id : `${selectedCategory}-${currentCardIndex}`;
    setLearningCards(prev => new Set([...prev, cardKey]));
    nextTypingCard();
  };

  // Spaced Repetition Functions (SM-2 Algorithm)
  const initializeSpacedRep = () => {
    const now = Date.now();
    const newData = {};
    allCards.forEach(card => {
      if (!spacedRepData[card.id]) {
        newData[card.id] = {
          interval: 0,
          easeFactor: 2.5,
          nextReview: now,
          repetitions: 0,
          lastReview: null
        };
      } else {
        newData[card.id] = spacedRepData[card.id];
      }
    });
    setSpacedRepData(newData);
    return newData;
  };

  const getSpacedQueue = (data) => {
    const now = Date.now();
    const due = allCards.filter(card => {
      const cardData = data[card.id];
      return cardData && cardData.nextReview <= now;
    });
    // Sort: new cards first, then by next review time
    due.sort((a, b) => {
      const aData = data[a.id];
      const bData = data[b.id];
      if (aData.repetitions === 0 && bData.repetitions > 0) return -1;
      if (bData.repetitions === 0 && aData.repetitions > 0) return 1;
      return aData.nextReview - bData.nextReview;
    });
    return due.slice(0, 20); // Limit session to 20 cards
  };

  const startSpacedSession = () => {
    const data = initializeSpacedRep();
    const queue = getSpacedQueue(data);
    setSpacedSessionCards(queue);
    setSpacedCurrentIndex(0);
    setSpacedShowAnswer(false);
  };

  const rateSpacedCard = (quality) => {
    // Quality: 0 = Again (complete fail), 1 = Hard, 2 = Good, 3 = Easy
    const card = spacedSessionCards[spacedCurrentIndex];
    if (!card) return;

    const cardData = { ...spacedRepData[card.id] };
    const now = Date.now();

    if (quality < 1) {
      // Failed - reset
      cardData.repetitions = 0;
      cardData.interval = 0;
      cardData.nextReview = now + 60000; // Review again in 1 minute
    } else {
      if (cardData.repetitions === 0) {
        cardData.interval = 1; // 1 day
      } else if (cardData.repetitions === 1) {
        cardData.interval = 3; // 3 days
      } else {
        cardData.interval = Math.round(cardData.interval * cardData.easeFactor);
      }

      // Adjust ease factor based on quality
      const easeAdjust = quality === 1 ? -0.15 : quality === 2 ? 0 : 0.15;
      cardData.easeFactor = Math.max(1.3, cardData.easeFactor + easeAdjust);
      
      cardData.repetitions += 1;
      cardData.nextReview = now + (cardData.interval * 24 * 60 * 60 * 1000);
    }
    
    cardData.lastReview = now;

    setSpacedRepData(prev => ({ ...prev, [card.id]: cardData }));
    setTodayReviewed(prev => prev + 1);

    // Update known/learning sets
    if (quality >= 2) {
      setKnownCards(prev => new Set([...prev, card.id]));
      setLearningCards(prev => { const n = new Set(prev); n.delete(card.id); return n; });
      setStreak(prev => prev + 1);
    } else {
      setLearningCards(prev => new Set([...prev, card.id]));
      setKnownCards(prev => { const n = new Set(prev); n.delete(card.id); return n; });
      if (quality === 0) setStreak(0);
    }

    // Move to next card
    setSpacedShowAnswer(false);
    if (spacedCurrentIndex < spacedSessionCards.length - 1) {
      setSpacedCurrentIndex(prev => prev + 1);
    } else {
      // Session complete - check for more due cards
      const newQueue = getSpacedQueue(spacedRepData);
      if (newQueue.length > 0) {
        setSpacedSessionCards(newQueue);
        setSpacedCurrentIndex(0);
      }
    }
  };

  const getIntervalText = (cardId) => {
    const data = spacedRepData[cardId];
    if (!data || data.repetitions === 0) return 'New';
    if (data.interval < 1) return '<1 day';
    if (data.interval === 1) return '1 day';
    if (data.interval < 30) return `${data.interval} days`;
    if (data.interval < 365) return `${Math.round(data.interval / 30)} months`;
    return `${Math.round(data.interval / 365)} years`;
  };

  const getDueCount = () => {
    const now = Date.now();
    return allCards.filter(card => {
      const data = spacedRepData[card.id];
      return data && data.nextReview <= now;
    }).length;
  };

  const getNewCount = () => {
    return allCards.filter(card => {
      const data = spacedRepData[card.id];
      return !data || data.repetitions === 0;
    }).length;
  };

  const getCardStatus = (index) => {
    const cardKey = showAllCards ? currentCards[index]?.id : `${selectedCategory}-${index}`;
    if (knownCards.has(cardKey)) return 'known';
    if (learningCards.has(cardKey)) return 'learning';
    return 'new';
  };

  const getCategoryProgress = (catKey) => {
    const cards = categories[catKey].cards;
    const known = cards.filter((_, i) => knownCards.has(`${catKey}-${i}`)).length;
    return Math.round((known / cards.length) * 100);
  };

  const totalWords = allCards.length;
  const totalKnown = knownCards.size;
  const totalLearning = learningCards.size;

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-sky-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No cards match your search.</p>
          <button onClick={() => setSearchTerm('')} className="text-rose-500 hover:underline">Clear search</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-sky-50 p-3">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">🇰🇷 Korean 300 Essential Words</h1>
          <p className="text-gray-600 text-sm">Master the top 300 words for beginners</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <div className="bg-white rounded-lg px-3 py-1.5 shadow-sm flex items-center gap-1.5 text-sm">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span>Streak: {streak}</span>
          </div>
          <div className="bg-white rounded-lg px-3 py-1.5 shadow-sm flex items-center gap-1.5 text-sm">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span>{totalKnown}/{totalWords} Known</span>
          </div>
          <div className="bg-white rounded-lg px-3 py-1.5 shadow-sm flex items-center gap-1.5 text-sm">
            <Target className="w-4 h-4 text-orange-500" />
            <span>{totalLearning} Learning</span>
          </div>
          {mode === 'typing' && (
            <div className="bg-white rounded-lg px-3 py-1.5 shadow-sm flex items-center gap-1.5 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{typingStats.correct}/{typingStats.attempted} Correct</span>
            </div>
          )}
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-4">
          <div className="bg-white rounded-full p-1 shadow-sm flex gap-1">
            <button
              onClick={() => setMode('flashcard')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${mode === 'flashcard' ? 'bg-rose-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              📚 Flashcards
            </button>
            <button
              onClick={() => { setMode('typing'); setTypingInput(''); setTypingResult(null); setShowHint(false); setRevealAnswer(false); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${mode === 'typing' ? 'bg-rose-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              ⌨️ Typing Practice
            </button>
            <button
              onClick={() => { setMode('spaced'); startSpacedSession(); }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${mode === 'spaced' ? 'bg-rose-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              🧠 Spaced Repetition
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4 justify-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search all 300 words..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setShowAllCards(true); }}
              className="pl-9 pr-4 py-2 rounded-full border text-sm w-56 focus:ring-2 focus:ring-rose-300 outline-none"
            />
          </div>
          <button
            onClick={() => { setShowAllCards(!showAllCards); setSearchTerm(''); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${showAllCards ? 'bg-rose-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            {showAllCards ? 'Show Categories' : 'All 300 Words'}
          </button>
        </div>

        {!showAllCards && (
          <div className="flex flex-wrap justify-center gap-1.5 mb-4 max-h-24 overflow-y-auto">
            {Object.entries(categories).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                  selectedCategory === key ? 'bg-rose-500 text-white' : 'bg-white text-gray-600 hover:bg-rose-100'
                }`}
              >
                {cat.icon} {cat.name} ({getCategoryProgress(key)}%)
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-center gap-1 mb-3 flex-wrap max-w-lg mx-auto">
          {cardOrder.slice(0, 30).map((origIdx, dispIdx) => {
            const status = getCardStatus(origIdx);
            return (
              <button
                key={dispIdx}
                onClick={() => { setCurrentIndex(dispIdx); setIsFlipped(false); }}
                className={`w-2.5 h-2.5 rounded-full transition ${dispIdx === currentIndex ? 'scale-125 ring-2 ring-rose-300' : ''} ${
                  status === 'known' ? 'bg-green-500' : status === 'learning' ? 'bg-yellow-500' : dispIdx === currentIndex ? 'bg-rose-500' : 'bg-gray-300'
                }`}
              />
            );
          })}
          {cardOrder.length > 30 && <span className="text-xs text-gray-400 ml-1">+{cardOrder.length - 30}</span>}
        </div>

        {/* SPACED REPETITION MODE */}
        {mode === 'spaced' ? (
          <div className="flex flex-col items-center mb-4">
            {/* Spaced Rep Stats */}
            <div className="flex gap-3 mb-4">
              <div className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm">
                📚 Due: {getDueCount()}
              </div>
              <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm">
                ✅ Today: {todayReviewed}
              </div>
              <div className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-sm">
                🆕 New: {getNewCount()}
              </div>
            </div>

            {spacedSessionCards.length === 0 || spacedCurrentIndex >= spacedSessionCards.length ? (
              /* No cards due or session complete */
              <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {getDueCount() === 0 ? "All caught up!" : "Session Complete!"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {getDueCount() === 0 
                    ? "No cards due for review. Come back later!" 
                    : `You reviewed ${todayReviewed} cards this session.`}
                </p>
                {getDueCount() > 0 && (
                  <button
                    onClick={startSpacedSession}
                    className="px-6 py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600"
                  >
                    Continue Reviewing ({getDueCount()} due)
                  </button>
                )}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
                  <h4 className="font-medium text-gray-700 mb-2">📊 Your Progress</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>• Cards mastered: {knownCards.size}</p>
                    <p>• Cards learning: {learningCards.size}</p>
                    <p>• Total reviewed today: {todayReviewed}</p>
                    <p>• Current streak: {streak}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Active card review */
              <>
                <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 mb-4">
                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Card {spacedCurrentIndex + 1} of {spacedSessionCards.length}</span>
                      <span>{getIntervalText(spacedSessionCards[spacedCurrentIndex]?.id)}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-rose-500 transition-all" 
                        style={{ width: `${((spacedCurrentIndex + 1) / spacedSessionCards.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-xs text-gray-400">{spacedSessionCards[spacedCurrentIndex]?.categoryName}</span>
                    
                    {!spacedShowAnswer ? (
                      /* Front of card */
                      <>
                        <div className="text-5xl font-bold text-gray-800 my-4">
                          {spacedSessionCards[spacedCurrentIndex]?.korean}
                        </div>
                        <button 
                          onClick={() => speakKorean(spacedSessionCards[spacedCurrentIndex]?.korean)} 
                          className="text-rose-500 hover:text-rose-600 flex items-center gap-1.5 mx-auto"
                        >
                          <Volume2 className="w-5 h-5" />
                          <span>{spacedSessionCards[spacedCurrentIndex]?.romanization}</span>
                        </button>
                        <button
                          onClick={() => setSpacedShowAnswer(true)}
                          className="mt-6 w-full py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition"
                        >
                          Show Answer
                        </button>
                      </>
                    ) : (
                      /* Back of card with answer */
                      <>
                        <div className="text-4xl font-bold text-gray-800 mt-2 mb-1">
                          {spacedSessionCards[spacedCurrentIndex]?.korean}
                        </div>
                        <button 
                          onClick={() => speakKorean(spacedSessionCards[spacedCurrentIndex]?.korean)} 
                          className="text-rose-500 hover:text-rose-600 flex items-center gap-1 mx-auto text-sm mb-3"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>{spacedSessionCards[spacedCurrentIndex]?.romanization}</span>
                        </button>
                        <div className="py-3 px-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl">
                          <p className="text-2xl font-bold text-gray-800">
                            {spacedSessionCards[spacedCurrentIndex]?.english}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Rating buttons */}
                {spacedShowAnswer && (
                  <div className="w-full max-w-sm">
                    <p className="text-center text-sm text-gray-500 mb-3">How well did you know this?</p>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => rateSpacedCard(0)}
                        className="flex flex-col items-center p-3 bg-red-100 hover:bg-red-200 rounded-xl transition"
                      >
                        <span className="text-2xl">😓</span>
                        <span className="text-xs font-medium text-red-700 mt-1">Again</span>
                        <span className="text-xs text-red-500">&lt;1m</span>
                      </button>
                      <button
                        onClick={() => rateSpacedCard(1)}
                        className="flex flex-col items-center p-3 bg-orange-100 hover:bg-orange-200 rounded-xl transition"
                      >
                        <span className="text-2xl">🤔</span>
                        <span className="text-xs font-medium text-orange-700 mt-1">Hard</span>
                        <span className="text-xs text-orange-500">1d</span>
                      </button>
                      <button
                        onClick={() => rateSpacedCard(2)}
                        className="flex flex-col items-center p-3 bg-green-100 hover:bg-green-200 rounded-xl transition"
                      >
                        <span className="text-2xl">😊</span>
                        <span className="text-xs font-medium text-green-700 mt-1">Good</span>
                        <span className="text-xs text-green-500">3d</span>
                      </button>
                      <button
                        onClick={() => rateSpacedCard(3)}
                        className="flex flex-col items-center p-3 bg-blue-100 hover:bg-blue-200 rounded-xl transition"
                      >
                        <span className="text-2xl">🤩</span>
                        <span className="text-xs font-medium text-blue-700 mt-1">Easy</span>
                        <span className="text-xs text-blue-500">5d+</span>
                      </button>
                    </div>
                    <p className="text-center text-xs text-gray-400 mt-3">
                      Cards you know well will appear less often. Struggling cards come back sooner.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* How it works */}
            <div className="w-full max-w-sm mt-4 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-700 mb-2 text-sm">🧠 How Spaced Repetition Works</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Cards you <strong>know well</strong> appear less frequently</li>
                <li>• Cards you <strong>struggle with</strong> come back sooner</li>
                <li>• Intervals grow: 1 day → 3 days → 1 week → 2 weeks...</li>
                <li>• Review daily for best results!</li>
              </ul>
            </div>
          </div>
        ) : mode === 'typing' ? (
          <div className="flex flex-col items-center mb-4">
            {/* Prompt Card */}
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 mb-4">
              {showAllCards && <span className="text-xs text-gray-400">{currentCard.categoryName}</span>}
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">Type the Korean for:</p>
                <div className="text-3xl font-bold text-gray-800 mb-2">{currentCard.english}</div>
                <p className="text-gray-400 text-sm">({currentCard.romanization})</p>
                
                {/* Hint */}
                {showHint && !revealAnswer && (
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                    <p className="text-blue-600 text-sm">
                      Hint: First character is <span className="font-bold text-lg">{currentCard.korean[0]}</span>
                    </p>
                  </div>
                )}
                
                {/* Reveal Answer */}
                {revealAnswer && (
                  <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                    <p className="text-gray-600 text-sm">Answer:</p>
                    <p className="text-2xl font-bold text-gray-800">{currentCard.korean}</p>
                    <button onClick={() => speakKorean(currentCard.korean)} className="mt-2 text-rose-500 hover:text-rose-600 flex items-center gap-1 mx-auto">
                      <Volume2 className="w-4 h-4" /> Listen
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="w-full max-w-sm">
              <input
                type="text"
                value={typingInput}
                onChange={(e) => setTypingInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !typingResult) checkTypingAnswer(); else if (e.key === 'Enter' && typingResult) nextTypingCard(); }}
                placeholder="Type in Korean here..."
                disabled={typingResult !== null}
                className={`w-full px-4 py-3 text-xl text-center rounded-xl border-2 outline-none transition ${
                  typingResult === 'correct' ? 'border-green-500 bg-green-50' :
                  typingResult === 'incorrect' ? 'border-red-500 bg-red-50' :
                  'border-gray-300 focus:border-rose-400'
                }`}
                autoFocus
              />
              
              {/* Result Feedback */}
              {typingResult && (
                <div className={`mt-3 p-3 rounded-lg text-center ${typingResult === 'correct' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {typingResult === 'correct' ? (
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Correct! 🎉</span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-center gap-2 text-red-700 mb-2">
                        <X className="w-5 h-5" />
                        <span className="font-medium">Not quite!</span>
                      </div>
                      <p className="text-sm text-red-600">
                        Correct answer: <span className="font-bold text-lg">{currentCard.korean}</span>
                      </p>
                      <button onClick={() => speakKorean(currentCard.korean)} className="mt-1 text-red-500 hover:text-red-600 flex items-center gap-1 mx-auto text-sm">
                        <Volume2 className="w-4 h-4" /> Listen
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center gap-2 mt-4">
                {!typingResult ? (
                  <>
                    <button
                      onClick={() => setShowHint(true)}
                      disabled={showHint || revealAnswer}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 disabled:opacity-50"
                    >
                      💡 Hint
                    </button>
                    <button
                      onClick={checkTypingAnswer}
                      disabled={!typingInput.trim()}
                      className="px-6 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 disabled:opacity-50"
                    >
                      Check ↵
                    </button>
                    <button
                      onClick={() => setRevealAnswer(true)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                    >
                      👁️ Show
                    </button>
                    <button
                      onClick={skipTypingCard}
                      className="px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200"
                    >
                      Skip →
                    </button>
                  </>
                ) : (
                  <button
                    onClick={nextTypingCard}
                    className="px-8 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600"
                  >
                    Next Card →
                  </button>
                )}
              </div>

              {/* Keyboard Tip */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 text-center">
                  💡 <strong>Tip:</strong> Enable Korean keyboard on your device. On Windows: Win+Space | Mac: Ctrl+Space | Mobile: Add Korean in keyboard settings
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* FLASHCARD MODE */
          <>
        <div className="flex justify-center mb-4">
          <div className="relative w-full max-w-sm h-56 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
            <div
              className="absolute inset-0 transition-transform duration-500"
              style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
              <div className="absolute inset-0 bg-white rounded-2xl shadow-xl p-4 flex flex-col items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
                {showAllCards && <span className="absolute top-2 left-3 text-xs text-gray-400">{currentCard.categoryName}</span>}
                <div className="text-5xl font-bold text-gray-800 mb-3">{currentCard.korean}</div>
                <button onClick={(e) => { e.stopPropagation(); speakKorean(currentCard.korean); }} className="flex items-center gap-2 text-rose-500 hover:text-rose-600">
                  <Volume2 className="w-5 h-5" />
                  <span>{currentCard.romanization}</span>
                </button>
                <p className="text-gray-400 mt-3 text-xs">Click to flip</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl shadow-xl p-4 flex flex-col items-center justify-center text-white" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                <div className="text-2xl font-bold mb-2">{currentCard.english}</div>
                <div className="text-base opacity-90 mb-2">{currentCard.romanization}</div>
                <button onClick={(e) => { e.stopPropagation(); speakKorean(currentCard.korean); }} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full text-sm">
                  <Volume2 className="w-4 h-4" />
                  Listen
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center gap-3 mb-4">
          <button onClick={handlePrevious} className="p-2 bg-white rounded-full shadow hover:shadow-md">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button onClick={markAsLearning} className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium hover:bg-yellow-200 flex items-center gap-1.5">
            <X className="w-4 h-4" /> Learning
          </button>
          <button onClick={markAsKnown} className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> Know It!
          </button>
          <button onClick={handleNext} className="p-2 bg-white rounded-full shadow hover:shadow-md">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex justify-center gap-2">
          <button onClick={shuffled ? () => { setCardOrder([...Array(currentCards.length).keys()]); setShuffled(false); setCurrentIndex(0); } : shuffleCards} className="px-3 py-1.5 bg-white rounded-lg shadow text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-1.5">
            {shuffled ? <RotateCcw className="w-3 h-3" /> : <Shuffle className="w-3 h-3" />}
            {shuffled ? 'Reset' : 'Shuffle'}
          </button>
        </div>
        </>
        )}

        <div className="text-center mt-3 text-gray-500 text-xs">
          Card {currentIndex + 1} of {cardOrder.length} {showAllCards ? '(All Categories)' : `in ${categories[selectedCategory].name}`}
        </div>
      </div>
    </div>
  );
};

export default KoreanFlashcards;