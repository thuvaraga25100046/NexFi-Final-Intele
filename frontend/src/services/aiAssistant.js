// Lower-case, Unicode-normalize and strip zero-width joiners (Sinhala keyboards add them in some conjuncts)
const normalize = (value) =>
    String(value || '')
        .normalize('NFC')
        .toLowerCase()
        .replace(/[\u200c\u200d]/g, '')
        .trim()

const hasAny = (text, words) => words.some((word) => text.includes(word))

const KEYWORDS = {
    afford: [
        'afford', 'purchase', 'can i buy', 'should i buy',
        'வாங்க', 'வாங்கலாமா', 'வாங்குவது', 'vanga mudiyuma', 'vaanga',
        'මිලදී', 'ගන්න පුළුවන්ද', 'දරන්න පුළුවන්ද', 'ganna puluwan', 'mila dee',
    ],
    forecast: [
        'forecast', 'predict', 'future', 'next 30', 'ahead', 'projection', 'month end', 'cash flow', 'cashflow',
        'முன்னறிவிப்பு', 'எதிர்காலம்', 'கணிப்பு', 'அடுத்த 30', 'பணப்புழக்க', 'munnarivippu', 'ethirkaalam',
        'පුරෝකථන', 'අනාගත', 'ප්‍රවාහ', 'purokathana', 'anagatha',
    ],
    shortage: [
        'shortage', 'run out', 'runout', 'short of', 'negative', 'risk', 'safe',
        'பற்றாக்குறை', 'தீர்ந்து', 'ஆபத்து', 'patrakkurai',
        'හිඟ', 'මුදල් ඉවර', 'අවදානම', 'hingaya', 'awadanama',
    ],
    overdue: [
        'overdue', 'late', 'delayed',
        'தாமத', 'காலாவதி', 'தவறிய', 'thamadham', 'thamatham',
        'ප්‍රමාද', 'කල් ඉකුත්', 'pramada', 'kal ikuth',
    ],
    upcoming: [
        'upcoming', 'due soon', 'due date', 'what is due', "what's due",
        'வரவிருக்கும்', 'காலக்கெடு', 'கடைசி தேதி', 'varavirukkum',
        'ඉදිරියේ', 'නියමිත දිනය', 'idiriye',
    ],
    payables: [
        'payable', 'bill', 'vendor', 'supplier', 'i owe', 'to pay',
        'செலுத்த', 'கொடுப்பனவு', 'பில்', 'seluthanum', 'seluthavendiya',
        'ගෙවිය යුතු', 'බිල්පත්', 'සැපයුම්කරු', 'geviya yuthu',
    ],
    receivables: [
        'receivable', 'owe me', 'owed', 'invoice', 'customer', 'collect', 'unpaid',
        'பெறவேண்டி', 'வரவுகள்', 'வாடிக்கையாளர்', 'விலைப்பட்டியல்', 'peravendiya',
        'ලැබිය යුතු', 'ඉන්වොයිස', 'පාරිභෝගික', 'labiya yuthu',
    ],
    category: [
        'category', 'categories', 'biggest', 'top expense', 'most spend', 'where am i spending', 'where do i spend',
        'வகை', 'அதிக செலவு',
        'ප්‍රවර්ග', 'වර්ගය', 'වැඩිම වියදම',
    ],
    expenses: [
        'expense', 'spend', 'spent', 'spending', 'cost', 'outflow', 'selavu',
        'செலவு',
        'වියදම', 'wiyadam', 'wiyadama',
    ],
    income: [
        'income', 'earn', 'revenue', 'inflow', 'sales', 'varumanam',
        'வருமான', 'வருவாய்',
        'ආදායම', 'adayama', 'adaayam',
    ],
    balance: [
        'balance', 'cash', 'how much money', 'how much do i have', 'evlo', 'evvalavu',
        'இருப்பு', 'பணம்', 'மீதி', 'iruppu', 'panam',
        'ශේෂය', 'මුදල්', 'ඉතිරි', 'කීයද', 'sheshaya', 'keeyada',
    ],
    health: [
        'health', 'score', 'rating',
        'ஆரோக்கிய', 'மதிப்பெண்',
        'සෞඛ්‍ය', 'ලකුණු',
    ],
    recent: [
        'recent', 'latest', 'last transaction', 'transactions', 'activity', 'history',
        'சமீபத்திய', 'பரிவர்த்தனை', 'கடைசி',
        'මෑත', 'ගනුදෙනු', 'ganudenu',
    ],
    tips: [
        'tip', 'advice', 'suggest', 'improve', 'recommend', 'save money', 'what should i do',
        'ஆலோசனை', 'பரிந்துரை', 'டிப்ஸ்',
        'උපදෙස්', 'නිර්දේශ',
    ],
    help: [
        'help', 'what can you', 'options', 'menu',
        'உதவி',
        'උදව්', 'උපකාර',
    ],
    thanks: [
        'thanks', 'thank you', 'thx', 'நன்றி', 'nandri', 'ස්තූතියි', 'ස්තුතියි', 'sthuthi',
    ],
}

const KW = Object.fromEntries(
    Object.entries(KEYWORDS).map(([name, words]) => [name, words.map(normalize)]),
)

const GREETING_PATTERN = /^(hi+|hello|hey|vanakkam|ayubowan|good (morning|afternoon|evening))\b/
const GREETING_PREFIXES = ['வணக்கம்', 'ஹலோ', 'ஹாய்', 'ආයුබෝවන්', 'හෙලෝ', 'හායි'].map(normalize)
const PERIOD_PATTERN = /\d+\s*(day|days|week|weeks|month|months|நாள்|நாட்கள்|வாரம்|மாதம்|දින|සති|මාස)/

