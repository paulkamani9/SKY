/**
 * Italian, German and Russian for everything in menuContent.ts.
 *
 * Kept apart from the English and French master transcription for two reasons:
 * the master stays readable as a menu, and this table is exactly what
 * `npm run translate` pushes into Sanity — one table to review, one script to
 * run, and re-running it never touches a price, a photo or an English line.
 *
 * Keys are Sanity document ids (sub-groups are keyed by their English title,
 * which is what the sub-section documents were named after). Field names are
 * the Sanity field names, so what is written here is what is stored.
 *
 * THESE ARE TRANSLATIONS, NOT COPY WRITTEN BY A NATIVE SPEAKER. They are
 * accurate and idiomatic enough to order from, but before this goes to print
 * they are worth a read-through by someone who speaks the language.
 */

type Three = "It" | "De" | "Ru";

export type DishTranslation = Partial<
  Record<`${"name" | "description" | "priceNote"}${Three}`, string>
>;

export type CategoryTranslation = Partial<
  Record<`${"title" | "intro" | "footnote" | "fruits"}${Three}`, string>
>;

export type GroupTranslation = Partial<Record<`title${Three}`, string>>;

export const settingsTranslations: Partial<
  Record<`${"tagline" | "notice"}${Three}`, string>
> = {
  taglineIt: "Flic en Flac · Lounge fronte spiaggia",
  taglineDe: "Flic en Flac · Strandlounge",
  taglineRu: "Флик-ан-Флак · Лаундж на берегу океана",
  noticeIt:
    "Una collezione curata di gelato artigianale, frutti tropicali estratti a freddo e caffè specialty premium, da gustare in riva all'oceano.",
  noticeDe:
    "Eine kuratierte Auswahl an handwerklichem Eis, kaltgepressten tropischen Früchten und Premium-Specialty-Kaffee — zum Genießen am Meer.",
  noticeRu:
    "Тщательно собранная коллекция ремесленного джелато, тропических фруктов холодного отжима и кофе premium specialty — чтобы наслаждаться у океана.",
};

/** Keyed by the sub-group's English title. */
export const groupTranslations: Record<string, GroupTranslation> = {
  "Tropical Sorbets (Dairy-Free)": {
    titleIt: "Sorbetti Tropicali (Senza Latte)",
    titleDe: "Tropische Sorbets (Ohne Milch)",
    titleRu: "Тропические сорбеты (без молока)",
  },
  "Premium Gelato": {
    titleIt: "Gelato Premium",
    titleDe: "Premium-Eis",
    titleRu: "Джелато премиум",
  },
  "Cold-Pressed Juices": {
    titleIt: "Succhi Estratti a Freddo",
    titleDe: "Kaltgepresste Säfte",
    titleRu: "Соки холодного отжима",
  },
  "Wellness Shots": {
    titleIt: "Shot del Benessere",
    titleDe: "Wellness-Shots",
    titleRu: "Велнес-шоты",
  },
  "Iced & Shaken Infusions": {
    titleIt: "Infusi Freddi & Shakerati",
    titleDe: "Eisgekühlte & geschüttelte Aufgüsse",
    titleRu: "Холодные настои со льдом",
  },
  "Hot Artisanal Steeps": {
    titleIt: "Infusi Caldi Artigianali",
    titleDe: "Heiße handwerkliche Aufgüsse",
    titleRu: "Горячие ремесленные настои",
  },
  "Classic Hot Drinks": {
    titleIt: "Classici Caldi",
    titleDe: "Klassische Heißgetränke",
    titleRu: "Классические горячие напитки",
  },
  "Iced & Chilled Coffee": {
    titleIt: "Caffè Freddi",
    titleDe: "Eiskaffee & kalte Kaffees",
    titleRu: "Холодный кофе",
  },
  Milkshakes: {
    titleIt: "Milkshake",
    titleDe: "Milchshakes",
    titleRu: "Молочные коктейли",
  },
  "From the Pastry Showcase": {
    titleIt: "Dalla Vetrina della Pasticceria",
    titleDe: "Aus der Patisserie-Vitrine",
    titleRu: "Из витрины кондитерской",
  },
};

export const categoryTranslations: Record<string, CategoryTranslation> = {
  "sec-gelato": {
    titleIt: "Gelati & Sorbetti",
    titleDe: "Eis & Sorbets",
    titleRu: "Джелато и сорбеты",
    introIt:
      "Preparati ogni giorno. Gusti puri e vivaci, perfetti in riva al mare. Selezione a pallina singola Rs 125.",
    introDe:
      "Täglich frisch hergestellt. Pure, lebendige Aromen — perfekt für den Strand. Auswahl pro Kugel Rs 125.",
    introRu:
      "Готовим каждый день. Чистые, яркие вкусы — то, что нужно у моря. Один шарик на выбор Rs 125.",
    footnoteIt: "Si informi presso il nostro team sui gusti ospiti di stagione di oggi.",
    footnoteDe:
      "Erkundigen Sie sich bei unserem Team nach den saisonalen Gastsorten des Tages.",
    footnoteRu: "Уточните у нашей команды сезонные вкусы дня.",
  },
  "sec-bowls": {
    titleIt: "Bowl di Frutta",
    titleDe: "Fruchtbowls",
    titleRu: "Фруктовые боулы",
    introIt:
      "Un'esperienza elegante e interattiva, costruita interamente sul suo gusto.",
    introDe:
      "Ein elegantes, interaktives Erlebnis, ganz nach Ihrem Geschmack zusammengestellt.",
    introRu: "Элегантный интерактивный ритуал, полностью на ваш вкус.",
    fruitsIt:
      "Papaya, Mango, Cocco grattugiato, Frutto del drago rosso, Bergamotto",
    fruitsDe:
      "Papaya, Mango, Kokosraspeln, Rote Drachenfrucht, Bergamotte",
    fruitsRu:
      "Папайя, Манго, Кокосовая стружка, Красный драконий фрукт, Бергамот",
  },
  "sec-smoothies": {
    titleIt: "Smoothie",
    titleDe: "Smoothies",
    titleRu: "Смузи",
    introIt: "Frullati al momento. Densi, ghiacciati, puro piacere di frutta.",
    introDe:
      "Frisch auf Bestellung gemixt. Dickflüssig, eisig und pure Frucht.",
    introRu:
      "Взбиваем на заказ. Густые, ледяные — чистое фруктовое удовольствие.",
    fruitsIt:
      "Papaya, Mango, Cocco grattugiato, Frutto del drago rosso, Bergamotto",
    fruitsDe:
      "Papaya, Mango, Kokosraspeln, Rote Drachenfrucht, Bergamotte",
    fruitsRu:
      "Папайя, Манго, Кокосовая стружка, Красный драконий фрукт, Бергамот",
  },
  "sec-juices": {
    titleIt: "Succhi & Shot",
    titleDe: "Säfte & Shots",
    titleRu: "Соки и шоты",
    introIt:
      "100% liquido di frutta pura, estratto al momento. Leggero, fresco e profondamente dissetante.",
    introDe:
      "100 % reine Fruchtflüssigkeit, frisch auf Bestellung entsaftet. Leicht, frisch und tief erfrischend.",
    introRu:
      "100% чистый фруктовый сок, отжимаем на заказ. Лёгкий, свежий и глубоко утоляющий жажду.",
  },
  "sec-teas": {
    titleIt: "Tè & Infusi",
    titleDe: "Tees & Aufgüsse",
    titleRu: "Чай и настои",
    introIt: "Una selezione curata di tè in foglia e botaniche.",
    introDe: "Sorgfältig ausgewählte lose Blatt-Tees und Kräuter.",
    introRu: "Тщательно отобранные листовые чаи и травы.",
  },
  "sec-breakfast": {
    titleIt: "Colazione & Brunch",
    titleDe: "Frühstück & Brunch",
    titleRu: "Завтрак и бранч",
    introIt: "Servito ogni giorno fino alle 13:00.",
    introDe: "Täglich bis 13:00 Uhr.",
    introRu: "Подаём ежедневно до 13:00.",
  },
  "sec-coffee": {
    titleIt: "Caffè",
    titleDe: "Kaffee",
    titleRu: "Кофе",
    introIt:
      "Preparati con chicchi specialty premium, estratti con precisione e serviti alla perfezione.",
    introDe:
      "Zubereitet aus Premium-Specialty-Bohnen, präzise extrahiert und perfekt serviert.",
    introRu:
      "Готовим на зёрнах premium specialty: точная экстракция и безупречная подача.",
    footnoteIt:
      "Alternative al latte disponibili: soia, mandorla o avena, con un supplemento di Rs 50.",
    footnoteDe:
      "Milchalternativen erhältlich: Soja-, Mandel- oder Hafermilch für Rs 50 Aufpreis.",
    footnoteRu:
      "Доступны альтернативы молоку: соевое, миндальное или овсяное — за доплату Rs 50.",
  },
  "sec-shakes": {
    titleIt: "Milkshake & Pasticceria",
    titleDe: "Milchshakes & Gebäck",
    titleRu: "Молочные коктейли и выпечка",
    introIt:
      "Milkshake densi e golosi, preparati con il nostro gelato artigianale premium, frullati fino a essere setosi e serviti ghiacciati.",
    introDe:
      "Dicke, verführerische Shakes aus unserem handwerklichen Premium-Eis, cremig gemixt und eiskalt serviert.",
    introRu:
      "Густые щедрые коктейли на нашем ремесленном джелато премиум, взбитые до гладкости и поданные ледяными.",
  },
  "sec-bites": {
    titleIt: "Stuzzichini da Spiaggia",
    titleDe: "Beach Bites",
    titleRu: "Закуски у моря",
    introIt:
      "Disponibili dalle 14:00. Porzioni generose da condividere, l'accompagnamento salato perfetto per il tramonto.",
    introDe:
      "Ab 14:00 Uhr erhältlich. Großzügige Portionen zum Teilen — die perfekte herzhafte Begleitung zum Sonnenuntergang.",
    introRu:
      "Подаём с 14:00. Щедрые порции, чтобы разделить на компанию, — идеальная солёная закуска к закату.",
  },
  "sec-mocktails": {
    titleIt: "Mocktail",
    titleDe: "Mocktails",
    titleRu: "Безалкогольные коктейли",
    introIt:
      "Disponibili tutto il giorno. Long drink preparati con cura, perfetti sulla terrazza aperta mentre il sole scende.",
    introDe:
      "Ganztägig erhältlich. Sorgfältig komponierte Longdrinks, perfekt auf der offenen Terrasse zum Sonnenuntergang.",
    introRu:
      "Доступны весь день. Тщательно составленные лонг-дринки — идеально на открытой террасе на закате.",
  },
  "sec-softs": {
    titleIt: "Bibite",
    titleDe: "Erfrischungen",
    titleRu: "Прохладительные напитки",
    introIt:
      "Una selezione di bibite fredde classiche, mixer e acque premium.",
    introDe:
      "Eine Auswahl klassischer gekühlter Getränke, Mixer und Premium-Wässer.",
    introRu:
      "Подборка классических охлаждённых напитков, миксеров и премиальной воды.",
  },
};

