import {
  categoryTranslations,
  dishTranslations,
  groupTranslations,
  settingsTranslations,
} from "@/lib/menuTranslations";
import type { Category, Dish, Layout, Settings } from "@/sanity/queries";

/**
 * The SKY Lounge menu, transcribed from the master menu PDF.
 *
 * This renders until Sanity has its first published section, so the site works
 * the moment it is deployed. `npm run seed` pushes this same content into
 * Sanity, after which the Studio becomes the source of truth and this file is
 * no longer read.
 *
 * PHOTOS ARE STOCK IMAGES from Unsplash, not photographs of SKY's own dishes.
 * Replace them in the Studio before this goes live on the tables.
 */

const UNSPLASH = "https://images.unsplash.com/photo-";

function photo(id: string) {
  return {
    imageUrl: `${UNSPLASH}${id}?w=600&h=450&fit=crop&q=72&auto=format`,
    imageUrlLarge: `${UNSPLASH}${id}?w=1400&q=80&auto=format`,
  };
}

type Seed = {
  id: string;
  en: string;
  fr: string;
  descEn?: string;
  descFr?: string;
  price?: number;
  noteEn?: string;
  noteFr?: string;
  groupEn?: string;
  groupFr?: string;
  /**
   * Off for an item that is on the menu but not being served yet — a flavour
   * the kitchen has announced but not churned. Sanity drops it from the menu
   * until "Available today" is switched back on; the fallback menu here marks
   * it sold out. Defaults to on.
   */
  available?: boolean;
  photoId?: string;
  /**
   * A transparent cut-out served from /public — what the grid is designed
   * around. Drop-in replacement point for real product photography: swap the
   * file behind the same path and nothing here has to change.
   */
  cutout?: string;
};

/**
 * Italian, German and Russian for this item and for the sub-group it sits in.
 * They live in menuTranslations.ts, keyed by the same ids used here — see the
 * note at the top of that file.
 */
function translationsFor(seed: Seed) {
  const group = seed.groupEn ? groupTranslations[seed.groupEn] : undefined;

  return {
    ...dishTranslations[seed.id],
    groupIt: group?.titleIt,
    groupDe: group?.titleDe,
    groupRu: group?.titleRu,
  };
}

function item(seed: Seed): Dish {
  return {
    _id: seed.id,
    nameEn: seed.en,
    nameFr: seed.fr,
    descriptionEn: seed.descEn,
    descriptionFr: seed.descFr,
    price: seed.price ?? null,
    priceNoteEn: seed.noteEn,
    priceNoteFr: seed.noteFr,
    groupEn: seed.groupEn,
    groupFr: seed.groupFr,
    ...translationsFor(seed),
    available: seed.available ?? true,
    ...(seed.cutout
      ? { imageUrl: seed.cutout, imageUrlLarge: seed.cutout }
      : seed.photoId
        ? photo(seed.photoId)
        : { imageUrl: null, imageUrlLarge: null }),
  };
}

// Menu order is the array order here; the seeder turns the index into Sanity's
// numeric `order` field.
function section(
  c: Omit<Category, "dishes" | "layout"> & { layout: Layout },
  seeds: Seed[],
): Category {
  return {
    ...c,
    ...categoryTranslations[c._id],
    dishes: seeds.map(item),
  };
}

export const menuSettings: Settings = {
  name: "SKY",
  taglineEn: "Flic en Flac · Beachfront lounge",
  taglineFr: "Flic en Flac · Lounge en bord de mer",
  currency: "Rs",
  logoUrl: null,
  noticeEn:
    "A curated collection of artisanal gelato, cold-pressed tropical fruits, and premium specialty coffee, crafted to be enjoyed by the ocean.",
  noticeFr:
    "Une collection choisie de glaces artisanales, de fruits tropicaux pressés à froid et de cafés de spécialité, à savourer face à l'océan.",
  ...settingsTranslations,
};

