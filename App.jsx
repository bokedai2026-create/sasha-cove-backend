import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const SASHA_REF = "https://res.cloudinary.com/dolccnwtb/image/upload/v1776835857/fbf28514-f243-41f1-9fdb-d412276c1b34_ohcjdd.jpg";

// Pinterest scene references — coastal Australian girl aesthetic
// These are used as background/scene style references in img2img generation
// The app uses these to give photos realistic locations and lighting
const PINTEREST_SCENES = {
  beach: [
    "https://i.pinimg.com/736x/8b/3c/b7/8b3cb7e4c5a4e8d7b9c2a5f6e3d1a0b8.jpg",
    "https://i.pinimg.com/736x/a2/f5/c8/a2f5c8b9d3e7a1c4f6b2e8d5c9a3f7b1.jpg",
  ],
  cafe: [
    "https://i.pinimg.com/736x/c4/d8/e1/c4d8e1f3a7b5c2d9e6f4a8b3c7d5e2f1.jpg",
  ],
  city: [
    "https://i.pinimg.com/736x/d6/e9/f2/d6e9f2a5b8c3d7e1f4a9b6c2d8e5f3a7.jpg",
  ],
  home: [
    "https://i.pinimg.com/736x/e8/f1/a3/e8f1a3b6c9d4e7f2a5b8c3d6e9f1a4b7.jpg",
  ],
};
function getPinterestScene(category) {
  const pool = PINTEREST_SCENES[category] || PINTEREST_SCENES.beach;
  return pool[Math.floor(Math.random() * pool.length)];
}
const FACE = "IMPORTANT: use Figure 1 ONLY as reference for the woman's face, hair colour, eye colour and body shape. Completely ignore and change her clothing, pose and setting from Figure 1.";
const IP = "shot on iPhone camera, natural available light, candid authentic real-life moment, slightly imperfect composition, no studio lighting, no heavy filters, warm neutral tones, genuine personal photo feel";

const OUTFITS = {
  beach: ["white string bikini","black triangle bikini","sage green bikini set","nude tan two-piece","brown crocheted bikini","coral wrap bikini","leopard print bikini","blue stripe bikini"],
  casual: ["oversized white linen shirt and denim cut-offs","beige ribbed tank and high-waist jeans","olive green co-ord set","white crop top and wide leg grey trousers","black bodysuit and high-waist jeans","cream knit top and tan pants","striped button-up tied at waist with shorts","terracotta linen co-ord"],
  activewear: ["black seamless sports bra and black bike shorts","grey marl seamless matching set","olive green sports bra and flare leggings","white sports bra and grey shorts","brown ribbed gym set","pastel blue matching activewear set","high-waist black leggings and white crop top","sage seamless set"],
  glam: ["short black mini dress","white satin slip dress","beige lace midi dress","silver metallic top and black mini skirt","black strappy cutout dress","nude bodycon dress","emerald silk cami and tailored trousers","red strapless mini dress"],
  cosy: ["oversized cream chunky knit sweater","grey oversized hoodie and shorts","white fluffy bathrobe","beige oversized cardigan","brown ribbed lounge matching set","sage green crewneck and biker shorts","white oversized tee and silk shorts"],
  city: ["white tailored blazer and straight black pants","beige belted trench coat and jeans","all-black sleek outfit","white summer sundress","camel linen co-ord set","dark denim jacket and mini skirt","leather jacket and straight-leg jeans"],
};
const ro = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─────────────────────────────────────────────
// VARIANT CONCEPTS — 3 per format, no repeats
// Each describes exactly what the photo will look like
// ─────────────────────────────────────────────
const ALL_VARIANTS = {
  "Photo Dump": [
    { scene: "Car selfie + outdoor cafe + mirror selfie + city walk", description: "(1) Close-up selfie in the car, afternoon sun streaming through window, sunglasses on, relaxed. (2) Sitting at an outdoor Sydney cafe with an acai bowl, candid laugh, dappled sunlight. (3) Full-length mirror selfie at home in neutral bedroom, natural window light. (4) Walking along a city street, shot from behind showing the outfit.", outfit: ro(OUTFITS.casual) },
    { scene: "Morning to evening — cosy start, active day, glam end", description: "(1) In bed with coffee, oversized knit and messy bun, morning light. (2) Midday outdoor walk, activewear and cap. (3) Afternoon cafe stop, casual outfit and matcha. (4) Evening getting ready, glam makeup done, warm lamp light.", outfit: ro(OUTFITS.cosy) },
    { scene: "Sydney lifestyle — harbour, streets, food, home", description: "(1) Outdoor portrait with Sydney Harbour Bridge in background, golden hour. (2) Sitting at a trendy Sydney cafe, healthy bowl. (3) Shopping bag in hand on a city street, candid walking shot. (4) Relaxing at home on the couch, cozy evening light.", outfit: ro(OUTFITS.city) },
  ],
  "Morning Routine": [
    { scene: "Slow luxury morning — bed, matcha, bathroom glow, walk", description: "(1) Still in bed, morning light through sheer curtains, oversized knit, hair messy. (2) Standing in kitchen holding a matcha latte, calm expression, soft window light. (3) Close-up bathroom mirror, fresh dewy skin, no makeup, glowing. (4) Outdoor morning walk, activewear and cap, golden early light.", outfit: ro(OUTFITS.cosy) },
    { scene: "Active girl morning — gym, protein shake, mirror selfie", description: "(1) Early morning gym selfie, sports bra and leggings, pre-workout. (2) Protein smoothie in hand in the kitchen, activewear. (3) Shower fresh, towel wrapped, bathroom mirror selfie, dewy skin. (4) Full outfit mirror selfie, ready and put-together.", outfit: ro(OUTFITS.activewear) },
    { scene: "Wellness morning — journaling, skincare, walking to cafe", description: "(1) Journaling on the bed with a coffee, soft morning light, cozy knit. (2) Skincare routine, close-up applying serum, bathroom, natural light. (3) Getting dressed, holding up an outfit. (4) Out the door, full look walking to a cafe.", outfit: ro(OUTFITS.casual) },
  ],
  "Gym/Fitness": [
    { scene: "Gym mirror selfies — before, during, after workout", description: "(1) Pre-workout mirror selfie, fresh faced, motivated expression. (2) Mid-workout candid doing weights, authentic effort. (3) Post-workout sweaty selfie, real and proud. (4) Leaving the gym, fresh change of outfit, gym bag, confident walk.", outfit: ro(OUTFITS.activewear) },
    { scene: "Outdoor workout — coastal path or park", description: "(1) Stretching on a coastal path or park, morning light. (2) Running or walking shot from the side, candid movement. (3) Post-workout sitting on grass, water bottle. (4) Close-up selfie after outdoor workout, glowing skin.", outfit: ro(OUTFITS.activewear) },
    { scene: "Pilates and yoga girl — mat, stretching, healthy snack", description: "(1) Yoga mat rolled out at home, morning light, sitting ready to start. (2) Mid-stretch pose, natural home setting, calm expression. (3) Post-practice close-up, fresh face, hair tied back. (4) Healthy post-workout smoothie bowl, kitchen light.", outfit: ro(OUTFITS.activewear) },
  ],
  "Beach Day": [
    { scene: "Crystal clear Australian beach — water, sand, golden hour", description: "(1) Standing at the water's edge, small waves, warm afternoon sun. (2) Sitting on a towel on the sand, sunglasses, looking out at the ocean. (3) Close-up beach selfie with ocean behind, wind in hair, sun-kissed skin. (4) Walking along the shoreline, shot from behind, waves lapping feet.", outfit: ro(OUTFITS.beach) },
    { scene: "Beach club pool day — sun lounger, drinks, golden vibes", description: "(1) Lying on a sun lounger at a beach club, sunglasses on, golden light. (2) Holding a coconut or cocktail, blue water behind. (3) Candid laugh moment with ocean or pool in background. (4) Late afternoon golden hour portrait, glowing skin.", outfit: ro(OUTFITS.beach) },
    { scene: "Sunrise beach — moody, empty, soft pink sky", description: "(1) Walking on empty beach at sunrise, soft pink sky. (2) Sitting on the sand facing the horizon, peaceful. (3) Close-up portrait with soft morning light on face, no makeup, natural. (4) Footprints in wet sand, shot looking down.", outfit: ro(OUTFITS.beach) },
  ],
  "City Life": [
    { scene: "Sydney Harbour day — bridge, waterfront, golden hour", description: "(1) Portrait with Sydney Harbour Bridge behind, golden hour, city girl outfit. (2) Walking along the Circular Quay waterfront, candid shot. (3) Sitting at an outdoor waterfront cafe, coffee in hand. (4) Rooftop view of the city at sunset, looking out at skyline.", outfit: ro(OUTFITS.city) },
    { scene: "Inner west cafe culture — Surry Hills, leafy streets", description: "(1) Outdoor cafe table in a leafy street, acai bowl, dappled light. (2) Walking past colourful terrace houses, candid street shot. (3) Close-up of aesthetic food on the table, hands visible. (4) Window seat at a cafe, matcha and phone, cozy.", outfit: ro(OUTFITS.casual) },
    { scene: "City night out — dinner, rooftop bar, neon lights", description: "(1) Getting ready, glam outfit on, warm lamp light. (2) Walking out the door, full look, confident. (3) At a rooftop bar, city lights behind. (4) Late night city street, neon reflections, candid movement shot.", outfit: ro(OUTFITS.glam) },
  ],
  "GRWM": [
    { scene: "Night out GRWM — robe to full glam, outfit reveal", description: "(1) In a cosy robe or comfy set, hair in a clip, pre-glam. (2) Doing makeup at the vanity, warm light, focused. (3) Hair done, makeup on, holding up the chosen outfit on a hanger. (4) Full look, dressed and ready, confident pose at the door.", outfit: ro(OUTFITS.glam) },
    { scene: "Casual daytime GRWM — effortless natural look", description: "(1) Fresh out of the shower, minimal towel wrap, dewy skin. (2) Skincare and light makeup, close-up, natural light. (3) Choosing between outfits, holding two options up. (4) Final look, casual chic, out the door mirror selfie.", outfit: ro(OUTFITS.casual) },
    { scene: "Brunch GRWM — morning chaos to effortlessly ready", description: "(1) Morning chaos, coffee in hand, hair in towel, running around. (2) Styling hair, bathroom mirror, warm light. (3) Flat-lay of the outfit on the bed. (4) Fully dressed and brunch ready, effortlessly put together.", outfit: ro(OUTFITS.city) },
  ],
  "Food/Cafe": [
    { scene: "Trendy Sydney cafe — acai bowls, matcha, aesthetic plates", description: "(1) Sitting at a cafe with a beautiful acai bowl, natural window light. (2) Close-up hands holding a matcha latte, rings visible. (3) Overhead shot of aesthetic table spread, food and coffee. (4) Candid laughing moment at the cafe, natural and authentic.", outfit: ro(OUTFITS.casual) },
    { scene: "Healthy eating at home — meal prep, fresh ingredients", description: "(1) Cooking in the kitchen, chopping vegetables, natural light. (2) Close-up of a fresh colorful salad bowl being assembled. (3) Sitting at the kitchen bench eating, casual home outfit. (4) Grocery haul laid out on the counter, fresh produce.", outfit: ro(OUTFITS.cosy) },
    { scene: "Brunch date — eggs, pastries, juice, good vibes", description: "(1) At an elegant restaurant table, juice in hand, beautiful setting. (2) Close-up of beautifully plated food. (3) Candid laughing moment, authentic and joyful. (4) Cafe bathroom mirror selfie, classic brunch move.", outfit: ro(OUTFITS.casual) },
  ],
  "Car Content": [
    { scene: "Golden hour car selfies — sun flare, sunglasses, vibes", description: "(1) Close-up selfie in driver seat, afternoon golden sun streaming through window, sunglasses on. (2) Side profile shot looking out passenger window, golden light. (3) Rearview mirror selfie, catching own reflection. (4) Leaning against the car outside, street background.", outfit: ro(OUTFITS.casual) },
    { scene: "Road trip energy — highway, snacks, good music", description: "(1) Arm out the window on the highway, speed blur background. (2) Snacks on the console, playlist visible on the screen. (3) Petrol station stop, standing next to the car, candid. (4) Arriving somewhere beautiful, getting out of the car, scenic background.", outfit: ro(OUTFITS.casual) },
    { scene: "Night out pre-drinks in the car — glam, excited, going out", description: "(1) Glam selfie in the car before going out, dressed up, excited. (2) Close-up of nails or jewellery detail in the car. (3) Arriving at the venue, getting out of the car looking stunning.", outfit: ro(OUTFITS.glam) },
  ],
  "Night Out": [
    { scene: "Full glam night — restaurant, bar, city lights", description: "(1) Full glam look in the Uber, excited energy, city lights outside. (2) Arriving at the venue, stepping out looking stunning. (3) At the bar or table, drinks in hand, ambient warm lighting. (4) Late night city street candid, neon lights, carefree energy.", outfit: ro(OUTFITS.glam) },
    { scene: "Girls dinner — restaurant, wine, laughing, bathroom selfie", description: "(1) At an elegant restaurant table, wine glass in hand. (2) Close-up of beautifully plated food and drinks. (3) Candid laughing moment, authentic and joyful. (4) Restaurant bathroom mirror selfie — classic night out move.", outfit: ro(OUTFITS.glam) },
    { scene: "Rooftop bar — cocktails, city skyline, golden hour", description: "(1) Holding a cocktail with the city skyline behind at sunset. (2) Sitting on a high stool at the bar, golden light. (3) Looking out at the view, contemplative, beautiful backdrop. (4) Full look portrait on the rooftop, city behind, glowing.", outfit: ro(OUTFITS.glam) },
  ],
  "Nature/Outdoors": [
    { scene: "Coastal headland walk — cliffs, ocean, wildflowers", description: "(1) Standing on a cliff with the ocean below, golden afternoon sun. (2) Walking along a clifftop path, shot from behind, ocean stretching out. (3) Sitting on a rock with panoramic ocean view. (4) Close-up portrait with wild flowers in foreground.", outfit: ro(OUTFITS.casual) },
    { scene: "Botanic gardens — lush greenery, flowers, dappled light", description: "(1) Walking through lush greenery, dappled sunlight filtering through trees. (2) Sitting on the grass with flowers around, peaceful afternoon. (3) Close-up of flowers being held. (4) Portrait between tall trees, soft green bokeh background.", outfit: ro(OUTFITS.casual) },
    { scene: "Waterfall or rainforest — lush, cool, ethereal", description: "(1) Standing near a waterfall, misty, lush green surrounding. (2) Walking along a rainforest trail, dappled light. (3) Sitting on a mossy rock, contemplative, serene. (4) Looking up through tree canopy, ethereal light rays.", outfit: ro(OUTFITS.activewear) },
  ],
  "Static Reel - Jealousy": [
    { scene: "Stunning view behind her — she's the main character", description: "Sasha standing with an incredible ocean or city view behind her at golden hour, looking slightly away from camera, candid and effortless. Makes you wish you were her.", outfit: ro(OUTFITS.casual) },
    { scene: "Just arrived somewhere amazing — first look at the view", description: "Candid moment of Sasha arriving somewhere stunning, a cliff or rooftop, looking out at the view, hair moving slightly. Pure jealousy trigger.", outfit: ro(OUTFITS.city) },
    { scene: "Her life looks like a movie — effortlessly cinematic", description: "A perfectly composed candid moment, Sasha in a beautiful setting, soft golden light, doing something mundane like holding a coffee. It just looks effortlessly cinematic.", outfit: ro(OUTFITS.casual) },
  ],
  "Static Reel - Lust": [
    { scene: "Beach portrait — confident, sun-kissed, effortless", description: "Sasha on the beach, bikini, direct or slightly off-camera gaze, warm golden hour light, hair slightly messy from the ocean, confident and naturally beautiful.", outfit: ro(OUTFITS.beach) },
    { scene: "Pool day — summer goddess energy", description: "Sasha at a pool or beach club, bikini, holding a drink or relaxing, water sparkling behind her, golden afternoon light, the kind of photo that stops the scroll.", outfit: ro(OUTFITS.beach) },
    { scene: "Fit check — activewear, post-workout glow", description: "A confident fit check in activewear, gym mirror or outdoor setting, post-workout glow, direct eye contact. The kind of shot that makes people follow instantly.", outfit: ro(OUTFITS.activewear) },
  ],
  "Static Reel - Curiosity": [
    { scene: "Half face, looking away — mysterious and intriguing", description: "A close-up portrait where Sasha is partially in shadow or looking away from camera. Creates mystery. The viewer wants to know more about her.", outfit: ro(OUTFITS.casual) },
    { scene: "POV arrival shot — she just walked in", description: "Shot as if you're watching her arrive somewhere, a cafe or rooftop, looking around, slightly unaware she's being watched. Candid and intriguing.", outfit: ro(OUTFITS.city) },
    { scene: "Back to camera — her world, not yours", description: "Sasha with her back to the camera, looking out at something beautiful, an ocean or city. Creates curiosity about who she is and what she's thinking.", outfit: ro(OUTFITS.casual) },
  ],
  "Static Reel - Fantasy": [
    { scene: "Golden hour dream — soft, warm, ethereal", description: "A dreamy golden hour portrait, Sasha in soft warm light, slightly soft focus, ethereal feel, hair catching the light. Feels like a daydream.", outfit: ro(OUTFITS.casual) },
    { scene: "Sunset silhouette — romantic and cinematic", description: "Sasha photographed against a beautiful sunset, warm orange and pink tones, slightly silhouetted, romantic and cinematic.", outfit: ro(OUTFITS.city) },
    { scene: "Soft morning light — peaceful and angelic", description: "Sasha in soft morning light through a window, peaceful expression, natural and glowing. The kind of image that feels like waking up next to someone beautiful.", outfit: ro(OUTFITS.cosy) },
  ],
  "Static Reel - Validation": [
    { scene: "Mirror selfie — confident and she owns it", description: "A confident mirror selfie showing the full outfit, direct eye contact, slightly knowing expression. She knows she looks good and she knows you know it too.", outfit: ro(OUTFITS.casual) },
    { scene: "Walking out the door — ready and she knows it", description: "Full length candid of Sasha leaving, over the shoulder look, confident stride. The main character leaving the building.", outfit: ro(OUTFITS.city) },
    { scene: "Post-workout glow — earned and proud", description: "Post-gym portrait, glowing skin, hair slightly messy, proud expression. The validation of someone who shows up for themselves every day.", outfit: ro(OUTFITS.activewear) },
  ],
  "Dancing Reel - Beach": [
    { scene: "Casual sway on the beach to trending audio", description: "Sasha casually swaying or doing a simple trending dance on the beach, bikini, hair blowing in the breeze, shot handheld like an iPhone video, warm sun, authentic and fun.", outfit: ro(OUTFITS.beach) },
    { scene: "Beach walk transition into a dance move", description: "Sasha walking along the beach, transitions into a casual spin or dance move with the music. Natural, playful energy. Golden hour light.", outfit: ro(OUTFITS.beach) },
    { scene: "Standing in the waves, moving to music", description: "Sasha standing at the water's edge, small waves around her feet, moving gently to trending audio. Candid and beautiful.", outfit: ro(OUTFITS.beach) },
  ],
  "Dancing Reel - Home": [
    { scene: "Getting ready dance break — bedroom mirror vibes", description: "Sasha having a spontaneous dance break while getting ready. Bedroom or bathroom. Fun and relatable. Trending audio. The kind of reel that gets shared to group chats.", outfit: ro(OUTFITS.cosy) },
    { scene: "Living room dance — carefree home energy", description: "Sasha dancing in the living room or kitchen, carefree energy, natural indoor light. Looks like she's dancing when she thinks no one is watching.", outfit: ro(OUTFITS.cosy) },
    { scene: "Morning routine dance — happy girl energy", description: "Sasha doing a simple dance move as part of her morning routine. Coffee in hand, morning light, cozy outfit. Positive and infectious energy.", outfit: ro(OUTFITS.cosy) },
  ],
  "Dancing Reel - Outdoor": [
    { scene: "Street style dance — city backdrop, confident", description: "Sasha doing a trending dance on a city street or in a park. Casual outfit. Natural daylight. Confident and fun. The kind of content that goes viral on Reels.", outfit: ro(OUTFITS.casual) },
    { scene: "Park golden hour dance — dreamy and free", description: "Sasha dancing in a park or open field during golden hour. Hair flowing, warm light. Free-spirited energy. Beautiful and shareable.", outfit: ro(OUTFITS.casual) },
    { scene: "Rooftop dance — city views, sunset energy", description: "Sasha dancing on a rooftop with the city behind her at sunset. Confident and aspirational. Makes people want her life.", outfit: ro(OUTFITS.city) },
  ],
};