const MULTIPLIERS = {
    k: 1e3,
    thousand: 1e3,
    m: 1e6,
    million: 1e6,
    lakh: 1e5,
    lakhs: 1e5,
    ஆயிரம்: 1e3,
    லட்சம்: 1e5,
    இலட்சம்: 1e5,
    மில்லியன்: 1e6,
    දහස: 1e3,
    දහස්: 1e3,
    ලක්ෂ: 1e5,
    ලක්ෂයක්: 1e5,
    මිලියන: 1e6,
}

const AMOUNT_PATTERN =
    /(\d[\d,]*(?:\.\d+)?)\s*(lakhs?|million|thousand|k(?![a-z])|m(?![a-z])|ஆயிரம்|லட்சம்|இலட்சம்|மில்லியன்|දහස්|දහස|ලක්ෂයක්|ලක්ෂ|මිලියන)?/i

const sum = (list) => list.reduce((total, item) => total + Number(item.amount || 0), 0)

function parseAmount(text) {
    const match = text.match(AMOUNT_PATTERN)
    if (!match) return null
    const value = Number(match[1].replace(/,/g, ''))
    if (!Number.isFinite(value) || value <= 0) return null
    return value * (MULTIPLIERS[normalize(match[2])] || 1)
}

function pending(list) {
    return list.filter((item) => item.status !== 'paid')
}

function splitOverdue(list, today) {
    const open = pending(list).sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)))
    const overdue = open.filter((item) => item.status === 'overdue' || String(item.dueDate) < today)
    const upcoming = open.filter((item) => !overdue.includes(item))
    return { open, overdue, upcoming }
}

function pickLanguage(text, appLanguage) {
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'
    if (/[\u0D80-\u0DFF]/.test(text)) return 'si'
    return MESSAGES[appLanguage] ? appLanguage : 'en'
}

// ---------------------------------------------------------------------------------------------
// Reply wording per language
// ---------------------------------------------------------------------------------------------

const plural = (count, one, many) => (count === 1 ? one : many)

