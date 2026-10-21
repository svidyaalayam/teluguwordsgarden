from django.core.management.base import BaseCommand
from django.db import transaction

from vocabulary.models import (
    LearningLevel,
    Lesson,
    LessonWord,
    VocabularyCategory,
    Word,
)

# Bilingual categories (Telugu & English) with 5 authentic Telugu vocabulary words each
CATEGORY_WORDS = {
    "జంతువులు (Animals)": "పిల్లి|కుక్క|ఆవు|గుర్రం|చేప",
    "పెంపుడు జంతువులు (Pets)": "కుందేలు|పిల్లిపిల్ల|కుక్కపిల్ల|తాబేలు|గినియా పంది",
    "అడవి జంతువులు (Wild Animals)": "సింహం|పులి|ఏనుగు|కోతి|జింక",
    "వ్యవసాయ జంతువులు (Farm Animals)": "గేదె|మేక|గొర్రె|ఎద్దు|కోడి",
    "సముద్ర జీవులు (Sea Animals)": "తిమింగలం|సొరచేప|పీత|నక్షత్ర చేప|డాల్ఫిన్",
    "పక్షులు (Birds)": "నెమలి|చిలుక|కాకి|పావురం|కోయిల",
    "కీటకాలు (Insects & Bugs)": "చీమ|తేనెటీగ|సీతాకోకచిలుక|దోమ|మిడత",
    "పండ్లు (Fruits)": "మామిడిపండు|అరటిపండు|ఆపిల్|ద్రాక్ష|జామపండు",
    "కూరగాయలు (Vegetables)": "వంకాయ|టమాట|క్యారెట్|బంగాళాదుంప|బెండకాయ",
    "ఆహారం (Food)": "అన్నం|రోటీ|ఇడ్లీ|దోశ|లడ్డూ",
    "పానీయాలు (Drinks)": "నీరు|పాలు|మజ్జిగ|పండ్ల రసం|తేనీరు",
    "రంగులు (Colors)": "ఎరుపు|నీలం|ఆకుపచ్చ|పసుపు|తెలుపు",
    "అంకెలు (Numbers)": "ఒకటి|రెండు|మూడు|నాలుగు|ఐదు",
    "ఆకారాలు (Shapes)": "వృత్తం|చతురస్రం|త్రిభుజం|దీర్ఘచతురస్రం|నక్షత్రం",
    "శరీర భాగాలు (Body Parts)": "కన్ను|ముక్కు|నోరు|చెవి|చేయి",
    "పంచేంద్రియాలు (Five Senses)": "చూపు|వినికిడి|వాసన|రుచి|స్పర్శ",
    "కుటుంబం (Family)": "అమ్మ|నాన్న|తాతయ్య|అమ్మమ్మ|అన్నయ్య",
    "స్నేహితులు & సంబంధాలు (Friends & Relationships)": "స్నేహితుడు|తమ్ముడు|చెల్లెలు|అక్క|గురువు",
    "బట్టలు & దుస్తులు (Clothing & Accessories)": "చొక్కా|లంగా|టోపీ|మేజోళ్ళు|చెప్పులు",
    "వాహనాలు (Vehicles)": "కారు|బస్సు|రైలు|విమానం|సైకిల్",
    "బడి / పాఠశాల (School)": "బడి|పుస్తకం|కలం|పలక|సంచి",
    "ఇంటి వస్తువులు (Household Objects)": "గడియారం|దీపం|అద్దం|తాళం|కుర్చీ",
    "వంటగది వస్తువులు (Kitchen Items)": "పళ్ళెం|గ్లాసు|స్పూన్|గిన్నె|పొయ్యి",
    "ప్రకృతి (Nature)": "సూర్యుడు|చంద్రుడు|వర్షం|నది|కొండ",
    "మొక్కలు & పూలు (Plants & Flowers)": "తామరపువ్వు|గులాబీ|మల్లెపువ్వు|బంతిపువ్వు|మందారపువ్వు",
    "చెట్లు & అడవులు (Trees & Forests)": "చెట్టు|కొమ్మ|ఆకు|వేరు|అడవి",
    "వాతావరణం (Weather)": "ఎండ|వాన|గాలి|మబ్బు|చలి",
    "వారంలోని రోజులు (Days of the Week)": "ఆదివారం|సోమవారం|మంగళవారం|బుధవారం|శుక్రవారం",
    "సమయం (Time of Day)": "ఉదయం|మధ్యాహ్నం|సాయంత్రం|రాత్రి|పగలు",
    "ఆటలు & బొమ్మలు (Toys & Games)": "బంతి|బొమ్మ|గాలిపటం|ఊయల|పరుగు పందెం",
    "సంగీతం & వాయిద్యాలు (Music & Instruments)": "పాట|వీణ|మృదంగం|పిల్లనగ్రోవి|తాళం",
    "నిత్య పనులు (Everyday Actions)": "చదువు|రాయి|వినండి|మాట్లాడు|ఆడు",
    "కదలికలు & ఆటలు (Movement & Actions)": "పరుగెత్తు|నడువు|దూకు|ఈదు|తాళం వేయి",
    "భావాలు & అనుభూతులు (Feelings)": "సంతోషం|ప్రేమ|శాంతం|ఉత్సాహం|నవ్వు",
    "మర్యాదలు & మంచి అలవాట్లు (Social Skills & Manners)": "దయచేసి|ధన్యవాదాలు|క్షమించండి|నమస్కారం|సహాయం",
    "పరిమాణాలు (Sizes & Measurements)": "పెద్దది|చిన్నది|పొడవైనది|పొట్టిది|బరువైనది",
    "వ్యతిరేక పదాలు (Opposites)": "వేడి|చల్లని|పైకి|కిందికి|వేగంగా",
    "దిక్కులు (Directions)": "తూర్పు|పడమర|ఉత్తరం|దక్షిణం|మధ్యలో",
    "రుచులు (Taste & Texture)": "తీపి|కారం|పులుపు|ఉప్పు|చేదు",
    "పండుగలు & వేడుకలు (Holidays & Celebrations)": "సంక్రాంతి|ఉగాది|దీపావళి|పుట్టినరోజు|పండుగ",
    "వృత్తులు (Jobs & Occupations)": "రైతు|వైద్యుడు|ఉపాధ్యాయుడు|సైనికుడు|శిల్పి",
    "భవనాలు & ప్రదేశాలు (Places & Buildings)": "ఇల్లు|గుడి|ఆసుపత్రి|గ్రంథాలయం|తోట",
    "గదులు & ప్రదేశాలు (Rooms in Home)": "పడుకునే గది|వంటగది|స్నానాల గది|హాలు|వరండా",
    "అంతరిక్షం & గ్రహాలు (Space & Planets)": "భూమి|ఆకాశం|గ్రహం|తోకచుక్క|రాకెట్",
    "తోట జీవులు (Garden Creatures)": "వానపాము|నత్త|సాలీడు|తూనీగ|కీచురాయి",
    "సహాయకులు (Community Helpers)": "పోలీసు|నర్స్|తపాలా బంట్రోతు|అగ్నిమాపక సిబ్బంది|పారిశుధ్య కార్మికుడు",
    "అక్షరాలు & వర్ణమాల (Alphabet & Letters)": "అక్షరం|అచ్చులు|హల్లులు|గుణింతం|పదం",
    "ఋతువులు (Seasons)": "వసంత ఋతువు|గ్రీష్మ ఋతువు|వర్ష ఋతువు|శరద్ ఋతువు|శిశిర ఋతువు",
    "ఆరోగ్యం & పరిశుభ్రత (Health & Hygiene)": "సబ్బు|బ్రష్|స్నానం|శుభ్రత|మందు",
    "వ్యక్తిత్వ లక్షణాలు (Personality Traits)": "ధైర్యం|దయ|వినయం|నిజాయితీ|ఓర్పు",
    "భద్రత (Safety)": "జాగ్రత్త|ఆగు|రహదారి|హెల్మెట్|సురక్షితం",
    "రవాణా (Transport)": "ప్రయాణం|టికెట్|స్టేషన్|దారి|విహారయాత్ర",
    "రహదారి భద్రత (Road Safety)": "జీబ్రా క్రాసింగ్|సిగ్నల్|పాదచారి|కాలిబాట|బెల్టు",
    "తరగతి గది వస్తువులు (Classroom Objects)": "బల్ల|బోర్డు|రబ్బరు|స్కేలు|పుస్తకాల అర",
    "చదువు & అభ్యాసం (Learning & Study)": "నేర్చుకో|గుర్తుంచుకో|సాధన|పాఠం|పరీక్ష",
    "పుస్తకాలు & కథలు (Books & Stories)": "కథ|కథానాయకుడు|నీతి|బొమ్మల కథ|ముగింపు",
    "సాంకేతికత (Technology)": "కంప్యూటర్|ఫోన్|కీబోర్డు|తెర|రోబోట్",
    "సంభాషణ (Communication)": "సందేశం|ప్రశ్న|సమాధానం|కబుర్లు|మాట",
    "ప్రయాణం & సెలవులు (Travel & Holidays)": "సూట్‌కేస్|పాస్‌పోర్ట్|సముద్ర తీరం|పర్వతం|రైల్వే స్టేషన్",
    "షాపింగ్ & డబ్బులు (Shopping & Money)": "దుకాణం|రూపాయి|నాణెం|ధర|సంచి",
    "సైన్స్ & ఆవిష్కరణలు (Science & Discovery)": "ప్రయోగం|పరిశీలన|భూతద్దం|కనిపెట్టు|కొలత",
    "నమూనాలు & వరుసలు (Patterns & Sequences)": "వరుస|మొదటిది|చివరిది|తరువాత|పునరావృతం",
    "లెక్కింపు & పరిమాణాలు (Counting & Quantities)": "చాలా|కొన్ని|ఎక్కువ|తక్కువ|సరిపడా",
    "ప్రాథమిక భావనలు (Basic Concepts)": "ఒకేలా|వేరుగా|అన్నీ|ఏమీలేవు|మరొకటి",
    "కాలాలు (Past, Present & Future)": "నిన్న|నేడు|రేపు|ఇప్పుడు|తరువాత",
    "జంతువుల నివాసాలు (Animal Homes)": "గూడు|గుహ|పుట్ట|తేనెపట్టు|కొట్టం",
    "జంతువుల శబ్దాలు (Animal Sounds)": "మ్యావ్|భౌ భౌ|అంబా|గర్జన|కూత",
    "పర్యావరణం (Environment)": "మొక్క నాటడం|పరిరక్షణ|నీటి పొదుపు|చెత్త బుట్ట|స్వచ్ఛత",
    "కళలు & చేతిపనులు (Art & Crafts)": "చిత్రం|రంగు వేయు|కత్తెర|జిగురు|కాగితం",
    "వంట & భోజనం (Meals & Cooking)": "అల్పాహారం|మధ్యాహ్న భోజనం|రాత్రి భోజనం|వంట|రుచి",
    "ఊరిలోని ప్రదేశాలు (Places in Town)": "పార్కు|మార్కెట్|పోస్టాఫీసు|బ్యాంకు|సినిమా హాలు",
    "క్యాలెండర్ & తేదీలు (Calendar & Dates)": "క్యాలెండర్|తేదీ|నెల|సంవత్సరం|వారము",
    "సంవత్సరంలోని నెలలు (Months of the Year)": "చైత్రం|వైశాఖం|శ్రావణం|భాద్రపదం|కార్తీకం",
    "గడియారం & సమయం (Clock & Time)": "గంట|నిమిషం|సెకను|ముల్లు|సమయపాలన",
    "సంజ్ఞలు & గుర్తులు (Signs & Symbols)": "బాణం గుర్తు|ప్రవేశం|నిష్క్రమణ|స్వచ్ఛభారత్|ఓం",
}