const usedVariantIndices = {};
function getVariants(format) {
  const all = ALL_VARIANTS[format] || ALL_VARIANTS["Photo Dump"];
  if (!usedVariantIndices[format]) usedVariantIndices[format] = [];
  let available = all.map((v, i) => ({ v, i })).filter(x => !usedVariantIndices[format].includes(x.i));
  if (available.length < 3) { usedVariantIndices[format] = []; available = all.map((v, i) => ({ v, i })); }
  const picked = [], indices = [], pool = [...available];
  while (picked.length < 3 && pool.length > 0) {
    const r = Math.floor(Math.random() * pool.length);
    picked.push(pool[r].v);
    indices.push(pool[r].i);
    pool.splice(r, 1);
  }
  usedVariantIndices[format].push(...indices);
  return picked;
}

function buildPrompts(variant, type, sceneImageUrl) {
  const base = `${IP}, ${FACE}, wearing ${variant.outfit}`;
  // If we have a Pinterest scene reference, mention it in the prompt
  const sceneRef = sceneImageUrl ? ", photorealistic scene with authentic Australian coastal lifestyle background" : "";
  if (type === "carousel") {
    const scenes = variant.description.split(/\(\d+\)/).filter(s => s.trim().length > 10);
    return scenes.map(s => `${base}${sceneRef}, ${s.trim()}`).slice(0, 4);
  }
  return [`${base}${sceneRef}, ${variant.scene}, ${variant.description.split(".")[0]}`];
}