const MESSAGES = {
    en: {
        hello: "Hi! 👋 I'm NexFi AI. Ask me about your balance, forecast, receivables, payables, or whether you can afford a purchase.",
        thanks: "You're welcome! Ask me anything else about your cash flow.",
        help: 'I can answer from your own data:\n• Balance, income and expenses\n• Cash flow forecast and shortage risk\n• Receivables, payables and overdue items\n• Biggest expense categories\n• "Can I afford 50,000?"\n• Recent transactions and tips',
        unknown: 'I\'m not sure about that yet. Try asking about your balance, forecast, overdue invoices, upcoming bills, expenses, or "Can I afford 25,000?".',
        noData: "You don't have any records yet. Add a transaction, receivable or payable (or set your base capital) and I'll start tracking your cash flow.",
        unnamed: 'Unnamed',
        unknownDate: 'an unknown date',
        item: (name, amount, date) => `• ${name}: ${amount} (due ${date})`,
        severity: {},
        balance: (bal, inc, exp) => `Your current cash balance is ${bal}.\nTotal income recorded: ${inc} · Total expenses: ${exp}.`,
        noIncome: 'No income has been recorded yet. Add an income transaction and I can track it for you.',
        income: (total, count, inflow) =>
            `Total income recorded: ${total}${count ? ` across ${count} transaction${plural(count, '', 's')}` : ''}.` +
            (inflow ? `\nExpected inflow over the forecast period: ${inflow}.` : ''),
        noExpenses: 'No expenses have been recorded yet.',
        expenses: (total, count, outflow) =>
            `Total expenses recorded: ${total}${count ? ` across ${count} transaction${plural(count, '', 's')}` : ''}.` +
            (outflow ? `\nExpected outflow over the forecast period: ${outflow}.` : ''),
        noCategory: 'No expenses have been recorded yet, so there is no category breakdown to show.',
        categoryHead: 'Your biggest expense categories:',
        noForecast: "A forecast isn't available yet. Add a few records and I'll project your cash flow.",
        forecast: (days, inflow, outflow, lastDate, lastBal, low, lowDate) =>
            `Over the next ${days} days I expect ${inflow} in and ${outflow} out.\nProjected balance on ${lastDate}: ${lastBal}.\nLowest point: ${low} on ${lowDate}.`,
        shortage: (amount, date, days, sev) =>
            `⚠️ A cash shortage of ${amount} is expected on ${date} (in ${days} day${plural(days, '', 's')}, severity ${sev}).`,
        noShortage: (date) => `✅ No cash shortage is forecast through ${date}.`,
        noReceivables: 'No receivables are pending. Nobody owes you anything right now.',
        receivablesHead: (total, n) => `You're waiting on ${total} across ${n} invoice${plural(n, '', 's')}.`,
        overdueHead: (n, total) => `⏰ ${n} overdue (${total}):`,
        nextDue: 'Next due:',
        noPayables: 'No payables are pending. You have no bills to pay right now.',
        payablesHead: (total, n) => `You owe ${total} across ${n} bill${plural(n, '', 's')}.`,
        nothingOverdue: '✅ Nothing is overdue. Your receivables and payables are on schedule.',
        customersOverdue: (total) => `Customers overdue (${total}):`,
        billsOverdue: (total) => `Bills overdue (${total}):`,
        affordAsk: 'Tell me the amount and I\'ll check it against your forecast. For example: "Can I afford 50,000?"',
        baseForecast: 'your lowest projected balance',
        baseBalance: 'your balance',
        affordTooMuch: (amt, bal, base, after) =>
            `${amt} is more than your current cash balance of ${bal}. After it, ${base} would be ${after}, so I'd hold off unless more money comes in first.`,
        affordYes: (amt, base, after) => `Yes, it looks affordable. After spending ${amt}, ${base} would still be ${after}.`,
        affordRisky: (amt, base, after) => `That would be risky. After spending ${amt}, ${base} would drop to ${after}.`,
        healthNone: 'Your health score is 0/100 because there is no activity yet. Add income and set your base capital to get a score.',
        moods: { strong: 'a strong position', stable: 'a stable position', improve: 'room to improve' },
        health: (score, mood) =>
            `Your financial health score is ${score}/100, which shows ${mood}.\nIt reflects your cash balance and income activity. Keeping a positive balance and recording regular income raises it.`,
        noRecent: 'No transactions yet. Use "Add Transaction" to record your first one.',
        recentHead: 'Your latest transactions:',
        transaction: 'Transaction',
        tipsHead: 'Here is what I suggest:',
        tipShortage: 'A shortage is forecast: delay non-essential payments and follow up on pending receivables.',
        tipOverdueRec: (n, total) => `Follow up on ${n} overdue invoice${plural(n, '', 's')} worth ${total}.`,
        tipOverduePay: (n) => `Settle ${n} overdue bill${plural(n, '', 's')} to avoid penalties.`,
        tipExpenseHigh: 'Expenses are above 80% of your income. Look at your biggest expense categories.',
        tipDefault: ['Keep recording income and expenses so the forecast stays accurate.', 'Review upcoming bills weekly to avoid surprises.'],
    },

    ta: {
        hello: 'வணக்கம்! 👋 நான் NexFi AI. உங்கள் பண இருப்பு, பணப்புழக்க முன்னறிவிப்பு, பெறவேண்டியவை, செலுத்தவேண்டியவை அல்லது ஒரு பொருளை வாங்க முடியுமா என்று கேளுங்கள்.',
        thanks: 'நன்றி! உங்கள் பணப்புழக்கம் பற்றி வேறு ஏதாவது கேட்கலாம்.',
        help: 'உங்கள் தரவுகளின் அடிப்படையில் நான் பதிலளிப்பேன்:\n• பண இருப்பு, வருமானம், செலவுகள்\n• பணப்புழக்க முன்னறிவிப்பு மற்றும் பற்றாக்குறை அபாயம்\n• பெறவேண்டியவை, செலுத்தவேண்டியவை, தாமதமானவை\n• அதிக செலவு வகைகள்\n• "50,000 வாங்க முடியுமா?"\n• சமீபத்திய பரிவர்த்தனைகள் மற்றும் ஆலோசனைகள்',
        unknown: 'இது எனக்கு இன்னும் புரியவில்லை. உங்கள் பண இருப்பு, முன்னறிவிப்பு, தாமதமான விலைப்பட்டியல்கள், வரவிருக்கும் பில்கள், செலவுகள் அல்லது "25,000 வாங்க முடியுமா?" என்று கேட்டுப் பாருங்கள்.',
        noData: 'உங்களிடம் இன்னும் பதிவுகள் எதுவும் இல்லை. ஒரு பரிவர்த்தனை, பெறவேண்டியது அல்லது செலுத்தவேண்டியதைச் சேர்த்தால் உங்கள் பணப்புழக்கத்தைக் கண்காணிக்கத் தொடங்குவேன்.',
        unnamed: 'பெயரில்லை',
        unknownDate: 'தெரியாத தேதி',
        item: (name, amount, date) => `• ${name}: ${amount} (காலக்கெடு ${date})`,
        severity: { low: 'குறைவு', medium: 'மிதமானது', high: 'அதிகம்', critical: 'மிக அதிகம்' },
        balance: (bal, inc, exp) => `உங்கள் தற்போதைய பண இருப்பு ${bal}.\nபதிவான மொத்த வருமானம்: ${inc} · மொத்த செலவுகள்: ${exp}.`,
        noIncome: 'இன்னும் வருமானம் எதுவும் பதிவாகவில்லை. ஒரு வருமான பரிவர்த்தனையைச் சேர்த்தால் அதைக் கண்காணிப்பேன்.',
        income: (total, count, inflow) =>
            `பதிவான மொத்த வருமானம்: ${total}${count ? ` (${count} பரிவர்த்தனைகள்)` : ''}.` +
            (inflow ? `\nமுன்னறிவிப்புக் காலத்தில் எதிர்பார்க்கும் வரவு: ${inflow}.` : ''),
        noExpenses: 'இன்னும் செலவுகள் எதுவும் பதிவாகவில்லை.',
        expenses: (total, count, outflow) =>
            `பதிவான மொத்த செலவுகள்: ${total}${count ? ` (${count} பரிவர்த்தனைகள்)` : ''}.` +
            (outflow ? `\nமுன்னறிவிப்புக் காலத்தில் எதிர்பார்க்கும் செலவு: ${outflow}.` : ''),
        noCategory: 'இன்னும் செலவுகள் பதிவாகவில்லை, எனவே வகைப் பிரிவைக் காட்ட இயலாது.',
        categoryHead: 'உங்கள் அதிக செலவு வகைகள்:',
        noForecast: 'முன்னறிவிப்பு இன்னும் கிடைக்கவில்லை. சில பதிவுகளைச் சேர்த்தால் உங்கள் பணப்புழக்கத்தைக் கணிப்பேன்.',
        forecast: (days, inflow, outflow, lastDate, lastBal, low, lowDate) =>
            `அடுத்த ${days} நாட்களில் ${inflow} வரவும் ${outflow} செலவும் எதிர்பார்க்கிறேன்.\n${lastDate} அன்று கணிக்கப்பட்ட இருப்பு: ${lastBal}.\nகுறைந்த இருப்பு: ${low} (${lowDate}).`,
        shortage: (amount, date, days, sev) =>
            `⚠️ ${date} அன்று (${days} நாட்களில், தீவிரம்: ${sev}) ${amount} பணப் பற்றாக்குறை எதிர்பார்க்கப்படுகிறது.`,
        noShortage: (date) => `✅ ${date} வரை பணப் பற்றாக்குறை எதிர்பார்க்கப்படவில்லை.`,
        noReceivables: 'நிலுவையில் பெறவேண்டியவை எதுவும் இல்லை. தற்போது யாரும் உங்களுக்குப் பணம் தர வேண்டியதில்லை.',
        receivablesHead: (total, n) => `${n} விலைப்பட்டியல்கள் மூலம் ${total} உங்களுக்கு வர வேண்டியுள்ளது.`,
        overdueHead: (n, total) => `⏰ ${n} தாமதம் (${total}):`,
        nextDue: 'அடுத்து காலக்கெடு:',
        noPayables: 'நிலுவையில் செலுத்தவேண்டியவை எதுவும் இல்லை. இப்போது செலுத்த வேண்டிய பில்கள் இல்லை.',
        payablesHead: (total, n) => `${n} பில்கள் மூலம் ${total} நீங்கள் செலுத்த வேண்டியுள்ளது.`,
        nothingOverdue: '✅ எதுவும் தாமதமாகவில்லை. உங்கள் பெறவேண்டியவை மற்றும் செலுத்தவேண்டியவை திட்டப்படி உள்ளன.',
        customersOverdue: (total) => `தாமதமான வாடிக்கையாளர் தொகைகள் (${total}):`,
        billsOverdue: (total) => `தாமதமான பில்கள் (${total}):`,
        affordAsk: 'தொகையைச் சொல்லுங்கள், உங்கள் முன்னறிவிப்புடன் ஒப்பிட்டுப் பார்க்கிறேன். எ.கா: "50,000 வாங்க முடியுமா?"',
        baseForecast: 'உங்கள் குறைந்தபட்ச கணிக்கப்பட்ட இருப்பு',
        baseBalance: 'உங்கள் இருப்பு',
        affordTooMuch: (amt, bal, base, after) =>
            `${amt} உங்கள் தற்போதைய பண இருப்பான ${bal}-ஐ விட அதிகம். இதைச் செலவழித்தால் ${base} ${after} ஆகும்; எனவே மேலும் பணம் வரும் வரை காத்திருக்கப் பரிந்துரைக்கிறேன்.`,
        affordYes: (amt, base, after) => `ஆம், வாங்க முடியும். ${amt} செலவழித்த பின்னும் ${base} ${after} ஆக இருக்கும்.`,
        affordRisky: (amt, base, after) => `இது ஆபத்தானது. ${amt} செலவழித்தால் ${base} ${after} ஆகக் குறையும்.`,
        healthNone: 'செயல்பாடுகள் இல்லாததால் உங்கள் நிதி ஆரோக்கிய மதிப்பெண் 0/100. வருமானத்தைச் சேர்த்து அடிப்படை மூலதனத்தை அமைத்தால் மதிப்பெண் கிடைக்கும்.',
        moods: { strong: 'நிலை வலுவாக உள்ளது', stable: 'நிலை சீராக உள்ளது', improve: 'மேம்படுத்த இடமுள்ளது' },
        health: (score, mood) =>
            `உங்கள் நிதி ஆரோக்கிய மதிப்பெண் ${score}/100. இது ${mood} என்பதைக் காட்டுகிறது.\nஇது உங்கள் பண இருப்பு மற்றும் வருமானச் செயல்பாட்டைப் பிரதிபலிக்கிறது. நேர்மறை இருப்பைப் பராமரித்து, தொடர்ந்து வருமானத்தைப் பதிவு செய்தால் மதிப்பெண் உயரும்.`,
        noRecent: 'இன்னும் பரிவர்த்தனைகள் இல்லை. "பரிவர்த்தனை சேர்" மூலம் உங்கள் முதல் பதிவைச் சேர்க்கவும்.',
        recentHead: 'உங்கள் சமீபத்திய பரிவர்த்தனைகள்:',
        transaction: 'பரிவர்த்தனை',
        tipsHead: 'நான் பரிந்துரைப்பது:',
        tipShortage: 'பற்றாக்குறை எதிர்பார்க்கப்படுகிறது: அத்தியாவசியமற்ற கொடுப்பனவுகளைத் தாமதப்படுத்தி, நிலுவையிலுள்ள பெறவேண்டியவற்றைப் பின்தொடருங்கள்.',
        tipOverdueRec: (n, total) => `${total} மதிப்புள்ள ${n} தாமதமான விலைப்பட்டியல்களைப் பின்தொடருங்கள்.`,
        tipOverduePay: (n) => `அபராதத்தைத் தவிர்க்க ${n} தாமதமான பில்களைச் செலுத்துங்கள்.`,
        tipExpenseHigh: 'செலவுகள் உங்கள் வருமானத்தின் 80%-ஐ விட அதிகம். அதிக செலவு வகைகளைப் பாருங்கள்.',
        tipDefault: ['முன்னறிவிப்பு துல்லியமாக இருக்க வருமானம், செலவுகளைத் தொடர்ந்து பதிவு செய்யுங்கள்.', 'எதிர்பாராத சிக்கல்களைத் தவிர்க்க வாரந்தோறும் வரவிருக்கும் பில்களைப் பாருங்கள்.'],
    },

    si: {
        hello: 'ආයුබෝවන්! 👋 මම NexFi AI. ඔබේ මුදල් ශේෂය, මුදල් ප්‍රවාහ පුරෝකථනය, ලැබිය යුතු සහ ගෙවිය යුතු මුදල්, නැතහොත් යමක් මිලදී ගැනීමට හැකිදැයි මගෙන් අසන්න.',
        thanks: 'ස්තූතියි! ඔබේ මුදල් ප්‍රවාහය ගැන තවත් යමක් අසන්න.',
        help: 'මම ඔබේම දත්ත අනුව පිළිතුරු දෙන්නෙමි:\n• මුදල් ශේෂය, ආදායම සහ වියදම්\n• මුදල් ප්‍රවාහ පුරෝකථනය සහ හිඟ අවදානම\n• ලැබිය යුතු, ගෙවිය යුතු සහ ප්‍රමාද වූ ගෙවීම්\n• වැඩිම වියදම් ප්‍රවර්ග\n• "50,000ක් මිලදී ගන්න පුළුවන්ද?"\n• මෑත ගනුදෙනු සහ උපදෙස්',
        unknown: 'මට ඒ ගැන තවම තේරෙන්නේ නැහැ. ඔබේ මුදල් ශේෂය, පුරෝකථනය, ප්‍රමාද වූ ඉන්වොයිසි, ඉදිරියේ බිල්පත්, වියදම් හෝ "25,000ක් මිලදී ගන්න පුළුවන්ද?" ලෙස අසා බලන්න.',
        noData: 'ඔබට තවම වාර්තා කිසිවක් නැත. ගනුදෙනුවක්, ලැබිය යුතු හෝ ගෙවිය යුතු මුදලක් එක් කළ විට මම ඔබේ මුදල් ප්‍රවාහය නිරීක්ෂණය කිරීමට පටන් ගන්නෙමි.',
        unnamed: 'නමක් නැත',
        unknownDate: 'නොදන්නා දිනයක්',
        item: (name, amount, date) => `• ${name}: ${amount} (නියමිත දිනය ${date})`,
        severity: { low: 'අඩු', medium: 'මධ්‍යම', high: 'ඉහළ', critical: 'බරපතළ' },
        balance: (bal, inc, exp) => `ඔබේ වත්මන් මුදල් ශේෂය ${bal}.\nසටහන් වූ මුළු ආදායම: ${inc} · මුළු වියදම්: ${exp}.`,
        noIncome: 'තවම ආදායමක් සටහන් වී නැත. ආදායම් ගනුදෙනුවක් එක් කළ විට මම එය නිරීක්ෂණය කරමි.',
        income: (total, count, inflow) =>
            `සටහන් වූ මුළු ආදායම: ${total}${count ? ` (ගනුදෙනු ${count}ක්)` : ''}.` +
            (inflow ? `\nපුරෝකථන කාලයේ අපේක්ෂිත ලැබීම්: ${inflow}.` : ''),
        noExpenses: 'තවම වියදම් සටහන් වී නැත.',
        expenses: (total, count, outflow) =>
            `සටහන් වූ මුළු වියදම්: ${total}${count ? ` (ගනුදෙනු ${count}ක්)` : ''}.` +
            (outflow ? `\nපුරෝකථන කාලයේ අපේක්ෂිත වියදම්: ${outflow}.` : ''),
        noCategory: 'තවම වියදම් සටහන් වී නැති නිසා ප්‍රවර්ග බෙදීමක් පෙන්විය නොහැක.',
        categoryHead: 'ඔබේ වැඩිම වියදම් ප්‍රවර්ග:',
        noForecast: 'පුරෝකථනයක් තවම නොමැත. වාර්තා කිහිපයක් එක් කළ විට මම ඔබේ මුදල් ප්‍රවාහය ගණනය කරමි.',
        forecast: (days, inflow, outflow, lastDate, lastBal, low, lowDate) =>
            `ඉදිරි දින ${days} තුළ ${inflow} ක ලැබීම් සහ ${outflow} ක වියදම් අපේක්ෂා කරමි.\n${lastDate} දිනට ගණන් බලන ලද ශේෂය: ${lastBal}.\nඅවම ශේෂය: ${low} (${lowDate}).`,
        shortage: (amount, date, days, sev) =>
            `⚠️ ${date} දින (දින ${days} කින්, බරපතළකම: ${sev}) ${amount} ක මුදල් හිඟයක් අපේක්ෂා කෙරේ.`,
        noShortage: (date) => `✅ ${date} දක්වා මුදල් හිඟයක් අපේක්ෂා නොකෙරේ.`,
        noReceivables: 'ලැබිය යුතු මුදල් කිසිවක් නැත. දැනට කිසිවෙකු ඔබට ණයක් නැත.',
        receivablesHead: (total, n) => `ඉන්වොයිසි ${n}ක් සඳහා ඔබට ${total} ක් ලැබිය යුතුය.`,
        overdueHead: (n, total) => `⏰ ප්‍රමාද වූ ${n}ක් (${total}):`,
        nextDue: 'ඊළඟට නියමිත:',
        noPayables: 'ගෙවිය යුතු මුදල් කිසිවක් නැත. දැනට ගෙවිය යුතු බිල්පත් නැත.',
        payablesHead: (total, n) => `බිල්පත් ${n}ක් සඳහා ඔබ ${total} ක් ගෙවිය යුතුය.`,
        nothingOverdue: '✅ ප්‍රමාද වූ දෙයක් නැත. ඔබේ ලැබිය යුතු සහ ගෙවිය යුතු මුදල් නියමිත පරිදි පවතී.',
        customersOverdue: (total) => `ප්‍රමාද වූ පාරිභෝගික ගෙවීම් (${total}):`,
        billsOverdue: (total) => `ප්‍රමාද වූ බිල්පත් (${total}):`,
        affordAsk: 'මුදල කියන්න, මම එය ඔබේ පුරෝකථනය සමඟ සසඳා බලන්නම්. උදා: "50,000ක් මිලදී ගන්න පුළුවන්ද?"',
        baseForecast: 'ඔබේ අවම ගණන් බලන ලද ශේෂය',
        baseBalance: 'ඔබේ ශේෂය',
        affordTooMuch: (amt, bal, base, after) =>
            `${amt} ඔබේ වත්මන් මුදල් ශේෂය වන ${bal} ට වඩා වැඩිය. එය වියදම් කළහොත් ${base} ${after} වනු ඇත, එම නිසා තවත් මුදල් ලැබෙන තුරු රැඳී සිටීම වඩා හොඳයි.`,
        affordYes: (amt, base, after) => `ඔව්, දරාගත හැකියි. ${amt} වියදම් කළත් ${base} තවමත් ${after} ක් වේ.`,
        affordRisky: (amt, base, after) => `මෙය අවදානම්ය. ${amt} වියදම් කළහොත් ${base} ${after} දක්වා පහත වැටේ.`,
        healthNone: 'ක්‍රියාකාරකම් නොමැති නිසා ඔබේ මූල්‍ය සෞඛ්‍ය ලකුණු 0/100 කි. ආදායම් එක් කර මූලික ප්‍රාග්ධනය සකසන්න.',
        moods: { strong: 'ඔබේ තත්ත්වය ශක්තිමත් බවයි', stable: 'ඔබේ තත්ත්වය ස්ථාවර බවයි', improve: 'දියුණු කර ගත හැකි ඉඩ ඇති බවයි' },
        health: (score, mood) =>
            `ඔබේ මූල්‍ය සෞඛ්‍ය ලකුණු ${score}/100 කි. එයින් පෙන්වන්නේ ${mood}.\nමෙය ඔබේ මුදල් ශේෂය සහ ආදායම් ක්‍රියාකාරකම් පිළිබිඹු කරයි. ධන ශේෂයක් පවත්වා නිතිපතා ආදායම් සටහන් කිරීමෙන් ලකුණු ඉහළ යයි.`,
        noRecent: 'ගනුදෙනු තවම නැත. පළමු එක සටහන් කිරීමට "ගනුදෙනුවක් එක් කරන්න" භාවිත කරන්න.',
        recentHead: 'ඔබේ මෑත ගනුදෙනු:',
        transaction: 'ගනුදෙනුව',
        tipsHead: 'මගේ යෝජනා:',
        tipShortage: 'හිඟයක් අපේක්ෂා කෙරේ: අත්‍යවශ්‍ය නොවන ගෙවීම් කල් දමා ලැබිය යුතු මුදල් ඉල්ලා සිටින්න.',
        tipOverdueRec: (n, total) => `${total} වටිනා ප්‍රමාද වූ ඉන්වොයිසි ${n}ක් ගැන විමසන්න.`,
        tipOverduePay: (n) => `දඩ මුදල් වළක්වා ගැනීමට ප්‍රමාද වූ බිල්පත් ${n} පියවන්න.`,
        tipExpenseHigh: 'වියදම් ඔබේ ආදායමෙන් 80% ට වැඩියි. වැඩිම වියදම් ප්‍රවර්ග පරීක්ෂා කරන්න.',
        tipDefault: ['පුරෝකථනය නිවැරදිව තබා ගැනීමට ආදායම් සහ වියදම් නිතිපතා සටහන් කරන්න.', 'අනපේක්ෂිත දේවලින් වැළකීමට සතිපතා ඉදිරි බිල්පත් පරීක්ෂා කරන්න.'],
    },
}