export const menuCategories: Category[] = [
  section(
    {
      _id: "sec-gelato",
      titleEn: "Gelato & Sorbets",
      titleFr: "Glaces & Sorbets",
      introEn:
        "Crafted daily. Pure, vibrant flavours perfect for the beachfront. Single scoop selection Rs 125.",
      introFr:
        "Préparées chaque jour. Des saveurs pures et éclatantes, parfaites en bord de mer. Sélection à la boule Rs 125.",
      footnoteEn:
        "Please enquire with our team for today's seasonal guest flavours.",
      footnoteFr:
        "Renseignez-vous auprès de notre équipe sur les parfums invités de saison du jour.",
      layout: "grid",
    },
    [
      {
        id: "gel-mango",
        en: "Mango",
        fr: "Mangue",
        descEn: "Smooth, velvety, and naturally sweet.",
        descFr: "Onctueux, velouté et naturellement sucré.",
        price: 125,
        groupEn: "Tropical Sorbets (Dairy-Free)",
        groupFr: "Sorbets Tropicaux (Sans Lactose)",
        cutout: "/fruit/mango.svg",
      },
      {
        id: "gel-passion",
        en: "Passion Fruit",
        fr: "Fruit de la Passion",
        descEn: "Sharp, vibrant, and intensely aromatic.",
        descFr: "Vif, éclatant et intensément aromatique.",
        price: 125,
        groupEn: "Tropical Sorbets (Dairy-Free)",
        groupFr: "Sorbets Tropicaux (Sans Lactose)",
        cutout: "/fruit/passion-fruit.svg",
      },
      {
        id: "gel-pineapple",
        en: "Pineapple",
        fr: "Ananas",
        descEn: "Crisp, refreshing, and packed with island sunshine.",
        descFr: "Croquant, rafraîchissant et gorgé de soleil des îles.",
        price: 125,
        groupEn: "Tropical Sorbets (Dairy-Free)",
        groupFr: "Sorbets Tropicaux (Sans Lactose)",
        cutout: "/fruit/pineapple.svg",
      },
      {
        id: "gel-coco",
        en: "Coco",
        fr: "Coco",
        descEn: "Rich, smooth, and beautifully tropical.",
        descFr: "Riche, onctueux et merveilleusement tropical.",
        price: 125,
        groupEn: "Tropical Sorbets (Dairy-Free)",
        groupFr: "Sorbets Tropicaux (Sans Lactose)",
        cutout: "/fruit/coconut.svg",
      },
      {
        id: "gel-grapefruit",
        en: "Grapefruit",
        fr: "Pamplemousse",
        descEn: "A sophisticated balance of bright, crisp citrus.",
        descFr: "Un équilibre raffiné d'agrumes vifs et éclatants.",
        price: 125,
        groupEn: "Tropical Sorbets (Dairy-Free)",
        groupFr: "Sorbets Tropicaux (Sans Lactose)",
        cutout: "/fruit/grapefruit.svg",
      },
      {
        id: "gel-guava",
        en: "Guava",
        fr: "Goyave",
        descEn: "Fragrant, exotic, and deeply refreshing.",
        descFr: "Parfumée, exotique et profondément rafraîchissante.",
        price: 125,
        groupEn: "Tropical Sorbets (Dairy-Free)",
        groupFr: "Sorbets Tropicaux (Sans Lactose)",
        cutout: "/fruit/guava.svg",
      },
      /*
       * The five flavours the kitchen announced on 23 August, off the menu
       * until the first batch is churned — see the `available` note above.
       */
      {
        id: "gel-melon",
        en: "Melon",
        fr: "Melon",
        descEn: "Cool, mellow, and quietly sweet.",
        descFr: "Frais, doux et délicatement sucré.",
        price: 125,
        groupEn: "Tropical Sorbets (Dairy-Free)",
        groupFr: "Sorbets Tropicaux (Sans Lactose)",
        available: false,
      },
      {
        id: "gel-avocado",
        en: "Avocado",
        fr: "Avocat",
        descEn: "Silky, gently nutty, and unexpectedly refreshing.",
        descFr: "Soyeux, légèrement noiseté et étonnamment rafraîchissant.",
        price: 125,
        groupEn: "Tropical Sorbets (Dairy-Free)",
        groupFr: "Sorbets Tropicaux (Sans Lactose)",
        available: false,
      },
      {
        id: "gel-letchi",
        en: "Letchi",
        fr: "Letchi",
        descEn: "Delicate, floral, and unmistakably of the island.",
        descFr: "Délicat, floral et résolument insulaire.",
        price: 125,
        groupEn: "Tropical Sorbets (Dairy-Free)",
        groupFr: "Sorbets Tropicaux (Sans Lactose)",
        available: false,
      },
      {
        id: "gel-watermelon",
        en: "Watermelon",
        fr: "Pastèque",
        descEn: "Light, juicy, and thirst-quenching.",
        descFr: "Léger, juteux et désaltérant.",
        price: 125,
        groupEn: "Tropical Sorbets (Dairy-Free)",
        groupFr: "Sorbets Tropicaux (Sans Lactose)",
        available: false,
      },
      {
        id: "gel-bergamot",
        en: "Bergamot",
        fr: "Bergamote",
        descEn: "Bright, perfumed citrus with a clean finish.",
        descFr: "Agrume parfumé et éclatant, à la finale nette.",
        price: 125,
        groupEn: "Tropical Sorbets (Dairy-Free)",
        groupFr: "Sorbets Tropicaux (Sans Lactose)",
        available: false,
      },
      {
        id: "gel-vanilla",
        en: "Classic Vanilla",
        fr: "Vanille Classique",
        descEn: "Rich, creamy, and elegantly smooth.",
        descFr: "Riche, crémeuse et d'une élégante onctuosité.",
        price: 125,
        groupEn: "Premium Gelato",
        groupFr: "Glaces Premium",
        photoId: "1497034825429-c343d7c6a68f",
      },
      {
        id: "gel-chocolate",
        en: "Deep Chocolate",
        fr: "Chocolat Intense",
        descEn: "Indulgent, velvety, and intensely decadent.",
        descFr: "Gourmand, velouté et intensément décadent.",
        price: 125,
        groupEn: "Premium Gelato",
        groupFr: "Glaces Premium",
        photoId: "1580915411954-282cb1b0d780",
      },
      {
        id: "gel-caramel",
        en: "Salted Caramel",
        fr: "Caramel au Beurre Salé",
        descEn:
          "Perfect balance of rich sweetness and a hint of sea salt.",
        descFr:
          "L'équilibre parfait entre douceur riche et pointe de sel marin.",
        price: 125,
        groupEn: "Premium Gelato",
        groupFr: "Glaces Premium",
        photoId: "1516559828984-fb3b99548b21",
      },
      {
        id: "gel-oreo",
        en: "Oreo Cookies & Cream",
        fr: "Oreo Cookies & Cream",
        descEn:
          "A classic favourite packed with crunchy chocolate biscuit swirls.",
        descFr:
          "Un grand classique parsemé d'éclats croquants de biscuit au chocolat.",
        price: 125,
        groupEn: "Premium Gelato",
        groupFr: "Glaces Premium",
        photoId: "1567206563064-6f60f40a2b57",
      },
      {
        id: "gel-raspberry",
        en: "Raspberry Cheesecake",
        fr: "Cheesecake Framboise",
        descEn:
          "Tart raspberry ribboned through a rich, creamy cake base.",
        descFr:
          "Framboise acidulée marbrée dans une base de cheesecake riche et crémeuse.",
        price: 125,
        groupEn: "Premium Gelato",
        groupFr: "Glaces Premium",
        photoId: "1501443762994-82bd5dace89a",
      },
      /*
       * Filed here rather than under Coffee: the whole point is choosing a
       * flavour, and the flavours are the lines directly above it.
       *
       * PRICE NOT SET — the owner has not quoted one, so it shows the note
       * instead of a number. Put the real price in the Studio and the note
       * disappears on its own.
       */
      {
        id: "gel-affogato",
        en: "Affogato",
        fr: "Affogato",
        descEn:
          "The gelato of your choice, drowned at the counter under a freshly pulled shot of our specialty espresso. Pick any flavour from above.",
        descFr:
          "La glace de votre choix, noyée au comptoir sous un espresso de spécialité fraîchement extrait. Choisissez le parfum qui vous tente parmi ceux ci-dessus.",
        noteEn: "Ask our team",
        noteFr: "Demandez à notre équipe",
        groupEn: "Affogato",
        groupFr: "Affogato",
      },
    ],
  ),

  section(
    {
      _id: "sec-bowls",
      titleEn: "Fruit Bowls",
      titleFr: "Bols de Fruits",
      introEn:
        "An elegant, interactive experience tailored completely to your taste.",
      introFr:
        "Une expérience élégante et interactive, entièrement adaptée à vos envies.",
      // What is actually on the display table. Two items, two photos worth
      // looking at — one per row on a phone rather than a pair of thumbnails.
      fruitsEn: "Papaya, Mango, Shredded Coconut, Red Dragon Fruit, Bergamot",
      fruitsFr:
        "Papaye, Mangue, Coco râpée, Fruit du dragon rouge, Bergamote",
      wideTiles: true,
      layout: "grid",
    },
    [
      {
        id: "bowl-build",
        en: "Build Your Own Tropical Bowl",
        fr: "Composez Votre Bol Tropical",
        descEn:
          "Indulge in the ultimate island ritual. We invite you to visit our fresh display table to hand-select your favourite seasonal fruits from our daily harvest. Our team will freshly cut and elegantly arrange your selection, presenting a vibrant, tasty masterpiece.",
        descFr:
          "Laissez-vous tenter par le rituel insulaire par excellence. Nous vous invitons à notre table de présentation pour choisir vous-même vos fruits de saison préférés parmi la récolte du jour. Notre équipe les découpe à l'instant et les dresse avec élégance en un chef-d'œuvre éclatant et savoureux.",
        noteEn: "Based on selection",
        noteFr: "Selon votre sélection",
        photoId: "1583258292688-d0213dc5a3a8",
      },
      {
        id: "bowl-superfood",
        en: "The SKY Superfood Bowl",
        fr: "Le Bol Superfood SKY",
        descEn:
          "Elevate your hand-selected fruit harvest. Choose your fruits from the display table, and our team will layer them with your choice of creamy Greek yoghurt or vibrant fruity yoghurt, honey-baked granola, a premium sprinkle of superfood seeds (chia and flax), crisp roasted shaved coconut, and a delicate drizzle of pure local honey.",
        descFr:
          "Sublimez votre récolte de fruits choisie à la main. Choisissez vos fruits à la table de présentation : notre équipe les superpose, à votre choix, de yaourt grec onctueux ou de yaourt fruité éclatant, de granola au miel, d'une pincée premium de graines superfood (chia et lin), de copeaux de coco torréfiés croquants et d'un délicat filet de miel local pur.",
        noteEn: "Selection + premium toppings",
        noteFr: "Sélection + garnitures premium",
        photoId: "1517673400267-0251440c45dc",
      },
    ],
  ),

  section(
    {
      _id: "sec-smoothies",
      titleEn: "Smoothies",
      titleFr: "Smoothies",
      introEn:
        "Blended fresh to order. Thick, frosty, and pure fruit indulgence.",
      introFr:
        "Mixés à la commande. Épais, glacés, purement fruités.",
      fruitsEn: "Papaya, Mango, Shredded Coconut, Red Dragon Fruit, Bergamot",
      fruitsFr:
        "Papaye, Mangue, Coco râpée, Fruit du dragon rouge, Bergamote",
      layout: "grid",
    },
    [
      {
        id: "smo-build",
        en: "Build Your Own Signature Blend",
        fr: "Composez Votre Mélange Signature",
        descEn:
          "Craft your perfect beachside creation. Select any 3 to 4 premium fruits from our daily island harvest below to design a custom, hand-crafted masterwork.",
        descFr:
          "Créez votre boisson idéale en bord de mer. Choisissez 3 à 4 fruits premium parmi notre récolte du jour, ci-dessous, pour composer une création sur mesure, préparée à la main.",
        price: 300,
        photoId: "1622597467836-f3285f2131b8",
      },
      {
        id: "smo-crush",
        en: "The Flic-en-Flac Crush",
        fr: "Le Flic-en-Flac Crush",
        descEn:
          "Our house-recommended combination: a vibrant, exotic blend of sweet mango, crisp pineapple, sharp passion fruit, and stunning dragon fruit.",
        descFr:
          "La combinaison recommandée par la maison : un mélange exotique et éclatant de mangue sucrée, d'ananas croquant, de fruit de la passion vif et de superbe fruit du dragon.",
        price: 300,
        photoId: "1502741224143-90386d7f8c82",
      },
      {
        id: "smo-golden",
        en: "Golden Hour",
        fr: "Golden Hour",
        descEn:
          "An electric, beautifully vibrant smoothie crafted from sweet pineapple, bright orange, and exotic dragon fruit.",
        descFr:
          "Un smoothie électrique et magnifiquement éclatant, à base d'ananas sucré, d'orange lumineuse et de fruit du dragon exotique.",
        price: 300,
        photoId: "1505252585461-04db1eb84625",
      },
      {
        id: "smo-single",
        en: "Single-Fruit Smoothies",
        fr: "Smoothies Mono-Fruit",
        // The fruit list moved out of here and onto the section, where it is
        // read once for the whole menu instead of hiding on the back of one
        // tile — and where it stays true as the display table changes.
        descEn:
          "Thick, simple, and refreshing. Choose any single fruit from our raw island selection.",
        descFr:
          "Épais, simple et rafraîchissant. Choisissez un seul fruit parmi notre sélection de fruits de l'île.",
        price: 250,
        photoId: "1553530666-ba11a7da3888",
      },
    ],
  ),

  section(
    {
      _id: "sec-juices",
      titleEn: "Juices & Shots",
      titleFr: "Jus & Shots",
      introEn:
        "100% pure fruit liquid, extracted fresh to order. Light, crisp, and deeply hydrating.",
      introFr:
        "100% pur jus de fruit, extrait à la commande. Léger, vif et profondément hydratant.",
      layout: "grid",
    },
    [
      {
        id: "juice-velvet",
        en: "Velvet Sunrise",
        fr: "Velvet Sunrise",
        descEn:
          "Our signature crisp carrot base, balanced perfectly with sweet orange and a warm kick of ginger.",
        descFr:
          "Notre base signature de carotte croquante, parfaitement équilibrée par l'orange sucrée et une pointe chaleureuse de gingembre.",
        price: 275,
        groupEn: "Cold-Pressed Juices",
        groupFr: "Jus Pressés à Froid",
        photoId: "1600271886742-f049cd451bba",
      },
      {
        id: "juice-coral",
        en: "Coral Reef",
        fr: "Coral Reef",
        descEn:
          "A visually stunning, thirst-quenching press of hydrating watermelon, tart passion fruit, and fresh garden mint.",
        descFr:
          "Un pressé spectaculaire et désaltérant de pastèque hydratante, de fruit de la passion acidulé et de menthe fraîche du jardin.",
        price: 250,
        groupEn: "Cold-Pressed Juices",
        groupFr: "Jus Pressés à Froid",
        photoId: "1595981267035-7b04ca84a82d",
      },
      {
        id: "juice-passion",
        en: "Pure Passion Citrus",
        fr: "Pure Passion Citrus",
        descEn:
          "An intensely aromatic, bold press of passion fruit, orange, and grapefruit for a sophisticated, zesty finish.",
        descFr:
          "Un pressé intensément aromatique de fruit de la passion, d'orange et de pamplemousse, pour une finale zestée et raffinée.",
        price: 250,
        groupEn: "Cold-Pressed Juices",
        groupFr: "Jus Pressés à Froid",
        photoId: "1613478223719-2ab802602423",
      },
      {
        id: "shot-ginger",
        en: "The Ginger Ignition",
        fr: "The Ginger Ignition",
        descEn:
          "Pure, fiery cold-pressed ginger and fresh lemon juice with an invigorating pinch of cayenne pepper.",
        descFr:
          "Gingembre pressé à froid, ardent et pur, jus de citron frais et une pincée revigorante de piment de Cayenne.",
        price: 150,
        groupEn: "Wellness Shots",
        groupFr: "Shots Bien-Être",
      },
      {
        id: "shot-golden",
        en: "The Golden Glow",
        fr: "The Golden Glow",
        descEn:
          "A vibrant, immune-boosting press of fresh turmeric, orange, carrot, and a crack of black pepper for maximum absorption.",
        descFr:
          "Un pressé éclatant de curcuma frais, d'orange et de carotte, relevé d'un tour de poivre noir pour une absorption optimale.",
        price: 150,
        groupEn: "Wellness Shots",
        groupFr: "Shots Bien-Être",
      },
    ],
  ),

  section(
    {
      _id: "sec-teas",
      titleEn: "Teas & Infusions",
      titleFr: "Thés & Infusions",
      introEn: "Carefully curated loose-leaf grades and botanicals.",
      introFr: "Des feuilles entières et des plantes soigneusement choisies.",
      layout: "list",
    },
    [
      {
        id: "tea-passionmint",
        en: "The Passion-Mint Black Brew",
        fr: "Thé Noir Passion-Menthe",
        descEn:
          "A bold, structured premium black tea shaken ice-cold with sharp passion fruit and intensely fragrant snapped garden mint.",
        descFr:
          "Un thé noir premium, franc et structuré, shaké glacé avec un fruit de la passion vif et de la menthe du jardin fraîchement cassée, intensément parfumée.",
        price: 240,
        groupEn: "Iced & Shaken Infusions",
        groupFr: "Infusions Glacées & Secouées",
      },
      {
        id: "tea-peach",
        en: "Island Peach & Earl Grey",
        fr: "Earl Grey & Pêche des Îles",
        descEn:
          "A sophisticated black tea base infused with the elegant citrus of bergamot and the soft, juicy sweetness of fresh peach.",
        descFr:
          "Une base de thé noir raffinée, infusée de l'agrume élégant de la bergamote et de la douceur tendre et juteuse de la pêche fraîche.",
        price: 240,
        groupEn: "Iced & Shaken Infusions",
        groupFr: "Infusions Glacées & Secouées",
      },
      {
        id: "tea-citron",
        en: "Classic Citron Black Tea",
        fr: "Thé Noir Citron Classique",
        descEn:
          "A timeless, clean, and refreshing black tea cold-brewed and finished with generous slices of fresh local lemon.",
        descFr:
          "Un thé noir intemporel, net et rafraîchissant, infusé à froid et garni de généreuses tranches de citron local.",
        price: 220,
        groupEn: "Iced & Shaken Infusions",
        groupFr: "Infusions Glacées & Secouées",
      },
      {
        id: "tea-rouges-glace",
        en: "Fruits Rouges Glacé",
        fr: "Fruits Rouges Glacé",
        descEn:
          "A vibrant, antioxidant-rich ruby infusion of wild red berries and hibiscus, naturally tart and perfectly thirst-quenching.",
        descFr:
          "Une infusion rubis éclatante et riche en antioxydants, aux baies rouges sauvages et à l'hibiscus, naturellement acidulée et parfaitement désaltérante.",
        price: 240,
        groupEn: "Iced & Shaken Infusions",
        groupFr: "Infusions Glacées & Secouées",
      },
      {
        id: "tea-ginger-green",
        en: "Zesty Ginger Green Tea",
        fr: "Thé Vert Gingembre Zesté",
        descEn:
          "Chilled premium green tea paired with a sharp, refreshing kick of cold-pressed ginger and a touch of raw honey.",
        descFr:
          "Thé vert premium glacé, associé à une pointe vive et rafraîchissante de gingembre pressé à froid et à une touche de miel brut.",
        price: 240,
        groupEn: "Iced & Shaken Infusions",
        groupFr: "Infusions Glacées & Secouées",
      },
      {
        id: "tea-citronella",
        en: "Pineapple & Citronella Cooler",
        fr: "Cooler Ananas & Citronnelle",
        descEn:
          "A beautiful tropical twist. Crisp local lemongrass (citronella) infusion layered with a splash of fresh pineapple juice.",
        descFr:
          "Une belle touche tropicale. Infusion de citronnelle locale bien fraîche, relevée d'un trait de jus d'ananas frais.",
        price: 240,
        groupEn: "Iced & Shaken Infusions",
        groupFr: "Infusions Glacées & Secouées",
      },
      {
        id: "tea-peppermint-lime",
        en: "Iced Peppermint & Lime Burst",
        fr: "Menthe Poivrée & Citron Vert Glacé",
        descEn:
          "An ultra-cooling, crisp peppermint infusion shaken with fresh lime juice for the ultimate midday cooldown.",
        descFr:
          "Une infusion de menthe poivrée ultra-rafraîchissante, secouée au jus de citron vert frais.",
        price: 220,
        groupEn: "Iced & Shaken Infusions",
        groupFr: "Infusions Glacées & Secouées",
      },
      {
        id: "tea-english",
        en: "Premium English Breakfast",
        fr: "English Breakfast Premium",
        descEn: "A rich, robust traditional black tea blend.",
        descFr: "Un mélange de thé noir traditionnel, riche et corsé.",
        price: 180,
        groupEn: "Hot Artisanal Steeps",
        groupFr: "Infusions Chaudes Artisanales",
      },
      {
        id: "tea-earl-grey",
        en: "Spiced Earl Grey",
        fr: "Earl Grey Épicé",
        descEn: "Bergamot notes enhanced with local cinnamon.",
        descFr: "Notes de bergamote rehaussées de cannelle locale.",
        price: 200,
        groupEn: "Hot Artisanal Steeps",
        groupFr: "Infusions Chaudes Artisanales",
      },
      {
        id: "tea-jasmine",
        en: "Pure Jasmine Green Tea",
        fr: "Thé Vert Jasmin Pur",
        descEn: "Clean, floral green tea scented with true blossoms.",
        descFr: "Thé vert net et floral, parfumé aux véritables fleurs.",
        price: 200,
        groupEn: "Hot Artisanal Steeps",
        groupFr: "Infusions Chaudes Artisanales",
      },
      {
        id: "tea-classic-citronella",
        en: "The Classic Citronella",
        fr: "La Citronnelle Classique",
        descEn: "Fresh, locally sourced soothing lemongrass steep.",
        descFr: "Infusion apaisante de citronnelle fraîche, d'origine locale.",
        price: 180,
        groupEn: "Hot Artisanal Steeps",
        groupFr: "Infusions Chaudes Artisanales",
      },
      {
        id: "tea-rouges",
        en: "Fruits Rouges Infusion",
        fr: "Infusion Fruits Rouges",
        descEn: "Aromatic blend of wild strawberries and dark berries.",
        descFr: "Mélange aromatique de fraises des bois et de baies noires.",
        price: 200,
        groupEn: "Hot Artisanal Steeps",
        groupFr: "Infusions Chaudes Artisanales",
      },
      {
        id: "tea-chamomile",
        en: "Serene Chamomile Citrus",
        fr: "Camomille Agrumes Sereine",
        descEn: "Calming chamomile flowers with sweet orange slices.",
        descFr: "Fleurs de camomille apaisantes et tranches d'orange douce.",
        price: 180,
        groupEn: "Hot Artisanal Steeps",
        groupFr: "Infusions Chaudes Artisanales",
      },
      {
        id: "tea-peppermint",
        en: "Pure Peppermint Digestif",
        fr: "Digestif Menthe Poivrée",
        descEn: "Intensely vibrant, stomach-friendly mint leaves.",
        descFr: "Feuilles de menthe intensément vives, douces pour l'estomac.",
        price: 180,
        groupEn: "Hot Artisanal Steeps",
        groupFr: "Infusions Chaudes Artisanales",
      },
    ],
  ),

  section(
    {
      _id: "sec-breakfast",
      titleEn: "Breakfast & Brunch",
      titleFr: "Petit-déjeuner & Brunch",
      introEn: "Served daily until 13:00.",
      introFr: "Servi tous les jours jusqu'à 13h00.",
      layout: "grid",
    },
    [
      {
        id: "bf-sunrise",
        en: "The SKY Sunrise Platter",
        fr: "L'Assiette Sunrise SKY",
        descEn:
          "The ultimate hearty beachfront breakfast. Three eggs cooked to your liking, thick-cut artisanal sourdough toast, premium crispy bacon, and savoury grilled sausages. Served with a side of rich baked beans and your choice of a fresh cold-pressed juice or a hot coffee.",
        descFr:
          "La formule la plus copieuse en bord de mer. Trois œufs cuits selon votre goût, pain au levain artisanal tranché épais et grillé, bacon croustillant premium et saucisses grillées savoureuses. Servi avec une portion de haricots à la sauce tomate et, à votre choix, un jus frais pressé à froid ou un café chaud.",
        price: 500,
        photoId: "1533089860892-a7c6f0a88666",
      },
      {
        id: "bf-francais",
        en: "Le Petit Déjeuner Français",
        fr: "Le Petit Déjeuner Français",
        descEn:
          "A timeless Parisian morning by the sea. Your choice of a warm, flaky artisanal butter croissant or a rich pain au chocolat, served alongside freshly baked crusty bread, premium butter, gourmet fruit jam, and a selection of fine cheeses. Accompanied by a hot, fresh coffee of your choice.",
        descFr:
          "Un matin parisien intemporel face à la mer. À votre choix, un croissant au beurre artisanal chaud et feuilleté ou un pain au chocolat gourmand, servi avec du pain croustillant fraîchement cuit, du beurre premium, une confiture de fruits gourmet et une sélection de fromages fins. Accompagné d'un café chaud fraîchement préparé, à votre choix.",
        price: 350,
        photoId: "1555507036-ab1f4038808a",
      },
      {
        id: "bf-avocado",
        en: "The SKY Avocado Toast",
        fr: "L'Avocado Toast SKY",
        descEn:
          "Thick-cut toasted sourdough topped with smoothly crushed fresh avocado, a squeeze of lime, chilli flakes, and a delicate sprinkle of chia seeds.",
        descFr:
          "Pain au levain tranché épais et grillé, garni d'avocat frais finement écrasé, d'un trait de citron vert, de flocons de piment et d'une délicate pincée de graines de chia.",
        price: 275,
        photoId: "1588137378633-dea1336ce1e2",
      },
      {
        id: "bf-caprese",
        en: "The Caprese Croissant Melt",
        fr: "Croissant Caprese Gratiné",
        descEn:
          "A flaky, warm toasted croissant filled with creamy melted mozzarella, thick slices of fresh local tomatoes, and a vibrant house-made basil pesto drizzle.",
        descFr:
          "Croissant chaud et feuilleté garni de mozzarella fondante et crémeuse, de tranches épaisses de tomates locales fraîches et d'un filet de pesto au basilic maison bien parfumé.",
        price: 250,
      },
      {
        id: "bf-croque",
        en: "The Croque Monsieur",
        fr: "Le Croque-Monsieur",
        descEn:
          "The French café classic, toasted golden. Chicken ham and melted cheese pressed between thick-cut bread. A vegetarian option is available on request.",
        descFr:
          "Le classique des cafés français, gratiné et doré. Jambon de volaille et fromage fondu entre deux tranches épaisses de pain de mie. Une version végétarienne est disponible sur demande.",
        price: 270,
      },
      {
        id: "bf-salmon",
        en: "Gourmet Smoked Salmon Croissant",
        fr: "Croissant Gourmet au Saumon Fumé",
        descEn:
          "A flaky, buttery artisanal pastry layered with premium cold-smoked salmon, rich cream cheese, fresh dill, and crisp local capers.",
        descFr:
          "Une viennoiserie artisanale feuilletée au beurre, garnie de saumon fumé à froid premium, de fromage frais onctueux, d'aneth frais et de câpres locales croquantes.",
        price: 380,
      },
      {
        id: "bf-oats",
        en: "Vanilla Bean & Chia Overnight Oats",
        fr: "Overnight Oats Vanille & Chia",
        descEn:
          "Rolled oats infused with vanilla bean and oat milk, layered with a heavy sprinkle of chia seeds, and topped fresh at the counter with sliced bananas, raw local honey, and toasted almonds.",
        descFr:
          "Flocons d'avoine infusés à la gousse de vanille et au lait d'avoine, superposés d'une généreuse pincée de graines de chia, puis garnis à la minute au comptoir de tranches de banane, de miel local brut et d'amandes torréfiées.",
        price: 220,
      },
    ],
  ),

  section(
    {
      _id: "sec-coffee",
      titleEn: "Coffee",
      titleFr: "Cafés",
      introEn:
        "Crafted with premium specialty beans, extracted with precision, and served to perfection.",
      introFr:
        "Préparés avec des grains de spécialité premium, extraits avec précision et servis à la perfection.",
      footnoteEn:
        "Milk alternatives available: soy, almond or oat milk for an additional Rs 50.",
      footnoteFr:
        "Alternatives au lait disponibles : soja, amande ou avoine, pour un supplément de Rs 50.",
      layout: "list",
    },
    [
      {
        id: "cof-espresso",
        en: "Espresso",
        fr: "Espresso",
        descEn: "Rich intense shot with dense golden crema.",
        descFr: "Extraction riche et intense, crema dorée et dense.",
        price: 125,
        groupEn: "Classic Hot Drinks",
        groupFr: "Boissons Chaudes Classiques",
      },
      {
        id: "cof-macchiato",
        en: "Espresso Macchiato",
        fr: "Espresso Macchiato",
        descEn: "Stained with a small dollop of velvety milk foam.",
        descFr: "Taché d'une petite touche de mousse de lait veloutée.",
        price: 135,
        groupEn: "Classic Hot Drinks",
        groupFr: "Boissons Chaudes Classiques",
      },
      {
        id: "cof-americano",
        en: "Americano",
        fr: "Americano",
        descEn: "Smooth, deep black coffee with premium espresso.",
        descFr: "Café noir profond et tout en rondeur, à l'espresso premium.",
        price: 135,
        groupEn: "Classic Hot Drinks",
        groupFr: "Boissons Chaudes Classiques",
      },
      {
        id: "cof-cortado",
        en: "Cortado",
        fr: "Cortado",
        descEn: "Equal parts espresso and warm micro-foamed milk.",
        descFr: "À parts égales, espresso et lait micro-moussé tiède.",
        price: 140,
        groupEn: "Classic Hot Drinks",
        groupFr: "Boissons Chaudes Classiques",
      },
      {
        id: "cof-cappuccino",
        en: "Cappuccino",
        fr: "Cappuccino",
        descEn: "Traditional perfect balance of foam, milk, and espresso.",
        descFr: "L'équilibre traditionnel parfait entre mousse, lait et espresso.",
        price: 150,
        groupEn: "Classic Hot Drinks",
        groupFr: "Boissons Chaudes Classiques",
      },
      {
        id: "cof-flatwhite",
        en: "Flat White",
        fr: "Flat White",
        descEn: "Smooth, velvety micro-foam over clean espresso.",
        descFr: "Micro-mousse veloutée sur un espresso net.",
        price: 150,
        groupEn: "Classic Hot Drinks",
        groupFr: "Boissons Chaudes Classiques",
      },
      {
        id: "cof-latte",
        en: "Café Latte",
        fr: "Café Latte",
        descEn: "Comforting long milk beverage with light foam.",
        descFr: "Boisson lactée allongée et réconfortante, mousse légère.",
        price: 175,
        groupEn: "Classic Hot Drinks",
        groupFr: "Boissons Chaudes Classiques",
      },
      {
        id: "cof-mocha",
        en: "Café Mocha",
        fr: "Café Mocha",
        descEn: "Indulgent blend of espresso, rich chocolate, and milk.",
        descFr: "Mélange gourmand d'espresso, de chocolat riche et de lait.",
        price: 175,
        groupEn: "Classic Hot Drinks",
        groupFr: "Boissons Chaudes Classiques",
      },
      {
        id: "cof-chocolate",
        en: "Artisanal Hot Chocolate",
        fr: "Chocolat Chaud Artisanal",
        descEn: "Premium dark cocoa and perfectly textured steamed milk.",
        descFr: "Cacao noir premium et lait vapeur à la texture parfaite.",
        price: 160,
        groupEn: "Classic Hot Drinks",
        groupFr: "Boissons Chaudes Classiques",
      },
      {
        id: "cof-chai",
        en: "SKY Spiced Chai Latte",
        fr: "Chai Latte Épicé SKY",
        descEn: "Aromatic blend of tea, Mauritian spices, and raw honey.",
        descFr: "Mélange aromatique de thé, d'épices mauriciennes et de miel brut.",
        price: 150,
        groupEn: "Classic Hot Drinks",
        groupFr: "Boissons Chaudes Classiques",
      },
      {
        id: "cof-iced-americano",
        en: "Iced Americano",
        fr: "Americano Glacé",
        descEn: "Rich shots poured over ice and chilled water.",
        descFr: "Extractions riches versées sur glace et eau fraîche.",
        price: 135,
        groupEn: "Iced & Chilled Coffee",
        groupFr: "Cafés Glacés",
      },
      {
        id: "cof-iced-latte",
        en: "Iced Latte",
        fr: "Latte Glacé",
        descEn: "Espresso with chilled milk over ice for a clean lift.",
        descFr: "Espresso et lait frais sur glace, pour un réveil tout en netteté.",
        price: 175,
        groupEn: "Iced & Chilled Coffee",
        groupFr: "Cafés Glacés",
      },
      {
        id: "cof-iced-caramel",
        en: "Iced Caramel Latte",
        fr: "Latte Caramel Glacé",
        descEn: "Our smooth latte layered with sweet rich caramel sauce.",
        descFr: "Notre latte onctueux nappé d'une sauce caramel riche et sucrée.",
        price: 175,
        groupEn: "Iced & Chilled Coffee",
        groupFr: "Cafés Glacés",
      },
      {
        id: "cof-iced-mocha",
        en: "Iced Mocha",
        fr: "Mocha Glacé",
        descEn: "Cold espresso and rich chocolate whisked with fresh milk.",
        descFr: "Espresso froid et chocolat riche, fouettés au lait frais.",
        price: 175,
        groupEn: "Iced & Chilled Coffee",
        groupFr: "Cafés Glacés",
      },
    ],
  ),

  section(
    {
      _id: "sec-shakes",
      titleEn: "Milkshakes & Pastries",
      titleFr: "Milkshakes & Pâtisseries",
      introEn:
        "Thick, indulgent shakes crafted with our premium artisanal gelato, blended smooth and served ice-cold.",
      introFr:
        "Des milkshakes épais et gourmands, préparés avec notre gelato artisanal premium, mixés onctueux et servis glacés.",
      layout: "grid",
    },
    [
      {
        id: "shake-mango",
        en: "The Mango Sovereign",
        fr: "The Mango Sovereign",
        descEn:
          "Our crowning signature shake. Vibrant, sweet fresh mangoes blended perfectly with a rich artisanal vanilla gelato base.",
        descFr:
          "Notre milkshake signature par excellence. Des mangues fraîches, sucrées et éclatantes, parfaitement mixées avec une riche base de gelato artisanal à la vanille.",
        price: 250,
        groupEn: "Milkshakes",
        groupFr: "Milkshakes",
        photoId: "1553279768-865429fa0078",
      },
      {
        id: "shake-matcha",
        en: "Matcha Frappé",
        fr: "Frappé Matcha",
        descEn:
          "A luxurious, icy blend of premium ceremonial matcha green tea whipped smooth with our vanilla gelato base for a vibrant, modern twist.",
        descFr:
          "Un mélange luxueux et glacé de thé vert matcha de cérémonie premium, fouetté onctueux avec notre base de gelato à la vanille, pour une touche éclatante et moderne.",
        price: 260,
        groupEn: "Milkshakes",
        groupFr: "Milkshakes",
        photoId: "1536256263959-770b48d82b0a",
      },
      {
        id: "shake-oreo",
        en: "Oreo Cookies Crunch",
        fr: "Oreo Cookies Crunch",
        descEn:
          "Premium cookies & cream gelato blended smooth and packed with crushed, crunchy Oreo cocoa biscuits.",
        descFr:
          "Gelato premium cookies & cream mixé onctueux et généreusement garni de biscuits Oreo au cacao concassés et croquants.",
        price: 240,
        groupEn: "Milkshakes",
        groupFr: "Milkshakes",
        photoId: "1572490122747-3968b75cc699",
      },
      {
        id: "shake-vanilla",
        en: "Classic Vanilla Cream",
        fr: "Classic Vanilla Cream",
        descEn:
          "A rich and velvety shake blended with our signature artisanal vanilla gelato and fresh milk.",
        descFr:
          "Un milkshake riche et velouté, mixé avec notre glace vanille artisanale signature et du lait frais.",
        price: 220,
        groupEn: "Milkshakes",
        groupFr: "Milkshakes",
      },
      {
        id: "shake-chocolate",
        en: "Deep Chocolate Velvet",
        fr: "Deep Chocolate Velvet",
        descEn:
          "An intense, decadent chocolate shake crafted with rich chocolate gelato and finished with a smooth chocolate drizzle.",
        descFr:
          "Un milkshake au chocolat intense et gourmand, préparé avec un riche gelato au chocolat et terminé par un filet de chocolat onctueux.",
        price: 230,
        groupEn: "Milkshakes",
        groupFr: "Milkshakes",
        photoId: "1553787499-6f9133860278",
      },
      {
        id: "shake-strawberry",
        en: "Tropical Strawberry Swirl",
        fr: "Tropical Strawberry Swirl",
        descEn:
          "A refreshing, vibrant blend of our rich vanilla gelato and sweet strawberries, finished with a smooth fruit coulis.",
        descFr:
          "Un mélange éclatant et rafraîchissant de glace vanille et de fraises sucrées, terminé par un coulis de fruits onctueux.",
        price: 230,
        groupEn: "Milkshakes",
        groupFr: "Milkshakes",
      },
      {
        id: "shake-caramel",
        en: "Salted Caramel Dream",
        fr: "Salted Caramel Dream",
        descEn:
          "The perfect blend of sweet and savoury. Artisanal caramel gelato whipped with a touch of fine sea salt and a buttery caramel drizzle.",
        descFr:
          "L'accord parfait entre sucré et salé. Glace caramel artisanale fouettée avec une pointe de sel marin et un filet de caramel au beurre.",
        price: 250,
        groupEn: "Milkshakes",
        groupFr: "Milkshakes",
        photoId: "1541658016709-82535e94bc69",
      },
      {
        id: "shake-almond",
        en: "Toasted Almond Silk",
        fr: "Toasted Almond Silk",
        descEn:
          "A smooth, nutty masterpiece blending creamy vanilla gelato with premium roasted almond paste and a hint of toasted crunch.",
        descFr:
          "Une création onctueuse et gourmande mêlant glace vanille crémeuse, pâte d'amande torréfiée premium et une pointe de croquant.",
        price: 250,
        groupEn: "Milkshakes",
        groupFr: "Milkshakes",
      },
      {
        id: "pastry-daily",
        en: "Daily Baked Pastries & Croissants",
        fr: "Viennoiseries & Croissants du Jour",
        descEn:
          "Baked fresh every single morning. Please visit our visual display next to the primary counter to view today's fresh selection of artisanal pastries, flaky croissants, and sweet treats.",
        descFr:
          "Cuites fraîches chaque matin. Rendez-vous devant notre présentoir, à côté du comptoir principal, pour découvrir la sélection du jour : pâtisseries artisanales, croissants feuilletés et douceurs.",
        noteEn: "As priced",
        noteFr: "Prix affichés",
        groupEn: "From the Pastry Showcase",
        groupFr: "La Vitrine des Pâtisseries",
        photoId: "1517433670267-08bbd4be890f",
      },
    ],
  ),

  section(
    {
      _id: "sec-bites",
      titleEn: "Beach Bites",
      titleFr: "Bouchées de Plage",
      introEn:
        "Available from 14:00 onwards. Generous sharing portions — the perfect savoury accompaniment for sunset viewing.",
      introFr:
        "À partir de 14h00. Généreuses portions à partager — l'accompagnement salé idéal pour le coucher du soleil.",
      layout: "grid",
    },
    [
      {
        id: "bite-prawns",
        en: "Crispy Golden Prawns",
        fr: "Crevettes Dorées Croustillantes",
        descEn:
          "A generous serving of plump, juicy prawns coated in a remarkably crunchy, golden batter. Served with a custom sweet chilli and tropical pineapple dipping sauce.",
        descFr:
          "Une portion généreuse de crevettes charnues et juteuses, enrobées d'une pâte à frire dorée et remarquablement croustillante. Servies avec une sauce maison au sweet chilli et à l'ananas tropical.",
        price: 390,
        photoId: "1559737558-2f5a35f4523b",
      },
      {
        id: "bite-calamari",
        en: "Crispy Calamari Rings",
        fr: "Anneaux de Calamars Croustillants",
        descEn:
          "A premium portion of tender calamari tossed in a light, seasoned crust and fried until perfectly golden. Served with ketchup, sweet chilli sauce, or as per request.",
        descFr:
          "Une portion premium de calamars tendres, enrobés d'une croûte légère et assaisonnée, frits jusqu'à une dorure parfaite. Servis avec du ketchup, une sauce sweet chilli ou selon votre demande.",
        price: 375,
        photoId: "1476224203421-9ac39bcb3327",
      },
      {
        id: "bite-fish",
        en: "Golden Crispy Fish & Chips",
        fr: "Fish & Chips Croustillant",
        descEn:
          "Fresh local fish fillet coated in panko breadcrumbs and fried golden brown. Served with seasoned French fries, our classic homemade sauce, and a fresh lemon wedge.",
        descFr:
          "Filet de poisson local frais pané à la chapelure panko et frit jusqu'à une belle dorure. Servi avec des frites assaisonnées, notre sauce maison classique et un quartier de citron frais.",
        price: 525,
      },
      {
        id: "bite-chicken",
        en: "Crispy Golden Chicken Bites",
        fr: "Bouchées de Poulet Dorées",
        descEn:
          "A large, shareable platter of tender chicken pieces seasoned with local island spices and fried to a perfect crunch. Served with ketchup, sweet chilli sauce, or as per request.",
        descFr:
          "Un grand plat à partager de morceaux de poulet tendres, assaisonnés aux épices locales de l'île et frits jusqu'à une croustillance parfaite. Servis avec du ketchup, une sauce sweet chilli ou selon votre demande.",
        price: 350,
        photoId: "1562967914-608f82629710",
      },
      {
        id: "bite-springrolls",
        en: "Savoury Chicken Spring Rolls",
        fr: "Rouleaux de Printemps au Poulet",
        descEn:
          "Crispy, golden pastry rolls generously packed with a savoury, perfectly seasoned chicken and vegetable filling. Served hot with ketchup, sweet chilli sauce, or as per request.",
        descFr:
          "Rouleaux de pâte dorés et croustillants, généreusement garnis d'une farce savoureuse et parfaitement assaisonnée de poulet et de légumes. Servis chauds avec du ketchup, une sauce sweet chilli ou selon votre demande.",
        price: 180,
        photoId: "1606525437679-037aca74a3e9",
      },
      {
        id: "bite-fries",
        en: "Melted Cheese Fries",
        fr: "Frites au Fromage Fondu",
        descEn:
          "A generous sharing basket of crisp, hot fries tossed in fine sea salt and completely smothered in a rich, velvety melted cheese sauce.",
        descFr:
          "Un panier généreux à partager de frites chaudes et croustillantes, relevées de sel marin fin et entièrement nappées d'une sauce au fromage fondu riche et veloutée.",
        price: 220,
        photoId: "1573080496219-bb080dd4f877",
      },
      {
        id: "bite-samosas",
        en: "Traditional Island Samosas",
        fr: "Samoussas Traditionnels",
        descEn:
          "A classic local favourite. Flaky, golden pastry triangles filled with a perfectly spiced potato and herb filling. Served hot and fresh with ketchup, sweet chilli sauce, or as per request.",
        descFr:
          "Un classique local très apprécié. Triangles de pâte feuilletée dorée garnis d'une farce de pommes de terre et d'herbes parfaitement épicée. Servis chauds et frais avec du ketchup, une sauce sweet chilli ou selon votre demande.",
        price: 150,
        photoId: "1601050690597-df0568f70950",
      },
    ],
  ),

  section(
    {
      _id: "sec-mocktails",
      titleEn: "Mocktails",
      titleFr: "Mocktails",
      introEn:
        "Available all day. Exquisitely crafted long drinks, perfectly enjoyed on the open terrace as the sun goes down.",
      introFr:
        "Disponibles toute la journée. Des long drinks élaborés avec soin, à savourer en terrasse au coucher du soleil.",
      layout: "grid",
    },
    [
      {
        id: "mock-pinacolada",
        en: "The SKY Piña Colada",
        fr: "La Piña Colada SKY",
        descEn:
          "A luxurious, creamy island masterpiece. Blended fresh using our real local coconut harvest and sweet, ripe pineapple, served frosty and thick.",
        descFr:
          "Un chef-d'œuvre insulaire crémeux et luxueux. Préparé avec notre récolte de coco locale et de l'ananas mûr et sucré, servi glacé et épais.",
        price: 300,
      },
      {
        id: "mock-sunset",
        en: "The SKY Sunset Glow",
        fr: "Le Sunset Glow SKY",
        descEn:
          "Our signature terrace creation. A vibrant, tropical blend of sweet orange, crisp pineapple, and sharp passion fruit, finished with a delicate touch of fresh dragon fruit to capture the perfect glowing hue of the evening sky.",
        descFr:
          "Notre création signature de la terrasse. Un mélange tropical éclatant d'orange sucrée, d'ananas croquant et de fruit de la passion vif, terminé par une délicate touche de fruit du dragon frais pour capturer la teinte rougeoyante parfaite du ciel du soir.",
        price: 300,
        photoId: "1609951651556-5334e2706168",
      },
      {
        id: "mock-bluelagoon",
        en: "The SKY Blue Lagoon",
        fr: "Le Blue Lagoon SKY",
        descEn:
          "A visually stunning beachfront drink. Freshly squeezed local lime juice and a touch of blue curaçao syrup, layered over crushed ice and topped with sparkling water. Garnished with a slice of fresh orange and a vibrant sprig of garden mint.",
        descFr:
          "Un cocktail de bord de mer spectaculaire. Jus de citron vert local fraîchement pressé et une touche de sirop de blue curaçao, versés sur de la glace pilée et allongés d'eau pétillante. Garni d'une tranche d'orange fraîche et d'un brin de menthe du jardin bien vert.",
        price: 290,
        photoId: "1587888637140-849b25d80ef9",
      },
      {
        id: "mock-passionmojito",
        en: "Sparkling Passion Fruit Mojito",
        fr: "Mojito Pétillant Fruit de la Passion",
        descEn:
          "An intensely aromatic island classic. Muddled fresh garden mint and lime wedges, layered with our signature tart passion fruit pulp, crushed ice, and charged with premium soda.",
        descFr:
          "Un classique de l'île intensément aromatique. Menthe fraîche du jardin et quartiers de citron vert pilés, superposés de notre pulpe de fruit de la passion signature bien acidulée, de glace pilée et allongés d'un soda premium.",
        price: 275,
        photoId: "1551538827-9c037cb4f32a",
      },
      {
        id: "mock-ruby",
        en: "The Ruby Sparkler",
        fr: "Le Ruby Sparkler",
        descEn:
          "A sophisticated, crisp terrace favourite. Bright ruby grapefruit juice paired with a subtle, light touch of cold-pressed ginger and fresh snapped mint, built over ice and topped with premium tonic water.",
        descFr:
          "Un favori raffiné et vif de la terrasse. Jus de pamplemousse rose lumineux associé à une touche subtile et légère de gingembre pressé à froid et à de la menthe fraîchement cassée, monté sur glace et allongé d'un tonic premium.",
        price: 275,
        photoId: "1497534446932-c925b458314e",
      },
      {
        id: "mock-virginmojito",
        en: "Classic Virgin Mojito",
        fr: "Mojito Vierge Classique",
        descEn:
          "The ultimate crisp midday refresher. Fresh garden mint leaves and juicy lime wedges muddled with pure cane sugar, built over crushed ice and topped with sparkling soda.",
        descFr:
          "Le rafraîchissement de milieu de journée par excellence. Feuilles de menthe fraîche et quartiers de citron vert pilés au sucre de canne pur, sur glace pilée et soda pétillant.",
        price: 250,
        photoId: "1621263764928-df1444c5e859",
      },
    ],
  ),

  section(
    {
      _id: "sec-softs",
      titleEn: "Refreshments",
      titleFr: "Rafraîchissements",
      introEn:
        "A selection of classic chilled beverages, mixers and premium waters.",
      introFr:
        "Une sélection de boissons fraîches classiques, de mixers et d'eaux premium.",
      layout: "list",
    },
    [
      { id: "soft-still", en: "Local Still Water", fr: "Eau Plate Locale", price: 100 },
      {
        id: "soft-sparkling",
        en: "Premium Sparkling Water",
        fr: "Eau Pétillante Premium",
        price: 125,
      },
      { id: "soft-coke", en: "Coca-Cola", fr: "Coca-Cola", price: 100 },
      {
        id: "soft-coke-diet",
        en: "Coca-Cola Diet",
        fr: "Coca-Cola Light",
        price: 125,
      },
      { id: "soft-sprite", en: "Sprite", fr: "Sprite", price: 100 },
      { id: "soft-fanta", en: "Fanta", fr: "Fanta", price: 100 },
      { id: "soft-club", en: "Club Soda", fr: "Club Soda", price: 100 },
      { id: "soft-tonic", en: "Tonic Water", fr: "Tonic", price: 125 },
    ],
  ),
];