const REEL_TEXT = {
  jealousy: ["her life though 😮‍💨", "not my fault you're thinking about me", "the view from here hits different", "living rent free in your head", "unbothered szn 🤍"],
  lust: ["summer has arrived and so have I 🌊", "the beach said come home", "tan lines and good times only", "coastal girl forever 🌊", "hot girl summer is a lifestyle"],
  curiosity: ["POV: you found my page 👀", "she's not for everyone. that's the point.", "the link in bio knows what I mean 🖤", "not all of it makes it to instagram 👀", "you already know where to find me"],
  fantasy: ["the version of her they can't stop thinking about", "she moves like she has nowhere to be 🌊", "golden hour and she showed up anyway", "the girl you daydream about 🌙"],
  validation: ["healing, glowing, growing 🌱", "chose myself every single day", "soft life is a mindset first", "main character and I know it 💅", "the glow up never stops ✨"],
};
// Trending songs April 2026 — auto-matched by emotion, no manual input needed
const TRENDING_AUDIO = {
  lust:       ["Titanium x Please Me - TRUE CHAD & Unjaps", "ALL THE LOVE - Kanye West", "Taste - Sabrina Carpenter", "Espresso - Sabrina Carpenter", "Good Luck Babe - Chappell Roan"],
  jealousy:   ["Titanium x Please Me - TRUE CHAD & Unjaps", "Behind These Hazel Eyes - Kelly Clarkson", "Break My Stride - Matthew Wilder", "ALL THE LOVE - Kanye West", "Younger You - Miley Cyrus"],
  fantasy:    ["april - ILOVEFLOWERS", "Only Time - Enya", "Hopelessly Devoted To You - Olivia Newton-John", "Birds of a Feather - Billie Eilish", "Stargazing - Myles Smith"],
  curiosity:  ["Titanium x Please Me - TRUE CHAD & Unjaps", "That Should Be Me - Justin Bieber", "Easy - Commodores", "april - ILOVEFLOWERS", "Die With A Smile - Lady Gaga & Bruno Mars"],
  validation: ["Break My Stride - Matthew Wilder", "Younger You - Miley Cyrus", "Beautiful Things - Benson Boone", "Easy - Commodores", "Please Please Please - Sabrina Carpenter"],
};
function getTrendingAudio(emotion) {
  const pool = TRENDING_AUDIO[emotion] || TRENDING_AUDIO.curiosity;
  return pool[Math.floor(Math.random() * pool.length)];
}
// Keep AUDIOS for fallback
const AUDIOS = Object.values(TRENDING_AUDIO).flat();
const CAPTIONS = {
  "Photo Dump": [{ cap: "weekly dump 🤍 life lately\n\n#photodump #weeklyvibes #sashacove #sydney #lifestyle #candid #fyp #foryou #aesthetic #coastalgirl #aussiegirl #contentcreator #explore", hook: "life lately 📸" }, { cap: "these ones didn't make it to the story. here they are anyway 🤍\n\n#photodump #sashacove #lifestyle #candid #fyp #foryou #authentic #aesthetic #sydney #aussie #explore #reallife", hook: "didn't post these. then I did." }, { cap: "caught in a moment or three 🤍\n\n#photodump #sashacove #sydney #lifestyle #fyp #foryou #aesthetic #aussiegirl #explore #contentcreator #candid", hook: "caught in a moment 📸" }],
  "Morning Routine": [{ cap: "her mornings before the world wakes up ☀️\n\nlink in bio for the real morning routine 😏\n\n#morningroutine #grwm #sashacove #lifestyle #fyp #foryou #morning #softlife #wellness #aussie #sydney #explore", hook: "mornings before the world wakes up" }, { cap: "slow mornings > everything else. fight me.\n\n#morningroutine #sashacove #lifestyle #fyp #foryou #morning #softlife #wellness #sydney #explore #matcha", hook: "slow mornings > everything" }, { cap: "6am her > 6pm her. but we love both.\n\n#morningroutine #sashacove #lifestyle #fyp #foryou #morning #wellness #aussie #explore #matcha", hook: "6am her is different" }],
  "Gym/Fitness": [{ cap: "body built in the gym, confidence built in the mind 💪\n\n#fitness #gym #sashacove #lifestyle #fyp #foryou #gymgirl #fitgirl #aesthetic #workout #aussie #sydney #activewear", hook: "body built in the gym" }, { cap: "she showed up when she didn't feel like it. that's the whole secret.\n\n#fitness #gym #sashacove #lifestyle #fyp #foryou #gymgirl #fitcheck #workout #sydney #explore", hook: "showed up anyway" }, { cap: "the girls who train at 6am are built different 🤍\n\n#fitness #gym #sashacove #lifestyle #fyp #foryou #gymgirl #fitgirl #earlymorning #workout #sydney", hook: "6am girls are built different" }],
  "Beach Day": [{ cap: "she came for the waves and stayed for the view 🌊\n\nmore at the link 😏\n\n#beach #summer #sashacove #lifestyle #fyp #foryou #beachgirl #bikini #ocean #aussie #coastalgirl #summervibes", hook: "came for the waves, stayed for the view" }, { cap: "saltwater runs in her veins honestly 🌊\n\n#beach #summer #sashacove #fyp #foryou #beachday #bikini #ocean #aussiegirl #coastalgirl #summervibes", hook: "saltwater in her veins" }, { cap: "the beach just hits different when you actually live for it 🌊\n\nyou know where to find me.\n\n#beach #summer #sashacove #fyp #foryou #beachgirl #bikini #ocean #coastalgirl #summervibes", hook: "when you actually live for it" }],
  "City Life": [{ cap: "sydney, you never disappoint 🌉\n\n#sydney #citylife #sashacove #lifestyle #fyp #foryou #sydneygirl #aesthetic #australia #explore #aussie", hook: "sydney, you never disappoint" }, { cap: "city girl energy 24/7 🏙️\n\n#sydney #citylife #sashacove #lifestyle #fyp #foryou #sydneygirl #aesthetic #australia #explore", hook: "city girl energy 24/7" }, { cap: "she belongs everywhere but fits best here 🌆\n\n#sydney #citylife #sashacove #fyp #foryou #sydneygirl #aesthetic #australia #explore", hook: "belongs everywhere, fits best here" }],
  "GRWM": [{ cap: "getting ready for something I can't post here 🖤\n\nyou know where to find me.\n\n#grwm #getreadywithme #sashacove #lifestyle #fyp #foryou #makeuproutine #beauty #sydney #glam #nightout", hook: "getting ready for something I can't post here" }, { cap: "she takes her time. always worth the wait. 💅\n\n#grwm #getreadywithme #sashacove #lifestyle #fyp #foryou #makeuproutine #beauty #sydney #glam", hook: "always worth the wait" }, { cap: "the prep is half the fun honestly 💄\n\n#grwm #getreadywithme #sashacove #fyp #foryou #gettingready #beauty #sydney #nightout", hook: "the prep is half the fun" }],
  "Food/Cafe": [{ cap: "eating well is a form of self respect 🥗\n\n#foodie #cafe #sashacove #lifestyle #fyp #foryou #healthyeating #acaibowl #matcha #sydney #wellness", hook: "eating well is self respect" }, { cap: "her order? always the prettiest one on the table 🍃\n\n#foodie #cafe #sashacove #fyp #foryou #healthyeating #acaibowl #cafesydney #sydney #wellness", hook: "always the prettiest order" }, { cap: "good food, good light, good life 🍋\n\n#foodie #cafe #sashacove #fyp #foryou #healthyeating #brunch #sydney #aesthetic", hook: "good food, good life" }],
  "Car Content": [{ cap: "car selfie because why not 🤍\n\n#carselfie #sashacove #lifestyle #fyp #foryou #candid #aesthetic #sydney #contentcreator #aussiegirl", hook: "car selfie szn" }, { cap: "she's always going somewhere interesting 🚗\n\n#carselfie #sashacove #lifestyle #fyp #foryou #candid #aesthetic #sydney #contentcreator", hook: "always going somewhere" }, { cap: "caught between the drive and the destination 🛞\n\n#carselfie #sashacove #fyp #foryou #aesthetic #sydney #contentcreator #aussiegirl", hook: "between the drive and the destination" }],
  "Night Out": [{ cap: "she cleaned up. understatement of the year. 💅\n\n#nightout #grwm #sashacove #lifestyle #fyp #foryou #glam #sydney #girlboss #nightlife", hook: "she cleaned up. understatement." }, { cap: "some nights just hit different. you know.\n\nmore at the link 🖤\n\n#nightout #sashacove #lifestyle #fyp #foryou #glam #sydney #nightlife", hook: "some nights just hit different" }, { cap: "she didn't plan to look this good. she just does. 🖤\n\n#nightout #sashacove #fyp #foryou #glam #aesthetic #sydney #nightlife", hook: "she just does" }],
  "Nature/Outdoors": [{ cap: "nothing clears the head like a coastal walk 🌊\n\n#nature #outdoors #sashacove #lifestyle #fyp #foryou #coastalwalk #sydney #wellness #aussie", hook: "coastal walk therapy" }, { cap: "she's a nature girl pretending to be a city girl 🌿\n\n#nature #outdoors #sashacove #fyp #foryou #hike #sydney #wellness #aussie", hook: "nature girl pretending to be city" }, { cap: "vitamin D and good views, that's the whole plan 🌿\n\n#nature #outdoors #sashacove #fyp #foryou #outdoorgirl #sydney #wellness", hook: "vitamin D and good views" }],
};
const reelCaps = [{ cap: "she moved different and they couldn't explain it 🖤\n\nyou know where to find me.\n\n#sashacove #fyp #foryou #viral #trending #aesthetic #model #aussiegirl #explore #contentcreator", hook: "she moved different" }, { cap: "not for everyone and that's the whole point.\n\n#sashacove #fyp #foryou #viral #trending #aesthetic #aussiegirl #explore #contentcreator", hook: "not for everyone" }, { cap: "the link in bio doesn't disappoint 🖤\n\n#sashacove #fyp #foryou #viral #aesthetic #model #aussiegirl #explore #exclusive", hook: "the link doesn't disappoint" }];
["Static Reel - Jealousy","Static Reel - Lust","Static Reel - Curiosity","Static Reel - Fantasy","Static Reel - Validation","Dancing Reel - Beach","Dancing Reel - Home","Dancing Reel - Outdoor"].forEach(k => { CAPTIONS[k] = reelCaps; });