// Texts used by the chat window itself (greeting, quick questions, placeholder, accessibility labels)
export const ASSISTANT_UI = {
    en: {
        greeting: MESSAGES.en.hello,
        contextLabel: 'Grounded in your account data',
        suggestions: ['My balance', 'Cash flow forecast', 'Overdue items', 'Can I afford 25,000?'],
        placeholder: 'Ask about your cash flow…',
        inputLabel: 'Ask NexFi AI',
        sendLabel: 'Send message',
        chatLabel: 'AI chat',
        typingLabel: 'NexFi AI is typing',
    },
    ta: {
        greeting: MESSAGES.ta.hello,
        contextLabel: 'உங்கள் கணக்குத் தரவின் அடிப்படையில்',
        suggestions: ['என் பண இருப்பு', 'பணப்புழக்க முன்னறிவிப்பு', 'தாமதமானவை', '25,000 வாங்க முடியுமா?'],
        placeholder: 'உங்கள் பணப்புழக்கம் பற்றிக் கேளுங்கள்…',
        inputLabel: 'NexFi AI-யிடம் கேளுங்கள்',
        sendLabel: 'செய்தியை அனுப்பு',
        chatLabel: 'AI உரையாடல்',
        typingLabel: 'NexFi AI தட்டச்சு செய்கிறது',
    },
    si: {
        greeting: MESSAGES.si.hello,
        contextLabel: 'ඔබේ ගිණුම් දත්ත මත පදනම්ව',
        suggestions: ['මගේ මුදල් ශේෂය', 'මුදල් ප්‍රවාහ පුරෝකථනය', 'ප්‍රමාද වූ දේවල්', '25,000ක් මිලදී ගන්න පුළුවන්ද?'],
        placeholder: 'ඔබේ මුදල් ප්‍රවාහය ගැන අසන්න…',
        inputLabel: 'NexFi AI ගෙන් අසන්න',
        sendLabel: 'පණිවිඩය යවන්න',
        chatLabel: 'AI සංවාදය',
        typingLabel: 'NexFi AI ටයිප් කරමින්',
    },
}