# Detailed metadata for Telugu words: (definition, part_of_speech, pronunciation, example_sentence)
WORD_DETAILS = {
    # Animals
    "పిల్లి": (
        "Cat • A playful domestic pet animal that purrs and likes milk.",
        "నామవాచకం • Noun",
        "Pilli",
        "పిల్లి పాలు తాగుతుంది. • The cat is drinking milk.",
    ),
    "కుక్క": (
        "Dog • A loyal and friendly pet animal that barks and guards the home.",
        "నామవాచకం • Noun",
        "Kukka",
        "కుక్క తోక ఊపుతూ స్వాగతం పలికింది. • The dog wagged its tail welcoming us.",
    ),
    "ఆవు": (
        "Cow • A gentle farm animal that gives wholesome, fresh milk.",
        "నామవాచకం • Noun",
        "Aavu",
        "ఆవు పచ్చిక బయలులో మేస్తుంది. • The cow is grazing in the green meadow.",
    ),
    "గుర్రం": (
        "Horse • A strong and noble animal that gallops swiftly.",
        "నామవాచకం • Noun",
        "Gurram",
        "గుర్రం వేగంగా పరిగెడుతుంది. • The horse runs swiftly.",
    ),
    "చేప": (
        "Fish • A beautiful aquatic creature that swims in fresh water.",
        "నామవాచకం • Noun",
        "Chepa",
        "చేప నీటిలో చురుగ్గా ఈదుతుంది. • The fish swims gracefully in water.",
    ),

    # Wild Animals
    "సింహం": (
        "Lion • The majestic king of the jungle with a golden mane.",
        "నామవాచకం • Noun",
        "Simham",
        "సింహం గంభీరంగా గర్జిస్తుంది. • The lion roars majestically.",
    ),
    "పులి": (
        "Tiger • A powerful striped big cat, India's national animal.",
        "నామవాచకం • Noun",
        "Puli",
        "పులి అడవిలో దర్పంగా నడుస్తుంది. • The tiger walks gracefully in the jungle.",
    ),
    "ఏనుగు": (
        "Elephant • A friendly giant with large floppy ears and a long trunk.",
        "నామవాచకం • Noun",
        "Eenugu",
        "ఏనుగు తొండంతో నీళ్లు చల్లుకుంటుంది. • The elephant sprays water with its trunk.",
    ),
    "కోతి": (
        "Monkey • A clever, playful animal that swings happily from tree branches.",
        "నామవాచకం • Noun",
        "Kothi",
        "కోతి కొమ్మపై కూర్చుని అరటిపండు తింటోంది. • The monkey is eating a banana on the branch.",
    ),
    "జింక": (
        "Deer • A gentle and graceful creature that bounds through woodlands.",
        "నామవాచకం • Noun",
        "Jinka",
        "అందమైన జింక గెంతుతూ వెళ్ళింది. • The beautiful deer bounded away.",
    ),

    # Birds
    "నెమలి": (
        "Peacock • India's national bird with dazzling, colourful feather fan.",
        "నామవాచకం • Noun",
        "Nemali",
        "నెమలి వర్షం రాగానే పురివిప్పి నాట్యం చేస్తుంది. • The peacock fans its feathers and dances in rain.",
    ),
    "చిలుక": (
        "Parrot • A bright green bird with a cute red curved beak.",
        "నామవాచకం • Noun",
        "Chiluka",
        "రామచిలుక తీపి జామపండు కొరికింది. • The sweet parrot nibbled on a guava.",
    ),
    "కాకి": (
        "Crow • A very clever black bird that perches high and caws.",
        "నామవాచకం • Noun",
        "Kaaki",
        "కాకి చెట్టు కొమ్మపై కావు కావు అంటోంది. • The crow is cawing on the tree branch.",
    ),
    "పావురం": (
        "Pigeon • A gentle bird symbolising peace and friendliness.",
        "నామవాచకం • Noun",
        "Paavuram",
        "పావురం గింజలు తింటూ గూటికి చేరింది. • The pigeon ate grains and flew to its nest.",
    ),
    "కోయిల": (
        "Cuckoo • A melodious singing bird that heralds the spring season.",
        "నామవాచకం • Noun",
        "Koyila",
        "వసంతకాలంలో కోయిల మధురంగా కూస్తుంది. • The cuckoo sings melodiously in spring.",
    ),

    # Fruits
    "మామిడిపండు": (
        "Mango • The luscious king of fruits loved by children in India.",
        "నామవాచకం • Noun",
        "Maamidipandu",
        "తీపి మామిడిపండు అంటే పిల్లలందరికీ ఇష్టం. • All children love sweet mangoes.",
    ),
    "అరటిపండు": (
        "Banana • A sweet, nutritious yellow fruit easy to peel and enjoy.",
        "నామవాచకం • Noun",
        "Aratipandu",
        "రోజూ అరటిపండు తింటే మంచి బలం వస్తుంది. • Eating a banana daily gives great energy.",
    ),
    "ఆపిల్": (
        "Apple • A crisp, red sweet fruit that keeps you healthy and fit.",
        "నామవాచకం • Noun",
        "Aapil",
        "ఎర్రటి ఆపిల్ ఆరోగ్యానికి ఎంతో మంచిది. • A red apple is wonderful for health.",
    ),
    "ద్రాక్ష": (
        "Grapes • Juicy berries growing in joyful sweet bunches.",
        "నామవాచకం • Noun",
        "Draaksha",
        "ద్రాక్ష గుత్తులు తీపిగా మరియు రసభరితంగా ఉన్నాయి. • The grape bunches are sweet and juicy.",
    ),
    "జామపండు": (
        "Guava • A crunchy tropical green fruit rich in vitamins.",
        "నామవాచకం • Noun",
        "Jaamapandu",
        "తోటలోని జామపండు ఎంతో రుచిగా ఉంది. • The guava from the garden is so crunchy and delicious.",
    ),

    # Vegetables
    "వంకాయ": (
        "Aubergine / Brinjal • A rich purple vegetable, crowned king of veggies.",
        "నామవాచకం • Noun",
        "Vankaaya",
        "వంకాయ కూర అన్నంలో ఎంతో రుచిగా ఉంటుంది. • Aubergine curry tastes wonderful with rice.",
    ),
    "టమాట": (
        "Tomato • A juicy, vibrant red vegetable full of sunshine goodness.",
        "నామవాచకం • Noun",
        "Tamaata",
        "ఎర్ర టమాటాలతో రుచికరమైన రసం చేశారు. • Delicious soup was made with red tomatoes.",
    ),
    "క్యారెట్": (
        "Carrot • A crunchy bright orange root vegetable great for healthy eyes.",
        "నామవాచకం • Noun",
        "Kyarat",
        "క్యారెట్ హల్వా పండుగకు తయారుచేశారు. • Carrot halwa was prepared for the festival.",
    ),
    "బంగాళాదుంప": (
        "Potato • A versatile and delicious vegetable children cherish.",
        "నామవాచకం • Noun",
        "Bangaalaadumpa",
        "బంగాళాదుంప వేపుడు పిల్లలందరికీ ఎంతో ఇష్టం. • Potato fry is a favourite with all children.",
    ),
    "బెండకాయ": (
        "Okra / Lady's Finger • A tender green vegetable believed to sharpen young minds.",
        "నామవాచకం • Noun",
        "Bendakaaya",
        "బెండకాయ తింటే గణితం బాగా వస్తుందని చెబుతారు. • They say eating okra makes you sharp in maths.",
    ),

    # Colors
    "ఎరుపు": (
        "Red • The warm, vibrant colour of roses, strawberries, and rubies.",
        "విశేషణం • Adjective",
        "Erupu",
        "గులాబీ పువ్వు ఎరుపు రంగులో ఉంది. • The rose flower is bright red.",
    ),
    "నీలం": (
        "Blue • The cool, tranquil colour of the morning sky and ocean waves.",
        "విశేషణం • Adjective",
        "Neelam",
        "నిర్మలమైన ఆకాశం నీలం రంగులో మెరుస్తోంది. • The clear sky is shining blue.",
    ),
    "ఆకుపచ్చ": (
        "Green • The fresh, lively colour of plant leaves and rolling meadows.",
        "విశేషణం • Adjective",
        "Aakupachha",
        "చెట్ల ఆకులు పచ్చగా, అందంగా ఉన్నాయి. • The tree leaves are lush and green.",
    ),
    "పసుపు": (
        "Yellow • The cheerful sunny shade of marigolds and morning rays.",
        "విశేషణం • Adjective",
        "Pasupu",
        "పసుపు రంగు బంతిపూలు తోరణంలో మెరుస్తున్నాయి. • Yellow marigolds shine in the garland.",
    ),
    "తెలుపు": (
        "White • The peaceful, pure colour of milk, clouds, and swan feathers.",
        "విశేషణం • Adjective",
        "Telupu",
        "జాబిల్లి వెన్నెల తెలుపు రంగులో వెలిగిపోతోంది. • The gentle moonlight shines in pure white.",
    ),

    # Numbers
    "ఒకటి": (
        "One (1) • The very first counting number representing unity.",
        "సంఖ్య • Number",
        "Okkati",
        "నా చేతిలో ఒకటి ఎర్ర బంతి ఉంది. • I have one red ball in my hand.",
    ),
    "రెండు": (
        "Two (2) • The pair number: like our two eyes, ears, and hands.",
        "సంఖ్య • Number",
        "Rendu",
        "మనకు చూడటానికి రెండు కళ్లు ఉన్నాయి. • We have two eyes to see the world.",
    ),
    "మూడు": (
        "Three (3) • The number representing a trio, like wheels of a rickshaw.",
        "సంఖ్య • Number",
        "Moodu",
        "ఆటో రిక్షాకు మూడు చక్రాలు ఉంటాయి. • An auto-rickshaw has three wheels.",
    ),
    "నాలుగు": (
        "Four (4) • The number of paws on a gentle pet puppy or table legs.",
        "సంఖ్య • Number",
        "Naalugu",
        "కుక్కపిల్లకు నాలుగు చిన్న కాళ్లు ఉన్నాయి. • The puppy has four little paws.",
    ),
    "ఐదు": (
        "Five (5) • The number of fingers on each hand giving a warm high-five.",
        "సంఖ్య • Number",
        "Aidu",
        "చేతికి ఐదు వేళ్లు ఉన్నాయి, చప్పట్లు కొట్టండి! • There are five fingers on a hand, let's clap!",
    ),

    # Family
    "అమ్మ": (
        "Mother / Mummy • The loving, caring mother at the heart of home.",
        "నామవాచకం • Noun",
        "Amma",
        "అమ్మ నన్ను ఆప్యాయంగా దగ్గరకు తీసుకుంది. • Mother hugged me with warm love.",
    ),
    "నాన్న": (
        "Father / Daddy • The supportive, encouraging father guiding the family.",
        "నామవాచకం • Noun",
        "Naanna",
        "నాన్న నాతో కలిసి తోటలో ఆడుకున్నారు. • Father played with me in the garden.",
    ),
    "తాతయ్య": (
        "Grandfather • Grandpa who shares fascinating bedtime tales and wisdom.",
        "నామవాచకం • Noun",
        "Thaathayya",
        "తాతయ్య పిల్లలకు రామాయణం కథ చెప్పారు. • Grandpa narrated a story from the Ramayana.",
    ),
    "అమ్మమ్మ": (
        "Grandmother • Grandma who prepares sweet goodies and cradles lovingly.",
        "నామవాచకం • Noun",
        "Ammamma",
        "అమ్మమ్మ చేతి పాయసం అమృతంలా ఉంటుంది. • Grandma's sweet kheer tastes heavenly.",
    ),
    "అన్నయ్య": (
        "Elder Brother • An older brother who teaches, shares toys, and cares.",
        "నామవాచకం • Noun",
        "Annayya",
        "అన్నయ్య నాకు సైకిల్ తొక్కడం నేర్పించాడు. • Elder brother taught me how to ride a bicycle.",
    ),

    # Body Parts
    "కన్ను": (
        "Eye • The precious organ of vision through which we view this world.",
        "నామవాచకం • Noun",
        "Kannu",
        "కంటితో వర్ణమయ ప్రపంచాన్ని చూస్తాం. • We see the colourful world with our eyes.",
    ),
    "ముక్కు": (
        "Nose • The organ we breathe with and identify pleasant fragrances.",
        "నామవాచకం • Noun",
        "Mukku",
        "ముక్కుతో పువ్వుల సువాసనను పసిగడతాం. • We smell the lovely flower fragrance with our nose.",
    ),
    "నోరు": (
        "Mouth • Used for speaking Telugu sweetly, singing, and tasting food.",
        "నామవాచకం • Noun",
        "Noru",
        "నోటితో మధురంగా తెలుగు మాట్లాడాలి. • We should speak Telugu sweetly with our mouth.",
    ),
    "చెవి": (
        "Ear • The listening organ that brings us music, birdsong, and stories.",
        "నామవాచకం • Noun",
        "Chevi",
        "చెవులతో అమ్మ పాడే లాలిపాట వింటాం. • We listen to mother's lullaby with our ears.",
    ),
    "చేయి": (
        "Hand • The limb we use to write Telugu letters, hold hands, and give.",
        "నామవాచకం • Noun",
        "Cheyi",
        "చేతితో కలం పట్టుకుని అందంగా రాస్తాను. • I hold a pen with my hand and write neatly.",
    ),

    # School
    "బడి": (
        "School • The wonderful school where friends learn and grow together.",
        "నామవాచకం • Noun",
        "Badi",
        "మేము క్రమం తప్పకుండా తెలుగు బడికి వెళ్తాం. • We regularly attend our Telugu school.",
    ),
    "పుస్తకం": (
        "Book • A treasured gateway of knowledge, imagination, and wisdom.",
        "నామవాచకం • Noun",
        "Pusthakam",
        "తెలుగు బాలల పుస్తకం రంగురంగుల బొమ్మలతో ఉంది. • The Telugu children's book has colourful pictures.",
    ),
    "కలం": (
        "Pen • The trusted writing companion for penning inspiring ideas.",
        "నామవాచకం • Noun",
        "Kalam",
        "నా కలంతో తెలుగు అక్షరాలు రాశాను. • I wrote Telugu letters with my pen.",
    ),
    "పలక": (
        "Slate • A classic slate used by young learners to master the alphabet.",
        "నామవాచకం • Noun",
        "Palaka",
        "పలకపై బలపంతో అ ఆ ఇ ఈ దిద్దుతాను. • I trace Telugu letters on the slate with chalk.",
    ),
    "సంచి": (
        "School Bag • A sturdy bag keeping books, crayons, and snacks safe.",
        "నామవాచకం • Noun",
        "Sanchi",
        "పుస్తకాల సంచిని భుజాన వేసుకుని బడికి వెళ్లాను. • I slung my school bag and went to class.",
    ),

    # Nature
    "సూర్యుడు": (
        "Sun • The radiant star shedding golden light and vitality on Earth.",
        "నామవాచకం • Noun",
        "Sooryudu",
        "సూర్యుడు తూర్పున ఉదయించి వెలుగులు పంచాడు. • The sun rose in the east spreading light.",
    ),
    "చంద్రుడు": (
        "Moon • The gentle silvery companion gracing the star-studded night.",
        "నామవాచకం • Noun",
        "Chandrudu",
        "చంద్రుడు రాత్రిపూట చల్లని వెన్నెల కురిపిస్తాడు. • The moon showers cool moonlight at night.",
    ),
    "వర్షం": (
        "Rain • Refreshing raindrops nourishing trees, flowers, and rivers.",
        "నామవాచకం • Noun",
        "Varsham",
        "వర్షం పడినప్పుడు కాగితం పడవలు నీటిలో వదిలాం. • We sailed paper boats when rain fell.",
    ),
    "నది": (
        "River • A flowing river like Krishna or Godavari singing along its banks.",
        "నామవాచకం • Noun",
        "Nadi",
        "గోదావరి నది హుందాగా ప్రవహిస్తోంది. • The sacred Godavari river flows gracefully.",
    ),
    "కొండ": (
        "Hill / Mountain • A majestic green hill rising serenely towards the blue sky.",
        "నామవాచకం • Noun",
        "Konda",
        "పచ్చని కొండపై అందమైన గుడి ఉంది. • There is a pretty temple atop the green hill.",
    ),

    # Vehicles
    "కారు": (
        "Car • A comfortable four-wheeled motor car for happy family trips.",
        "నామవాచకం • Noun",
        "Kaaru",
        "మేము కారులో విహారయాత్రకు వెళ్లాం. • We traveled by car on a picnic outing.",
    ),
    "బస్సు": (
        "Bus • A cheerful big bus picking up children for school every morning.",
        "నామవాచకం • Noun",
        "Bassu",
        "పిల్లలందరూ వరుసలో బడి బస్సు ఎక్కారు. • All the children boarded the school bus in a line.",
    ),
    "రైలు": (
        "Train • A grand long train chugging rhythmically on silver tracks.",
        "నామవాచకం • Noun",
        "Railu",
        "రైలు కూత వేస్తూ వేగంగా స్టేషన్‌కు వచ్చింది. • The train whistled and arrived swiftly at the station.",
    ),
    "విమానం": (
        "Aeroplane • A silver bird flying high above soft white clouds.",
        "నామవాచకం • Noun",
        "Vimaanam",
        "విమానం ఆకాశంలో చుక్కలా ఎగురుతోంది. • The aeroplane is flying high like a dot in the sky.",
    ),
    "సైకిల్": (
        "Bicycle • A fun pedal cycle with two wheels for joyful park rides.",
        "నామవాచకం • Noun",
        "Saikil",
        "నేను సాయంత్రం పార్కులో సైకిల్ తొక్కాను. • I rode my bicycle in the park this evening.",
    ),

    # Food & Drink
    "అన్నం": (
        "Cooked Rice • The wholesome staple food that nourishes Telugu homes.",
        "నామవాచకం • Noun",
        "Annam",
        "అమ్మ వండిన వేడి అన్నం పప్పుతో రుచిగా ఉంది. • Hot rice cooked by mother tastes great with dal.",
    ),
    "పాలు": (
        "Milk • Pure, calcium-rich white milk that builds strong bones.",
        "నామవాచకం • Noun",
        "Paalu",
        "ప్రతిరోజూ ఉదయం గోరువెచ్చని పాలు తాగాలి. • Drink warm milk every morning for strength.",
    ),
    "నీరు": (
        "Water • Cool, clear crystal water vital for all living beings.",
        "నామవాచకం • Noun",
        "Neeru",
        "దాహం వేసినప్పుడు స్వచ్ఛమైన నీరు తాగాలి. • Drink clean, fresh water when thirsty.",
    ),
    "లడ్డూ": (
        "Laddu • A beloved round golden Indian sweet relished on celebrations.",
        "నామవాచకం • Noun",
        "Laddu",
        "వినాయక చవితి పండుగకు తియ్యని లడ్డూలు చేశారు. • Sweet laddus were prepared for Ganesh Chaturthi.",
    ),
    "రోటీ": (
        "Roti • Soft wholewheat flatbread served hot from the griddle.",
        "నామవాచకం • Noun",
        "Roti",
        "వేడి వేడి రోటీ కూరతో బాగుంటుంది. • Warm roti tastes delicious with vegetable curry.",
    ),

    # Actions
    "చదువు": (
        "Read / Study • To explore words, stories, and discover new things.",
        "క్రియ • Verb",
        "Chaduvu",
        "ప్రతిరోజూ తెలుగు పాఠం శ్రద్ధగా చదువుకోవాలి. • Study the Telugu lesson attentively every day.",
    ),
    "రాయి": (
        "Write • To put thoughts and letters gracefully onto paper.",
        "క్రియ • Verb",
        "Raayi",
        "అక్షరాలను ముత్యాల్లా అందంగా రాయి. • Write your letters beautifully like shining pearls.",
    ),
    "వినండి": (
        "Listen • To tune your ears attentively to Telugu sounds and stories.",
        "క్రియ • Verb",
        "Vinandi",
        "గురువుగారు చెప్పే మంచి మాటలను శ్రద్ధగా వినండి. • Listen carefully to the good words of the teacher.",
    ),
    "మాట్లాడు": (
        "Speak • To communicate thoughts sweetly and fluently in Telugu.",
        "క్రియ • Verb",
        "Maatlaadu",
        "ఇంట్లో అందరితో తెలుగులో స్పష్టంగా మాట్లాడు. • Speak clearly in Telugu with everyone at home.",
    ),
    "ఆడు": (
        "Play • To engage cheerfully in games and sports with friends.",
        "క్రియ • Verb",
        "Aadu",
        "సాయంత్రం స్నేహితులతో కలిసి మైదానంలో ఆడు. • Play in the ground with your friends in the evening.",
    ),
}