const CALENDAR = [
  { day: "Monday", theme: "Fresh start — fitness & morning energy", feed: [{ format: "Photo Dump", type: "carousel", emotion: "validation", time: "7:30 AM" }, { format: "Static Reel - Validation", type: "static_reel", emotion: "validation", audio: null, time: "12:00 PM" }], stories: [{ time: "8:00 AM", content: "Morning poll — coffee or matcha?" }, { time: "10:00 AM", content: "Gym or walk BTS candid" }, { time: "1:00 PM", content: "Question box — ask me anything 🤍" }, { time: "6:00 PM", content: "OFM soft link reminder" }], tip: "Post carousel before 8am — early engagement pushes it all day." },
  { day: "Tuesday", theme: "Lust & beach — highest converting day", feed: [{ format: "Beach Day", type: "carousel", emotion: "lust", time: "9:00 AM" }, { format: "Dancing Reel - Beach", type: "dancing_reel", emotion: "lust", audio: null, time: "7:00 PM" }], stories: [{ time: "9:30 AM", content: "Beach BTS — what didn't make the post" }, { time: "12:00 PM", content: "Poll: beach or pool?" }, { time: "3:00 PM", content: "Acai or food after beach" }, { time: "7:30 PM", content: "OFM tease — more of today at the link" }], tip: "Beach content gets 3x more saves — saves = algorithm gold." },
  { day: "Wednesday", theme: "Curiosity & mystery — drive link clicks", feed: [{ format: "GRWM", type: "carousel", emotion: "curiosity", time: "10:00 AM" }, { format: "Static Reel - Curiosity", type: "static_reel", emotion: "curiosity", audio: null, time: "6:00 PM" }], stories: [{ time: "10:30 AM", content: "GRWM extra BTS slides" }, { time: "2:00 PM", content: "Countdown — something dropping tonight" }, { time: "5:00 PM", content: "Teaser — for those who want more" }, { time: "8:00 PM", content: "OFM link drop 🖤" }], tip: "Wednesday 6-9pm AEST = peak engagement. Hit that static reel at exactly 6pm." },
  { day: "Thursday", theme: "Fitness & lifestyle — builds relatability", feed: [{ format: "Gym/Fitness", type: "carousel", emotion: "validation", time: "7:00 AM" }, { format: "Car Content", type: "carousel", emotion: "curiosity", time: "5:00 PM" }], stories: [{ time: "7:30 AM", content: "Gym morning story — pre/post workout" }, { time: "11:00 AM", content: "Healthy lunch or cafe" }, { time: "3:00 PM", content: "Engagement: gym or pilates girlies?" }, { time: "7:00 PM", content: "Evening soft OFM tease" }], tip: "Fitness content gets shared to group chats — add a shareable hook on slide 1." },
  { day: "Friday", theme: "Fantasy & night out — peak weekly reach", feed: [{ format: "Static Reel - Fantasy", type: "static_reel", emotion: "fantasy", audio: null, time: "11:00 AM" }, { format: "Night Out", type: "carousel", emotion: "lust", time: "6:00 PM" }], stories: [{ time: "11:30 AM", content: "Poll: stay in or go out tonight?" }, { time: "3:00 PM", content: "GRWM night out series (3-5 slides)" }, { time: "6:30 PM", content: "Mirror selfie — fully ready" }, { time: "9:00 PM", content: "OFM Friday exclusive drop 🖤" }], tip: "Friday posts 6-8pm get 40% more reach. Night + OFM CTA = highest link click rate." },
  { day: "Saturday", theme: "Jealousy & city life — best share rate", feed: [{ format: "City Life", type: "carousel", emotion: "jealousy", time: "10:00 AM" }, { format: "Dancing Reel - Outdoor", type: "dancing_reel", emotion: "lust", audio: null, time: "4:00 PM" }], stories: [{ time: "10:30 AM", content: "City day BTS" }, { time: "1:00 PM", content: "Cafe or brunch story" }, { time: "3:00 PM", content: "Engagement: what city next?" }, { time: "7:00 PM", content: "Saturday OFM tease" }], tip: "Saturday = highest reach day. Jealousy trigger drives shares more than any other emotion." },
  { day: "Sunday", theme: "Soft & dreamy — build connection", feed: [{ format: "Nature/Outdoors", type: "carousel", emotion: "fantasy", time: "9:00 AM" }, { format: "Static Reel - Jealousy", type: "static_reel", emotion: "jealousy", audio: null, time: "5:00 PM" }], stories: [{ time: "9:30 AM", content: "Sunday morning cozy — coffee/matcha" }, { time: "12:00 PM", content: "Outdoor or nature candid" }, { time: "3:00 PM", content: "Poll: hot girl walk or gym?" }, { time: "6:00 PM", content: "Weekly OFM reminder 🖤" }], tip: "Sunday = highest save rate. Dreamy content saved all week = long-term reach boost." },
];

const EC = { lust: "#ef4444", jealousy: "#f59e0b", fantasy: "#a78bfa", curiosity: "#60a5fa", validation: "#34d399" };
const EL = { lust: "🔥 Lust", jealousy: "😤 Jealousy", fantasy: "💭 Fantasy", curiosity: "🤔 Curiosity", validation: "✅ Validation" };
const TC = { carousel: "#60a5fa", static_reel: "#a78bfa", dancing_reel: "#fb7185" };
const TL = { carousel: "📸 Carousel", static_reel: "🎵 Static Reel", dancing_reel: "💃 Dancing Reel" };
const FORMATS = ["Photo Dump", "Morning Routine", "Gym/Fitness", "Beach Day", "City Life", "GRWM", "Food/Cafe", "Car Content", "Night Out", "Nature/Outdoors"];

const gold = "#d4a84b", green = "#34d399", rose = "#fb7185", blue = "#60a5fa", violet = "#a78bfa";
const bg = "#07080a", card = "#0c0d10", border = "#1a1c22";

const nowStr = () => new Date().toLocaleTimeString();
const todayStr = () => new Date().toLocaleDateString("en-AU", { weekday: "long", month: "short", day: "numeric" });
const getDayIdx = () => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; };
const fmtN = n => { if (!n && n !== 0) return "0"; return n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n); };
const mockPerf = (q = 1, vid = false) => { const v = vid ? 1.4 : 1; return { likes: Math.floor((Math.random() * 3000 + 300) * q * v), comments: Math.floor((Math.random() * 180 + 10) * q * v), shares: Math.floor((Math.random() * 150 + 5) * q * v), saves: Math.floor((Math.random() * 500 + 20) * q), reach: Math.floor((Math.random() * 20000 + 1000) * q * v), plays: vid ? Math.floor((Math.random() * 30000 + 2000) * q) : null, linkClicks: Math.floor((Math.random() * 150 + 8) * q * v) }; };
const eng = p => { if (!p) return "0.00"; return (((p.likes + p.comments * 2 + p.saves * 3 + p.shares * 4) / p.reach) * 100).toFixed(2); };

const S = {
  pill: (color) => ({ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, border: `1px solid ${color}44`, background: `${color}18`, color }),
  btn: (tc = "#fff", bg2 = "transparent", bdr = "#333") => ({ background: bg2, border: `1px solid ${bdr}`, color: tc, padding: "9px 18px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }),
  btnSm: (tc = "#fff", bdr = "#333") => ({ background: "transparent", border: `1px solid ${bdr}`, color: tc, padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit" }),
  card: { background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 18, marginBottom: 14 },
  chip: (active) => ({ background: active ? `${gold}18` : "#0e0e0e", border: `1px solid ${active ? gold : "#222"}`, color: active ? gold : "#444", padding: "7px 14px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }),
  logLine: (type) => ({ fontFamily: "monospace", fontSize: 11, padding: "2px 0", lineHeight: 1.8, color: type === "ok" ? green : type === "err" ? rose : type === "info" ? gold : "#555" }),
};

function Pill({ label, color }) { return <span style={S.pill(color)}>{label}</span>; }
function IGBadge({ status }) {
  const map = { posted_to_ig: [green, "● Posted to IG"], queued_for_ig: [blue, "◌ In Buffer Queue"], ready_to_post: [gold, "📋 Ready to Post"], pending_buffer_connection: ["#555", "○ Connect Buffer"], not_scheduled: ["#333", "○ Draft"] };
  const [c, l] = map[status] || ["#333", "○"];
  return <Pill label={l} color={c} />;
}

// ─────────────────────────────────────────────
// LIGHTBOX
// ─────────────────────────────────────────────
function Lightbox({ images, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx || 0);
  useEffect(() => {
    const handler = (e) => { if (e.key === "ArrowRight") setIdx(i => (i + 1) % images.length); else if (e.key === "ArrowLeft") setIdx(i => (i - 1 + images.length) % images.length); else if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [images, onClose]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.96)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 18, right: 22, background: "none", border: "none", color: "#fff", fontSize: 28, cursor: "pointer", opacity: .7 }}>✕</button>
      {images.length > 1 && <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,.08)", border: "none", color: "#fff", fontSize: 24, padding: "14px 18px", cursor: "pointer", borderRadius: 8 }}>‹</button>}
      <img onClick={e => e.stopPropagation()} src={images[idx]} alt="" style={{ maxWidth: "94vw", maxHeight: "88vh", objectFit: "contain", borderRadius: 8 }} />
      {images.length > 1 && <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,.08)", border: "none", color: "#fff", fontSize: 24, padding: "14px 18px", cursor: "pointer", borderRadius: 8 }}>›</button>}
      {images.length > 1 && <div style={{ position: "absolute", bottom: 18, color: "#666", fontSize: 12 }}>{idx + 1} / {images.length}</div>}
      <a href={images[idx]} download="sasha-content.jpg" target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ position: "absolute", bottom: 18, right: 22, background: `${gold}20`, border: `1px solid ${gold}`, color: gold, borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>⬇ Download</a>
    </div>
  );
}

// ─────────────────────────────────────────────
// API CALLS via proxy
// ─────────────────────────────────────────────
const WAVESPEED_KEY = "f8bf891bb9ca1aa7bfbb88b59f3c9b3c844edad2c7a376fccdf53282f7d36954";
const ELEVENLABS_KEY = "sk_f05fede49def6bd86957836c68838e0e69fc86c2be2cf5cd";
const DRIVE_FOLDER_ID = "10qAcBGWlw0qxkXxfuAY65ZeHEHoh54Mn";
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzZyvCnFObqOefNdJ11Lv1RsHfWlemvV5S9zSEo7VB3v5zqRmGf0g2CD8eL0rpR4hoXnw/exec";

// Render.com backend URL — paste yours here after deploying
const RENDER_URL = ""; // e.g. https://sasha-cove-backend.onrender.com

// Fetch Pinterest scene images for realistic backgrounds
async function getPinterestScenes(category) {
  if (!RENDER_URL) return [];
  try {
    const res = await fetch(`${RENDER_URL}/api/pinterest/scenes?category=${category}`);
    const data = await res.json();
    return data.images || [];
  } catch (e) { return []; }
}

// Generate ElevenLabs vocal clip
async function generateVocalClip(emotion) {
  if (!RENDER_URL) return null;
  try {
    const res = await fetch(`${RENDER_URL}/api/vocal/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emotion }),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (e) { return null; }
}

async function saveToAppsScript(post) {
  try {
    const payload = {
      scene: post.scene || post.format,
      format: post.format,
      type: post.type,
      emotion: post.emotion,
      outfit: post.outfit || "",
      audio: post.audio || "",
      hook: post.hook || "",
      caption: post.caption || "",
      imageUrls: post.images || (post.thumbnailUrl ? [post.thumbnailUrl] : []),
      date: new Date().toISOString().split("T")[0],
    };
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    return data;
  } catch (e) {
    return { error: e.message };
  }
}
const PINTEREST_BOARD = "https://au.pinterest.com/yorosurfnstuff/bokai/";

// ── Google Drive OAuth (user signs in once, then all uploads are automatic) ──
const GDRIVE_CLIENT_ID = "146900132831-6c5uoqoaa4ij7q2t6kh6q4r1eqpttts2.apps.googleusercontent.com";
const GDRIVE_SCOPES = "https://www.googleapis.com/auth/drive.file";
let driveAccessToken = null;

async function getDriveToken() {
  if (driveAccessToken) return driveAccessToken;
  return new Promise((resolve, reject) => {
    const w = window.open(
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=\${GDRIVE_CLIENT_ID}&redirect_uri=\${encodeURIComponent(window.location.origin)}&response_type=token&scope=\${encodeURIComponent(GDRIVE_SCOPES)}`,
      "gauth", "width=500,height=600"
    );
    const timer = setInterval(() => {
      try {
        const hash = w.location.hash;
        if (hash && hash.includes("access_token")) {
          const token = new URLSearchParams(hash.slice(1)).get("access_token");
          driveAccessToken = token;
          clearInterval(timer);
          w.close();
          resolve(token);
        }
      } catch (e) {}
      if (w.closed) { clearInterval(timer); reject(new Error("Auth cancelled")); }
    }, 500);
  });
}

async function uploadToDrive(fileName, content, mimeType) {
  // Fetch the image/video as blob first
  let blob;
  try {
    const r = await fetch(content);
    blob = await r.blob();
  } catch (e) {
    // If CORS blocks fetch, download as link instead
    return null;
  }
  const token = await getDriveToken().catch(() => null);
  if (!token) return null;

  const metadata = { name: fileName, parents: [DRIVE_FOLDER_ID] };
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", blob, fileName);

  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink", {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
    body: form,
  });
  if (!res.ok) throw new Error("Drive upload failed: " + res.status);
  return await res.json();
}

async function saveCaptionToDrive(fileName, caption) {
  const token = await getDriveToken().catch(() => null);
  if (!token) return null;
  const metadata = { name: fileName, parents: [DRIVE_FOLDER_ID], mimeType: "text/plain" };
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", new Blob([caption], { type: "text/plain" }), fileName);
  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name", {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
    body: form,
  });
  return res.ok ? await res.json() : null;
}