// ---------------------------------------------------------------------------------------------
// Replies
// ---------------------------------------------------------------------------------------------

const dateText = (ctx, L, value) => (value ? ctx.date(value) || L.unknownDate : L.unknownDate)

function describeItems(items, nameKey, ctx, L, limit = 3) {
    return items
        .slice(0, limit)
        .map((item) => L.item(item[nameKey] || L.unnamed, ctx.money(item.amount), dateText(ctx, L, item.dueDate)))
        .join('\n')
}

function hasAnyData(ctx) {
    return Boolean(
        ctx.balance || ctx.income || ctx.expenses || ctx.receivables.length || ctx.payables.length || ctx.transactions.length,
    )
}

function balanceReply(ctx, L) {
    if (!hasAnyData(ctx)) return L.noData
    return L.balance(ctx.money(ctx.balance), ctx.money(ctx.income), ctx.money(ctx.expenses))
}

function incomeReply(ctx, L) {
    const entries = ctx.transactions.filter((item) => item.type === 'income')
    if (!entries.length && !ctx.income) return L.noIncome
    return L.income(ctx.money(ctx.income), entries.length, ctx.forecast?.expectedInflow ? ctx.money(ctx.forecast.expectedInflow) : '')
}

function categoryReply(ctx, L) {
    const totals = new Map()
    ctx.transactions
        .filter((item) => item.type === 'expense')
        .forEach((item) => {
            const key = item.category || 'Other'
            totals.set(key, (totals.get(key) || 0) + Number(item.amount || 0))
        })
    if (!totals.size) return L.noCategory
    const total = [...totals.values()].reduce((a, b) => a + b, 0)
    const lines = [...totals.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, amount]) => `• ${name}: ${ctx.money(amount)} (${Math.round((amount / total) * 100)}%)`)
    return `${L.categoryHead}\n${lines.join('\n')}`
}

