/* IPA — American English, using ONLY the symbols on the Fluent English Sound Chart (supplied by the school; it
   follows the symbol set of oxfordlearnersdictionaries.com/us). Individual word transcriptions were written
   from the chart's symbol set and the author's knowledge; they were NOT looked up on Oxford (the site was
   unreachable when this lesson was built), so they are unverified.
   Sentence transcriptions are assembled word by word from citation forms (articles use weak forms);
   they are teaching aids, not verbatim Oxford sentence transcriptions. */
(function (FE) {
  'use strict';
  const D = FE.IPA = {};
  const TABLE = `
1 wʌn|2 tuː|3 θriː|4 fɔːr|5 faɪv|6 sɪks|7 ˈsevn|8 eɪt|9 naɪn|10 ten|60 ˈsɪksti|90% ˈnaɪnti pərˈsent|6:00 sɪks əˈklɑːk|5:50 faɪv ˈfɪfti
a ə|about əˈbaʊt|activity ækˈtɪvəti|add æd|after ˈæftər|again əˈɡen|alex ˈæleks|all ɔːl|also ˈɔːlsəʊ|always ˈɔːlweɪz|am æm|an ən|and ænd|angry ˈæŋɡri|another əˈnʌðər|answer ˈænsər|answering ˈænsərɪŋ|answers ˈænsərz|apostrophe əˈpɑːstrəfi|are ɑːr|aren't ɑːrnt|arrive əˈraɪv|as æz|ask æsk|asks æsks|at æt|attempt əˈtempt
bag bæɡ|bags bæɡz|be biː|beach biːtʃ|becomes bɪˈkʌmz|before bɪˈfɔːr|ben ben|blue bluː|book bʊk|books bʊks|both bəʊθ|bubble ˈbʌbl|build bɪld|but bʌt
café kæˈfeɪ|calm kɑːm|can kæn|carefully ˈkerfəli|chair tʃer|challenge ˈtʃælɪndʒ|check tʃek|choose tʃuːz|class klæs|classroom ˈklæsruːm|color ˈkʌlər|comes kʌmz|complete kəmˈpliːt|contraction kənˈtrækʃn|contracts kənˈtrækts|contrast ˈkɑːntræst|correct kəˈrekt|correction kəˈrekʃn
desk desk|detail ˈdiːteɪl|details ˈdiːteɪlz|detective dɪˈtektɪv|different ˈdɪfrənt|do duː|doctor ˈdɑːktər|does dʌz|doesn't ˈdʌznt|don't dəʊnt
each iːtʃ|empty ˈempti|energy ˈenərdʒi|engine ˈendʒɪn|engineer ˌendʒɪˈnɪr|english ˈɪŋɡlɪʃ|evidence ˈevɪdəns|examples ɪɡˈzæmplz|exit ˈeɡzɪt|explain ɪkˈspleɪn|extra ˈekstrə
fact fækt|facts fækts|false fɔːls|families ˈfæməliz|feel fiːl|feels fiːlz|find faɪnd|fine faɪn|first fɜːrst|fix fɪks|fluent ˈfluːənt|for fɔːr|form fɔːrm|forms fɔːrmz|frame freɪm|fresh freʃ|from frʌm|full fʊl
goal ɡəʊl|goes ɡəʊz|gold ɡəʊld|grade ɡreɪd|grammatical ɡrəˈmætɪkl|great ɡreɪt|green ɡriːn|group ɡruːp|guess ɡes|guided ˈɡaɪdɪd
happy ˈhæpi|he hiː|he's hiːz|help help|here hɪr|hidden ˈhɪdn|home həʊm|how haʊ|hungry ˈhʌŋɡri
i aɪ|i'm aɪm|if ɪf|in ɪn|incorrect ˌɪnkəˈrekt|independent ˌɪndɪˈpendənt|individual ˌɪndɪˈvɪdʒuəl|information ˌɪnfərˈmeɪʃn|inside ˌɪnˈsaɪd|invented ɪnˈventɪd|is ɪz|isn't ˈɪznt|it ɪt|it's ɪts|item ˈaɪtəm
know nəʊ|lab læb|label ˈleɪbl|late leɪt|learner ˈlɜːrnər|learners ˈlɜːrnərz|leo ˈliːəʊ|less les|lesson ˈlesn|letter ˈletər|library ˈlaɪbreri|lina ˈliːnə|list lɪst|listen ˈlɪsn|look lʊk
make meɪk|manages ˈmænɪdʒɪz|mark mɑːrk|mastery ˈmæstəri|match mætʃ|matches ˈmætʃɪz|maya ˈmaɪə|maya's ˈmaɪəz|meaning ˈmiːnɪŋ|means miːnz|measure ˈmeʒər|minute ˈmɪnɪt|minutes ˈmɪnɪts|missed mɪst|model ˈmɑːdl|more mɔːr
n't nt|natural ˈnætʃrəl|near nɪr|need niːd|needed ˈniːdɪd|negative ˈneɡətɪv|negatives ˈneɡətɪvz|new nuː|no nəʊ|not nɑːt|now naʊ
object ˈɑːbdʒekt|of əv|on ɑːn|one wʌn|only ˈəʊnli|opposite ˈɑːpəzɪt|optional ˈɑːpʃənl|or ɔːr|original əˈrɪdʒənl|other ˈʌðər|outside ˌaʊtˈsaɪd|own əʊn
pablo ˈpɑːbləʊ|path pæθ|paths pæðz|pattern ˈpætərn|patterns ˈpætərnz|people ˈpiːpl|person ˈpɜːrsn|phone fəʊn|picture ˈpɪktʃər|pictures ˈpɪktʃərz|pilot ˈpaɪlət|plural ˈplʊrəl|point pɔɪnt|positive ˈpɑːzətɪv|practice ˈpræktɪs|private ˈpraɪvət|problem ˈprɑːbləm|pronoun ˈprəʊnaʊn|pronunciation prəˌnʌnsiˈeɪʃn
question ˈkwestʃən|questions ˈkwestʃənz
're ər|ready ˈredi|real ˈriːəl|red red|reference ˈrefrəns|repair rɪˈper|repeat rɪˈpiːt|replaces rɪˈpleɪsɪz|rest rest|results rɪˈzʌlts|ring rɪŋ|rita ˈriːtə|roles rəʊlz|room ruːm|rosa ˈrəʊzə|rounds raʊndz
's z|sad sæd|same seɪm|say seɪ|saying ˈseɪɪŋ|says sez|scored skɔːrd|see siː|sentence ˈsentəns|sentences ˈsentənsɪz|share ʃer|she ʃiː|she's ʃiːz|short ʃɔːrt|shorten ˈʃɔːrtn|should ʃʊd|show ʃəʊ|shown ʃəʊn|shows ʃəʊz|sign saɪn|simple ˈsɪmpl|skills skɪlz|so səʊ|sound saʊnd|speak spiːk|speaker ˈspiːkər|speaker's ˈspiːkərz|spelling ˈspelɪŋ|standard ˈstændərd|starts stɑːrts|stated ˈsteɪtɪd|statement ˈsteɪtmənt|statements ˈsteɪtmənts|stay steɪ|subject ˈsʌbdʒɪkt|submit səbˈmɪt|support səˈpɔːrt|system ˈsɪstəm
table ˈteɪbl|takes teɪks|talking ˈtɔːkɪŋ|tap tæp|teacher ˈtiːtʃər|teacher's ˈtiːtʃərz|tell tel|tells telz|ten ten|test test|that ðæt|the ðə|their ðer|themselves ðəmˈselvz|then ðen|there ðer|they ðeɪ|they're ðer|thing θɪŋ|things θɪŋz|this ðɪs|thought θɔːt|three θriː|tickets ˈtɪkɪts|time taɪm|timer ˈtaɪmər|tired ˈtaɪərd|to tuː|today təˈdeɪ|today's təˈdeɪz|together təˈɡeðər|true truː|try traɪ|turns tɜːrnz|two tuː|type taɪp
until ənˈtɪl|remember rɪˈmembər|below bɪˈləʊ|use juːz|uses ˈjuːzɪz|up ʌp|us ʌs|version ˈvɜːrʒn|warm wɔːrm|was wʌz|we wiː|we're wɪr|welcome ˈwelkəm|what wʌt|when wen|where wer|who huː|whole həʊl|why waɪ|with wɪð|words wɜːrdz|work wɜːrk|works wɜːrks|write raɪt|wrong rɔːŋ|yellow ˈjeləʊ|yes jes|you juː|you're jʊr|your jɔːr|yourself jɔːrˈself`;
  TABLE.split(/[\n|]/).forEach((e) => {
    e = e.trim(); if (!e) return;
    const i = e.indexOf(' '); D[e.slice(0, i)] = e.slice(i + 1).replace(/^\/|\/$/g, '');
  });
  FE.SOUND_CHART = 'æ e ɪ ɔ ʊ ə ʌ i u ɑ ɜ a r p ʒ z s t m n f v d ð θ l w b g ɡ ʃ h k ŋ j ː ˈ ˌ'.split(' ');
  FE.ipaMissing = new Set();
  const L = 'A-Za-z\\u00C0-\\u017F';
  const TOK = new RegExp(`['\\u2019]?[${L}]+(?:['\\u2019][${L}]+)*|\\d+:\\d+|\\d+%?`, 'g');
  FE.ipaOf = function (text) {
    const out = [];
    (String(text).match(TOK) || []).forEach((w) => {
      const k = w.toLowerCase().replace(/’/g, "'");
      if (D[k]) out.push(D[k]); else FE.ipaMissing.add(k);
    });
    return out.length ? '/' + out.join(' ') + '/' : '';
  };
})(window.FE = window.FE || {});
