import type { Locale } from "@/lib/i18n/config";

export const topicCategories = ["school", "animals", "games", "food", "nature", "technology"] as const;
export type TopicCategory = (typeof topicCategories)[number];

type Localized<T> = Record<Locale, T>;

export interface SampleTopic {
  id: string;
  category: TopicCategory;
  emoji: string;
  /** The debate question, shown on the tile and used as the debate topic. */
  question: Localized<string>;
  agree: Localized<string>;
  disagree: Localized<string>;
  /** Model opening points, shown on the sample-topics page. */
  sample: Localized<{ agree: string[]; disagree: string[] }>;
}

export const sampleTopics: SampleTopic[] = [
  {
    id: "uniforms",
    category: "school",
    emoji: "🏫",
    question: { en: "Should we wear uniforms?", hi: "क्या हमें वर्दी पहननी चाहिए?" },
    agree: { en: "Everyone should wear a uniform", hi: "सबको वर्दी पहननी चाहिए" },
    disagree: { en: "We should wear our own clothes", hi: "हमें अपने कपड़े पहनने चाहिए" },
    sample: {
      en: {
        agree: [
          "Uniforms make everyone look equal, so nobody is teased about clothes.",
          "They save time in the morning because you do not need to choose what to wear.",
        ],
        disagree: [
          "Choosing our own clothes lets us show who we are.",
          "Uniforms cost money, and some families find that hard.",
        ],
      },
      hi: {
        agree: [
          "वर्दी सबको बराबर दिखाती है, इसलिए कपड़ों पर कोई किसी का मज़ाक नहीं उड़ाता।",
          "सुबह समय बचता है क्योंकि क्या पहनें यह सोचना नहीं पड़ता।",
        ],
        disagree: [
          "अपने कपड़े चुनने से हम दिखा सकते हैं कि हम कौन हैं।",
          "वर्दी पर पैसे लगते हैं और कुछ परिवारों के लिए यह मुश्किल होता है।",
        ],
      },
    },
  },
  {
    id: "pets",
    category: "animals",
    emoji: "🐶",
    question: { en: "Should pets be allowed at school?", hi: "क्या स्कूल में पालतू जानवर आने चाहिए?" },
    agree: { en: "Pets should come to school", hi: "पालतू जानवर स्कूल आने चाहिए" },
    disagree: { en: "Pets should stay home", hi: "पालतू जानवर घर पर रहने चाहिए" },
    sample: {
      en: {
        agree: [
          "Pets make kids feel calm, so they can learn better.",
          "Reading to a dog can help children read with more confidence.",
        ],
        disagree: [
          "Some kids are scared of animals or allergic to them.",
          "Animals could make a mess and make it hard to focus.",
        ],
      },
      hi: {
        agree: [
          "पालतू जानवर बच्चों को शांत महसूस कराते हैं, इसलिए वे बेहतर सीख पाते हैं।",
          "कुत्ते को पढ़कर सुनाने से बच्चे ज़्यादा आत्मविश्वास से पढ़ते हैं।",
        ],
        disagree: [
          "कुछ बच्चे जानवरों से डरते हैं या उन्हें एलर्जी होती है।",
          "जानवर गंदगी फैला सकते हैं और ध्यान लगाना मुश्किल हो सकता है।",
        ],
      },
    },
  },
  {
    id: "video-games",
    category: "games",
    emoji: "🎮",
    question: { en: "Is video gaming good for us?", hi: "क्या वीडियो गेम खेलना हमारे लिए अच्छा है?" },
    agree: { en: "Video games are good for us", hi: "वीडियो गेम हमारे लिए अच्छे हैं" },
    disagree: { en: "Video games are bad for us", hi: "वीडियो गेम हमारे लिए बुरे हैं" },
    sample: {
      en: {
        agree: [
          "Games can teach us to solve puzzles and think fast.",
          "Playing with friends online helps us work as a team.",
        ],
        disagree: [
          "Too much gaming hurts our eyes and our sleep.",
          "Time spent gaming is time we do not spend playing outside.",
        ],
      },
      hi: {
        agree: [
          "गेम हमें पहेलियाँ सुलझाना और जल्दी सोचना सिखा सकते हैं।",
          "दोस्तों के साथ खेलने से हम टीम में काम करना सीखते हैं।",
        ],
        disagree: [
          "ज़्यादा गेम खेलने से आँखों और नींद को नुकसान होता है।",
          "जो समय गेम में जाता है, वह बाहर खेलने में नहीं जाता।",
        ],
      },
    },
  },
  {
    id: "candy",
    category: "food",
    emoji: "🍕",
    question: { en: "Should schools sell candy?", hi: "क्या स्कूलों में टॉफ़ी बिकनी चाहिए?" },
    agree: { en: "Schools can sell candy", hi: "स्कूलों में टॉफ़ी बिक सकती है" },
    disagree: { en: "Schools should not sell candy", hi: "स्कूलों में टॉफ़ी नहीं बिकनी चाहिए" },
    sample: {
      en: {
        agree: [
          "A small treat can make a school day happier.",
          "Money from candy sales can help pay for school trips.",
        ],
        disagree: [
          "Too much sugar is bad for our teeth and our energy.",
          "Schools should help us choose healthy food, like fruit.",
        ],
      },
      hi: {
        agree: [
          "छोटी-सी मिठाई स्कूल के दिन को खुशनुमा बना सकती है।",
          "टॉफ़ी बिकने से मिले पैसे स्कूल की सैर में काम आ सकते हैं।",
        ],
        disagree: [
          "ज़्यादा चीनी दाँतों और ताकत के लिए ठीक नहीं है।",
          "स्कूलों को फल जैसा सेहतमंद खाना चुनने में हमारी मदद करनी चाहिए।",
        ],
      },
    },
  },
  {
    id: "plastic-bags",
    category: "nature",
    emoji: "🌳",
    question: { en: "Should we ban plastic bags?", hi: "क्या प्लास्टिक की थैलियों पर रोक लगनी चाहिए?" },
    agree: { en: "Plastic bags should be banned", hi: "प्लास्टिक की थैलियों पर रोक लगनी चाहिए" },
    disagree: { en: "Plastic bags should be allowed", hi: "प्लास्टिक की थैलियों की अनुमति रहनी चाहिए" },
    sample: {
      en: {
        agree: [
          "Plastic bags end up in rivers and hurt fish and birds.",
          "Cloth bags can be used again and again.",
        ],
        disagree: [
          "Plastic bags are cheap and many families depend on them.",
          "A sudden ban can be hard for small shops.",
        ],
      },
      hi: {
        agree: [
          "प्लास्टिक की थैलियाँ नदियों में पहुँचकर मछलियों और पक्षियों को नुकसान पहुँचाती हैं।",
          "कपड़े की थैलियाँ बार-बार इस्तेमाल हो सकती हैं।",
        ],
        disagree: [
          "प्लास्टिक की थैलियाँ सस्ती हैं और कई परिवार उन पर निर्भर हैं।",
          "अचानक रोक लगने से छोटी दुकानों को मुश्किल हो सकती है।",
        ],
      },
    },
  },
  {
    id: "tablets",
    category: "technology",
    emoji: "🤖",
    question: { en: "Do kids need tablets?", hi: "क्या बच्चों को टैबलेट चाहिए?" },
    agree: { en: "Kids need tablets", hi: "बच्चों को टैबलेट चाहिए" },
    disagree: { en: "Kids do not need tablets", hi: "बच्चों को टैबलेट नहीं चाहिए" },
    sample: {
      en: {
        agree: [
          "Tablets let us learn with videos, books and fun apps.",
          "Learning to use technology now helps us in the future.",
        ],
        disagree: [
          "Kids can learn well with books, pencils and talking to people.",
          "Too much screen time can make it hard to pay attention.",
        ],
      },
      hi: {
        agree: [
          "टैबलेट से हम वीडियो, किताबों और मज़ेदार ऐप से सीख सकते हैं।",
          "अभी तकनीक चलाना सीखना भविष्य में काम आता है।",
        ],
        disagree: [
          "बच्चे किताबों, पेंसिल और लोगों से बात करके भी अच्छा सीख सकते हैं।",
          "ज़्यादा स्क्रीन देखने से ध्यान लगाना मुश्किल हो सकता है।",
        ],
      },
    },
  },
];

export function getSampleTopic(id: string): SampleTopic | undefined {
  return sampleTopics.find((topic) => topic.id === id);
}

/** True when the text is exactly one of the curated (already vetted) questions, in any language. */
export function isCuratedTopic(text: string): boolean {
  const normalized = text.trim();
  return sampleTopics.some((topic) => Object.values(topic.question).includes(normalized));
}
