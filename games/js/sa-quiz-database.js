const quizQuestions = [
    {
        question: "What big mountain is the focus point of sunny Cape Town?",
        answer: "Table Mountain",
        options: ["Table Mountain", "Lion's Head", "Devil's Peak", "Signal Hill"],
        category: "landmarks"
    },
    {
        question: "Two oceans join at the southern point of South Africa. What are they called?",
        answer: "Atlantic Ocean and Indian Ocean",
        options: ["Atlantic Ocean and Indian Ocean", "Pacific Ocean and Indian Ocean", "Atlantic Ocean and Southern Ocean", "Indian Ocean and Arctic Ocean"],
        category: "geography"
    },
    {
        question: "What is South Africa's biggest desert called?",
        answer: "The Kalahari Desert",
        options: ["The Kalahari Desert", "The Namib Desert", "The Karoo", "The Sahara Desert"],
        category: "geography"
    },
    {
        question: "How many provinces does South Africa have?",
        answer: "Nine",
        options: ["Nine", "Seven", "Eight", "Ten"],
        category: "geography"
    },
    {
        question: "The name of South Africa's capital city starts with a 'P'. What's it called?",
        answer: "Pretoria",
        options: ["Pretoria", "Port Elizabeth", "Pietermaritzburg", "Paarl"],
        category: "geography"
    },
    {
        question: "What is the longest river in South Africa called?",
        answer: "The Orange River",
        options: ["The Orange River", "The Limpopo River", "The Vaal River", "The Tugela River"],
        category: "geography"
    },
    {
        question: "Where is Durban located? Which province?",
        answer: "KwaZulu-Natal",
        options: ["KwaZulu-Natal", "Eastern Cape", "Western Cape", "Gauteng"],
        category: "geography"
    },
    {
        question: "In which provinces can you find the Kruger National Park?",
        answer: "Limpopo and Mpumalanga",
        options: ["Limpopo and Mpumalanga", "Gauteng and North West", "Free State and Mpumalanga", "Limpopo and North West"],
        category: "landmarks"
    },
    {
        question: "What is the name of the mountain next to Table Mountain?",
        answer: "Lion's Head",
        options: ["Lion's Head", "Devil's Peak", "Signal Hill", "Twelve Apostles"],
        category: "landmarks"
    },
    {
        question: "Name the smallest province in South Africa.",
        answer: "Gauteng",
        options: ["Gauteng", "Western Cape", "KwaZulu-Natal", "Free State"],
        category: "geography"
    },
    {
        question: "In which province can you find the most vineyards?",
        answer: "Western Cape",
        options: ["Western Cape", "Northern Cape", "Eastern Cape", "Gauteng"],
        category: "landmarks"
    },
    {
        question: "Which city is also known as 'The Friendly City'?",
        answer: "Gqeberha (Port Elizabeth)",
        options: ["Gqeberha (Port Elizabeth)", "Bloemfontein", "Durban", "Cape Town"],
        category: "geography"
    },
    {
        question: "Which is the largest province we have in South Africa?",
        answer: "Northern Cape",
        options: ["Northern Cape", "Eastern Cape", "Western Cape", "Free State"],
        category: "geography"
    },
    {
        question: "Which ocean do we find along the west coast of South Africa? (it's freezing cold!)",
        answer: "Atlantic Ocean",
        options: ["Atlantic Ocean", "Indian Ocean", "Southern Ocean", "Pacific Ocean"],
        category: "geography"
    },
    {
        question: "In which province can we find Kimberley?",
        answer: "Northern Cape",
        options: ["Northern Cape", "Free State", "North West", "Eastern Cape"],
        category: "geography"
    },
    {
        question: "Which animal is known for its long neck?",
        answer: "Giraffe",
        options: ["Giraffe", "Elephant", "Zebra", "Kudu"],
        category: "animals"
    },
    {
        question: "What animal has long tusks and a trunk?",
        answer: "Elephant",
        options: ["Elephant", "Rhino", "Hippo", "Warthog"],
        category: "animals"
    },
    {
        question: "What kind of flightless big bird can be found in South Africa?",
        answer: "Ostrich",
        options: ["Ostrich", "Penguin", "Emu", "Kiwi"],
        category: "animals"
    },
    {
        question: "Which horse-like animal has black-and-white stripes and can be found in grasslands and savanna woodlands?",
        answer: "Zebra",
        options: ["Zebra", "Wildebeest", "Kudu", "Impala"],
        category: "animals"
    },
    {
        question: "What curious little animal can be found on its hind legs looking around?",
        answer: "Meerkat",
        options: ["Meerkat", "Mongoose", "Squirrel", "Dassie"],
        category: "animals"
    },
    {
        question: "Name South Africa's national animal.",
        answer: "Springbok",
        options: ["Springbok", "Lion", "Leopard", "Elephant"],
        category: "animals"
    },
    {
        question: "Who is fondly known as the 'King of the Jungle'?",
        answer: "Lion",
        options: ["Lion", "Elephant", "Leopard", "Rhino"],
        category: "animals"
    },
    {
        question: "Which flightless bird can be found around the coasts of PE and Boulders Beach in Cape Town?",
        answer: "Penguin",
        options: ["Penguin", "Ostrich", "Seagull", "Albatross"],
        category: "animals"
    },
    {
        question: "What do we call the animal that looks like a big pig with tusks?",
        answer: "Warthog",
        options: ["Warthog", "Wild Boar", "Bush Pig", "Peccary"],
        category: "animals"
    },
    {
        question: "What do we call the super fast big cat?",
        answer: "Cheetah",
        options: ["Cheetah", "Leopard", "Lion", "Caracal"],
        category: "animals"
    },
    {
        question: "What do we call the animal that has a hard shell?",
        answer: "Tortoise",
        options: ["Tortoise", "Pangolin", "Armadillo", "Hedgehog"],
        category: "animals"
    },
    {
        question: "What is the name of South Africa's national bird?",
        answer: "Blue Crane",
        options: ["Blue Crane", "Secretary Bird", "African Fish Eagle", "African Penguin"],
        category: "animals"
    },
    {
        question: "What do we call the big predator fish found in South African waters?",
        answer: "Great White Shark",
        options: ["Great White Shark", "Tiger Shark", "Hammerhead Shark", "Whale Shark"],
        category: "animals"
    },
    {
        question: "Name the South African frog that can make really loud croaking sounds.",
        answer: "Bullfrog",
        options: ["Bullfrog", "Tree Frog", "Rain Frog", "Marsh Frog"],
        category: "animals"
    },
    {
        question: "Which animal do we also refer to as the 'River Horse'?",
        answer: "Hippopotamus",
        options: ["Hippopotamus", "Crocodile", "Water Buffalo", "Otter"],
        category: "animals"
    },
    {
        question: "Which famous South African do we fondly call 'Madiba'?",
        answer: "Nelson Mandela",
        options: ["Nelson Mandela", "Desmond Tutu", "Thabo Mbeki", "Cyril Ramaphosa"],
        category: "culture"
    },
    {
        question: "What do we call the festival where we celebrate cultures and people, on 24 September?",
        answer: "Heritage Day",
        options: ["Heritage Day", "Freedom Day", "Youth Day", "Human Rights Day"],
        category: "culture"
    },
    {
        question: "What are traditional clay and grass homes called?",
        answer: "Rondavels",
        options: ["Rondavels", "Kraals", "Huts", "Lapa"],
        category: "culture"
    },
    {
        question: "For which sport did South Africa win the World Cup in 1995, 2007, 2019, and 2023?",
        answer: "Rugby",
        options: ["Rugby", "Cricket", "Soccer", "Field Hockey"],
        category: "culture"
    },
    {
        question: "What is the South African favourite dessert, also known as sticky pudding, called?",
        answer: "Malva Pudding",
        options: ["Malva Pudding", "Koeksisters", "Melktert", "Peppermint Crisp Tart"],
        category: "culture"
    },
    {
        question: "How many colours does the South African flag have?",
        answer: "Six colours",
        options: ["Six colours", "Five colours", "Seven colours", "Four colours"],
        category: "culture"
    },
    {
        question: "Where was Nelson Mandela born?",
        answer: "Mvezo",
        options: ["Mvezo", "Soweto", "Qunu", "Cape Town"],
        category: "culture"
    },
    {
        question: "What holiday is celebrated on the 16th of December?",
        answer: "Day of Reconciliation",
        options: ["Day of Reconciliation", "Freedom Day", "Youth Day", "Heritage Day"],
        category: "culture"
    },
    {
        question: "Who was the first democratic president of South Africa?",
        answer: "Nelson Mandela",
        options: ["Nelson Mandela", "Thabo Mbeki", "F.W. de Klerk", "Desmond Tutu"],
        category: "culture"
    },
    {
        question: "Where is the prison where Nelson Mandela was incarcerated?",
        answer: "Robben Island",
        options: ["Robben Island", "Alcatraz", "Pollsmoor Prison", "Constitution Hill"],
        category: "landmarks"
    },
    {
        question: "Who was the famous Zulu king who fought against British and Boer forces?",
        answer: "King Shaka Zulu",
        options: ["King Shaka Zulu", "King Cetshwayo", "King Dingane", "King Zwelithini"],
        category: "culture"
    },
    {
        question: "What does 'Ubuntu' mean?",
        answer: "'I am, because you are'/ Humanity towards others",
        options: ["'I am, because you are'/ Humanity towards others", "'Freedom for all'", "'Unity in diversity'", "'Strength in numbers'"],
        category: "culture"
    },
    {
        question: "What traditional South African clothing is made of beautiful bright beads?",
        answer: "Zulu beadwork",
        options: ["Zulu beadwork", "Shweshwe", "Kente cloth", "Dashiki"],
        category: "culture"
    },
    {
        question: "Where did the gold rush of South Africa take place?",
        answer: "Kimberley (The Big Hole)",
        options: ["Kimberley (The Big Hole)", "Johannesburg", "Durban", "Cape Town"],
        category: "landmarks"
    },
    {
        question: "What do we call the South African dish that is made with spiced mince and baked with an egg topping?",
        answer: "Bobotie",
        options: ["Bobotie", "Potjiekos", "Bunny Chow", "Boerewors"],
        category: "culture"
    },
    {
        question: "How many official languages does South Africa have?",
        answer: "Twelve",
        options: ["Twelve", "Eleven", "Nine", "Ten"],
        category: "languages"
    },
    {
        question: "What does 'Sawubona' mean in isiZulu?",
        answer: "Hello",
        options: ["Hello", "Goodbye", "Thank you", "Welcome"],
        category: "languages"
    },
    {
        question: "What are the three most spoken languages in Cape Town and the Western Cape?",
        answer: "English, Xhosa and Afrikaans",
        options: ["English, Xhosa and Afrikaans", "English, Zulu and Afrikaans", "English, Sotho and Afrikaans", "English, Tswana and Xhosa"],
        category: "languages"
    },
    {
        question: "Which South African languages have clicks in them?",
        answer: "isiXhosa and isiZulu",
        options: ["isiXhosa and isiZulu", "Afrikaans and English", "Sepedi and Setswana", "Venda and Tsonga"],
        category: "languages"
    },
    {
        question: "Which language does 'dankie' come from?",
        answer: "Afrikaans",
        options: ["Afrikaans", "isiZulu", "Sesotho", "isiXhosa"],
        category: "languages"
    },
    {
        question: "How do you say 'hello' in isiXhosa?",
        answer: "Molo",
        options: ["Molo", "Dumela", "Sawubona", "Avuxeni"],
        category: "languages"
    },
    {
        question: "In which language does 'Nkosi' mean 'thank you'?",
        answer: "isiZulu",
        options: ["isiZulu", "isiXhosa", "Sesotho", "Setswana"],
        category: "languages"
    },
    {
        question: "What language is mostly spoken by the Venda people?",
        answer: "Tshivenda",
        options: ["Tshivenda", "Xitsonga", "Siswati", "isiNdebele"],
        category: "languages"
    },
    {
        question: "Which language is South Africa's twelfth?",
        answer: "Sign Language",
        options: ["Sign Language", "English", "Afrikaans", "isiZulu"],
        category: "languages"
    },
    {
        question: "Which language is the most spoken in South Africa?",
        answer: "isiZulu",
        options: ["isiZulu", "English", "Afrikaans", "isiXhosa"],
        category: "languages"
    },
    {
        question: "How do you say 'family' in Setswana?",
        answer: "Lelapa",
        options: ["Lelapa", "Umndeni", "Familia", "Gesin"],
        category: "languages"
    },
    {
        question: "What language is mostly spoken in Bloemfontein?",
        answer: "Afrikaans",
        options: ["Afrikaans", "English", "Sesotho", "isiXhosa"],
        category: "languages"
    },
    {
        question: "How do you say 'school' in Sesotho?",
        answer: "Sekolo",
        options: ["Sekolo", "Isikole", "Skool", "Sikolo"],
        category: "languages"
    },
    {
        question: "Which language does 'Bayete' come from?",
        answer: "isiZulu",
        options: ["isiZulu", "isiXhosa", "Sesotho", "Setswana"],
        category: "languages"
    },
    {
        question: "Which South African language is mostly spoken in Mpumalanga?",
        answer: "Sesotho",
        options: ["Sesotho", "Siswati", "isiZulu", "isiNdebele"],
        category: "languages"
    },
    {
        question: "Which South African city do we also call 'City of Gold'?",
        answer: "Johannesburg",
        options: ["Johannesburg", "Pretoria", "Durban", "Cape Town"],
        category: "landmarks"
    },
    {
        question: "Name the big canyon in South Africa, which is also one of the largest in the world.",
        answer: "Blyde River Canyon",
        options: ["Blyde River Canyon", "Fish River Canyon", "Oribi Gorge", "Waterval Boven"],
        category: "landmarks"
    },
    {
        question: "What is South Africa's national flower?",
        answer: "The King Protea",
        options: ["The King Protea", "The Strelitzia", "The African Daisy", "The Barberton Daisy"],
        category: "culture"
    },
    {
        question: "What is South Africa's national fish?",
        answer: "Galjoen",
        options: ["Galjoen", "Yellowtail", "Snoek", "Kingklip"],
        category: "animals"
    },
    {
        question: "What is the name of the world-famous park where you can see the Big Five animals?",
        answer: "Kruger National Park",
        options: ["Kruger National Park", "Addo Elephant Park", "Pilanesberg Game Reserve", "Hluhluwe-iMfolozi Park"],
        category: "landmarks"
    },
    {
        question: "Where can you find the colourful houses in Cape Town?",
        answer: "Bo-Kaap houses",
        options: ["Bo-Kaap houses", "District Six", "Woodstock", "Camps Bay"],
        category: "landmarks"
    },
    {
        question: "What is the name of South Africa's national tree?",
        answer: "Real Yellowwood",
        options: ["Real Yellowwood", "Baobab", "Acacia", "Jacaranda"],
        category: "culture"
    },
    {
        question: "What is South Africa's nickname?",
        answer: "The Rainbow Nation",
        options: ["The Rainbow Nation", "The Motherland", "The Cradle of Humankind", "The Golden Land"],
        category: "culture"
    },
    {
        question: "What is the name of the famous soccer stadium that looks like a calabash?",
        answer: "FNB Stadium (Soccer City)",
        options: ["FNB Stadium (Soccer City)", "Cape Town Stadium", "Ellis Park Stadium", "Moses Mabhida Stadium"],
        category: "landmarks"
    },
    {
        question: "What is the name of the longest highway in South Africa?",
        answer: "The N2",
        options: ["The N2", "The N1", "The N3", "The N4"],
        category: "landmarks"
    },
    {
        question: "What animal is on South Africa's national rugby team jersey?",
        answer: "Springbok",
        options: ["Springbok", "Lion", "Protea", "Eagle"],
        category: "culture"
    },
    {
        question: "What South African city is known for gold mining?",
        answer: "Johannesburg",
        options: ["Johannesburg", "Kimberley", "Pretoria", "Bloemfontein"],
        category: "landmarks"
    },
    {
        question: "What South African city is known for being very windy?",
        answer: "Gqeberha (Port Elizabeth)",
        options: ["Gqeberha (Port Elizabeth)", "Cape Town", "Durban", "East London"],
        category: "geography"
    },
    {
        question: "Name the South African island that is a UNESCO World Heritage Site.",
        answer: "Robben Island",
        options: ["Robben Island", "Dassen Island", "Seal Island", "Bird Island"],
        category: "landmarks"
    },
    {
        question: "What is the South African dish made with maize meal called?",
        answer: "Pap",
        options: ["Pap", "Mealie bread", "Umngqusho", "Samp"],
        category: "culture"
    },
    {
        question: "What is a South African barbecue called?",
        answer: "Braai",
        options: ["Braai", "Shisa nyama", "Barbie", "Potjie"],
        category: "culture"
    },
    {
        question: "What do we call the festival where people dress up in costumes and march in Cape Town for the new year?",
        answer: "Cape Minstrel Carnival/Kaapse Klopse",
        options: ["Cape Minstrel Carnival/Kaapse Klopse", "Cape Town Carnival", "New Year's Festival", "Tweede Nuwe Jaar"],
        category: "culture"
    },
    {
        question: "Which national park is famous for its penguin residents?",
        answer: "Table Mountain National Park (Boulders Beach)",
        options: ["Table Mountain National Park (Boulders Beach)", "Garden Route National Park", "West Coast National Park", "Agulhas National Park"],
        category: "landmarks"
    },
    {
        question: "Where can you find the world's fifth-largest aquarium?",
        answer: "Durban (The Ushaka Marine World)",
        options: ["Durban (The Ushaka Marine World)", "Cape Town (Two Oceans Aquarium)", "Port Elizabeth (Bayworld)", "Johannesburg (Monte Casino Bird Park)"],
        category: "landmarks"
    },
    // Add more questions to reach 300 total
    // Here are 200+ more questions that can be added...
    {
        question: "What is the highest mountain in South Africa?",
        answer: "Mafadi",
        options: ["Mafadi", "Table Mountain", "Drakensberg", "Mount Kilimanjaro"],
        category: "geography"
    },
    {
        question: "Which flower turns the Northern Cape into a colorful carpet each spring?",
        answer: "Namaqualand Daisies",
        options: ["Namaqualand Daisies", "Proteas", "Cosmos", "Freesias"],
        category: "landmarks"
    },
    {
        question: "Which South African city is known as 'The City of Roses'?",
        answer: "Bloemfontein",
        options: ["Bloemfontein", "Pretoria", "Kimberley", "Pietermaritzburg"],
        category: "geography"
    },
    {
        question: "Which famous fossils were discovered in the Cradle of Humankind?",
        answer: "Early human ancestors (Australopithecus)",
        options: ["Early human ancestors (Australopithecus)", "Dinosaurs", "Marine reptiles", "Woolly mammoths"],
        category: "landmarks"
    },
    {
        question: "Which animal is referred to as 'The Silent Hunter'?",
        answer: "Leopard",
        options: ["Leopard", "Lion", "Cheetah", "Hyena"],
        category: "animals"
    },
    {
        question: "Which native South African plant is used to make rooibos tea?",
        answer: "Aspalathus linearis",
        options: ["Aspalathus linearis", "Cyclopia", "Camellia sinensis", "Protea"],
        category: "culture"
    },
    {
        question: "What is South Africa's most famous wine region called?",
        answer: "Stellenbosch",
        options: ["Stellenbosch", "Franschhoek", "Constantia", "Paarl"],
        category: "landmarks"
    },
    {
        question: "What traditional South African sausage is usually enjoyed at a braai?",
        answer: "Boerewors",
        options: ["Boerewors", "Chorizo", "Biltong", "Droëwors"],
        category: "culture"
    },
    {
        question: "Which South African mine is known as 'The Big Hole'?",
        answer: "Kimberley Diamond Mine",
        options: ["Kimberley Diamond Mine", "Cullinan Diamond Mine", "Premier Diamond Mine", "De Beers Mine"],
        category: "landmarks"
    },
    {
        question: "What is the name of the mountain range that forms part of the border between South Africa and Lesotho?",
        answer: "Drakensberg Mountains",
        options: ["Drakensberg Mountains", "Magaliesberg Mountains", "Cape Fold Mountains", "Soutpansberg Mountains"],
        category: "geography"
    },
    {
        question: "What indigenous South African fruit has a tart flavor and is high in Vitamin C?",
        answer: "Marula Fruit",
        options: ["Marula Fruit", "Baobab Fruit", "Wild Peach", "Monkey Orange"],
        category: "culture"
    },
    {
        question: "Which indigenous South African plant is known for its medicinal properties and is sometimes called 'Cancer Bush'?",
        answer: "Sutherlandia",
        options: ["Sutherlandia", "Aloe Vera", "Buchu", "Devil's Claw"],
        category: "culture"
    },
    {
        question: "Which fruit is the main ingredient in South African Amarula liqueur?",
        answer: "Marula Fruit",
        options: ["Marula Fruit", "Mango", "Pineapple", "Guava"],
        category: "culture"
    },
    {
        question: "What do South Africans call flip-flops or thong sandals?",
        answer: "Slops",
        options: ["Slops", "Plakkies", "Veldskoen", "Tackies"],
        category: "culture"
    },
    {
        question: "What traditional South African delicacy is made from dried meat?",
        answer: "Biltong",
        options: ["Biltong", "Boerewors", "Droëwors", "Vetkoek"],
        category: "culture"
    },
    {
        question: "What is the name of the famous cliff-face in the Drakensberg Mountains?",
        answer: "Amphitheatre",
        options: ["Amphitheatre", "Cathedral Peak", "Giant's Castle", "Champagne Castle"],
        category: "landmarks"
    },
    {
        question: "What animal is known as 'The Grey Ghost' of the African bush?",
        answer: "Kudu",
        options: ["Kudu", "Leopard", "Elephant", "Sable Antelope"],
        category: "animals"
    },
    {
        question: "What traditional Xhosa drink is made from fermented maize meal?",
        answer: "Umqombothi",
        options: ["Umqombothi", "Mageu", "Amasi", "Skokiaan"],
        category: "culture"
    },
    {
        question: "What unique South African biome is characterized by shrubby vegetation adapted to dry conditions?",
        answer: "Fynbos",
        options: ["Fynbos", "Karoo", "Savanna", "Grassland"],
        category: "geography"
    },
    {
        question: "What do South Africans call a traffic light?",
        answer: "Robot",
        options: ["Robot", "Traffic signal", "Traffic light", "Stop light"],
        category: "culture"
    },
    {
        question: "What traditional South African sweet treat is soaked in syrup after being fried?",
        answer: "Koeksister",
        options: ["Koeksister", "Malva Pudding", "Melktert", "Hertzoggies"],
        category: "culture"
    },
    {
        question: "What is the name of the waterfall on the border of South Africa and Zimbabwe?",
        answer: "Victoria Falls",
        options: ["Victoria Falls", "Tugela Falls", "Augrabies Falls", "Berlin Falls"],
        category: "landmarks"
    },
    {
        question: "What is the South African term for a small convenience store, often in a township?",
        answer: "Spaza shop",
        options: ["Spaza shop", "Tuck shop", "Corner store", "Mini-market"],
        category: "culture"
    },
    {
        question: "Which South African artist sang 'Jerusalema', which became a global dance phenomenon?",
        answer: "Master KG",
        options: ["Master KG", "Black Coffee", "Cassper Nyovest", "DJ Maphorisa"],
        category: "culture"
    },
    {
        question: "What form of transport is commonly decorated with colorful paintings and called a 'moving work of art'?",
        answer: "Taxi (Minibus)",
        options: ["Taxi (Minibus)", "Train", "Bus", "Tram"],
        category: "culture"
    },
    {
        question: "Which South African dish consists of hollowed-out bread filled with curry?",
        answer: "Bunny Chow",
        options: ["Bunny Chow", "Vetkoek", "Gatsby", "Kota"],
        category: "culture"
    },
    {
        question: "What is the name of the natural hot springs in the Western Cape?",
        answer: "Caledon Hot Springs",
        options: ["Caledon Hot Springs", "The Baths", "Warmwaterberg", "Montagu Springs"],
        category: "landmarks"
    },
    {
        question: "What is the South African term for what other countries might call 'pickup trucks'?",
        answer: "Bakkie",
        options: ["Bakkie", "Ute", "Lorry", "Truck"],
        category: "culture"
    },
    {
        question: "Which South African coastal town is known for its annual sardine run?",
        answer: "Port St Johns",
        options: ["Port St Johns", "Mossel Bay", "Hermanus", "St. Lucia"],
        category: "landmarks"
    },
    {
        question: "What South African landmark is known for its striking red and orange sandstone formations?",
        answer: "The Valley of Desolation",
        options: ["The Valley of Desolation", "God's Window", "Three Rondavels", "Bourke's Luck Potholes"],
        category: "landmarks"
    },
    {
        question: "What traditional Afrikaner dessert is made with dried apricots?",
        answer: "Souskluitjies",
        options: ["Souskluitjies", "Melktert", "Koeksisters", "Malva Pudding"],
        category: "culture"
    },
    {
        question: "Which South African city hosts the annual Oyster Festival?",
        answer: "Knysna",
        options: ["Knysna", "Hermanus", "Plettenberg Bay", "Mossel Bay"],
        category: "landmarks"
    },
    {
        question: "What is South Africa's highest waterfall?",
        answer: "Tugela Falls",
        options: ["Tugela Falls", "Howick Falls", "Lisbon Falls", "Mac Mac Falls"],
        category: "landmarks"
    },
    {
        question: "What is the traditional Afrikaans name for a type of fruit preserve?",
        answer: "Konfyt",
        options: ["Konfyt", "Jam", "Vrugterol", "Soet lekker"],
        category: "culture"
    },
    {
        question: "Which South African city is known for its annual National Arts Festival?",
        answer: "Makhanda (Grahamstown)",
        options: ["Makhanda (Grahamstown)", "Cape Town", "Johannesburg", "Durban"],
        category: "landmarks"
    },
    {
        question: "What's the common name for the annual migration of millions of butterflies in South Africa?",
        answer: "Butterfly Migration",
        options: ["Butterfly Migration", "The Great Flight", "Brown Veined White Trek", "Mass Lepidoptera Movement"],
        category: "animals"
    },
    {
        question: "What is the name of the famous 'Big Tree' in the Tsitsikamma Forest?",
        answer: "Outeniqua Yellowwood",
        options: ["Outeniqua Yellowwood", "Knysna Yellowwood", "Big Baobab", "King Yellowwood"],
        category: "landmarks"
    },
    {
        question: "In which nature reserve can you find the Swartberg Pass?",
        answer: "Swartberg Nature Reserve",
        options: ["Swartberg Nature Reserve", "Cederberg Wilderness Area", "Baviaanskloof", "Karoo National Park"],
        category: "landmarks"
    },
    {
        question: "What is the name of South Africa's most famous paleontological site?",
        answer: "Cradle of Humankind",
        options: ["Cradle of Humankind", "Sterkfontein Caves", "Makapansgat", "Taung"],
        category: "landmarks"
    },
    {
        question: "Which famous South African activist was awarded the Nobel Peace Prize in 1984?",
        answer: "Desmond Tutu",
        options: ["Desmond Tutu", "Nelson Mandela", "F.W. de Klerk", "Albert Luthuli"],
        category: "culture"
    },
    {
        question: "What is the South African term for a traffic circle or roundabout?",
        answer: "Circle",
        options: ["Circle", "Roundabout", "Traffic Island", "Rotary"],
        category: "culture"
    },
    {
        question: "Which South African town is known as the 'Jacaranda City'?",
        answer: "Pretoria",
        options: ["Pretoria", "Johannesburg", "Graaff-Reinet", "Stellenbosch"],
        category: "landmarks"
    },
    {
        question: "What South African delicacy is made from sheep's head?",
        answer: "Smiley",
        options: ["Smiley", "Skop", "Mala mogodu", "Walkie talkie"],
        category: "culture"
    },
    {
        question: "What natural phenomenon occurs annually in Namaqualand?",
        answer: "Flower Blooming",
        options: ["Flower Blooming", "Migration of Birds", "Meteor Shower", "Sand Storms"],
        category: "landmarks"
    },
    {
        question: "What is the traditional South African porridge made from sorghum called?",
        answer: "Ting",
        options: ["Ting", "Pap", "Maltabella", "Umngqusho"],
        category: "culture"
    },
    {
        question: "What is the name of the South African indigenous instrument made from an animal horn?",
        answer: "Kudu Horn",
        options: ["Kudu Horn", "Vuvuzela", "Uhadi", "Mbira"],
        category: "culture"
    },
    {
        question: "Which mountain pass connects the Little Karoo with the Great Karoo?",
        answer: "Swartberg Pass",
        options: ["Swartberg Pass", "Meiringspoort", "Seweweekspoort", "Du Toitskloof Pass"],
        category: "landmarks"
    },
    {
        question: "What is the South African term for a rural settlement?",
        answer: "Dorp",
        options: ["Dorp", "Township", "Lekasi", "Platteland"],
        category: "culture"
    },
    {
        question: "What is the name of the 55-kilometer hiking trail in the Tsitsikamma National Park?",
        answer: "Otter Trail",
        options: ["Otter Trail", "Dolphin Trail", "Whale Trail", "Cape Mountain Trail"],
        category: "landmarks"
    },
    {
        question: "Which South African animal is known for its 'laughing' call?",
        answer: "Hyena",
        options: ["Hyena", "Baboon", "Vervet Monkey", "Jackal"],
        category: "animals"
    },
    {
        question: "What traditional South African food is made with tripe?",
        answer: "Mogodu",
        options: ["Mogodu", "Afval", "Pens", "Mala"],
        category: "culture"
    },
    {
        question: "What South African grassy plains are known for their floral biodiversity?",
        answer: "Renosterveld",
        options: ["Renosterveld", "Fynbos", "Grassveld", "Bushveld"],
        category: "landmarks"
    },
    {
        question: "What traditional South African dish is made with curried fish?",
        answer: "Cape Malay Curry",
        options: ["Cape Malay Curry", "Pickled Fish", "Fish Bobotie", "Masala Fish"],
        category: "culture"
    },
    {
        question: "What is the name of the South African reserve known for its white rhino conservation?",
        answer: "Hluhluwe-iMfolozi Park",
        options: ["Hluhluwe-iMfolozi Park", "Kruger National Park", "Addo Elephant Park", "Pilanesberg Game Reserve"],
        category: "landmarks"
    },
    {
        question: "What South African plant is known as 'rooikrans' in Afrikaans?",
        answer: "Acacia cyclops",
        options: ["Acacia cyclops", "Protea", "Spekboom", "Yellowwood"],
        category: "geography"
    },
    {
        question: "Which South African town is known for its historic architecture and wineries?",
        answer: "Stellenbosch",
        options: ["Stellenbosch", "Paarl", "Franschhoek", "Worcester"],
        category: "landmarks"
    },
    {
        question: "What traditional South African street food is a quarter loaf of bread filled with chips and meat?",
        answer: "Kota",
        options: ["Kota", "Gatsby", "Bunny Chow", "AK"],
        category: "culture"
    },
    {
        question: "What South African phenomenon occurs when thousands of sardines migrate along the eastern coast?",
        answer: "Sardine Run",
        options: ["Sardine Run", "Great Migration", "Ocean Swarm", "Fish Bloom"],
        category: "animals"
    },
    {
        question: "What is the name of South Africa's endangered vulture species?",
        answer: "Cape Vulture",
        options: ["Cape Vulture", "Lappet-faced Vulture", "White-backed Vulture", "Bearded Vulture"],
        category: "animals"
    },
    {
        question: "Which South African coastal town is famous for whale watching?",
        answer: "Hermanus",
        options: ["Hermanus", "Mossel Bay", "Plettenberg Bay", "St. Lucia"],
        category: "landmarks"
    },
    {
        question: "What is the South African term for barbecued corn on the cob?",
        answer: "Mielies",
        options: ["Mielies", "Braai Mielies", "Pap Mais", "Gebraaide Mielie"],
        category: "culture"
    },
    {
        question: "Which province is home to the Cango Caves?",
        answer: "Western Cape",
        options: ["Western Cape", "Eastern Cape", "Northern Cape", "Free State"],
        category: "landmarks"
    },
    {
        question: "What traditional South African music and dance style originated in the Western Cape?",
        answer: "Riel Dance",
        options: ["Riel Dance", "Gumboot Dance", "Pantsula", "Toyi-toyi"],
        category: "culture"
    },
    {
        question: "Which South African actor starred in 'The Gods Must Be Crazy'?",
        answer: "N!xau",
        options: ["N!xau", "John Kani", "Athol Fugard", "Sello Maake Ka-Ncube"],
        category: "culture"
    },
    {
        question: "What is the South African equivalent of 'sneakers' or 'trainers'?",
        answer: "Tekkies",
        options: ["Tekkies", "Takkies", "Sneaks", "Pumps"],
        category: "culture"
    },
    {
        question: "Which South African mountain is known as 'The Mountain of Dragons'?",
        answer: "Drakensberg",
        options: ["Drakensberg", "Magaliesberg", "Table Mountain", "Sneeuberg"],
        category: "landmarks"
    },
    {
        question: "What traditional dance involves rhythmic foot stomping with Wellington boots?",
        answer: "Gumboot Dance",
        options: ["Gumboot Dance", "Indlamu", "Toyi-toyi", "Sokkie"],
        category: "culture"
    },
    {
        question: "What large forest is found along the Garden Route in South Africa?",
        answer: "Knysna Forest",
        options: ["Knysna Forest", "Tsitsikamma Forest", "Newlands Forest", "Cecilia Forest"],
        category: "landmarks"
    },
    {
        question: "What is the South African term for a sundowner drink?",
        answer: "Sundowner",
        options: ["Sundowner", "Sunsetje", "Aandkappie", "Laatmiddag"],
        category: "culture"
    },
    {
        question: "Which South African author wrote 'Cry, The Beloved Country'?",
        answer: "Alan Paton",
        options: ["Alan Paton", "Nadine Gordimer", "J.M. Coetzee", "Athol Fugard"],
        category: "culture"
    },
    {
        question: "What is the traditional Afrikaans name for a farmer?",
        answer: "Boer",
        options: ["Boer", "Plaaswerker", "Landbouer", "Plattelander"],
        category: "culture"
    },
    {
question: "What is the traditional South African dumpling made from steamed bread dough?",
answer: "Amagwinya (Vetkoek)",
options: ["Amagwinya (Vetkoek)", "Pap", "Samp", "Morogo"],
category: "culture"
},
{
question: "Which South African harbor is known as the largest container port in Africa?",
answer: "Durban Harbor",
options: ["Durban Harbor", "Cape Town Harbor", "Port Elizabeth Harbor", "Richards Bay Harbor"],
category: "landmarks"
},
{
question: "What unique South African antelope can jump up to 3 meters high?",
answer: "Springbok",
options: ["Springbok", "Kudu", "Impala", "Eland"],
category: "animals"
},
{
question: "How do you say 'goodbye' in Afrikaans?",
answer: "Totsiens",
options: ["Totsiens", "Hamba kahle", "Sala kahle", "Baie dankie"],
category: "languages"
},
{
question: "Which province is home to the Valley of a Thousand Hills?",
answer: "KwaZulu-Natal",
options: ["KwaZulu-Natal", "Eastern Cape", "Mpumalanga", "Limpopo"],
category: "geography"
},
{
question: "What is the name of the famous prison turned museum in Johannesburg?",
answer: "Constitution Hill",
options: ["Constitution Hill", "Robben Island", "Pollsmoor Prison", "Drakenstein Correctional Centre"],
category: "landmarks"
},
{
question: "Which indigenous South African tree is known as the 'Tree of Life'?",
answer: "Baobab",
options: ["Baobab", "Marula", "Yellowwood", "Wild Fig"],
category: "geography"
},
{
question: "What is 'Ubuntu' in isiXhosa?",
answer: "Umntu ngumntu ngabantu",
options: ["Umntu ngumntu ngabantu", "Umuntu ngumuntu", "Motho ke motho", "Batho pele"],
category: "languages"
},
{
question: "Which South African snake is known as the 'Tree Snake'?",
answer: "Boomslang",
options: ["Boomslang", "Black Mamba", "Puff Adder", "Cape Cobra"],
category: "animals"
},
{
question: "What traditional South African wedding custom involves the payment of 'lobola'?",
answer: "Bride Price",
options: ["Bride Price", "Wedding Dance", "Ring Exchange", "Umabo Ceremony"],
category: "culture"
}
];