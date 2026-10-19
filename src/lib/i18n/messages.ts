export const locale = { code: 'ar', direction: 'rtl' as const, numberLocale: 'ar' };
export const ar = {
  appName:'تجليد', projectFallback:'غلاف جديد', projects:'مشاريعي', exportTemplate:'تصدير القالب', darkMode:'تفعيل الوضع الداكن', lightMode:'تفعيل الوضع الفاتح',
  copySuffix:'نسخة', metaDescription:'مساحة عمل عربية لإنشاء قوالب أغلفة الكتب بمقاسات دقيقة.', settingsLabel:'إعدادات الغلاف', previewToolsLabel:'أدوات المعاينة', templateImageLabel:'قالب غلاف كتاب', templateTitle:'قالب', fontLoadError:'تعذر تحميل خط التعليقات.',
  saveReady:'محفوظ محليًا', saving:'جارٍ الحفظ…', saveFailed:'تعذر الحفظ محليًا؛ عملك محفوظ في هذه الجلسة.',
  startingValues:'قيم ابتدائية قابلة للتعديل', build:'بناء الغلاف', dimensions:'الأبعاد والورق', guides:'إرشادات الطباعة', barcode:'باركود ISBN',
  paperback:'غلاف ورقي', hardcover:'غلاف مقوّى', jacket:'غلاف واقٍ', arabicOpening:'فتح عربي · الأمام يسار الكعب', englishOpening:'فتح إنجليزي · الأمام يمين الكعب',
  construction:'نوع الغلاف', opening:'اتجاه فتح الكتاب', trimWidth:'عرض اللوح', trimHeight:'ارتفاع اللوح', spine:'عرض الكعب', bleed:'نزف الطباعة', safe:'الهامش الآمن',
  frontFlap:'اللسان الأمامي', backFlap:'اللسان الخلفي', hinge:'فجوة المفصل', turnIn:'ثنية التجليد',
  spineMode:'طريقة حساب الكعب', manual:'إدخال يدوي', estimate:'تقدير من الورق', pages:'عدد الصفحات', sheetThickness:'سمك الورقة', adjustment:'تعديل المطبعة',
  pageHint:'صفحات، لا أوراق. الورقة الواحدة = صفحتان.', thicknessHint:'أدخل السمك بالملليمتر؛ وزن GSM وحده لا يكفي.',
  printerHint:'استخدم القياسات الهيكلية التي زودتك بها المطبعة.',
  showGuides:'إظهار خطوط المعاينة', fit:'ملاءمة العرض', zoomIn:'تكبير', zoomOut:'تصغير', dragHint:'اسحب لتحريك المعاينة', previewKeyHint:'معاينة القالب. استخدم الأسهم للتحريك، وزرّي زائد وناقص للتكبير، وصفر أو Enter للملاءمة.',
  preview:'معاينة القالب', outsideSpread:'السطح الخارجي', dimensionsLabel:'مقاس المستند', trimLabel:'حد القص', lastValid:'تعرض المعاينة آخر قيم صالحة أثناء تصحيح الحقول.',
  spineRequired:'أدخل عرض الكعب أو بيانات التقدير لتفعيل التصدير.', errors:'تحقق من الحقول المعلّمة قبل التصدير.',
  includeGuides:'تضمين خطوط الإرشاد', includeMeasurements:'تضمين التسميات والقياسات', includeMarks:'إضافة علامات المطبعة', exportHint:'هذه ملفات قوالب مرجعية، وليست ملفات PDF/X أو أغلفة مكتملة للطباعة.',
  svg:'تنزيل SVG', pdf:'تنزيل PDF', backup:'تنزيل ملف المشروع', import:'استيراد مشروع', newProject:'مشروع جديد', rename:'إعادة تسمية', duplicate:'إنشاء نسخة', open:'فتح', delete:'حذف', close:'إغلاق',
  projectName:'اسم المشروع', projectList:'المشاريع المحلية', noProjects:'لا توجد مشاريع محفوظة بعد. ابدأ بتعديل الغلاف الحالي.',
  confirmDelete:'هل تريد حذف هذا المشروع نهائيًا من هذا المتصفح؟', importError:'تعذر استيراد الملف. تحقق من بنية المشروع وإصداره.', importSuccess:'تم استيراد المشروع.',
  exportError:'تعذر إنشاء القالب. تحقق من القياسات ثم حاول مرة أخرى.',
  barcodeEnabled:'إضافة باركود ISBN-13', isbn:'رقم ISBN-13', barcodeX:'الإزاحة من بداية الخلف', barcodeY:'الإزاحة من أسفل الخلف', barcodeWidth:'عرض الباركود', barcodeHeight:'ارتفاع الباركود',
  quietZones:'يُحفظ فراغ قراءة حول الخطوط ولا ينعكس اتجاه الباركود.', unit:'مم', exportUnit:'mm',
  fieldPositive:'أدخل قيمة أكبر من صفر.', fieldNonnegative:'لا يمكن إدخال قيمة سالبة.', fieldNumber:'أدخل رقمًا صالحًا.',
  safeOverlap:'الهامش الآمن يتداخل داخل اللوح؛ خفّضه أو زِد المقاس.', pagesError:'أدخل عدد صفحات زوجيًا لا يقل عن صفحتين.', thicknessError:'أدخل سمك الورقة بالملليمتر من مواصفات المطبعة.',
  spineError:'أدخل عرض الكعب أو بيانات تقدير صحيحة قبل التصدير.', hingeError:'أدخل فجوة المفصل من مواصفات المطبعة.', turnInError:'أدخل عرض الثنية من مواصفات المطبعة.',
  jacketFlapsError:'أدخل عرض لساني الغلاف الواقي من مواصفات المطبعة.', isbnError:'أدخل ISBN-13 يبدأ بـ 978 أو 979 وبرقم تحقق صحيح.', barcodeSizeError:'الباركود أصغر من الحد المقترح للقراءة (25 × 18 مم).', barcodePlacementError:'حرّك الباركود داخل المساحة الآمنة للغلاف الخلفي مع فراغات القراءة.',
  front:'الغلاف الأمامي', back:'الغلاف الخلفي', spinePanel:'الكعب', frontFlapPanel:'لسان أمامي', backFlapPanel:'لسان خلفي', frontHingePanel:'مفصل أمامي', backHingePanel:'مفصل خلفي'
} as const;
export type MessageKey = keyof typeof ar;