# High-resolution, child-friendly Unsplash imagery
WORD_IMAGES = {
    "పిల్లి": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
    "కుక్క": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80",
    "ఆవు": "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=600&q=80",
    "గుర్రం": "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=600&q=80",
    "చేప": "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=80",
    "సింహం": "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=600&q=80",
    "పులి": "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=600&q=80",
    "ఏనుగు": "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=600&q=80",
    "కోతి": "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?auto=format&fit=crop&w=600&q=80",
    "జింక": "https://images.unsplash.com/photo-1484406566174-9da000fda645?auto=format&fit=crop&w=600&q=80",
    "నెమలి": "https://images.unsplash.com/photo-1536514498073-50e69d39c6cf?auto=format&fit=crop&w=600&q=80",
    "చిలుక": "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=600&q=80",
    "కాకి": "https://images.unsplash.com/photo-1563811771046-ba984ff30900?auto=format&fit=crop&w=600&q=80",
    "పావురం": "https://images.unsplash.com/photo-1548811579-017cf2a4268b?auto=format&fit=crop&w=600&q=80",
    "కోయిల": "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=600&q=80",
    "మామిడిపండు": "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80",
    "అరటిపండు": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80",
    "ఆపిల్": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80",
    "ద్రాక్ష": "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=600&q=80",
    "జామపండు": "https://images.unsplash.com/photo-1536511135899-756f709d784a?auto=format&fit=crop&w=600&q=80",
    "వంకాయ": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
    "టమాట": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80",
    "క్యారెట్": "https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?auto=format&fit=crop&w=600&q=80",
    "బంగాళాదుంప": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80",
    "బెండకాయ": "https://images.unsplash.com/photo-1627885750893-fafe0b240b9d?auto=format&fit=crop&w=600&q=80",
    "ఎరుపు": "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80",
    "నీలం": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    "ఆకుపచ్చ": "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80",
    "పసుపు": "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=600&q=80",
    "తెలుపు": "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=600&q=80",
    "ఒకటి": "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80",
    "రెండు": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80",
    "మూడు": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
    "నాలుగు": "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80",
    "ఐదు": "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
    "అమ్మ": "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
    "నాన్న": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80",
    "తాతయ్య": "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=600&q=80",
    "అమ్మమ్మ": "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=600&q=80",
    "అన్నయ్య": "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=600&q=80",
    "బడి": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=600&q=80",
    "పుస్తకం": "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    "కలం": "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80",
    "పలక": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
    "సంచి": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
    "సూర్యుడు": "https://images.unsplash.com/photo-1579003593419-98f949b9398f?auto=format&fit=crop&w=600&q=80",
    "చంద్రుడు": "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=600&q=80",
    "వర్షం": "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80",
    "నది": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80",
    "కొండ": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
    "కారు": "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80",
    "బస్సు": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
    "రైలు": "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=600&q=80",
    "విమానం": "https://images.unsplash.com/photo-1519074069444-1ba4ea16e6f5?auto=format&fit=crop&w=600&q=80",
    "సైకిల్": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80",
    "అన్నం": "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80",
    "పాలు": "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80",
    "నీరు": "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80",
    "తామరపువ్వు": "https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=600&q=80",
    "గులాబీ": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80",
    "చెట్టు": "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80",
}


