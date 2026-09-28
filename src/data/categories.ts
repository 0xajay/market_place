export interface SubCategory {
  name: string;
  slug: string;
  subcategories?: SubCategory[];
}

export interface Category {
  name: string;
  slug: string;
  subcategories: SubCategory[];
}

export const CATEGORIES: Category[] = [
  {
    "name": "Art",
    "slug": "art",
    "subcategories": [
      { "name": "Abstract Art", "slug": "abstract-art" },
      { "name": "Art Prints", "slug": "art-prints" },
      { "name": "Digital Art", "slug": "digital-art" },
      { "name": "Etchings", "slug": "etchings" },
      { "name": "Famous Artists", "slug": "famous-artists" },
      { "name": "Handicraft Art", "slug": "handicraft-art" },
      { "name": "Indian Art", "slug": "indian-art" },
      { "name": "Madhubani Art", "slug": "madhubani-art" },
      { "name": "Modern Art", "slug": "modern-art" },
      { "name": "Paintings and Illustrations", "slug": "paintings-and-illustrations" },
      { "name": "Sculpture", "slug": "sculpture" },
      { "name": "Serigraph", "slug": "serigraph" },
      { "name": "Sketch Art", "slug": "sketch-art" },
      { "name": "Vintage Art", "slug": "vintage-art" }
    ]
  },
  {
    "name": "Auctions",
    "slug": "auctions",
    "subcategories": [
      { "name": "Antiques Auctions", "slug": "antiques-auctions" },
      { "name": "Art Auctions", "slug": "art-auctions" },
      { "name": "Coins Auctions", "slug": "coins-auctions" },
      { "name": "Collectibles Auctions", "slug": "collectibles-auctions" },
      { "name": "Notes Auctions", "slug": "notes-auctions" },
      { "name": "Stamps Auctions", "slug": "stamps-auctions" }
    ]
  },
  {
    "name": "Bestsellers",
    "slug": "bestsellers",
    "subcategories": []
  },
  {
    "name": "Books",
    "slug": "books",
    "subcategories": [
      { "name": "Activity Book", "slug": "activity-book" },
      { "name": "Books Childrens", "slug": "books-childrens" },
      { "name": "Books Drama theatre", "slug": "books-drama-theatre" },
      { "name": "Books Fiction", "slug": "books-fiction" },
      { "name": "Books Humour", "slug": "books-humour" },
      { "name": "Books Non fiction", "slug": "books-non-fiction" },
      { "name": "Books Poetry", "slug": "books-poetry" },
      { "name": "Books Reference Encyclopedia", "slug": "books-reference-encyclopedia" },
      { "name": "Books Religion Spirituality", "slug": "books-religion-spirituality" },
      { "name": "Books Textbook", "slug": "books-textbook" },
      { "name": "Comics", "slug": "comics" },
      { "name": "Magazines", "slug": "magazines" },
      { "name": "Newspapers", "slug": "newspapers" },
      { "name": "Pre-owned Books", "slug": "pre-owned-books" },
      { "name": "Vintage Books", "slug": "vintage-books" }
    ]
  },
  {
    "name": "Cash on Delivery",
    "slug": "cod",
    "subcategories": []
  },
  {
    "name": "Clothings and Accessories",
    "slug": "clothings-and-accessories",
    "subcategories": [
      {
        "name": "Clothing Accessories",
        "slug": "clothing-accessories",
        "subcategories": [
          { "name": "Belts", "slug": "belts" },
          { "name": "Hair Accessories", "slug": "hair-accessories" },
          { "name": "Headwear", "slug": "headwear" },
          { "name": "Masks", "slug": "masks" },
          { "name": "Maternity", "slug": "maternity" },
          { "name": "Neckties", "slug": "neckties" },
          { "name": "Scarves and Shawls", "slug": "scarves-and-shawls" },
          { "name": "Sunglasses", "slug": "sunglasses" }
        ]
      },
      {
        "name": "Handbags and Purses",
        "slug": "handbags-and-purses",
        "subcategories": [
          { "name": "Card Cases", "slug": "card-cases" },
          { "name": "Handbags", "slug": "handbags" },
          { "name": "Wallets and Purses", "slug": "wallets-and-purses" }
        ]
      },
      { "name": "Kids Clothings", "slug": "kids-clothings" },
      {
        "name": "Mens Clothings",
        "slug": "mens-clothings",
        "subcategories": [
          { "name": "Casual Wear", "slug": "casual-wear-mens-clothings" },
          { "name": "Ethnic Wear", "slug": "ethnic-wear-mens-clothings" },
          { "name": "Formal Wear", "slug": "formal-wear-mens-clothings" },
          { "name": "Inner Wear", "slug": "inner-wear-mens-clothings" },
          { "name": "Sleepwear", "slug": "sleepwear-mens-clothings" },
          { "name": "Sports Wear", "slug": "sports-wear-mens-clothings" }
        ]
      },
      {
        "name": "Womens Clothings",
        "slug": "womens-clothings",
        "subcategories": [
          {
            "name": "Indian Wear",
            "slug": "indian-wear-womens-clothings",
            "subcategories": [
              { "name": "Ethnic Wear", "slug": "ethnic-wear-womens-clothings" },
              { "name": "Salwar Suits", "slug": "salwar-suits" },
              { "name": "Sari Saree", "slug": "sari-saree" }
            ]
          },
          { "name": "Inner Wear", "slug": "inner-wear-womens-clothings" },
          { "name": "Maternity Wear", "slug": "maternity-wear-womens-clothings" },
          { "name": "Sleepwear", "slug": "sleepwear-womens-clothings" },
          { "name": "Sports Wear", "slug": "sports-wear-womens-clothings" },
          { "name": "Western Wear", "slug": "western-wear-womens-clothings" }
        ]
      }
    ]
  },
  {
    "name": "Coins and Notes",
    "slug": "coins-and-notes",
    "subcategories": [
      {
        "name": "Bank Notes",
        "slug": "bank-notes",
        "subcategories": [
          {
            "name": "Bank Notes Bundles",
            "slug": "bank-notes-bundles",
            "subcategories": [
              { "name": "1 Rs Bundles", "slug": "1-rs-bundles" },
              { "name": "10 Rs Bundles", "slug": "10-rs-bundles" },
              { "name": "100 Rs Bundles", "slug": "100-rs-bundles" },
              { "name": "1000 Rs Bundles", "slug": "1000-rs-bundles" },
              { "name": "2 Rs Bundles", "slug": "2-rs-bundles" },
              { "name": "20 Rs Bundles", "slug": "20-rs-bundles" },
              { "name": "200 Rs Bundles", "slug": "200-rs-bundles" },
              { "name": "2000 Rs Bundles", "slug": "2000-rs-bundles" },
              { "name": "5 Rs Bundles", "slug": "5-rs-bundles" },
              { "name": "50 Rs Bundles", "slug": "50-rs-bundles" },
              { "name": "500 Rs Bundles", "slug": "500-rs-bundles" },
              { "name": "World Bank Notes Bundles", "slug": "world-bank-notes-bundles" }
            ]
          },
          { "name": "Bank Notes of British India", "slug": "bank-notes-of-british-india" },
          { "name": "Bank Notes Specimen", "slug": "bank-notes-specimen" },
          {
            "name": "Bank Notes World Wide",
            "slug": "bank-notes-world-wide",
            "subcategories": [
              { "name": "Africa Bank Notes", "slug": "africa-bank-notes" },
              { "name": "Asia Bank Notes", "slug": "asia-bank-notes" },
              { "name": "Australia Oceania Bank Notes", "slug": "australia-oceania-coins-bank-notes-world-wide" },
              { "name": "Europe Bank Notes", "slug": "europe-bank-notes" },
              { "name": "North America Bank Notes", "slug": "north-america-bank-notes" },
              { "name": "South America Bank Notes", "slug": "south-america-bank-notes" }
            ]
          },
          { "name": "Error Notes", "slug": "error-notes-bank-notes" },
          {
            "name": "Fancy Number Notes",
            "slug": "fancy-number-notes",
            "subcategories": [
              { "name": "786 Number Note", "slug": "786-number-note" },
              { "name": "Birthday Note", "slug": "birthday-note" }
            ]
          },
          { "name": "Republic of India Bank Notes", "slug": "bank-notes-of-republic-of-india" },
          { "name": "Star notes", "slug": "star-notes" }
        ]
      },
      {
        "name": "Coins",
        "slug": "coins",
        "subcategories": [
          { "name": "Ancient India Coins", "slug": "ancient-india-coins" },
          { "name": "British India Coins", "slug": "british-india-coins" },
          { "name": "British India Presidencies Coins", "slug": "british-india-presidencies-coins" },
          { "name": "Error - Coins", "slug": "error-coins" },
          { "name": "European Colonies in India Coins", "slug": "european-colonies-in-india-coins" },
          { "name": "Independent Kingdoms of India Coins", "slug": "independent-kingdoms-of-india-coins" },
          { "name": "India Commemorative Coins", "slug": "india-commemorative-coins" },
          { "name": "India Proof and UNC Coin Sets", "slug": "india-coins-proof-unc-sets" },
          { "name": "Indian Princely States Coins", "slug": "indian-princely-states-coins" },
          { "name": "Indian Sultanates Coins", "slug": "indian-sultanate-coins" },
          { "name": "Medieval India Coins", "slug": "medieval-india-coins" },
          { "name": "Mughal Emperors of India Coins", "slug": "mughal-coins-of-india" },
          { "name": "Republic India Coins", "slug": "republic-india-coins" },
          {
            "name": "World Coins",
            "slug": "world-coins",
            "subcategories": [
              { "name": "Africa Coins", "slug": "africa-coins" },
              { "name": "Ancient Roman Coins", "slug": "ancient-roman-coins" },
              { "name": "Asia Coins", "slug": "asia-coins" },
              { "name": "Australia Oceania Coins", "slug": "australia-oceania-coins" },
              { "name": "Europe Coins", "slug": "europe-coins" },
              { "name": "North America Coins", "slug": "north-america-coins" },
              { "name": "South America Coins", "slug": "south-america-coins" },
              { "name": "World Coins Proof Sets", "slug": "world-coins-proof-sets" }
            ]
          }
        ]
      },
      {
        "name": "Numismatic Publications and Supplies",
        "slug": "numismatic-publications-and-supplies",
        "subcategories": [
          { "name": "Numismatic Publications", "slug": "numismatic-publications" },
          { "name": "Numismatic Supplies", "slug": "numismatic-supplies" }
        ]
      }
    ]
  },
  {
    "name": "Collectibles",
    "slug": "collectibles",
    "subcategories": [
      {
        "name": "Antiques",
        "slug": "antiques",
        "subcategories": [
          { "name": "Vintage Camera", "slug": "vintage-camera" },
          { "name": "Vintage Ceramics & Glass", "slug": "vintage-ceramics-glass-antiques" },
          { "name": "Vintage Dolls and Toys", "slug": "vintage-dolls-and-toys" },
          { "name": "Vintage Instruments", "slug": "vintage-instruments" },
          { "name": "Vintage Jewellery and Trinkets", "slug": "vintage-jewellery" },
          { "name": "Vintage Metalware", "slug": "vintage-metalware-antiques" },
          { "name": "Vintage Pens & Writing instruments", "slug": "vintage-pens" },
          { "name": "Vintage Souvenirs and Novelties", "slug": "vintage-souvenirs-and-novelties" },
          { "name": "Vintage Statues and Figures", "slug": "vintage-statues-and-figures" },
          { "name": "Vintage Typewriters", "slug": "vintage-typewriters" },
          { "name": "Vintage Watches and Clocks", "slug": "vintage-watches-and-clocks" }
        ]
      },
      {
        "name": "Autographs",
        "slug": "autographs",
        "subcategories": [
          { "name": "Artists Authors Personalities Autographs", "slug": "artists-authors-personalities-autographs" },
          { "name": "Bollywood Indian Film Personalities Autographs", "slug": "bollywood-indian-film-personalities-autographs" },
          { "name": "Famous Personalities Autographs", "slug": "famous-personalities-autographs" },
          { "name": "Hollywood World Film Personalities Autographs", "slug": "hollywood-world-film-personalities-autographs" },
          { "name": "Music Dance Personalities Autographs", "slug": "music-dance-personalities-autographs" },
          { "name": "Political Social Personalities Autographs", "slug": "political-social-personalities-autographs" },
          { "name": "Sports Personalities Autographs", "slug": "sports-personalities-autographs" }
        ]
      },
      {
        "name": "Bullion",
        "slug": "bullion",
        "subcategories": [
          { "name": "Diamond", "slug": "diamond" },
          { "name": "Gold", "slug": "gold" },
          { "name": "Silver", "slug": "silver" }
        ]
      },
      { "name": "Maps and Globes", "slug": "maps-and-globes" },
      { "name": "Matchbox Labels", "slug": "matchbox-labels" },
      { "name": "Medals & Tokens", "slug": "medals-tokens" },
      { "name": "Novelties", "slug": "novelties" },
      { "name": "Other Collectibles", "slug": "other-collectibles" },
      { "name": "Photographs", "slug": "photographs" },
      { "name": "Postcards", "slug": "postcards" },
      { "name": "Sign Boards and Advertising Items", "slug": "sign-boards-and-advertising-items" },
      { "name": "Software CD / DVD", "slug": "software-cd-dvd" },
      { "name": "Sports Memorabilia", "slug": "sports-memorabilia" },
      { "name": "Vintage papers", "slug": "vintage-papers" }
    ]
  },
  {
    "name": "Deal of the Day",
    "slug": "deal-of-the-day",
    "subcategories": []
  },
  {
    "name": "Home and Living",
    "slug": "home-and-living",
    "subcategories": [
      { "name": "Bedding", "slug": "bedding" },
      {
        "name": "Home Decor",
        "slug": "home-decor",
        "subcategories": [
          { "name": "Artificial Flowers and Plants", "slug": "artificial-flowers-and-plants" },
          { "name": "Candles & Candle Stands", "slug": "candles-candle-stands" },
          { "name": "Decoracative Bells", "slug": "decoracative-bells" },
          { "name": "Decoracative Bottles", "slug": "decoracative-bottles" },
          { "name": "Decoracative Bowls", "slug": "decoracative-bowls" },
          { "name": "Decoracative Boxes", "slug": "decoracative-boxes" },
          { "name": "Decoracative Plates", "slug": "decoracative-plates" },
          { "name": "Decorative Trays", "slug": "decorative-trays" },
          { "name": "Figurines and Statues", "slug": "figurines-and-statues" },
          { "name": "Fountains", "slug": "fountains" },
          { "name": "Fridge Magnets", "slug": "fridge-magnets" },
          { "name": "Home Fragrances", "slug": "home-fragrances" },
          { "name": "Incense and Holders", "slug": "incense-and-holders" },
          { "name": "Keychains", "slug": "keychains" },
          { "name": "Mirrors", "slug": "mirrors" },
          { "name": "Photoframes", "slug": "photoframes" },
          { "name": "Table Top Decor", "slug": "table-top-decor" },
          { "name": "Tables", "slug": "tables" },
          { "name": "Vases and Indoor Flower Pots", "slug": "vases-and-indoor-flower-pots" },
          { "name": "Wall Art", "slug": "wall-art" },
          { "name": "Windchimes", "slug": "windchimes" }
        ]
      },
      { "name": "Home Improvement", "slug": "home-improvement" },
      { "name": "Kitchen and Dining", "slug": "kitchen-and-dining" },
      { "name": "Lighting", "slug": "home-lighting" },
      { "name": "Outdoor and Gardening", "slug": "outdoor-and-gardening" },
      { "name": "Spiritual and Religious", "slug": "spiritual-and-religious" }
    ]
  },
  {
    "name": "Jewellery and Watches",
    "slug": "jewellery-and-watches",
    "subcategories": [
      {
        "name": "Fashion Jewellery",
        "slug": "fashion-jewellery",
        "subcategories": [
          { "name": "Anklets", "slug": "anklets" },
          { "name": "Bangles Bracelets", "slug": "bangles-bracelets" },
          { "name": "Body Jewellery", "slug": "body-jewellery" },
          { "name": "Brooches Lapel Pins", "slug": "brooches-lapel-pins" },
          { "name": "Earrings", "slug": "earrings" },
          { "name": "Jewellery Sets", "slug": "jewellery-sets" },
          { "name": "Necklaces", "slug": "necklaces" },
          { "name": "Rings", "slug": "rings" }
        ]
      },
      { "name": "Gemstones", "slug": "gemstones" },
      { "name": "Jewellery Box", "slug": "jewellery-box" },
      {
        "name": "Watches and Clocks",
        "slug": "watches-and-clocks",
        "subcategories": [
          { "name": "Pocket Watches", "slug": "pocket-watches" },
          { "name": "Table Clocks", "slug": "table-clocks" },
          { "name": "Wall Clocks", "slug": "wall-clocks" },
          { "name": "Wrist Watches", "slug": "wrist-watches" }
        ]
      }
    ]
  },
  {
    "name": "Make an Offer",
    "slug": "make-an-offer",
    "subcategories": []
  },
  {
    "name": "Music and Movies",
    "slug": "music-and-movies",
    "subcategories": [
      {
        "name": "Audio Cassette Tapes",
        "slug": "audio-cassette-tapes",
        "subcategories": [
          { "name": "Audio Books Audio Cassettes", "slug": "audio-books-audio-cassettes" },
          { "name": "Bengali Audio Cassettes", "slug": "bengali-audio-cassettes" },
          { "name": "Bhojpuri Audio Cassettes", "slug": "bhojpuri-audio-cassettes" },
          { "name": "Bollywood Audio Cassettes", "slug": "bollywood-audio-cassettes" },
          { "name": "Children Audio Cassettes", "slug": "children-audio-cassettes" },
          { "name": "Devotional Audio Cassettes", "slug": "devotional-audio-cassettes" },
          { "name": "English Audio Cassettes", "slug": "english-audio-cassettes" },
          { "name": "Ghazals Sufi Qawwalli Audio Cassettes", "slug": "ghazals-sufi-qawwalli-audio-cassettes" },
          { "name": "Gujarati Audio Cassettes", "slug": "gujarati-audio-cassettes" },
          { "name": "Haryanavai Audio Cassette", "slug": "haryanavai-audio-cassette" },
          { "name": "Inde Non-filmi Audio Cassettes", "slug": "inde-non-filmi-audio-cassettes" },
          { "name": "Indian Classical Audio Cassettes", "slug": "indian-classical-audio-cassettes" },
          { "name": "Instrumental Audio Cassettes", "slug": "instrumental-audio-cassettes" },
          { "name": "Kannada Audio Cassettes", "slug": "kannada-audio-cassettes" },
          { "name": "Konkani Audio Cassettes", "slug": "konkani-audio-cassettes" },
          { "name": "Malayalam Audio Cassettes", "slug": "malayalam-audio-cassettes" },
          { "name": "Marathi Audio Cassettes", "slug": "marathi-audio-cassettes" },
          { "name": "Programs Audio Cassettes", "slug": "programs-audio-cassettes" },
          { "name": "Punjabi Audio Cassettes", "slug": "punjabi-audio-cassettes" },
          { "name": "Rajasthani Audio Cassettes", "slug": "rajasthani-audio-cassettes-audio-cassette-tapes" },
          { "name": "Tamil Audio Cassettes", "slug": "tamil-audio-cassettes" },
          { "name": "Telugu Audio Cassettes", "slug": "telugu-audio-cassettes" },
          { "name": "Western Classical Audio Cassettes", "slug": "western-classical-audio-cassettes" }
        ]
      },
      {
        "name": "Audio CD / DVD",
        "slug": "music-cd-dvd",
        "subcategories": [
          { "name": "Bengali Audio CD / DVD", "slug": "bengali-audio-cd-dvd" },
          { "name": "Childrens Audio CD / DVD", "slug": "childrens-audio-cd-dvd" },
          { "name": "Devotional Audio CD / DVD", "slug": "devotional-audio-cd-dvd" },
          { "name": "English Audio CD / DVD", "slug": "english-audio-cd-dvd" },
          { "name": "Ghazals Sufi Qawwalli Audio CD / DVD", "slug": "ghazals-sufi-qawwalli-audio-cd-dvd" },
          { "name": "Gujarati Audio CD / DVD", "slug": "gujarati-audio-cd-dvd" },
          { "name": "Hindi Audio CD / DVD", "slug": "hindi-audio-cd-dvd" },
          { "name": "Inde Non-filmi CD / DVD", "slug": "inde-non-filmi-cd-dvd" },
          { "name": "Indian Classical CD / DVD", "slug": "indian-classical-cd-dvd" },
          { "name": "Kannada Audio CD / DVD", "slug": "kannada-audio-cd-dvd" },
          { "name": "Malayalam Audio CD / DVD", "slug": "malayalam-audio-cd-dvd" },
          { "name": "Marathi Audio CD / DVD", "slug": "marathi-audio-cd-dvd" },
          { "name": "Punjabi Audio CD / DVD", "slug": "punjabi-audio-cd-dvd" },
          { "name": "Tamil Audio CD / DVD", "slug": "tamil-audio-cd-dvd" },
          { "name": "Telugu Audio CD / DVD", "slug": "telugu-audio-cd-dvd" },
          { "name": "Western Classical CD / DVD", "slug": "western-classical-cd-dvd" },
          { "name": "World Audio CD / DVD", "slug": "world-audio-cd-dvd" }
        ]
      },
      { "name": "AV Equipment and Instruments", "slug": "av-equipment" },
      {
        "name": "Movie Memorabilia",
        "slug": "movie-memorabilia",
        "subcategories": [
          { "name": "Movie Postcards", "slug": "movie-postcards" },
          { "name": "Movie Posters", "slug": "movie-posters" },
          { "name": "Movie Synopsis Pressbooks", "slug": "movie-synopsis-pressbooks" },
          { "name": "Movie Tickets", "slug": "movie-tickets" }
        ]
      },
      { "name": "Music Memorabilia", "slug": "music-memorabilia" },
      { "name": "Spool Tapes", "slug": "spool-tapes" },
      { "name": "VHS Tapes", "slug": "vhs-tapes" },
      {
        "name": "Video CD / DVD",
        "slug": "video-cd-dvd",
        "subcategories": [
          { "name": "Bengali Video CD / DVD", "slug": "bengali-video-cd-dvd" },
          { "name": "English Video CD / DVD", "slug": "english-video-cd-dvd" },
          { "name": "Gujarati Video CD / DVD", "slug": "gujarati-video-cd-dvd" },
          { "name": "Hindi Video CD / DVD", "slug": "hindi-video-cd-dvd" },
          { "name": "Kannada Video CD / DVD", "slug": "kannada-video-cd-dvd" },
          { "name": "Malayalam Video CD / DVD", "slug": "malayalam-video-cd-dvd" },
          { "name": "Marathi Video CD / DVD", "slug": "marathi-video-cd-dvd" },
          { "name": "Punjabi Video CD / DVD", "slug": "punjabi-video-cd-dvd" },
          { "name": "Tamil Video CD / DVD", "slug": "tamil-video-cd-dvd" },
          { "name": "Telugu Video CD / DVD", "slug": "telugu-video-cd-dvd" },
          { "name": "World Video CD / DVD", "slug": "world-video-cd-dvd" }
        ]
      },
      {
        "name": "Vinyl Records",
        "slug": "vinyl-records",
        "subcategories": [
          { "name": "Bengali Vinyl Records", "slug": "bengali-vinyl-records" },
          { "name": "Bhojpuri Vinyl Records", "slug": "bhojpuri-vinyl-records" },
          { "name": "Bihari Vinyl Records", "slug": "bihari-vinyl-records" },
          { "name": "Devotional Vinyl Records", "slug": "devotional-vinyl-records" },
          { "name": "English Vinyl Records", "slug": "english-vinyl-records" },
          { "name": "Ghazals Vinyl Records", "slug": "ghazals-vinyl-records" },
          { "name": "Gujarati Vinyl Records", "slug": "gujarati-vinyl-records" },
          { "name": "Haryanvi Vinyl Records", "slug": "haryanvi-vinyl-records" },
          { "name": "Hindi Movie Vinyl Records", "slug": "hindi-movie-vinyl-records" },
          { "name": "Hindi Non-Filmi Vinyl Records", "slug": "hindi-non-filmi-vinyl-records" },
          { "name": "Indian Classical Vinyl Records", "slug": "indian-classical-vinyl-records" },
          { "name": "Instrumental Vinyl Records", "slug": "instrumental-vinyl-records" },
          { "name": "Jazz Vinyl Records", "slug": "jazz-vinyl-records" },
          { "name": "Kannada Vinyl Records", "slug": "kannada-vinyl-records" },
          { "name": "Malayalam Vinyl Records", "slug": "malayalam-vinyl-records" },
          { "name": "Marathi Vinyl Records", "slug": "marathi-vinyl-records" },
          { "name": "Odia Vinyl Records", "slug": "odia-vinyl-records" },
          { "name": "Punjabi Vinyl Records", "slug": "punjabi-vinyl-records" },
          { "name": "Rajasthani Vinyl Records", "slug": "rajasthani-vinyl-records" },
          { "name": "Sindhi Vinyl Records", "slug": "sindhi-vinyl-records" },
          { "name": "Spoken Word Vinyl Records", "slug": "spoken-word-vinyl-records" },
          { "name": "Sufi Qawwalli Vinyl Records", "slug": "sufi-qawwalli-vinyl-records" },
          { "name": "Tamil Vinyl Records", "slug": "tamil-vinyl-records" },
          { "name": "Telugu Vinyl Records", "slug": "telugu-vinyl-records" },
          { "name": "Urdu Vinyl Records", "slug": "urdu-vinyl-records" },
          { "name": "Western Classical Vinyl Records", "slug": "western-classical-vinyl-records" },
          { "name": "World Music Vinyl Records", "slug": "world-music-vinyl-records" }
        ]
      }
    ]
  },
  {
    "name": "Philately",
    "slug": "philately",
    "subcategories": [
      {
        "name": "Covers and Postcards",
        "slug": "covers-and-postcards",
        "subcategories": [
          { "name": "First Day Covers (FDC)", "slug": "fdcs" },
          { "name": "First Flight Covers", "slug": "first-flight-covers" },
          { "name": "Info Sheets", "slug": "info-sheets" },
          { "name": "Postal Covers", "slug": "postal-covers" },
          { "name": "Postal Postcards", "slug": "postal-postcards" },
          { "name": "Presentation Pack", "slug": "presentation-pack" },
          { "name": "Special Covers", "slug": "special-covers" }
        ]
      },
      { "name": "Errors/Variety Stamps", "slug": "errors-stamps" },
      {
        "name": "Fiscals",
        "slug": "fiscals",
        "subcategories": [
          { "name": "Fiscal Stamps", "slug": "fiscal-stamps" },
          { "name": "Hundi Papers", "slug": "hundi-papers" },
          { "name": "Stamp Papers", "slug": "stamp-papers" }
        ]
      },
      {
        "name": "Philately Publications and Supplies",
        "slug": "philately-publications-and-supplies",
        "subcategories": [
          { "name": "Philately Publications", "slug": "philately-publications" },
          {
            "name": "Philately Supplies",
            "slug": "philately-supplies",
            "subcategories": [
              { "name": "Printable Album Pages", "slug": "printable-album-pages" },
              { "name": "Stamp Albums and Stock Cards", "slug": "albums-and-stock-cards" }
            ]
          }
        ]
      },
      {
        "name": "Stamps and Minisheets",
        "slug": "stamps-and-minisheets",
        "subcategories": [
          { "name": "Cinderella stamps", "slug": "cinderella-stamps" },
          { "name": "Foreign stamps", "slug": "foreign-stamps" },
          { "name": "Full sheets", "slug": "full-sheets" },
          { "name": "Minisheets", "slug": "minisheets" },
          { "name": "Mint stamps (MNH / MH)", "slug": "mint-stamps-mnh-mh" },
          { "name": "Stamps Lots", "slug": "lots" },
          { "name": "Used stamps", "slug": "used-stamps" },
          { "name": "Year pack", "slug": "year-pack" }
        ]
      }
    ]
  },
  {
    "name": "Stationery and Crafts",
    "slug": "stationery-and-crafts",
    "subcategories": [
      { "name": "Art and Craft Supplies", "slug": "art-and-craft-supplies" },
      { "name": "Bookmarks", "slug": "bookmarks" },
      { "name": "Filing and Organization", "slug": "filing-and-organization" },
      { "name": "Laminated Charts", "slug": "laminated-charts" },
      { "name": "Notebooks", "slug": "notebooks" },
      { "name": "Office Supplies", "slug": "office-supplies" }
    ]
  },
  {
    "name": "Toys and Games",
    "slug": "toys-and-games",
    "subcategories": [
      { "name": "Action Figures", "slug": "action-figures" },
      { "name": "Building Toys", "slug": "building-toys" },
      { "name": "Dolls", "slug": "dolls" },
      { "name": "Games and Puzzles", "slug": "games-and-puzzles" },
      { "name": "Models and Kits", "slug": "models-and-kits" },
      {
        "name": "Scale Models Diecasts",
        "slug": "diecast-scale-models",
        "subcategories": [
          { "name": "Aircrafts", "slug": "aircrafts" },
          { "name": "Bikes", "slug": "bikes" },
          { "name": "Buses", "slug": "buses" },
          { "name": "Cars", "slug": "cars" },
          { "name": "Equipment", "slug": "equipment" },
          { "name": "Fire Engines", "slug": "fire-engines" },
          { "name": "Military Models", "slug": "military-models" },
          { "name": "Trains", "slug": "trains" },
          { "name": "Trucks", "slug": "trucks" }
        ]
      },
      { "name": "Sporting Goods", "slug": "sporting-goods" },
      { "name": "Stuffed Toys", "slug": "stuffed-toys" },
      { "name": "Toys", "slug": "toys" },
      { "name": "Video Games", "slug": "video-games" }
    ]
  }
];