function expensesReply(ctx, L) {
    const entries = ctx.transactions.filter((item) => item.type === 'expense')
    if (!entries.length && !ctx.expenses) return L.noExpenses
    let reply = L.expenses(ctx.money(ctx.expenses), entries.length, ctx.forecast?.expectedOutflow ? ctx.money(ctx.forecast.expectedOutflow) : '')
    if (entries.length) reply += `\n\n${categoryReply(ctx, L)}`
    return reply
}

function forecastReply(ctx, L, focusShortage = false) {
    const days = ctx.forecast?.days || []
    if (!days.length) return L.noForecast

    const last = days[days.length - 1]
    const lowest = days.reduce((min, day) => (day.projectedBalance < min.projectedBalance ? day : min), days[0])
    const alert = ctx.forecast?.shortageAlert

    let shortageLine = L.noShortage(dateText(ctx, L, last.date))
    if (alert) {
        const severity = String(alert.severity || '').toLowerCase()
        shortageLine = L.shortage(
            ctx.money(alert.shortageAmount),
            dateText(ctx, L, alert.shortageDate),
            alert.daysRemaining,
            L.severity[severity] || severity,
        )
    }

    const detail = L.forecast(
        days.length,
        ctx.money(ctx.forecast.expectedInflow || 0),
        ctx.money(ctx.forecast.expectedOutflow || 0),
        dateText(ctx, L, last.date),
        ctx.money(last.projectedBalance),
        ctx.money(lowest.projectedBalance),
        dateText(ctx, L, lowest.date),
    )

    return focusShortage ? `${shortageLine}\n\n${detail}` : `${detail}\n\n${shortageLine}`
}