class Command(BaseCommand):
    help = (
        "Seed Word Garden with bilingual categories (Telugu and English), "
        "authentic Telugu words, transliterations, and lessons for UK learners."
    )

    @transaction.atomic
    def handle(self, *args, **options):
        starter, _ = LearningLevel.objects.update_or_create(
            name="Starter words • ప్రారంభ పదాలు",
            defaults={
                "min_age": 5,
                "max_age": 7,
                "description": "Everyday basic Telugu words for young UK learners",
                "display_order": 1,
            },
        )

        explorer, _ = LearningLevel.objects.update_or_create(
            name="Word explorers • పద అన్వేషకులు",
            defaults={
                "min_age": 7,
                "max_age": 10,
                "description": "Expanding vocabulary words for confident young learners",
                "display_order": 2,
            },
        )

        total_categories = len(CATEGORY_WORDS)
        total_words = 0
        total_lessons = 0

        for category_index, (bilingual_cat_name, raw_words) in enumerate(
            CATEGORY_WORDS.items(),
            start=1,
        ):
            # Extract English substring if present: e.g. "Animals" from "జంతువులు (Animals)"
            english_suffix = ""
            if "(" in bilingual_cat_name and ")" in bilingual_cat_name:
                english_suffix = bilingual_cat_name.split("(")[1].split(")")[0].strip()

            # Find existing category by English name or bilingual name, and upgrade to bilingual
            category = VocabularyCategory.objects.filter(name=bilingual_cat_name).first()
            if not category and english_suffix:
                matched = VocabularyCategory.objects.filter(name__icontains=english_suffix).first()
                if matched and not VocabularyCategory.objects.filter(name=bilingual_cat_name).exists():
                    matched.name = bilingual_cat_name
                    matched.active = True
                    matched.save(update_fields=("name", "active", "updated_at"))
                    category = matched

            if not category:
                category, _ = VocabularyCategory.objects.get_or_create(
                    name=bilingual_cat_name, defaults={"active": True}
                )

            level = starter if category_index % 2 else explorer
            words = [term.strip() for term in raw_words.split("|") if term.strip()]

            lesson, _ = Lesson.objects.update_or_create(
                title=f"{bilingual_cat_name}: Word Garden",
                defaults={
                    "description": (
                        f"Learn five useful Telugu words for {bilingual_cat_name}."
                    ),
                    "level": level,
                    "lesson_order": category_index,
                    "estimated_minutes": 12,
                    "published": True,
                },
            )
            total_lessons += 1

            for position, term in enumerate(words, start=1):
                details = WORD_DETAILS.get(term)
                image_url = WORD_IMAGES.get(term, "")

                if details:
                    definition, part_of_speech, pronunciation, sentence = details
                else:
                    # Generic child-friendly fallback for Telugu words without manual overrides
                    definition = f"Telugu vocabulary word in {bilingual_cat_name}."
                    part_of_speech = "నామవాచకం • Noun"
                    pronunciation = term
                    sentence = f"మనం '{term}' పదాన్ని నేర్చుకుంటున్నాం. • We are learning the word '{term}'."

                word_defaults = {
                    "definition": definition,
                    "part_of_speech": part_of_speech,
                    "pronunciation": pronunciation,
                    "example_sentence": sentence,
                    "active": True,
                }
                if image_url:
                    word_defaults["image_url"] = image_url

                word, created = Word.objects.get_or_create(
                    term=term,
                    defaults=word_defaults,
                )

                # Update existing words to make sure definition & pronunciation are bilingual
                if not created:
                    updated_fields = []
                    if details:
                        word.definition = definition
                        word.part_of_speech = part_of_speech
                        word.pronunciation = pronunciation
                        word.example_sentence = sentence
                        updated_fields.extend(["definition", "part_of_speech", "pronunciation", "example_sentence"])
                    if image_url and not word.image_url:
                        word.image_url = image_url
                        updated_fields.append("image_url")
                    if updated_fields:
                        updated_fields.append("updated_at")
                        word.save(update_fields=tuple(updated_fields))
                else:
                    total_words += 1

                word.categories.add(category)
                word.levels.add(level)

                LessonWord.objects.update_or_create(
                    lesson=lesson,
                    word=word,
                    defaults={"display_order": position},
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Word Garden Telugu seed completed successfully!\n"
                f"Bilingual categories: {total_categories}\n"
                f"Telugu words processed: {total_words} new / total {Word.objects.count()}\n"
                f"Lessons configured: {total_lessons}"
            )
        )