export const dishTranslations: Record<string, DishTranslation> = {
  // Gelato & Sorbets
  "gel-mango": {
    nameIt: "Mango",
    nameDe: "Mango",
    nameRu: "Манго",
    descriptionIt: "Cremoso, vellutato e naturalmente dolce.",
    descriptionDe: "Sanft, samtig und von Natur aus süß.",
    descriptionRu: "Гладкий, бархатистый и естественно сладкий.",
  },
  "gel-passion": {
    nameIt: "Frutto della Passione",
    nameDe: "Maracuja",
    nameRu: "Маракуйя",
    descriptionIt: "Deciso, vivace e intensamente aromatico.",
    descriptionDe: "Spritzig, lebendig und intensiv aromatisch.",
    descriptionRu: "Яркий, живой и насыщенно ароматный.",
  },
  "gel-pineapple": {
    nameIt: "Ananas",
    nameDe: "Ananas",
    nameRu: "Ананас",
    descriptionIt: "Fresco, dissetante e pieno di sole tropicale.",
    descriptionDe: "Frisch, erfrischend und voller Inselsonne.",
    descriptionRu: "Свежий, освежающий, полный островного солнца.",
  },
  "gel-coco": {
    nameIt: "Cocco",
    nameDe: "Kokos",
    nameRu: "Кокос",
    descriptionIt: "Ricco, morbido e splendidamente tropicale.",
    descriptionDe: "Vollmundig, cremig und herrlich tropisch.",
    descriptionRu: "Насыщенный, мягкий и по-настоящему тропический.",
  },
  "gel-grapefruit": {
    nameIt: "Pompelmo",
    nameDe: "Grapefruit",
    nameRu: "Грейпфрут",
    descriptionIt: "Un equilibrio raffinato di agrumi vivaci e freschi.",
    descriptionDe:
      "Ein raffiniertes Gleichgewicht aus hellen, frischen Zitrusnoten.",
    descriptionRu: "Изысканный баланс яркого свежего цитруса.",
  },
  "gel-guava": {
    nameIt: "Guava",
    nameDe: "Guave",
    nameRu: "Гуава",
    descriptionIt: "Profumata, esotica e molto rinfrescante.",
    descriptionDe: "Duftend, exotisch und tief erfrischend.",
    descriptionRu: "Ароматная, экзотическая и очень освежающая.",
  },
  "gel-vanilla": {
    nameIt: "Vaniglia Classica",
    nameDe: "Klassische Vanille",
    nameRu: "Классическая ваниль",
    descriptionIt: "Ricco, cremoso ed elegantemente morbido.",
    descriptionDe: "Vollmundig, cremig und elegant weich.",
    descriptionRu: "Насыщенный, сливочный и элегантно нежный.",
  },
  "gel-chocolate": {
    nameIt: "Cioccolato Intenso",
    nameDe: "Dunkle Schokolade",
    nameRu: "Насыщенный шоколад",
    descriptionIt: "Goloso, vellutato e intensamente decadente.",
    descriptionDe: "Verführerisch, samtig und intensiv dekadent.",
    descriptionRu: "Соблазнительный, бархатистый и очень насыщенный.",
  },
  "gel-caramel": {
    nameIt: "Caramello Salato",
    nameDe: "Gesalzenes Karamell",
    nameRu: "Солёная карамель",
    descriptionIt:
      "Equilibrio perfetto tra dolcezza intensa e un tocco di sale marino.",
    descriptionDe:
      "Perfekte Balance aus voller Süße und einem Hauch Meersalz.",
    descriptionRu:
      "Идеальный баланс насыщенной сладости и щепотки морской соли.",
  },
  "gel-oreo": {
    nameIt: "Oreo Cookies & Cream",
    nameDe: "Oreo Cookies & Cream",
    nameRu: "Орео, печенье со сливками",
    descriptionIt:
      "Un classico amatissimo, ricco di croccanti scaglie di biscotto al cioccolato.",
    descriptionDe:
      "Ein Klassiker voller knuspriger Schokoladenkeks-Stücke.",
    descriptionRu:
      "Любимая классика с хрустящими кусочками шоколадного печенья.",
  },
  "gel-raspberry": {
    nameIt: "Cheesecake ai Lamponi",
    nameDe: "Himbeer-Cheesecake",
    nameRu: "Малиновый чизкейк",
    descriptionIt:
      "Lampone acidulo a venature su una base cremosa da cheesecake.",
    descriptionDe:
      "Säuerliche Himbeere, eingezogen in eine cremige Cheesecake-Basis.",
    descriptionRu:
      "Кисловатая малина прожилками на сливочной чизкейковой основе.",
  },

  // Fruit Bowls
  "bowl-build": {
    nameIt: "Componi la Tua Bowl Tropicale",
    nameDe: "Stellen Sie Ihre Tropenbowl zusammen",
    nameRu: "Соберите свой тропический боул",
    descriptionIt:
      "Si conceda il rituale dell'isola per eccellenza. La invitiamo al nostro banco della frutta fresca per scegliere a mano i suoi frutti di stagione preferiti dal raccolto del giorno. Il nostro team li taglia al momento e li dispone con eleganza, presentando un capolavoro colorato e gustoso.",
    descriptionDe:
      "Gönnen Sie sich das Inselritual schlechthin. Wir laden Sie an unsere Frischetheke ein, um Ihre Lieblingsfrüchte aus der Tagesernte selbst auszuwählen. Unser Team schneidet sie frisch und richtet Ihre Auswahl elegant an — ein farbenprächtiges, köstliches Meisterwerk.",
    descriptionRu:
      "Позвольте себе главный островной ритуал. Приглашаем вас к столу со свежими фруктами, чтобы выбрать любимые сезонные плоды из урожая дня. Наша команда нарежет их при вас и изящно выложит подборку в яркую, аппетитную композицию.",
    priceNoteIt: "In base alla selezione",
    priceNoteDe: "Je nach Auswahl",
    priceNoteRu: "По вашему выбору",
  },
  "bowl-superfood": {
    nameIt: "La Bowl Superfood SKY",
    nameDe: "Die SKY Superfood-Bowl",
    nameRu: "Суперфуд-боул SKY",
    descriptionIt:
      "Impreziosisca la frutta che ha scelto a mano. Scelga i suoi frutti al banco e il nostro team li stratifica, a sua scelta, con yogurt greco cremoso o yogurt alla frutta vivace, granola al miele, una spolverata premium di semi superfood (chia e lino), cocco tostato in scaglie croccanti e un delicato filo di miele locale puro.",
    descriptionDe:
      "Veredeln Sie Ihre selbst gewählte Fruchtauswahl. Wählen Sie Ihre Früchte an der Theke — unser Team schichtet sie nach Wunsch mit cremigem griechischem Joghurt oder fruchtigem Joghurt, honiggebackenem Granola, einer Premium-Prise Superfood-Samen (Chia und Lein), knusprigen gerösteten Kokosraspeln und einem feinen Faden reinen lokalen Honigs.",
    descriptionRu:
      "Дополните выбранные вами фрукты. Выберите плоды у стола, а наша команда выложит их слоями — на ваш выбор со сливочным греческим или ярким фруктовым йогуртом, гранолой на меду, премиальной щепоткой суперфуд-семян (чиа и лён), хрустящей обжаренной кокосовой стружкой и тонкой нитью чистого местного мёда.",
    priceNoteIt: "Selezione + guarnizioni premium",
    priceNoteDe: "Auswahl + Premium-Toppings",
    priceNoteRu: "Выбор фруктов + премиальные топпинги",
  },

  // Smoothies
  "smo-build": {
    nameIt: "Componi il Tuo Frullato Signature",
    nameDe: "Stellen Sie Ihren Signature-Blend zusammen",
    nameRu: "Создайте свой фирменный смузи",
    descriptionIt:
      "Crei la sua bevanda perfetta in riva al mare. Scelga da 3 a 4 frutti premium dal raccolto del giorno qui sotto per comporre un capolavoro su misura, preparato a mano.",
    descriptionDe:
      "Kreieren Sie Ihr perfektes Strandgetränk. Wählen Sie 3 bis 4 Premium-Früchte aus der Tagesernte unten und gestalten Sie ein eigenes, von Hand gefertigtes Meisterwerk.",
    descriptionRu:
      "Создайте идеальный напиток у моря. Выберите 3–4 премиальных фрукта из урожая дня, указанного ниже, и получите авторский коктейль ручной работы.",
  },
  "smo-crush": {
    nameIt: "The Flic-en-Flac Crush",
    nameDe: "The Flic-en-Flac Crush",
    nameRu: "Флик-ан-Флак Краш",
    descriptionIt:
      "La combinazione consigliata dalla casa: un mix esotico e vivace di mango dolce, ananas croccante, frutto della passione deciso e spettacolare frutto del drago.",
    descriptionDe:
      "Die Empfehlung des Hauses: eine lebendige, exotische Mischung aus süßer Mango, frischer Ananas, spritziger Maracuja und beeindruckender Drachenfrucht.",
    descriptionRu:
      "Сочетание, рекомендованное заведением: яркий экзотический микс сладкого манго, свежего ананаса, кислинки маракуйи и эффектного драконьего фрукта.",
  },
  "smo-golden": {
    nameIt: "Golden Hour",
    nameDe: "Golden Hour",
    nameRu: "Золотой час",
    descriptionIt:
      "Uno smoothie elettrico e splendidamente vivace, con ananas dolce, arancia luminosa ed esotico frutto del drago.",
    descriptionDe:
      "Ein leuchtender, wunderbar lebendiger Smoothie aus süßer Ananas, heller Orange und exotischer Drachenfrucht.",
    descriptionRu:
      "Насыщенный, невероятно яркий смузи из сладкого ананаса, лучистого апельсина и экзотического драконьего фрукта.",
  },
  "smo-single": {
    nameIt: "Smoothie Monofrutto",
    nameDe: "Sortenreine Smoothies",
    nameRu: "Смузи из одного фрукта",
    descriptionIt:
      "Denso, semplice e rinfrescante. Scelga un solo frutto dalla nostra selezione di frutta fresca dell'isola.",
    descriptionDe:
      "Dick, schlicht und erfrischend. Wählen Sie eine einzelne Frucht aus unserer frischen Inselauswahl.",
    descriptionRu:
      "Густой, простой и освежающий. Выберите один фрукт из нашей островной подборки свежих плодов.",
  },

  // Juices & Shots
  "juice-velvet": {
    nameIt: "Velvet Sunrise",
    nameDe: "Velvet Sunrise",
    nameRu: "Бархатный рассвет",
    descriptionIt:
      "La nostra base di carota fresca, in perfetto equilibrio con arancia dolce e una nota calda di zenzero.",
    descriptionDe:
      "Unsere frische Karottenbasis, perfekt ausbalanciert mit süßer Orange und einem warmen Ingwerkick.",
    descriptionRu:
      "Наша фирменная морковная основа в балансе со сладким апельсином и тёплой ноткой имбиря.",
  },
  "juice-coral": {
    nameIt: "Coral Reef",
    nameDe: "Coral Reef",
    nameRu: "Коралловый риф",
    descriptionIt:
      "Un estratto bellissimo e dissetante di anguria, frutto della passione acidulo e menta fresca dell'orto.",
    descriptionDe:
      "Ein optisch beeindruckender, durststillender Saft aus Wassermelone, säuerlicher Maracuja und frischer Gartenminze.",
    descriptionRu:
      "Красивый и утоляющий жажду фреш из арбуза, кисловатой маракуйи и свежей садовой мяты.",
  },
  "juice-passion": {
    nameIt: "Passione & Agrumi",
    nameDe: "Maracuja-Zitrus pur",
    nameRu: "Маракуйя и цитрус",
    descriptionIt:
      "Un estratto intensamente aromatico e deciso di frutto della passione, arancia e pompelmo, dal finale agrumato e raffinato.",
    descriptionDe:
      "Ein intensiv aromatischer, kräftiger Saft aus Maracuja, Orange und Grapefruit mit raffiniertem, spritzigem Abgang.",
    descriptionRu:
      "Насыщенно ароматный, смелый фреш из маракуйи, апельсина и грейпфрута с изысканным цитрусовым финалом.",
  },
  "shot-ginger": {
    nameIt: "The Ginger Ignition",
    nameDe: "The Ginger Ignition",
    nameRu: "Имбирный заряд",
    descriptionIt:
      "Zenzero puro estratto a freddo e succo di limone fresco, con un pizzico tonificante di pepe di Caienna.",
    descriptionDe:
      "Purer, feuriger kaltgepresster Ingwer und frischer Zitronensaft mit einer belebenden Prise Cayennepfeffer.",
    descriptionRu:
      "Чистый жгучий имбирь холодного отжима и свежий лимонный сок с бодрящей щепоткой кайенского перца.",
  },
  "shot-golden": {
    nameIt: "The Golden Glow",
    nameDe: "The Golden Glow",
    nameRu: "Золотое сияние",
    descriptionIt:
      "Un estratto vivace e tonificante di curcuma fresca, arancia, carota e una macinata di pepe nero per il massimo assorbimento.",
    descriptionDe:
      "Ein leuchtender Saft aus frischer Kurkuma, Orange, Karotte und frisch gemahlenem schwarzem Pfeffer für maximale Aufnahme.",
    descriptionRu:
      "Яркий фреш из свежей куркумы, апельсина и моркови с щепоткой чёрного перца для лучшего усвоения.",
  },

  // Teas & Infusions
  "tea-passionmint": {
    nameIt: "Tè Nero Passione & Menta",
    nameDe: "Schwarztee Maracuja-Minze",
    nameRu: "Чёрный чай с маракуйей и мятой",
    descriptionIt:
      "Un tè nero premium deciso e strutturato, shakerato ghiacciato con frutto della passione vivo e menta dell'orto spezzata a mano, intensamente profumata.",
    descriptionDe:
      "Ein kräftiger, strukturierter Premium-Schwarztee, eiskalt geschüttelt mit spritziger Maracuja und intensiv duftender, frisch gezupfter Gartenminze.",
    descriptionRu:
      "Крепкий структурный чёрный чай премиум, взбитый со льдом с яркой маракуйей и интенсивно ароматной свежесорванной садовой мятой.",
  },
  "tea-peach": {
    nameIt: "Pesca dell'Isola & Earl Grey",
    nameDe: "Inselpfirsich & Earl Grey",
    nameRu: "Островной персик и Эрл Грей",
    descriptionIt:
      "Una base di tè nero raffinata, infusa con l'elegante agrume del bergamotto e la dolcezza morbida e succosa della pesca fresca.",
    descriptionDe:
      "Eine raffinierte Schwarztee-Basis mit der eleganten Zitrusnote der Bergamotte und der weichen, saftigen Süße frischer Pfirsiche.",
    descriptionRu:
      "Изысканная основа чёрного чая с элегантным цитрусом бергамота и мягкой сочной сладостью свежего персика.",
  },
  "tea-citron": {
    nameIt: "Tè Nero Classico al Limone",
    nameDe: "Klassischer Zitronen-Schwarztee",
    nameRu: "Классический чёрный чай с лимоном",
    descriptionIt:
      "Un tè nero senza tempo, pulito e rinfrescante, in infusione a freddo e completato da generose fette di limone locale.",
    descriptionDe:
      "Ein zeitloser, klarer und erfrischender Schwarztee, kalt aufgegossen und mit großzügigen Scheiben lokaler Zitrone vollendet.",
    descriptionRu:
      "Вне времени: чистый и освежающий чёрный чай холодного заваривания с щедрыми дольками местного лимона.",
  },
  "tea-rouges-glace": {
    nameIt: "Fruits Rouges Glacé",
    nameDe: "Fruits Rouges Glacé",
    nameRu: "Ледяные красные ягоды",
    descriptionIt:
      "Un'infusione rubino vivace e ricca di antiossidanti, con bacche rosse selvatiche e ibisco: naturalmente acidula e perfettamente dissetante.",
    descriptionDe:
      "Ein leuchtend rubinroter, antioxidantienreicher Aufguss aus wilden roten Beeren und Hibiskus — natürlich säuerlich und perfekt durststillend.",
    descriptionRu:
      "Яркий рубиновый настой из диких красных ягод и гибискуса, богатый антиоксидантами, с природной кислинкой и превосходно утоляющий жажду.",
  },
  "tea-ginger-green": {
    nameIt: "Tè Verde allo Zenzero",
    nameDe: "Spritziger Ingwer-Grüntee",
    nameRu: "Зелёный чай с имбирём",
    descriptionIt:
      "Tè verde premium freddo, abbinato a una nota decisa e rinfrescante di zenzero estratto a freddo e a un tocco di miele crudo.",
    descriptionDe:
      "Gekühlter Premium-Grüntee mit einem kräftigen, erfrischenden Kick kaltgepressten Ingwers und einem Hauch Rohhonig.",
    descriptionRu:
      "Охлаждённый зелёный чай премиум с острой освежающей ноткой имбиря холодного отжима и каплей сырого мёда.",
  },
  "tea-citronella": {
    nameIt: "Fresco all'Ananas & Citronella",
    nameDe: "Ananas-Zitronengras-Cooler",
    nameRu: "Ананас и лемонграсс",
    descriptionIt:
      "Un bel tocco tropicale. Infusione fresca di citronella (lemongrass) locale con un tocco di succo d'ananas fresco.",
    descriptionDe:
      "Eine schöne tropische Wendung. Frischer Aufguss aus lokalem Zitronengras (Citronella) mit einem Schuss frischem Ananassaft.",
    descriptionRu:
      "Красивый тропический поворот: настой свежего местного лемонграсса (цитронеллы) с добавлением свежего ананасового сока.",
  },
  "tea-peppermint-lime": {
    nameIt: "Menta Piperita & Lime Ghiacciati",
    nameDe: "Eisige Pfefferminz-Limetten-Frische",
    nameRu: "Ледяная мята с лаймом",
    descriptionIt:
      "Un'infusione di menta piperita ultra rinfrescante, shakerata con succo di lime fresco: il rimedio perfetto a metà giornata.",
    descriptionDe:
      "Ein ultrakühlender, klarer Pfefferminzaufguss, geschüttelt mit frischem Limettensaft — die perfekte Abkühlung am Mittag.",
    descriptionRu:
      "Ультраосвежающий настой перечной мяты, взбитый со свежим соком лайма, — идеально в полуденную жару.",
  },
  "tea-english": {
    nameIt: "English Breakfast Premium",
    nameDe: "Premium English Breakfast",
    nameRu: "Английский завтрак премиум",
    descriptionIt: "Una miscela di tè nero tradizionale, ricca e robusta.",
    descriptionDe:
      "Eine kräftige, vollmundige traditionelle Schwarztee-Mischung.",
    descriptionRu: "Насыщенная крепкая традиционная смесь чёрного чая.",
  },
  "tea-earl-grey": {
    nameIt: "Earl Grey Speziato",
    nameDe: "Gewürz-Earl-Grey",
    nameRu: "Пряный Эрл Грей",
    descriptionIt: "Note di bergamotto esaltate dalla cannella locale.",
    descriptionDe: "Bergamottenoten, verstärkt durch lokalen Zimt.",
    descriptionRu: "Ноты бергамота, усиленные местной корицей.",
  },
  "tea-jasmine": {
    nameIt: "Tè Verde al Gelsomino",
    nameDe: "Reiner Jasmin-Grüntee",
    nameRu: "Зелёный чай с жасмином",
    descriptionIt: "Tè verde pulito e floreale, profumato con veri fiori.",
    descriptionDe:
      "Klarer, blumiger Grüntee, mit echten Blüten aromatisiert.",
    descriptionRu:
      "Чистый цветочный зелёный чай, ароматизированный настоящими соцветиями.",
  },
  "tea-classic-citronella": {
    nameIt: "La Citronella Classica",
    nameDe: "Der klassische Zitronengras-Aufguss",
    nameRu: "Классический лемонграсс",
    descriptionIt:
      "Infuso lenitivo di citronella fresca di provenienza locale.",
    descriptionDe:
      "Beruhigender Aufguss aus frischem, lokalem Zitronengras.",
    descriptionRu: "Успокаивающий настой свежего местного лемонграсса.",
  },
  "tea-rouges": {
    nameIt: "Infusione Fruits Rouges",
    nameDe: "Fruits-Rouges-Aufguss",
    nameRu: "Настой красных ягод",
    descriptionIt:
      "Miscela aromatica di fragoline di bosco e bacche scure.",
    descriptionDe:
      "Aromatische Mischung aus Walderdbeeren und dunklen Beeren.",
    descriptionRu: "Ароматная смесь лесной земляники и тёмных ягод.",
  },
  "tea-chamomile": {
    nameIt: "Camomilla e Agrumi",
    nameDe: "Sanfte Kamille mit Zitrus",
    nameRu: "Ромашка с цитрусом",
    descriptionIt:
      "Fiori di camomilla rilassanti con fette di arancia dolce.",
    descriptionDe: "Beruhigende Kamillenblüten mit süßen Orangenscheiben.",
    descriptionRu:
      "Успокаивающие цветки ромашки с дольками сладкого апельсина.",
  },
  "tea-peppermint": {
    nameIt: "Menta Piperita Digestiva",
    nameDe: "Reiner Pfefferminz-Digestif",
    nameRu: "Перечная мята для пищеварения",
    descriptionIt:
      "Foglie di menta intensamente vivaci, amiche dello stomaco.",
    descriptionDe: "Intensiv belebende, magenfreundliche Minzblätter.",
    descriptionRu: "Насыщенные листья мяты, мягкие для желудка.",
  },

  // Breakfast & Brunch
  "bf-sunrise": {
    nameIt: "Il Piatto Sunrise SKY",
    nameDe: "Die SKY Sunrise-Platte",
    nameRu: "Тарелка SKY Sunrise",
    descriptionIt:
      "La colazione più abbondante in riva al mare. Tre uova cotte come preferisce, pane a lievitazione naturale tostato a fette spesse, bacon croccante premium e salsicce grigliate saporite. Serviti con un contorno di fagioli in salsa e, a scelta, un succo fresco estratto a freddo o un caffè caldo.",
    descriptionDe:
      "Das herzhafteste Strandfrühstück. Drei Eier nach Ihrem Wunsch, dick geschnittener Sauerteigtoast, knuspriger Premium-Speck und herzhafte gegrillte Würstchen. Dazu eine Beilage kräftiger Baked Beans und wahlweise ein frisch kaltgepresster Saft oder ein heißer Kaffee.",
    descriptionRu:
      "Самый сытный завтрак у моря. Три яйца на ваш вкус, толстые ломтики тоста на закваске, хрустящий бекон премиум и ароматные жареные колбаски. Подаём с гарниром из фасоли в томате и на выбор — свежий сок холодного отжима или горячий кофе.",
  },
  "bf-francais": {
    nameIt: "Le Petit Déjeuner Français",
    nameDe: "Le Petit Déjeuner Français",
    nameRu: "Французский завтрак",
    descriptionIt:
      "Un mattino parigino senza tempo in riva al mare. A scelta un croissant al burro artigianale caldo e fragrante o un goloso pain au chocolat, servito con pane croccante appena sfornato, burro premium, confettura di frutta gourmet e una selezione di formaggi fini. Accompagnato da un caffè caldo appena fatto, a sua scelta.",
    descriptionDe:
      "Ein zeitloser Pariser Morgen am Meer. Wahlweise ein warmes, blättriges handwerkliches Buttercroissant oder ein üppiges Pain au Chocolat, dazu frisch gebackenes Krustenbrot, Premium-Butter, feine Fruchtkonfitüre und eine Auswahl edler Käse. Begleitet von einem heißen, frisch zubereiteten Kaffee Ihrer Wahl.",
    descriptionRu:
      "Вечное парижское утро у моря. На выбор тёплый слоёный круассан на сливочном масле или насыщенный пан-о-шоколя, свежий хрустящий хлеб, premium масло, фруктовый джем и подборка тонких сыров. В сопровождении горячего свежесваренного кофе на ваш выбор.",
  },
  "bf-avocado": {
    nameIt: "L'Avocado Toast SKY",
    nameDe: "Der SKY Avocado-Toast",
    nameRu: "Тост с авокадо SKY",
    descriptionIt:
      "Pane a lievitazione naturale tostato a fette spesse con avocado fresco schiacciato finemente, una spruzzata di lime, fiocchi di peperoncino e una delicata spolverata di semi di chia.",
    descriptionDe:
      "Dick geschnittener Sauerteigtoast mit fein zerdrückter frischer Avocado, einem Spritzer Limette, Chiliflocken und einer zarten Prise Chiasamen.",
    descriptionRu:
      "Толстый ломтик тоста на закваске с нежно размятым свежим авокадо, соком лайма, хлопьями чили и деликатной щепоткой семян чиа.",
  },
  "bf-caprese": {
    nameIt: "Il Croissant Caprese",
    nameDe: "Der Caprese-Croissant-Melt",
    nameRu: "Круассан капрезе",
    descriptionIt:
      "Croissant caldo e fragrante farcito con mozzarella fusa e cremosa, fette spesse di pomodoro fresco locale e un vivace filo di pesto al basilico fatto in casa.",
    descriptionDe:
      "Ein warmes, blättriges Croissant, gefüllt mit cremig geschmolzenem Mozzarella, dicken Scheiben frischer lokaler Tomaten und einem lebendigen hausgemachten Basilikumpesto.",
    descriptionRu:
      "Тёплый слоёный круассан с кремово расплавленной моцареллой, толстыми ломтиками свежих местных томатов и ярким домашним песто из базилика.",
  },
  "bf-salmon": {
    nameIt: "Croissant Gourmet al Salmone Affumicato",
    nameDe: "Gourmet-Croissant mit Räucherlachs",
    nameRu: "Круассан с копчёным лососем",
    descriptionIt:
      "Sfoglia artigianale al burro con salmone affumicato a freddo premium, formaggio spalmabile ricco, aneto fresco e capperi locali croccanti.",
    descriptionDe:
      "Ein blättriges Buttergebäck mit premium kaltgeräuchertem Lachs, vollmundigem Frischkäse, frischem Dill und knackigen lokalen Kapern.",
    descriptionRu:
      "Слоёная выпечка на масле с лососем холодного копчения премиум, насыщенным сливочным сыром, свежим укропом и хрустящими местными каперсами.",
  },
  "bf-oats": {
    nameIt: "Overnight Oats Vaniglia & Chia",
    nameDe: "Overnight Oats mit Vanille & Chia",
    nameRu: "Ночная овсянка с ванилью и чиа",
    descriptionIt:
      "Fiocchi d'avena in infusione con bacca di vaniglia e latte d'avena, stratificati con un'abbondante spolverata di semi di chia e completati al momento al bancone con banana a fette, miele locale crudo e mandorle tostate.",
    descriptionDe:
      "Haferflocken mit Vanilleschote und Hafermilch, geschichtet mit einer großzügigen Portion Chiasamen und frisch am Tresen mit Bananenscheiben, rohem lokalem Honig und gerösteten Mandeln getoppt.",
    descriptionRu:
      "Овсяные хлопья с ванильным стручком и овсяным молоком, слоями с щедрой порцией семян чиа, а сверху — банан, местный мёд и обжаренный миндаль.",
  },

  // Coffee
  "cof-espresso": {
    nameIt: "Espresso",
    nameDe: "Espresso",
    nameRu: "Эспрессо",
    descriptionIt: "Estrazione ricca e intensa con una crema dorata e densa.",
    descriptionDe: "Kräftiger, intensiver Shot mit dichter goldener Crema.",
    descriptionRu:
      "Насыщенный, интенсивный шот с плотной золотистой пенкой.",
  },
  "cof-macchiato": {
    nameIt: "Espresso Macchiato",
    nameDe: "Espresso Macchiato",
    nameRu: "Эспрессо макиато",
    descriptionIt:
      "Macchiato con un piccolo tocco di schiuma di latte vellutata.",
    descriptionDe:
      "Mit einem kleinen Klecks samtigem Milchschaum verfeinert.",
    descriptionRu: "С небольшой каплей бархатистой молочной пены.",
  },
  "cof-americano": {
    nameIt: "Americano",
    nameDe: "Americano",
    nameRu: "Американо",
    descriptionIt: "Caffè nero morbido e profondo, con espresso premium.",
    descriptionDe: "Weicher, tiefschwarzer Kaffee mit Premium-Espresso.",
    descriptionRu:
      "Мягкий насыщенный чёрный кофе на основе эспрессо премиум.",
  },
  "cof-cortado": {
    nameIt: "Cortado",
    nameDe: "Cortado",
    nameRu: "Кортадо",
    descriptionIt: "Parti uguali di espresso e latte caldo con microschiuma.",
    descriptionDe:
      "Zu gleichen Teilen Espresso und warme Milch mit Mikroschaum.",
    descriptionRu: "Равные части эспрессо и тёплого молока с микропеной.",
  },
  "cof-cappuccino": {
    nameIt: "Cappuccino",
    nameDe: "Cappuccino",
    nameRu: "Капучино",
    descriptionIt:
      "Il tradizionale equilibrio perfetto di schiuma, latte ed espresso.",
    descriptionDe:
      "Die traditionelle perfekte Balance aus Schaum, Milch und Espresso.",
    descriptionRu:
      "Традиционный идеальный баланс пены, молока и эспрессо.",
  },
  "cof-flatwhite": {
    nameIt: "Flat White",
    nameDe: "Flat White",
    nameRu: "Флэт уайт",
    descriptionIt: "Microschiuma morbida e vellutata su un espresso pulito.",
    descriptionDe: "Weicher, samtiger Mikroschaum über klarem Espresso.",
    descriptionRu: "Мягкая бархатистая микропена на чистом эспрессо.",
  },
  "cof-latte": {
    nameIt: "Caffè Latte",
    nameDe: "Café Latte",
    nameRu: "Латте",
    descriptionIt:
      "Bevanda lunga al latte, avvolgente, con una schiuma leggera.",
    descriptionDe: "Wohltuendes langes Milchgetränk mit leichtem Schaum.",
    descriptionRu: "Уютный большой молочный напиток с лёгкой пеной.",
  },
  "cof-mocha": {
    nameIt: "Caffè Mocha",
    nameDe: "Café Mocha",
    nameRu: "Мокка",
    descriptionIt: "Goloso incontro di espresso, cioccolato ricco e latte.",
    descriptionDe:
      "Verführerische Mischung aus Espresso, vollmundiger Schokolade und Milch.",
    descriptionRu:
      "Соблазнительное сочетание эспрессо, насыщенного шоколада и молока.",
  },
  "cof-chocolate": {
    nameIt: "Cioccolata Calda Artigianale",
    nameDe: "Handwerkliche heiße Schokolade",
    nameRu: "Ремесленный горячий шоколад",
    descriptionIt:
      "Cacao fondente premium e latte montato dalla texture perfetta.",
    descriptionDe: "Premium-Kakao und perfekt aufgeschäumte Milch.",
    descriptionRu: "Тёмное какао премиум и идеально взбитое молоко.",
  },
  "cof-chai": {
    nameIt: "Chai Latte Speziato SKY",
    nameDe: "SKY Gewürz-Chai-Latte",
    nameRu: "Пряный чай-латте SKY",
    descriptionIt:
      "Miscela aromatica di tè, spezie mauriziane e miele crudo.",
    descriptionDe:
      "Aromatische Mischung aus Tee, mauritischen Gewürzen und Rohhonig.",
    descriptionRu:
      "Ароматная смесь чая, маврикийских специй и сырого мёда.",
  },
  "cof-iced-americano": {
    nameIt: "Americano Freddo",
    nameDe: "Iced Americano",
    nameRu: "Айс американо",
    descriptionIt: "Estrazioni ricche versate su ghiaccio e acqua fredda.",
    descriptionDe: "Kräftige Shots über Eis und kaltes Wasser gegossen.",
    descriptionRu: "Насыщенный эспрессо на льду с холодной водой.",
  },
  "cof-iced-latte": {
    nameIt: "Latte Freddo",
    nameDe: "Iced Latte",
    nameRu: "Айс латте",
    descriptionIt:
      "Espresso con latte freddo su ghiaccio, per una carica pulita.",
    descriptionDe: "Espresso mit kalter Milch über Eis für einen klaren Kick.",
    descriptionRu: "Эспрессо с холодным молоком на льду — чистая бодрость.",
  },
  "cof-iced-caramel": {
    nameIt: "Latte Freddo al Caramello",
    nameDe: "Iced Caramel Latte",
    nameRu: "Айс латте с карамелью",
    descriptionIt:
      "Il nostro latte morbido con una salsa al caramello dolce e ricca.",
    descriptionDe:
      "Unser weicher Latte mit süßer, vollmundiger Karamellsauce.",
    descriptionRu:
      "Наш мягкий латте со сладким насыщенным карамельным соусом.",
  },
  "cof-iced-mocha": {
    nameIt: "Mocha Freddo",
    nameDe: "Iced Mocha",
    nameRu: "Айс мокка",
    descriptionIt:
      "Espresso freddo e cioccolato ricco montati con latte fresco.",
    descriptionDe:
      "Kalter Espresso und vollmundige Schokolade, aufgeschlagen mit frischer Milch.",
    descriptionRu:
      "Холодный эспрессо и насыщенный шоколад, взбитые со свежим молоком.",
  },

  // Milkshakes & Pastries
  "shake-mango": {
    nameIt: "Il Sovrano al Mango",
    nameDe: "Der Mango Sovereign",
    nameRu: "Король манго",
    descriptionIt:
      "Il nostro milkshake signature per eccellenza. Mango freschi, dolci e vivaci frullati alla perfezione con una ricca base di gelato artigianale alla vaniglia.",
    descriptionDe:
      "Unser krönender Signature-Shake. Leuchtend süße frische Mangos, perfekt gemixt mit einer vollmundigen Basis aus handwerklichem Vanilleeis.",
    descriptionRu:
      "Наш главный фирменный коктейль. Яркие сладкие манго, идеально взбитые с насыщенной основой из ванильного джелато.",
  },
  "shake-matcha": {
    nameIt: "Frappé al Matcha",
    nameDe: "Matcha Frappé",
    nameRu: "Матча фраппе",
    descriptionIt:
      "Una miscela lussuosa e ghiacciata di tè verde matcha cerimoniale premium, montato con la nostra base di gelato alla vaniglia per un tocco vivace e moderno.",
    descriptionDe:
      "Eine luxuriöse, eisige Mischung aus Premium-Matcha-Grüntee in Zeremonienqualität, cremig aufgeschlagen mit unserer Vanilleeis-Basis — lebendig und modern.",
    descriptionRu:
      "Роскошный ледяной микс церемониального зелёного чая матча премиум, взбитого с нашей ванильной джелато-основой, — яркий современный акцент.",
  },
  "shake-oreo": {
    nameIt: "Croccante Oreo",
    nameDe: "Oreo Cookies Crunch",
    nameRu: "Хрустящий Орео",
    descriptionIt:
      "Gelato premium cookies & cream frullato fino a essere setoso e ricco di biscotti Oreo al cacao sbriciolati e croccanti.",
    descriptionDe:
      "Premium Cookies-&-Cream-Eis, cremig gemixt und voller knuspriger, zerbröselter Oreo-Kakaokekse.",
    descriptionRu:
      "Джелато cookies & cream, взбитое до гладкости, с хрустящим дроблёным какао-печеньем Орео.",
  },
  "shake-vanilla": {
    nameIt: "Crema Classica alla Vaniglia",
    nameDe: "Klassische Vanillecreme",
    nameRu: "Классические ванильные сливки",
    descriptionIt:
      "Un milkshake ricco e vellutato con il nostro gelato artigianale alla vaniglia e latte fresco.",
    descriptionDe:
      "Ein vollmundiger, samtiger Shake aus unserem handwerklichen Vanilleeis und frischer Milch.",
    descriptionRu:
      "Насыщенный бархатистый коктейль из нашего ванильного джелато и свежего молока.",
  },
  "shake-chocolate": {
    nameIt: "Velluto di Cioccolato",
    nameDe: "Dunkler Schokoladen-Samt",
    nameRu: "Шоколадный бархат",
    descriptionIt:
      "Un milkshake al cioccolato intenso e goloso, con gelato al cioccolato ricco e completato da un filo di cioccolato vellutato.",
    descriptionDe:
      "Ein intensiver, dekadenter Schokoladenshake aus vollmundigem Schokoladeneis, vollendet mit einem samtigen Schokoladenfaden.",
    descriptionRu:
      "Интенсивный роскошный шоколадный коктейль на насыщенном шоколадном джелато, завершённый бархатистым шоколадным соусом.",
  },
  "shake-strawberry": {
    nameIt: "Vortice Tropicale alla Fragola",
    nameDe: "Tropischer Erdbeer-Swirl",
    nameRu: "Тропический клубничный вихрь",
    descriptionIt:
      "Una miscela rinfrescante e vivace del nostro gelato alla vaniglia con fragole dolci, completata da un coulis di frutta setoso.",
    descriptionDe:
      "Eine erfrischende, lebendige Mischung aus unserem vollmundigen Vanilleeis und süßen Erdbeeren, vollendet mit einem feinen Fruchtcoulis.",
    descriptionRu:
      "Освежающее яркое сочетание ванильного джелато и сладкой клубники с нежным фруктовым кули.",
  },
  "shake-caramel": {
    nameIt: "Sogno al Caramello Salato",
    nameDe: "Traum aus gesalzenem Karamell",
    nameRu: "Мечта о солёной карамели",
    descriptionIt:
      "L'incontro perfetto tra dolce e sapido. Gelato artigianale al caramello montato con un tocco di sale marino fino e un filo di caramello burroso.",
    descriptionDe:
      "Die perfekte Verbindung von süß und salzig. Handwerkliches Karamelleis, aufgeschlagen mit feinem Meersalz und einem buttrigen Karamellfaden.",
    descriptionRu:
      "Идеальное сочетание сладкого и солёного. Карамельное джелато, взбитое с щепоткой морской соли и сливочной карамелью.",
  },
  "shake-almond": {
    nameIt: "Seta di Mandorle Tostate",
    nameDe: "Geröstete Mandel-Seide",
    nameRu: "Шёлк из обжаренного миндаля",
    descriptionIt:
      "Un capolavoro morbido e nocciolato: gelato alla vaniglia cremoso, pasta di mandorle tostate premium e un tocco croccante.",
    descriptionDe:
      "Ein weiches, nussiges Meisterwerk aus cremigem Vanilleeis, Premium-Mandelmus und einem Hauch gerösteter Knusprigkeit.",
    descriptionRu:
      "Гладкий ореховый шедевр: сливочное ванильное джелато, паста из обжаренного миндаля и лёгкий хруст.",
  },
  "pastry-daily": {
    nameIt: "Pasticceria e Croissant del Giorno",
    nameDe: "Täglich frisches Gebäck & Croissants",
    nameRu: "Свежая выпечка и круассаны дня",
    descriptionIt:
      "Sfornati freschi ogni mattina. Si avvicini al nostro espositore accanto al bancone principale per vedere la selezione fresca di oggi: pasticceria artigianale, croissant fragranti e dolcezze.",
    descriptionDe:
      "Jeden Morgen frisch gebacken. Werfen Sie einen Blick auf unsere Auslage neben dem Haupttresen — die heutige frische Auswahl an handwerklichem Gebäck, blättrigen Croissants und süßen Kleinigkeiten.",
    descriptionRu:
      "Печём свежее каждое утро. Подойдите к витрине рядом с основной стойкой, чтобы увидеть сегодняшнюю свежую подборку ремесленной выпечки, слоёных круассанов и сладостей.",
    priceNoteIt: "Prezzo esposto",
    priceNoteDe: "Preis laut Auszeichnung",
    priceNoteRu: "По ценнику",
  },

  // Beach Bites
  "bite-prawns": {
    nameIt: "Gamberi Dorati Croccanti",
    nameDe: "Knusprige goldene Garnelen",
    nameRu: "Хрустящие золотистые креветки",
    descriptionIt:
      "Una porzione generosa di gamberi polposi e succosi, avvolti in una pastella dorata straordinariamente croccante. Serviti con una salsa della casa al sweet chilli e ananas tropicale.",
    descriptionDe:
      "Eine großzügige Portion praller, saftiger Garnelen in bemerkenswert knusprigem, goldenem Teigmantel. Serviert mit einem eigens gemachten Sweet-Chili-Ananas-Dip.",
    descriptionRu:
      "Щедрая порция сочных креветок в невероятно хрустящем золотистом кляре. Подаём с фирменным соусом из сладкого чили и тропического ананаса.",
  },
  "bite-calamari": {
    nameIt: "Anelli di Calamaro Croccanti",
    nameDe: "Knusprige Calamari-Ringe",
    nameRu: "Хрустящие кольца кальмара",
    descriptionIt:
      "Una porzione premium di calamari teneri in una panatura leggera e saporita, fritti fino a doratura perfetta. Serviti con ketchup, salsa sweet chilli o secondo la sua richiesta.",
    descriptionDe:
      "Eine Premium-Portion zarter Calamari in leichter, gewürzter Panade, goldbraun frittiert. Serviert mit Ketchup, Sweet-Chili-Sauce oder nach Wunsch.",
    descriptionRu:
      "Премиальная порция нежного кальмара в лёгкой пряной панировке, обжаренного до идеальной золотистости. Подаём с кетчупом, соусом сладкий чили или по вашему пожеланию.",
  },
  "bite-chicken": {
    nameIt: "Bocconcini di Pollo Dorati",
    nameDe: "Knusprige goldene Hähnchen-Bites",
    nameRu: "Хрустящие золотистые кусочки курицы",
    descriptionIt:
      "Un grande piatto da condividere con bocconcini di pollo tenero, insaporiti con spezie locali dell'isola e fritti fino alla croccantezza perfetta. Serviti con ketchup, salsa sweet chilli o secondo la sua richiesta.",
    descriptionDe:
      "Eine große Platte zum Teilen mit zarten Hähnchenstücken, gewürzt mit lokalen Inselgewürzen und perfekt knusprig frittiert. Serviert mit Ketchup, Sweet-Chili-Sauce oder nach Wunsch.",
    descriptionRu:
      "Большое блюдо для компании: нежные кусочки курицы с местными островными специями, обжаренные до идеального хруста. Подаём с кетчупом, соусом сладкий чили или по вашему пожеланию.",
  },
  "bite-springrolls": {
    nameIt: "Involtini Primavera al Pollo",
    nameDe: "Herzhafte Hähnchen-Frühlingsrollen",
    nameRu: "Спринг-роллы с курицей",
    descriptionIt:
      "Involtini di pasta dorata e croccante, generosamente farciti con un ripieno saporito e perfettamente condito di pollo e verdure. Serviti caldi con ketchup, salsa sweet chilli o secondo la sua richiesta.",
    descriptionDe:
      "Knusprige, goldene Teigrollen, großzügig gefüllt mit einer herzhaften, perfekt gewürzten Hähnchen-Gemüse-Füllung. Heiß serviert mit Ketchup, Sweet-Chili-Sauce oder nach Wunsch.",
    descriptionRu:
      "Хрустящие золотистые роллы с щедрой начинкой из ароматной, идеально приправленной курицы с овощами. Подаём горячими с кетчупом, соусом сладкий чили или по вашему пожеланию.",
  },
  "bite-fries": {
    nameIt: "Patatine con Formaggio Fuso",
    nameDe: "Pommes mit geschmolzenem Käse",
    nameRu: "Картофель фри с расплавленным сыром",
    descriptionIt:
      "Un cestino generoso da condividere di patatine calde e croccanti, salate con sale marino fino e completamente ricoperte da una vellutata salsa al formaggio fuso.",
    descriptionDe:
      "Ein großzügiger Korb zum Teilen mit heißen, knusprigen Pommes, feinem Meersalz und vollständig überzogen von einer samtigen geschmolzenen Käsesauce.",
    descriptionRu:
      "Щедрая корзина горячего хрустящего картофеля с мелкой морской солью, полностью залитого насыщенным бархатистым сырным соусом.",
  },
  "bite-samosas": {
    nameIt: "Samosa Tradizionali dell'Isola",
    nameDe: "Traditionelle Insel-Samosas",
    nameRu: "Традиционные островные самосы",
    descriptionIt:
      "Un classico amatissimo dell'isola. Triangoli di pasta dorata e friabile con un ripieno di patate ed erbe perfettamente speziato. Serviti caldi e freschi con ketchup, salsa sweet chilli o secondo la sua richiesta.",
    descriptionDe:
      "Ein lokaler Klassiker. Blättrige goldene Teigdreiecke mit perfekt gewürzter Kartoffel-Kräuter-Füllung. Heiß und frisch serviert mit Ketchup, Sweet-Chili-Sauce oder nach Wunsch.",
    descriptionRu:
      "Местная классика. Слоёные золотистые треугольники с идеально приправленной начинкой из картофеля и трав. Подаём горячими и свежими с кетчупом, соусом сладкий чили или по вашему пожеланию.",
  },

  // Mocktails
  "mock-pinacolada": {
    nameIt: "La Piña Colada SKY",
    nameDe: "Die SKY Piña Colada",
    nameRu: "Пина колада SKY",
    descriptionIt:
      "Un capolavoro cremoso e lussuoso dell'isola. Frullata al momento con il nostro cocco locale e ananas dolce e maturo, servita densa e ghiacciata.",
    descriptionDe:
      "Ein luxuriöses, cremiges Inselmeisterwerk. Frisch gemixt aus unserer lokalen Kokosernte und süßer, reifer Ananas — eisig und dickflüssig serviert.",
    descriptionRu:
      "Роскошный сливочный островной шедевр. Взбиваем свежим из местного кокоса и сладкого спелого ананаса, подаём густым и ледяным.",
  },
  "mock-sunset": {
    nameIt: "Il Bagliore del Tramonto SKY",
    nameDe: "Der SKY Sunset Glow",
    nameRu: "Закатное сияние SKY",
    descriptionIt:
      "La nostra creazione signature da terrazza. Un mix tropicale vivace di arancia dolce, ananas croccante e frutto della passione deciso, completato da un delicato tocco di frutto del drago fresco per catturare la perfetta tinta luminosa del cielo della sera.",
    descriptionDe:
      "Unsere Signature-Kreation für die Terrasse. Eine lebendige, tropische Mischung aus süßer Orange, frischer Ananas und spritziger Maracuja, vollendet mit einem zarten Hauch frischer Drachenfrucht — der perfekte leuchtende Farbton des Abendhimmels.",
    descriptionRu:
      "Наша фирменная террасная композиция. Яркий тропический микс сладкого апельсина, свежего ананаса и маракуйи, завершённый деликатным штрихом свежего драконьего фрукта — точный оттенок сияющего вечернего неба.",
  },
  "mock-bluelagoon": {
    nameIt: "La Laguna Blu SKY",
    nameDe: "Die SKY Blue Lagoon",
    nameRu: "Голубая лагуна SKY",
    descriptionIt:
      "Un drink spettacolare da spiaggia. Succo di lime locale appena spremuto e un tocco di sciroppo blue curaçao, stratificati su ghiaccio tritato e completati con acqua frizzante. Guarnito con una fetta di arancia fresca e un vivace rametto di menta dell'orto.",
    descriptionDe:
      "Ein optisch beeindruckendes Strandgetränk. Frisch gepresster lokaler Limettensaft und ein Hauch Blue-Curaçao-Sirup über Crushed Ice, aufgefüllt mit Sprudelwasser. Garniert mit einer Scheibe frischer Orange und einem kräftigen Zweig Gartenminze.",
    descriptionRu:
      "Эффектный пляжный напиток. Свежевыжатый сок местного лайма и капля сиропа блю кюрасао на дроблёном льду, долитые газированной водой. Украшен долькой свежего апельсина и сочной веточкой садовой мяты.",
  },
  "mock-passionmojito": {
    nameIt: "Mojito Frizzante al Frutto della Passione",
    nameDe: "Prickelnder Maracuja-Mojito",
    nameRu: "Игристый мохито с маракуйей",
    descriptionIt:
      "Un classico dell'isola intensamente aromatico. Menta fresca dell'orto e spicchi di lime pestati, stratificati con la nostra polpa di frutto della passione signature, acidula, ghiaccio tritato e soda premium.",
    descriptionDe:
      "Ein intensiv aromatischer Inselklassiker. Frische Gartenminze und Limettenspalten gemörsert, geschichtet mit unserem säuerlichen Signature-Maracujamark, Crushed Ice und Premium-Soda.",
    descriptionRu:
      "Насыщенно ароматная островная классика. Растёртые свежая садовая мята и дольки лайма, слои нашей фирменной кисловатой мякоти маракуйи, дроблёный лёд и премиальная содовая.",
  },
  "mock-ruby": {
    nameIt: "Il Ruby Sparkler",
    nameDe: "Der Ruby Sparkler",
    nameRu: "Рубиновый спарклер",
    descriptionIt:
      "Un raffinato preferito della terrazza. Succo di pompelmo rosa luminoso abbinato a un tocco sottile e leggero di zenzero estratto a freddo e menta fresca spezzata, costruito sul ghiaccio e completato con tonica premium.",
    descriptionDe:
      "Ein raffinierter Terrassenliebling. Leuchtender roter Grapefruitsaft mit einer subtilen, leichten Note kaltgepressten Ingwers und frisch gezupfter Minze, über Eis gebaut und mit Premium-Tonic aufgefüllt.",
    descriptionRu:
      "Изысканный фаворит террасы. Яркий сок красного грейпфрута с тонкой лёгкой ноткой имбиря холодного отжима и свежесорванной мятой, на льду с премиальным тоником.",
  },
  "mock-virginmojito": {
    nameIt: "Mojito Analcolico Classico",
    nameDe: "Klassischer Virgin Mojito",
    nameRu: "Классический безалкогольный мохито",
    descriptionIt:
      "Il massimo della freschezza a metà giornata. Foglie di menta fresca e spicchi di lime succosi pestati con zucchero di canna puro, su ghiaccio tritato e completati con soda frizzante.",
    descriptionDe:
      "Die ultimative Erfrischung zur Mittagszeit. Frische Gartenminzblätter und saftige Limettenspalten mit reinem Rohrzucker gemörsert, über Crushed Ice und mit Sprudel aufgefüllt.",
    descriptionRu:
      "Идеальное дневное освежение. Свежие листья мяты и сочные дольки лайма, растёртые с тростниковым сахаром, на дроблёном льду с газированной содовой.",
  },

  // Refreshments
  "soft-still": {
    nameIt: "Acqua Naturale Locale",
    nameDe: "Lokales stilles Wasser",
    nameRu: "Местная негазированная вода",
  },
  "soft-sparkling": {
    nameIt: "Acqua Frizzante Premium",
    nameDe: "Premium-Sprudelwasser",
    nameRu: "Премиальная газированная вода",
  },
  "soft-coke": {
    nameIt: "Coca-Cola",
    nameDe: "Coca-Cola",
    nameRu: "Кока-Кола",
  },
  "soft-coke-diet": {
    nameIt: "Coca-Cola Diet",
    nameDe: "Coca-Cola Light",
    nameRu: "Кока-Кола Диет",
  },
  "soft-sprite": {
    nameIt: "Sprite",
    nameDe: "Sprite",
    nameRu: "Спрайт",
  },
  "soft-fanta": {
    nameIt: "Fanta",
    nameDe: "Fanta",
    nameRu: "Фанта",
  },
  "soft-club": {
    nameIt: "Soda",
    nameDe: "Sodawasser",
    nameRu: "Содовая",
  },
  "soft-tonic": {
    nameIt: "Acqua Tonica",
    nameDe: "Tonic Water",
    nameRu: "Тоник",
  },
};