function listReply(ctx, L, list, nameKey, noneText, headText) {
    const { open, overdue, upcoming } = splitOverdue(list, ctx.today)
    if (!open.length) return noneText
    const parts = [headText(ctx.money(sum(open)), open.length)]
    if (overdue.length) parts.push(`${L.overdueHead(overdue.length, ctx.money(sum(overdue)))}\n${describeItems(overdue, nameKey, ctx, L)}`)
    if (upcoming.length) parts.push(`${L.nextDue}\n${describeItems(upcoming, nameKey, ctx, L)}`)
    return parts.join('\n\n')
}

const receivablesReply = (ctx, L) => listReply(ctx, L, ctx.receivables, 'customerName', L.noReceivables, L.receivablesHead)
const payablesReply = (ctx, L) => listReply(ctx, L, ctx.payables, 'vendorName', L.noPayables, L.payablesHead)

function overdueReply(ctx, L) {
    const receivables = splitOverdue(ctx.receivables, ctx.today).overdue
    const payables = splitOverdue(ctx.payables, ctx.today).overdue
    if (!receivables.length && !payables.length) return L.nothingOverdue
    const parts = []
    if (receivables.length) parts.push(`${L.customersOverdue(ctx.money(sum(receivables)))}\n${describeItems(receivables, 'customerName', ctx, L)}`)
    if (payables.length) parts.push(`${L.billsOverdue(ctx.money(sum(payables)))}\n${describeItems(payables, 'vendorName', ctx, L)}`)
    return parts.join('\n\n')
}

