export interface AgroShopAd {
  id: string;
  nameHi: string;
  nameEn: string;
  taglineHi: string;
  locationHi: string;
  locationEn: string;
  phone: string;
  whatsapp: string;
  bannerColor: string;
  badge: string;
  featuredPesticides: {
    nameHi: string;
    brand: string;
    targetPest: string; // कीट / रोग
    category: 'कीटनाशक' | 'फफूंदनाशक' | 'टॉनिक' | 'खरपतवारनाशक';
    badge?: string;
  }[];
  services: string[];
}

export const AGRO_ADVERTISEMENTS: AgroShopAd[] = [
  {
    id: 'bhoomi-agro-surel',
    nameHi: 'भूमि एग्रो एजेंसी',
    nameEn: 'Bhoomi Agro Agency',
    taglineHi: 'सभी प्रकार के उत्तम कीटनाशक, फफूंदनाशक व खाद के विश्वसनीय विक्रेता',
    locationHi: 'ग्राम सुरेल, तहसील खाचरौद (Surel, Teh. Khachrod)',
    locationEn: 'Gram Surel, Teh. Khachrod',
    phone: '8959920373',
    whatsapp: '918959920373',
    bannerColor: 'from-emerald-800 to-teal-900',
    badge: 'प्रमाणित कृषि केंद्र • ग्राम सुरेल (खाचरौद)',
    featuredPesticides: [
      {
        nameHi: 'कोराजन (Coragen)',
        brand: 'FMC',
        targetPest: 'सोयाबीन, मक्का व चने की इल्ली (Caterpillar) का पक्का खात्मा',
        category: 'कीटनाशक',
        badge: 'बेस्ट सेलर'
      },
      {
        nameHi: 'पेगासस (Pegasus)',
        brand: 'Syngenta',
        targetPest: 'लहसुन व प्याज में थ्रिप्स व जलेबी रोग का रामबाण इलाज',
        category: 'कीटनाशक',
        badge: 'लहसुन स्पेशल'
      },
      {
        nameHi: 'नैटिवो (Nativo 75% WG)',
        brand: 'Bayer',
        targetPest: 'फसल में पत्ता पीलापन, फफूंद, ब्लाइट व पाउडरी मिल्ड्यू',
        category: 'फफूंदनाशक',
        badge: 'प्रीमियम'
      },
      {
        nameHi: 'एम्प्लीगो (Ampligo)',
        brand: 'Syngenta',
        targetPest: 'तना छेदक व फॉल आर्मीवर्म इल्ली का दोहरा नियंत्रण',
        category: 'कीटनाशक'
      },
      {
        nameHi: 'ओडिसी व निमार (Odyssey)',
        brand: 'BASF',
        targetPest: 'सोयाबीन व दलहन में चौड़ी व संकरी पत्ती खरपतवार का अंत',
        category: 'खरपतवारनाशक'
      },
      {
        nameHi: 'ह्यूमिक 98% व सागरीका',
        brand: 'IFFCO / Plant Care',
        targetPest: 'जड़ों की मजबूती, कंद का बड़ा आकार व भरपूर फुटाव',
        category: 'टॉनिक'
      }
    ],
    services: [
      '100% असली व पक्का जीएसटी बिल',
      'DAP, यूरिया, पोटाश व जिंक उचित सरकारी दर पर',
      'खेत अनुसार फसल बीमारी का मुफ्त विशेषज्ञ परामर्श'
    ]
  },
  {
    id: 'mali-krishi-kharsod',
    nameHi: 'माली कृषि सेवा केंद्र',
    nameEn: 'Mali Krishi Sewa Kendra',
    taglineHi: 'उच्च गुणवत्ता की कीटनाशक दवाएं, उन्नत प्रमाणित बीज व कृषि समाधान',
    locationHi: 'ग्राम खरसोद कलां, तहसील बड़नगर (Kharsod Kalan, Teh. Badnagar)',
    locationEn: 'Gram Kharsod Kalan, Teh. Badnagar',
    phone: '9893477848',
    whatsapp: '919893477848',
    bannerColor: 'from-blue-900 to-indigo-950',
    badge: 'अधिकृत कृषि केंद्र • ग्राम खरसोद कलां (बड़नगर)',
    featuredPesticides: [
      {
        nameHi: 'फेम (Fame - Flubendiamide)',
        brand: 'Bayer',
        targetPest: 'सभी प्रकार की हानिकारक इल्लियों पर तुरंत व लम्बा असर',
        category: 'कीटनाशक',
        badge: 'सुपर असरदार'
      },
      {
        nameHi: 'चेस (Chess 50% WG)',
        brand: 'Syngenta',
        targetPest: 'माहू, तेला व रस चूसक कीटों को 1 घंटे में बेअसर करे',
        category: 'कीटनाशक'
      },
      {
        nameHi: 'साफ़ (Saaf - Carbendazim + Mancozeb)',
        brand: 'UPL',
        targetPest: 'जड़ गलन, पत्ती धब्बा व कॉलर रॉट फफूंद से सुरक्षा',
        category: 'फफूंदनाशक',
        badge: 'किसान पसंद'
      },
      {
        nameHi: 'बेल्ट एक्सपर्ट (Belt Expert)',
        brand: 'Bayer',
        targetPest: 'गर्डल बीटल, सेमीलूपर व तना मक्खी से संपूर्ण रक्षा',
        category: 'कीटनाशक'
      },
      {
        nameHi: 'सल्फर 90% दानेदार (WDG)',
        brand: 'Fertisul / Swastik',
        targetPest: 'मिट्टी सुधार, पाले से बचाव व तिलहन में तेल % की वृद्धि',
        category: 'टॉनिक'
      },
      {
        nameHi: 'टैबुकोनाजोल 25.9%',
        brand: 'Folicur / Rallis',
        targetPest: 'लहसुन में पीलापन व पत्तियों का सूखना तुरंत रोके',
        category: 'फफूंदनाशक'
      }
    ],
    services: [
      'ब्रांडेड कंपनियों (Bayer, Syngenta, FMC, UPL) की सीधी सप्लाई',
      'उन्नत किस्म के रबी व खरीफ प्रमाणित बीज',
      'किसान भाइयों के लिए समय पर होम डिलीवरी व सहायता'
    ]
  }
];