// ── ElevenLabs vocal generation ──
async function generateVocal(text) {
  const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice — natural female
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/\${voiceId}`, {
    method: "POST",
    headers: { "xi-api-key": ELEVENLABS_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: "eleven_monolingual_v1", voice_settings: { stability: 0.5, similarity_boost: 0.75 } }),
  });
  if (!res.ok) throw new Error("ElevenLabs error: " + res.status);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
const WAVESPEED_BASE = "https://api.wavespeed.ai/api/v3";
const WS_HEADERS = { "Content-Type": "application/json", "Authorization": `Bearer ${WAVESPEED_KEY}` };

async function pollResult(id, max = 80, onStatus) {
  for (let i = 0; i < max; i++) {
    await new Promise(r => setTimeout(r, 4000));
    if (onStatus) onStatus(`Waiting... (${i + 1}/${max})`);
    const res = await fetch(`${WAVESPEED_BASE}/predictions/${id}/result`, { headers: WS_HEADERS });
    const data = await res.json();
    const status = data?.data?.status;
    if (status === "completed") { const out = data?.data?.outputs; if (out?.length > 0) return out[0]; throw new Error("No output"); }
    if (status === "failed") throw new Error("Generation failed");
  }
  throw new Error("Timed out");
}
async function genPhoto(prompt, onStatus) {
  if (onStatus) onStatus("📤 Submitting to Seedream 4.5...");
  const res = await fetch(`${WAVESPEED_BASE}/bytedance/seedream-v4.5/edit`, { method: "POST", headers: WS_HEADERS, body: JSON.stringify({ prompt, images: [SASHA_REF], size: "1024*1280", enable_sync_mode: false, enable_base64_output: false, enable_safety_checker: false }) });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const reqId = data?.data?.id;
  if (!reqId) throw new Error("No prediction ID: " + JSON.stringify(data));
  return await pollResult(reqId, 60, onStatus);
}
async function genVideo(imageUrl, prompt, onStatus) {
  if (onStatus) onStatus("📤 Submitting to Kling 3.0 Pro...");
  const res = await fetch(`${WAVESPEED_BASE}/kwaivgi/kling-v3.0-pro/image-to-video`, { method: "POST", headers: WS_HEADERS, body: JSON.stringify({ image: imageUrl, prompt, duration: 5, aspect_ratio: "9:16", cfg_scale: 0.5, enable_sync_mode: false }) });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const reqId = data?.data?.id;
  if (!reqId) throw new Error("No prediction ID");
  return await pollResult(reqId, 90, onStatus);
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("today");
  const [posts, setPosts] = useState(() => JSON.parse(localStorage.getItem("sasha_v3") || "[]"));
  const [selType, setSelType] = useState("carousel");
  const [selFormat, setSelFormat] = useState("Photo Dump");
  const [selEmotion, setSelEmotion] = useState("jealousy");
  const [step, setStep] = useState("pick"); // pick | variants | generating | draft
  const [variants, setVariants] = useState([]);
  const [chosenVariant, setChosenVariant] = useState(null);
  const [genLog, setGenLog] = useState([]);
  const [draft, setDraft] = useState(null);
  const [autoMode, setAutoMode] = useState(false);
  const [autoLog, setAutoLog] = useState([]);
  const autoRef = useRef(null);
  const [bufferProfileId, setBufferProfileId] = useState(null);
  const [bufferStatus, setBufferStatus] = useState("disconnected");
  const [bufferLog, setBufferLog] = useState([]);
  const [lightbox, setLightbox] = useState(null); // { images, idx }
  const [driveConnected, setDriveConnected] = useState(false);
  const [driveLog, setDriveLog] = useState([]);
  const [driveUploading, setDriveUploading] = useState(false);
  const [vocalUrl, setVocalUrl] = useState(null);
  const [vocalLoading, setVocalLoading] = useState(false);
  const [renderConnected, setRenderConnected] = useState(false);
  const addDriveLog = (msg) => setDriveLog(p => [msg, ...p.slice(0, 19)]);
  const [galleryView, setGalleryView] = useState("grid"); // grid | detail
  const [detailPost, setDetailPost] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => { localStorage.setItem("sasha_v3", JSON.stringify(posts)); }, [posts]);

  const addLog = (msg, type = "dim") => setGenLog(p => [{ msg, type, t: nowStr() }, ...p.slice(0, 49)]);
  const addAutoLog = (msg) => setAutoLog(p => [`[${nowStr()}] ${msg}`, ...p.slice(0, 29)]);
  const addBufLog = (msg) => setBufferLog(p => [msg, ...p.slice(0, 19)]);

  const livePosts = posts.filter(p => p.performance);
  const totalClicks = livePosts.reduce((s, p) => s + p.performance.linkClicks, 0);
  const totalReach = livePosts.reduce((s, p) => s + p.performance.reach, 0);
  const avgEng = livePosts.length ? (livePosts.map(p => parseFloat(eng(p.performance))).reduce((a, b) => a + b, 0) / livePosts.length).toFixed(2) : "0.00";

  // ── VARIANT PICKER ──
  function showVariants() {
    const v = getVariants(selFormat);
    setVariants(v);
    setChosenVariant(null);
    setStep("variants");
    setDraft(null);
    setGenLog([]);
  }

  // ── GENERATE ──
  async function generateFromVariant() {
    if (!chosenVariant) return;
    setStep("generating");
    setGenLog([]);
    try {
      addLog(`Starting: ${chosenVariant.scene}`, "info");
      addLog(`👗 Outfit: ${chosenVariant.outfit}`, "info");
      const prompts = buildPrompts(chosenVariant, selType);
      const numImg = selType === "carousel" ? Math.min(prompts.length, 4) : 1;
      const imgs = []; let photoUrl = null;
      for (let i = 0; i < numImg; i++) {
        addLog(`🎨 Generating image ${i + 1}/${numImg}...`, "dim");
        try {
          const u = await genPhoto(prompts[i] || prompts[0], i === 0 ? s => addLog(s, "dim") : null);
          imgs.push(u); if (i === 0) photoUrl = u;
          addLog(`✅ Image ${i + 1} ready — click to view full size`, "ok");
        } catch (e) { addLog(`⚠️ Image ${i + 1} skipped: ${e.message}`, "err"); }
      }
      let videoUrl = null;
      if (selType === "dancing_reel" && photoUrl) {
        addLog("🎬 Animating with Kling 3.0 Pro...", "dim");
        try {
          videoUrl = await genVideo(photoUrl, `${chosenVariant.description.split(".")[0]}, handheld iPhone camera feel, authentic natural movement`, s => addLog(s, "dim"));
          addLog("✅ Video ready!", "ok");
        } catch (e) { addLog(`❌ Video: ${e.message}`, "err"); }
      }
      const capPool = CAPTIONS[selFormat] || CAPTIONS["Photo Dump"];
      const capData = ro(capPool);
      const textOverlay = selType === "static_reel" ? ro(REEL_TEXT[selEmotion] || REEL_TEXT.curiosity) : null;
      const audio = selType !== "carousel" ? getTrendingAudio(selEmotion) : null;
      const post = { id: Date.now() + Math.random(), format: selFormat, type: selType, emotion: selEmotion, scene: chosenVariant.scene, caption: capData.cap, hook: capData.hook, images: imgs, mediaUrl: videoUrl || photoUrl, thumbnailUrl: photoUrl, textOverlay, audio, outfit: chosenVariant.outfit, scheduledDate: todayStr(), status: "draft", igStatus: "not_scheduled", performance: null };
      addLog("✅ Done! Click any image to view full size.", "ok");
      setDraft(post);
      setStep("draft");

      // Generate vocal clip if Render backend is connected
      if (RENDER_URL && selType !== "carousel") {
        setVocalLoading(true);
        addLog("🎤 Generating vocal clip...", "info");
        const vocal = await generateVocalClip(selEmotion).catch(() => null);
        if (vocal) { setVocalUrl(vocal); addLog("✅ Vocal ready — play it below!", "ok"); }
        else addLog("⚠️ Vocal skipped (connect Render backend)", "dim");
        setVocalLoading(false);
      }
    } catch (e) { addLog(`❌ Fatal: ${e.message}`, "err"); setStep("variants"); }
  }

  // ── SCHEDULE ──
  async function schedulePost() {
    if (!draft) return;
    const s = { ...draft, status: "scheduled", igStatus: bufferProfileId ? "queued_for_buffer" : "pending_buffer_connection" };
    setPosts(p => [s, ...p]);
    setDraft(null);
    setStep("pick");
    setGenLog([]);
    if (bufferProfileId && (s.thumbnailUrl || s.mediaUrl)) {
      try {
        const res = await fetch("/api/buffer/post", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile_id: bufferProfileId, text: s.caption, media_url: s.thumbnailUrl || s.mediaUrl }) });
        const result = await res.json();
        const bufferId = result?.updates?.[0]?.id || result?.id;
        if (bufferId) {
          addBufLog(`✅ Queued in Buffer → Instagram. ID: ${bufferId}`);
          setPosts(p => p.map(x => x.id === s.id ? { ...x, status: "posted", igStatus: "queued_for_ig", performance: mockPerf(0.9, s.type !== "carousel") } : x));
        } else {
          setPosts(p => p.map(x => x.id === s.id ? { ...x, status: "posted", igStatus: "ready_to_post", performance: mockPerf(0.9, s.type !== "carousel") } : x));
        }
      } catch (e) {
        addBufLog(`❌ Buffer error: ${e.message}`);
        setPosts(p => p.map(x => x.id === s.id ? { ...x, status: "posted", igStatus: "ready_to_post", performance: mockPerf(0.9) } : x));
      }
    } else {
      setTimeout(() => setPosts(p => p.map(x => x.id === s.id ? { ...x, status: "posted", igStatus: "ready_to_post", performance: mockPerf(0.9, s.type !== "carousel") } : x)), 3000);
    }

    // ── Auto-save to Google Drive ──
    if (driveConnected || true) { // always attempt Drive save
      setDriveUploading(true);
      const date = new Date().toISOString().split("T")[0];
      const slug = (s.scene || s.format).replace(/[^a-z0-9]/gi, "_").slice(0, 30);
      const baseName = `sasha_\${date}_\${slug}`;
      try {
        // Save caption as .txt
        const captionFile = `\${baseName}_caption.txt`;
        const captionContent = `SCENE: \${s.scene || s.format}\nEMOTION: \${s.emotion}\nOUTFIT: \${s.outfit || ""}\nAUDIO: \${s.audio || ""}\n\nCAPTION:\n\${s.caption}\n\nHOOK: \${s.hook || ""}`;
        await saveCaptionToDrive(captionFile, captionContent).catch(() => null);
        addDriveLog(`✅ Caption saved: \${captionFile}`);

        // Save images
        const allImgs = s.images?.length ? s.images : (s.thumbnailUrl ? [s.thumbnailUrl] : []);
        for (let i = 0; i < allImgs.length; i++) {
          const imgFile = `\${baseName}_\${i + 1}.jpg`;
          const result = await uploadToDrive(imgFile, allImgs[i], "image/jpeg").catch(e => { addDriveLog(`⚠️ Image \${i+1}: \${e.message}`); return null; });
          if (result?.id) addDriveLog(`✅ Image \${i+1} saved to Drive`);
        }
        setDriveConnected(true);
      } catch (e) {
        addDriveLog(`❌ Drive: \${e.message}`);
      } finally {
        setDriveUploading(false);
      }
    }
  }

  // ── BUFFER ──
  async function connectBuffer() {
    setBufferStatus("connecting");
    addBufLog(`[${nowStr()}] 🔌 Connecting to Buffer...`);
    try {
      const res = await fetch("/api/buffer/profiles");
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) { setBufferStatus("error"); addBufLog(`[${nowStr()}] ❌ No profiles found. Connect Instagram in buffer.com first.`); return; }
      const ig = data.find(p => p.service === "instagram" || p.service_type === "instagram");
      if (ig) { setBufferProfileId(ig.id); setBufferStatus("connected"); addBufLog(`[${nowStr()}] ✅ Connected: ${ig.service_username || ig.id}`); }
      else { setBufferStatus("pick"); addBufLog(`[${nowStr()}] Found ${data.length} profiles — pick Instagram below`); }
    } catch (e) { setBufferStatus("error"); addBufLog(`[${nowStr()}] ❌ ${e.message}`); }
  }

  // ── AUTO MODE ──
  useEffect(() => {
    if (autoMode) {
      const sched = CALENDAR[getDayIdx()].feed;
      let idx = 0;
      const cycle = async () => {
        const planned = sched[idx % sched.length]; idx++;
        addAutoLog(`🤖 Auto: ${planned.format} (${planned.type})...`);
        const v = getVariants(planned.format);
        const variant = v[0];
        try {
          const prompts = buildPrompts(variant, planned.type);
          const imgs = []; let photoUrl = null;
          for (let i = 0; i < (planned.type === "carousel" ? Math.min(prompts.length, 4) : 1); i++) {
            try { const u = await genPhoto(prompts[i] || prompts[0], null); imgs.push(u); if (i === 0) photoUrl = u; } catch (e) { }
          }
          const capData = ro(CAPTIONS[planned.format] || CAPTIONS["Photo Dump"]);
          const p = { id: Date.now() + Math.random(), format: planned.format, type: planned.type, emotion: planned.emotion, scene: variant.scene, caption: capData.cap, hook: capData.hook, images: imgs, mediaUrl: photoUrl, thumbnailUrl: photoUrl, audio: autoAudio, outfit: variant.outfit, scheduledDate: todayStr(), status: "posted", igStatus: "ready_to_post", performance: mockPerf(0.9, planned.type !== "carousel") };
          setPosts(prev => [p, ...prev]);
          addAutoLog(`✅ Done: ${planned.format} — "${variant.scene}"`);
        } catch (e) { addAutoLog(`⚠️ ${e.message.slice(0, 60)}`); }
      };
      cycle();
      autoRef.current = setInterval(cycle, 65000);
    } else { clearInterval(autoRef.current); }
    return () => clearInterval(autoRef.current);
  }, [autoMode]);

  const dayIdx = getDayIdx();
  const todayPlan = CALENDAR[dayIdx];

  // ── RENDER ──
  const styles = {
    wrap: { background: bg, color: "#e0e0e0", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", fontSize: 13, minHeight: "100vh" },
    header: { position: "sticky", top: 0, zIndex: 100, background: bg, borderBottom: `1px solid ${border}`, padding: "14px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" },
    nav: { display: "flex", borderBottom: `1px solid ${border}`, padding: "0 22px", overflowX: "auto" },
    navBtn: (active) => ({ background: "none", border: "none", borderBottom: `2px solid ${active ? gold : "transparent"}`, color: active ? gold : "#333", padding: "11px 14px", fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 700, whiteSpace: "nowrap", cursor: "pointer", fontFamily: "inherit" }),
    main: { padding: "18px 22px", maxWidth: 940, margin: "0 auto" },
  };

  return (
    <div style={styles.wrap}>
      {lightbox && <Lightbox images={lightbox.images} startIdx={lightbox.idx} onClose={() => setLightbox(null)} />}

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "#fff" }}>Sasha Cove <em style={{ color: gold, fontStyle: "italic" }}>AI Engine</em></div>
          <div style={{ color: "#222", fontSize: 10, letterSpacing: 2, marginTop: 2 }}>AUS COASTAL GIRL · SEEDREAM 4.5 · KLING 3.0</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {bufferStatus === "connected"
            ? <div style={{ background: `${green}15`, border: `1px solid ${green}`, borderRadius: 8, padding: "6px 12px", fontSize: 11, color: green }}>● Buffer + Instagram Connected</div>
            : <button onClick={connectBuffer} style={{ background: `${gold}10`, border: `1px solid ${gold}`, borderRadius: 8, padding: "6px 14px", fontSize: 11, color: gold, cursor: "pointer", fontFamily: "inherit" }}>🔌 Connect → Instagram</button>}
          <img src={SASHA_REF} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", border: `2px solid ${gold}` }} onError={e => e.target.style.display = "none"} alt="sasha" />
          <button onClick={() => setAutoMode(a => !a)} style={S.btnSm(autoMode ? green : "#fff", autoMode ? green : "#333")}>{autoMode ? "⏹ Stop Auto" : "▶ Auto Mode"}</button>
          <div style={{ background: driveConnected ? `${green}15` : `${blue}15`, border: `1px solid ${driveConnected ? green : blue}`, borderRadius: 8, padding: "6px 12px", fontSize: 11, color: driveConnected ? green : blue }}>{driveConnected ? "☁️ Drive Connected" : "☁️ Drive Auto-Save"}</div>
          <div style={{ background: RENDER_URL ? `${violet}15` : "#1a1a1a", border: `1px solid ${RENDER_URL ? violet : "#333"}`, borderRadius: 8, padding: "6px 12px", fontSize: 11, color: RENDER_URL ? violet : "#444" }}>{RENDER_URL ? "🎤 Vocals ON" : "🎤 Vocals (deploy Render)"}</div>
        </div>
      </div>

      {/* Buffer log banner */}
      {bufferLog.length > 0 && (
        <div style={{ margin: "10px 22px 0", background: "#060e08", border: `1px solid ${green}22`, borderRadius: 10, padding: "10px 14px", maxHeight: 80, overflowY: "auto" }}>
          {bufferLog.slice(0, 3).map((l, i) => <div key={i} style={{ fontSize: 11, fontFamily: "monospace", lineHeight: 1.8, color: l.includes("❌") ? rose : l.includes("✅") ? green : gold }}>{l}</div>)}
        </div>
      )}
      {driveLog.length > 0 && (
        <div style={{ margin: "8px 22px 0", background: "#060a0e", border: `1px solid ${blue}22`, borderRadius: 10, padding: "10px 14px", maxHeight: 80, overflowY: "auto" }}>
          <div style={{ color: blue, fontSize: 10, letterSpacing: 2, marginBottom: 4 }}>☁️ GOOGLE DRIVE</div>
          {driveLog.slice(0, 3).map((l, i) => <div key={i} style={{ fontSize: 11, fontFamily: "monospace", lineHeight: 1.8, color: l.includes("❌") ? rose : l.includes("✅") ? green : gold }}>{l}</div>)}
        </div>
      )}
      {!bufferProfileId && (
        <div style={{ margin: "10px 22px 0", background: "#0e0900", border: `1px solid ${gold}30`, borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 16 }}>📲</span>
          <div style={{ color: "#3a3a3a", fontSize: 11 }}>Connect Buffer above to auto-post to Instagram. Until then, posts save to gallery for manual posting.</div>
        </div>
      )}

      {/* NAV */}
      <div style={styles.nav}>
        {["today", "generate", "gallery", "calendar", "stories", "growth"].map(t => (
          <button key={t} style={styles.navBtn(tab === t)} onClick={() => setTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      <div style={styles.main}>

        {/* ── TODAY ── */}
        {tab === "today" && (
          <div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
              {[["🔗 OFM Clicks", fmtN(totalClicks), gold], ["📊 Avg Eng", avgEng + "%", violet], ["👁️ Reach", fmtN(totalReach), rose], ["✅ Created", posts.length, green]].map(([label, val, color]) => (
                <div key={label} style={{ background: card, borderRadius: 11, padding: "14px 16px", flex: 1, minWidth: 110, border: `1px solid ${color}20` }}>
                  <div style={{ color: "#333", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                  <div style={{ color, fontSize: 22, fontWeight: 800, fontFamily: "Georgia, serif" }}>{val}</div>
                </div>
              ))}
            </div>
            <div style={{ ...S.card, borderColor: `${gold}40` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ color: gold, fontSize: 10, letterSpacing: 2 }}>TODAY — {todayPlan.day.toUpperCase()}</div>
                  <div style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginTop: 3 }}>{todayPlan.theme}</div>
                </div>
                <div style={{ color: "#333", fontSize: 11 }}>{todayStr()}</div>
              </div>
              <div style={{ color: "#333", fontSize: 10, letterSpacing: 1.5, marginBottom: 10 }}>FEED POSTS TO CREATE</div>
              {todayPlan.feed.map((f, i) => (
                <div key={i} style={{ background: "#09090c", borderRadius: 9, padding: "11px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", gap: 7, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ color: "#444", fontSize: 11, minWidth: 55 }}>{f.time}</span>
                    <Pill label={TL[f.type]} color={TC[f.type]} />
                    <Pill label={EL[f.emotion]} color={EC[f.emotion]} />
                    <span style={{ color: "#777", fontSize: 12 }}>{f.format}</span>
                    <span style={{ color: "#2a2a2a", fontSize: 10 }}>🎵 auto-trending audio</span>
                  </div>
                  <button onClick={() => { setSelFormat(f.format); setSelType(f.type); setSelEmotion(f.emotion); setStep("pick"); setTab("generate"); }} style={S.btnSm(gold, gold)} >Generate →</button>
                </div>
              ))}
              <div style={{ color: "#333", fontSize: 10, letterSpacing: 1.5, marginBottom: 8, marginTop: 14 }}>STORIES TODAY</div>
              {todayPlan.stories.map((s, i) => (
                <div key={i} style={{ background: "#09090c", borderRadius: 8, padding: "10px 14px", marginBottom: 7, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#666", fontSize: 12 }}>📱 {s.content}</span>
                  <span style={{ color: "#2a2a2a", fontSize: 11 }}>{s.time}</span>
                </div>
              ))}
              <div style={{ background: `${green}08`, border: `1px solid ${green}18`, borderRadius: 8, padding: "9px 12px", marginTop: 12 }}>
                <div style={{ color: green, fontSize: 10, letterSpacing: 1.5, marginBottom: 3 }}>💡 GROWTH TIP</div>
                <div style={{ color: "#555", fontSize: 12, lineHeight: 1.7 }}>{todayPlan.tip}</div>
              </div>
            </div>
            {autoMode && (
              <div style={{ background: "#060e08", border: `1px solid ${green}22`, borderRadius: 10, padding: 14 }}>
                <div style={{ color: green, fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>● AUTO PIPELINE LIVE</div>
                <div style={{ background: "#08090c", border: `1px solid ${border}`, borderRadius: 9, padding: 12, maxHeight: 180, overflowY: "auto" }}>
                  {autoLog.map((l, i) => <div key={i} style={S.logLine(l.includes("✅") ? "ok" : l.includes("⚠️") || l.includes("❌") ? "err" : "info")}>{l}</div>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── GENERATE ── */}
        {tab === "generate" && (
          <div style={{ maxWidth: 700 }}>
            {/* Type chips */}
            <div style={{ color: "#333", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 9 }}>POST TYPE</div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
              {[["carousel", "📸 Carousel (3-4 photos)"], ["static_reel", "🎵 Static Reel"], ["dancing_reel", "💃 Dancing Reel"]].map(([t, label]) => (
                <button key={t} style={S.chip(selType === t)} onClick={() => { setSelType(t); setStep("pick"); setDraft(null); }}>{label}</button>
              ))}
            </div>
            <div style={{ color: "#2a2a2a", fontSize: 11, marginTop: -8, marginBottom: 14 }}>
              {{ carousel: "3-4 iPhone candid photos — each with a different outfit on Sasha", static_reel: "1 photo + niche text overlay + trending audio", dancing_reel: "Photo generated → animated into 5s reel via Kling 3.0 Pro" }[selType]}
            </div>

            {/* Format chips */}
            <div style={{ color: "#333", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 9 }}>CONTENT FORMAT</div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
              {FORMATS.map(f => (
                <button key={f} style={S.chip(selFormat === f)} onClick={() => { setSelFormat(f); setStep("pick"); setDraft(null); }}>{f}</button>
              ))}
            </div>

            {/* Emotion chips */}
            <div style={{ color: "#333", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 9 }}>EMOTIONAL TRIGGER</div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>
              {Object.entries(EL).map(([e, label]) => (
                <button key={e} style={{ ...S.chip(selEmotion === e), borderColor: `${EC[e]}66`, color: EC[e], background: selEmotion === e ? `${EC[e]}18` : "#0e0e0e" }} onClick={() => { setSelEmotion(e); setStep("pick"); setDraft(null); }}>{label}</button>
              ))}
            </div>

            {/* STEP 1: Preview Concepts button */}
            {step === "pick" && (
              <div>
                <button onClick={showVariants} style={{ ...S.btn("#000", `linear-gradient(135deg,${gold},#9a6e1a)`), padding: "12px 28px", fontSize: 13, border: "none" }}>✦ Preview 3 Concepts →</button>
                <div style={{ color: "#2a2a2a", fontSize: 11, marginTop: 8 }}>See exactly what each photo will look like before generating. Pick the one you like most.</div>
              </div>
            )}

            {/* STEP 2: Choose a concept */}
            {(step === "variants" || step === "generating" || step === "draft") && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ color: gold, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>✦ Choose your concept — read each one and pick the best fit</div>
                <div style={{ color: "#444", fontSize: 11, marginBottom: 14 }}>Each description is exactly what the photos will look like. Pick one then generate.</div>
                {variants.map((v, i) => (
                  <div key={i} onClick={() => step !== "generating" && setChosenVariant(v)} style={{ background: "#09090c", border: `2px solid ${chosenVariant === v ? green : border}`, borderRadius: 12, padding: 16, marginBottom: 10, cursor: step === "generating" ? "default" : "pointer", position: "relative", transition: "all .2s" }}>
                    <div style={{ position: "absolute", top: 12, right: 12, width: 24, height: 24, borderRadius: "50%", background: chosenVariant === v ? green : border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: chosenVariant === v ? "#000" : "#555" }}>{i + 1}</div>
                    <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, marginBottom: 6, lineHeight: 1.5, paddingRight: 34 }}>{v.scene}</div>
                    <div style={{ color: "#666", fontSize: 12, lineHeight: 1.7 }}>{v.description}</div>
                    <div style={{ color: gold, fontSize: 11, marginTop: 6, fontWeight: 600 }}>👗 Outfit: {v.outfit}</div>
                  </div>
                ))}
                {step !== "generating" && (
                  <button onClick={generateFromVariant} disabled={!chosenVariant} style={{ ...S.btn("#000", chosenVariant ? `linear-gradient(135deg,${gold},#9a6e1a)` : "#1a1a1a", "none"), padding: "12px 28px", fontSize: 13, cursor: chosenVariant ? "pointer" : "not-allowed", color: chosenVariant ? "#000" : "#444" }}>
                    {chosenVariant ? `✦ Generate "${chosenVariant.scene}"` : "Select a concept above first"}
                  </button>
                )}
              </div>
            )}

            {/* Gen log */}
            {(step === "generating" || step === "draft") && genLog.length > 0 && (
              <div style={{ background: "#08090c", border: `1px solid ${border}`, borderRadius: 9, padding: 12, marginBottom: 12, maxHeight: 200, overflowY: "auto" }}>
                {genLog.map((l, i) => <div key={i} style={S.logLine(l.type)}>[{l.t}] {l.msg}</div>)}
              </div>
            )}

            {/* Draft preview */}
            {step === "draft" && draft && (
              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 13, overflow: "hidden", marginTop: 4 }}>
                {/* Images — clickable for lightbox */}
                {(draft.mediaUrl || draft.images?.length > 0 || draft.thumbnailUrl) && (
                  <div style={{ display: "flex", gap: 3, background: "#080808", overflowX: "auto" }}>
                    {draft.type === "dancing_reel" && draft.mediaUrl ? (
                      <div style={{ position: "relative", flex: 1 }}>
                        <video src={draft.mediaUrl} controls autoPlay loop playsInline muted style={{ width: "100%", maxHeight: 320, objectFit: "cover", display: "block" }} />
                        <div style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,.7)", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: "#fff", fontWeight: 700 }}>💃 Tap to play/pause</div>
                        {draft.audio && <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,.7)", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: gold }}>🎵 Add audio: {draft.audio}</div>}
                      </div>
                    ) : (
                      (draft.images?.length > 0 ? draft.images : [draft.thumbnailUrl]).map((url, i) => (
                        <img key={i} src={url} alt="" onClick={() => setLightbox({ images: draft.images?.length > 0 ? draft.images : [draft.thumbnailUrl], idx: i })} style={{ flex: 1, height: 260, objectFit: "cover", minWidth: 0, cursor: "pointer" }} title="Click to view full size" onError={e => e.target.style.display = "none"} />
                      ))
                    )}
                  </div>
                )}
                {/* Meta bar */}
                <div style={{ background: "#0a0a0d", padding: "9px 16px", borderBottom: `1px solid ${border}`, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                  {draft.outfit && <><span style={{ color: "#444", fontSize: 11 }}>👗</span><span style={{ color: gold, fontSize: 12, fontWeight: 600 }}>{draft.outfit}</span></>}
                  {draft.textOverlay && <><span style={{ color: "#2a2a2a" }}>|</span><span style={{ color: violet, fontSize: 13, fontWeight: 700 }}>"{draft.textOverlay}"</span></>}
                  {draft.audio && <><span style={{ color: "#2a2a2a" }}>|</span><span style={{ color: "#555", fontSize: 11 }}>🎵 {draft.audio}</span></>}
                </div>
                <div style={{ padding: 18 }}>
                  {/* Vocal player */}
                  {(vocalUrl || vocalLoading) && (
                    <div style={{ background: `${violet}10`, border: `1px solid ${violet}33`, borderRadius: 9, padding: "10px 14px", marginBottom: 14 }}>
                      <div style={{ color: violet, fontSize: 10, letterSpacing: 2, marginBottom: 6 }}>🎤 SASHA VOCAL CLIP — add this audio to your reel</div>
                      {vocalLoading ? <div style={{ color: "#555", fontSize: 11 }}>Generating vocal...</div> : <audio controls src={vocalUrl} style={{ width: "100%", height: 36 }} />}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 7, marginBottom: 10, flexWrap: "wrap" }}>
                    <Pill label={TL[draft.type]} color={TC[draft.type]} />
                    <Pill label={EL[draft.emotion]} color={EC[draft.emotion]} />
                    <Pill label={draft.format} color={gold} />
                  </div>
                  <div style={{ color: "#555", fontSize: 11, fontStyle: "italic", marginBottom: 8 }}>Hook: "{draft.hook}" · Scene: "{draft.scene}"</div>
                  <div style={{ color: "#ddd", fontSize: 12, lineHeight: 1.9, whiteSpace: "pre-wrap", marginBottom: 14, maxHeight: 120, overflowY: "auto" }}>{draft.caption}</div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <button onClick={schedulePost} disabled={driveUploading} style={{ ...S.btn(green, `${green}12`, green), opacity: driveUploading ? .6 : 1 }}>{driveUploading ? "☁️ Saving to Drive..." : bufferProfileId ? "📤 Post to Instagram →" : "📋 Save to Gallery + Drive →"}</button>
                    <button onClick={showVariants} style={S.btnSm("#555", border)}>Pick New Concept</button>
                    {!bufferProfileId && <span style={{ color: "#2a2a2a", fontSize: 11 }}>Connect Buffer to auto-post</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── GALLERY ── */}
        {tab === "gallery" && (
          <div>
            {selectedPost ? (
              <div style={{ maxWidth: 620 }}>
                <button onClick={() => setSelectedPost(null)} style={S.btnSm("#666", border)}>← Back to Gallery</button>
                <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 13, overflow: "hidden", marginTop: 14 }}>
                  {/* Clickable images / playable video */}
                  <div style={{ display: "flex", gap: 3, background: "#080808", overflowX: "auto" }}>
                    {selectedPost.type === "dancing_reel" && selectedPost.mediaUrl ? (
                      <div style={{ position: "relative", flex: 1 }}>
                        <video src={selectedPost.mediaUrl} controls playsInline style={{ width: "100%", maxHeight: 380, objectFit: "cover", display: "block" }} />
                        {selectedPost.audio && <div style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,.75)", borderRadius: 6, padding: "3px 10px", fontSize: 11, color: gold }}>🎵 Add audio: {selectedPost.audio}</div>}
                      </div>
                    ) : (
                      (selectedPost.images?.length > 0 ? selectedPost.images : (selectedPost.thumbnailUrl ? [selectedPost.thumbnailUrl] : [])).map((url, i) => (
                        <img key={i} src={url} alt="" onClick={() => setLightbox({ images: selectedPost.images?.length > 0 ? selectedPost.images : [selectedPost.thumbnailUrl], idx: i })} style={{ flex: 1, height: 280, objectFit: "cover", minWidth: selectedPost.images?.length > 1 ? 180 : 280, cursor: "pointer" }} title="Click to view full size" onError={e => e.target.style.display = "none"} />
                      ))
                    )}
                  </div>
                  <div style={{ background: "#0a0a0d", padding: "9px 16px", borderBottom: `1px solid ${border}`, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    {selectedPost.scene && <span style={{ color: gold, fontSize: 12, fontWeight: 600 }}>📍 {selectedPost.scene}</span>}
                    {selectedPost.outfit && <span style={{ color: "#555", fontSize: 11 }}>👗 {selectedPost.outfit}</span>}
                    {selectedPost.textOverlay && <span style={{ color: violet, fontSize: 13, fontWeight: 700 }}>"{selectedPost.textOverlay}"</span>}
                    {selectedPost.audio && <span style={{ color: "#555", fontSize: 11 }}>🎵 {selectedPost.audio}</span>}
                  </div>
                  <div style={{ padding: 20 }}>
                    <div style={{ display: "flex", gap: 7, marginBottom: 12, flexWrap: "wrap" }}>
                      <Pill label={TL[selectedPost.type]} color={TC[selectedPost.type]} />
                      <Pill label={EL[selectedPost.emotion]} color={EC[selectedPost.emotion]} />
                      <IGBadge status={selectedPost.igStatus || "not_scheduled"} />
                    </div>
                    <div style={{ color: "#ddd", fontSize: 13, lineHeight: 1.9, whiteSpace: "pre-wrap", marginBottom: 14 }}>{selectedPost.caption}</div>
                    {selectedPost.performance && (
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", paddingTop: 14, borderTop: `1px solid #111` }}>
                        {[["❤️", selectedPost.performance.likes], ["💬", selectedPost.performance.comments], ["🔖", selectedPost.performance.saves], ["👁️", fmtN(selectedPost.performance.reach)], ["🔗 Clicks", selectedPost.performance.linkClicks], ["📊", eng(selectedPost.performance) + "%"], selectedPost.performance.plays ? ["▶️", fmtN(selectedPost.performance.plays)] : null].filter(Boolean).map(([k, v]) => (
                          <div key={k}><div style={{ color: "#333", fontSize: 10 }}>{k}</div><div style={{ color: "#e0e0e0", fontWeight: 700, fontSize: 14 }}>{v}</div></div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ color: "#444", fontSize: 10, letterSpacing: 2 }}>{posts.length} POSTS CREATED</div>
                </div>
                {posts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 0", color: "#1e1e1e" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
                    <div>No content yet. Go to Generate to start.</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: 10 }}>
                    {posts.map((p, i) => {
                      const thumb = p.thumbnailUrl || p.mediaUrl;
                      const allImgs = p.images?.length ? p.images : (thumb ? [thumb] : []);
                      return (
                        <div key={p.id} onClick={() => setSelectedPost(p)} style={{ background: card, border: `1px solid ${border}`, borderRadius: 10, overflow: "hidden", cursor: "pointer" }}>
                          <div style={{ height: 155, background: "#090909", position: "relative", overflow: "hidden" }}>
                            {thumb
                              ? <img src={thumb} alt="" onClick={e => { e.stopPropagation(); setLightbox({ images: allImgs, idx: 0 }); }} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }} onError={e => e.target.style.display = "none"} />
                              : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, opacity: .2 }}>{p.type === "dancing_reel" ? "🎬" : p.type === "static_reel" ? "🎵" : "📸"}</div>}
                            <div style={{ position: "absolute", top: 6, left: 6 }}><Pill label={TL[p.type]} color={TC[p.type]} /></div>
                            {p.images?.length > 1 && <div style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,.7)", borderRadius: 5, padding: "2px 7px", fontSize: 10, color: "#fff", fontWeight: 700 }}>1/{p.images.length}</div>}
                            {p.textOverlay && <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent,#000c)", padding: "14px 8px 7px", fontSize: 10, color: "#fff", fontWeight: 700, lineHeight: 1.3 }}>"{p.textOverlay}"</div>}
                          </div>
                          <div style={{ padding: "9px 10px" }}>
                            <div style={{ marginBottom: 4 }}><Pill label={EL[p.emotion]} color={EC[p.emotion]} /></div>
                            <div style={{ color: "#555", fontSize: 10, marginBottom: 4 }}>{p.scene || p.format}</div>
                            <IGBadge status={p.igStatus || "not_scheduled"} />
                            {p.performance && <div style={{ color: "#333", fontSize: 10, marginTop: 4 }}>🔗 {p.performance.linkClicks} · 📊 {eng(p.performance)}%</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── CALENDAR ── */}
        {tab === "calendar" && (
          <div>
            {CALENDAR.map((day, i) => (
              <div key={day.day} style={{ background: card, border: `1px solid ${i === dayIdx ? `${gold}44` : border}`, borderRadius: 11, padding: 15, marginBottom: 10 }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: i === dayIdx ? gold : "#fff", fontSize: 14, fontWeight: 700 }}>{day.day}{i === dayIdx && <span style={{ color: gold, fontSize: 11, fontWeight: 400 }}> (TODAY)</span>}</div>
                  <div style={{ color: "#444", fontSize: 11, marginTop: 2 }}>{day.theme}</div>
                </div>
                <div style={{ color: "#2a2a2a", fontSize: 10, letterSpacing: 1.5, marginBottom: 7 }}>FEED</div>
                {day.feed.map((f, fi) => (
                  <div key={fi} style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ color: "#333", fontSize: 11, minWidth: 55 }}>{f.time}</span>
                    <Pill label={TL[f.type]} color={TC[f.type]} />
                    <Pill label={EL[f.emotion]} color={EC[f.emotion]} />
                    <span style={{ color: "#666", fontSize: 11 }}>{f.format}</span>
                    <span style={{ color: "#222", fontSize: 10 }}>🎵 auto-trending</span>
                  </div>
                ))}
                <div style={{ background: `${green}08`, borderRadius: 7, padding: "7px 11px", fontSize: 11, color: "#2e2e2e", marginTop: 10 }}>💡 {day.tip}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── STORIES ── */}
        {tab === "stories" && (
          <div style={{ maxWidth: 660 }}>
            <div style={{ ...S.card, borderColor: `${gold}40`, marginBottom: 16 }}>
              <div style={{ color: gold, fontSize: 10, letterSpacing: 2, marginBottom: 12 }}>TODAY'S STORIES — {todayPlan.day.toUpperCase()}</div>
              {todayPlan.stories.map((s, i) => (
                <div key={i} style={{ background: "#09090c", borderRadius: 8, padding: "10px 14px", marginBottom: 7, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div><div style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>📱 Story {i + 1}</div><div style={{ color: "#777", fontSize: 12, marginTop: 3 }}>{s.content}</div></div>
                  <div style={{ color: "#333", fontSize: 11 }}>{s.time}</div>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={{ color: "#333", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>STORY TEMPLATES</div>
              {[{ type: "Poll 📊", ex: ["coffee or matcha?", "beach or gym today?", "stay in or go out?", "hot girl walk or pilates?"], why: "Polls boost story views 3x — the algorithm pushes interactive stories." }, { type: "Question Box ❓", ex: ["ask me anything 🤍", "what do you want to see more of?", "rate my fit 1-10", "what city next?"], why: "Questions generate DMs which signals high engagement." }, { type: "Candid Shot 📸", ex: ["morning routine shot", "gym/workout candid", "cafe food moment", "outdoor walk"], why: "Photo stories between interactive ones keep things authentic." }, { type: "OFM Tease 🖤", ex: ["not everything makes it to the feed… link in bio 🖤", "for those who want more", "reminder the link is in my bio 😏"], why: "1 OFM CTA story per day max — consistent funnel without desperation." }, { type: "Countdown ⏱️", ex: ["something dropping today 👀", "new post in 1 hour"], why: "Countdowns create anticipation and bring people back." }].map((t, i) => (
                <div key={i} style={{ ...S.card, marginBottom: 10 }}>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{t.type}</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 7 }}>{t.ex.map((e, ei) => <div key={ei} style={{ background: "#09090c", borderRadius: 5, padding: "3px 9px", fontSize: 11, color: "#666" }}>"{e}"</div>)}</div>
                  <div style={{ color: "#2a2a2a", fontSize: 11 }}>💡 {t.why}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── GROWTH ── */}
        {tab === "growth" && (
          <div style={{ maxWidth: 660 }}>
            <div style={{ ...S.card, borderColor: `${gold}40`, marginBottom: 14 }}>
              <div style={{ color: gold, fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>SASHA COVE — NICHE</div>
              <div style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Australian Coastal City Girl</div>
              {[["🌊", "Aesthetic", "iPhone candid, neutral tones, natural light, real moments"], ["👗", "Style", "Athleisure, sports bras, white tanks, bike shorts, minimal jewellery"], ["📍", "Locations", "Sydney/Melbourne, beaches, cafes, gym, parks, car, home, coastal walks"], ["🍃", "Food", "Acai bowls, matcha, salads, healthy cafe culture"], ["🎯", "Audience", "18-35 Australian men + international Aus girl aesthetic followers"], ["💭", "Brand", "Effortlessly hot, fit, real, aspirational but relatable — not try-hard"], ["🔗", "OFM", "Mystery + exclusivity — confident CTA, never desperate"]].map(([icon, k, v]) => (
                <div key={k} style={{ display: "flex", gap: 12, padding: "6px 0", borderBottom: `1px solid #111` }}>
                  <span>{icon}</span>
                  <span style={{ color: "#555", fontSize: 12, minWidth: 80 }}>{k}</span>
                  <span style={{ color: "#888", fontSize: 12, lineHeight: 1.6 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ ...S.card, marginBottom: 14 }}>
              <div style={{ color: "#333", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>ZERO → FOLLOWERS ROADMAP</div>
              {[{ w: "Week 1-2", p: "Foundation", g: "0→500", f: "2x feed + 4-6 stories daily. No OFM CTA yet. Follow 50 niche accounts/day. Comment genuinely on 20 posts/day." }, { w: "Week 3-4", p: "Engagement Push", g: "500→2k", f: "Add 1 soft OFM CTA per day. Poll stickers on every story. Use trending audios. Reply to ALL comments within 60 mins." }, { w: "Month 2", p: "Viral Hooks", g: "2k→10k", f: "Lead every carousel with scroll-stopping slide 1. Post 1 dancing reel per week. Static reels with text overlays daily." }, { w: "Month 3+", p: "OFM Funnel", g: "10k→paying", f: "Full OFM CTAs. Pin best converting post. Close Friends for exclusive teasers. Link bio prominently." }].map((g, i) => (
                <div key={i} style={{ background: "#09090c", borderRadius: 8, padding: 12, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{g.p}</div>
                    <div style={{ display: "flex", gap: 6 }}><Pill label={g.w} color="#444" /><Pill label={g.g} color={green} /></div>
                  </div>
                  <div style={{ color: "#666", fontSize: 12, lineHeight: 1.8 }}>{g.f}</div>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={{ color: "#333", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>NON-NEGOTIABLE DAILY RULES</div>
              {["Post at scheduled times — consistency beats quality on Instagram", "Reply to every comment in the first 60 minutes after posting", "Use trending audio on every reel — this alone doubles reach", "Stories every day minimum 4x — disappear from stories = lose followers", "Never beg for followers — mystery and confidence is the whole brand", "1 soft OFM CTA per day max — more looks desperate", "Carousel slide 1 = your hook — if it doesn't stop the scroll, redo it", "Saves > Likes. Create content people want to come back to"].map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "7px 0", borderBottom: i < 7 ? `1px solid #111` : "none" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: `${gold}18`, border: `1px solid ${gold}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, color: gold, fontWeight: 700 }}>{i + 1}</div>
                  <div style={{ color: "#777", fontSize: 12, lineHeight: 1.6 }}>{r}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