const upcomingReply = (ctx, L) => `${receivablesReply(ctx, L)}\n\n${payablesReply(ctx, L)}`

function affordReply(ctx, L, text) {
    const amount = parseAmount(text)
    if (!amount) return L.affordAsk

    const days = ctx.forecast?.days || []
    const lowest = days.length ? Math.min(...days.map((day) => day.projectedBalance)) : ctx.balance
    const after = lowest - amount
    const base = days.length ? L.baseForecast : L.baseBalance

    if (amount > ctx.balance && ctx.balance >= 0) {
        return L.affordTooMuch(ctx.money(amount), ctx.money(ctx.balance), base, ctx.money(after))
    }
    if (after >= 0) return L.affordYes(ctx.money(amount), base, ctx.money(after))
    return L.affordRisky(ctx.money(amount), base, ctx.money(after))
}

function healthReply(ctx, L) {
    if (!ctx.healthScore) return L.healthNone
    const mood = ctx.healthScore >= 80 ? L.moods.strong : ctx.healthScore >= 60 ? L.moods.stable : L.moods.improve
    return L.health(ctx.healthScore, mood)
}

function recentReply(ctx, L) {
    const latest = [...ctx.transactions]
        .sort((a, b) => String(b.transactionDate).localeCompare(String(a.transactionDate)))
        .slice(0, 5)
    if (!latest.length) return L.noRecent
    const lines = latest.map((item) => {
        const sign = item.type === 'income' ? '+' : '-'
        return `• ${dateText(ctx, L, item.transactionDate)} · ${sign}${ctx.money(item.amount)} · ${item.category || item.description || L.transaction}`
    })
    return `${L.recentHead}\n${lines.join('\n')}`
}

function tipsReply(ctx, L) {
    const tips = []
    const receivables = splitOverdue(ctx.receivables, ctx.today)
    const payables = splitOverdue(ctx.payables, ctx.today)
    if (ctx.forecast?.shortageAlert) tips.push(L.tipShortage)
    if (receivables.overdue.length) tips.push(L.tipOverdueRec(receivables.overdue.length, ctx.money(sum(receivables.overdue))))
    if (payables.overdue.length) tips.push(L.tipOverduePay(payables.overdue.length))
    if (ctx.income > 0 && ctx.expenses > ctx.income * 0.8) tips.push(L.tipExpenseHigh)
    if (!tips.length) tips.push(...L.tipDefault)
    return `${L.tipsHead}\n${tips.slice(0, 3).map((tip) => `• ${tip}`).join('\n')}`
}

// ---------------------------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------------------------

// ctx: { balance, income, expenses, healthScore, forecast, receivables, payables, transactions,
//        today, money(amount), date(value), language }
export function buildAssistantReply(question, ctx) {
    const text = normalize(question)
    const L = MESSAGES[pickLanguage(text, ctx.language)]

    if (!text) return L.help

    if (GREETING_PATTERN.test(text) || GREETING_PREFIXES.some((prefix) => text.startsWith(prefix))) return L.hello
    if (text.length < 40 && hasAny(text, KW.thanks)) return L.thanks

    const mentionsAmount = parseAmount(text) && hasAny(text, ['buy', 'spend', 'pay']) && !PERIOD_PATTERN.test(text)
    if (hasAny(text, KW.afford) || mentionsAmount) return affordReply(ctx, L, text)
    if (hasAny(text, KW.shortage)) return forecastReply(ctx, L, true)
    if (hasAny(text, KW.forecast)) return forecastReply(ctx, L)
    if (hasAny(text, KW.overdue)) return overdueReply(ctx, L)
    if (hasAny(text, KW.upcoming)) return upcomingReply(ctx, L)
    if (hasAny(text, KW.payables)) return payablesReply(ctx, L)
    if (hasAny(text, KW.receivables)) return receivablesReply(ctx, L)
    if (hasAny(text, KW.category)) return categoryReply(ctx, L)
    if (hasAny(text, KW.expenses)) return expensesReply(ctx, L)
    if (hasAny(text, KW.income)) return incomeReply(ctx, L)
    if (hasAny(text, KW.balance)) return balanceReply(ctx, L)
    if (hasAny(text, KW.health)) return healthReply(ctx, L)
    if (hasAny(text, KW.recent)) return recentReply(ctx, L)
    if (hasAny(text, KW.tips)) return tipsReply(ctx, L)
    if (hasAny(text, KW.help)) return L.help

    return L.unknown
}