export type Language = 'ar' | 'en';
export const localeMeta = {
  ar: { direction: 'rtl', numberLocale: 'ar' },
  en: { direction: 'ltr', numberLocale: 'en-US' }
} as const;
export const ar = {
  appName:'تجليد', projectFallback:'غلاف جديد', projects:'مشاريعي', exportTemplate:'تصدير القالب', darkMode:'تفعيل الوضع الداكن', lightMode:'تفعيل الوضع الفاتح',
  copySuffix:'نسخة', metaDescription:'مساحة عمل عربية لإنشاء قوالب أغلفة الكتب بمقاسات دقيقة.', settingsLabel:'إعدادات الغلاف', previewToolsLabel:'أدوات المعاينة', templateImageLabel:'قالب غلاف كتاب', templateTitle:'قالب', fontLoadError:'تعذر تحميل خط التعليقات.',
  save:'حفظ المشروع', undo:'تراجع', redo:'إعادة', saveReady:'محفوظ محليًا', savePending:'تعديلات غير محفوظة', saving:'جارٍ الحفظ…', saveFailed:'تعذر الحفظ محليًا؛ عملك محفوظ في هذه الجلسة.', saveNameError:'أدخل اسمًا للمشروع قبل الحفظ.', unsavedConfirm:'لديك تعديلات غير محفوظة. هل تريد المتابعة وفقدان هذه التعديلات؟', languageToggle:'Switch to English',
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
  front:'الغلاف الأمامي', back:'الغلاف الخلفي', spinePanel:'الكعب', frontFlapPanel:'لسان أمامي', backFlapPanel:'لسان خلفي', frontHingePanel:'مفصل أمامي', backHingePanel:'مفصل خلفي',
  slug:'مساحة معلومات الطباعة', slugHeight:'ارتفاع مساحة المعلومات', slugText:'نص معلومات الطباعة', slugHint:'مساحة اختيارية خارج النزف لوضع بيانات الطباعة؛ لا تدخل في مقاس القص.', slugHeightError:'اترك الارتفاع صفرًا أو أدخل ٨ مم على الأقل ليظهر النص بوضوح.', margins:'الهوامش الآمنة', marginTop:'علوي', marginRight:'أيمن', marginBottom:'سفلي', marginLeft:'أيسر', marginHint:'تقاس الهوامش من حافة اللوح إلى الداخل، ولا تغيّر مقاس المستند.'
} as const;
export type MessageKey = keyof typeof ar;
export const en: Record<MessageKey, string> = {
  appName:'Tajleed', projectFallback:'New cover', projects:'My projects', exportTemplate:'Export template', darkMode:'Use dark mode', lightMode:'Use light mode',
  copySuffix:'copy', metaDescription:'A workspace for precise book cover templates.', settingsLabel:'Cover settings', previewToolsLabel:'Preview tools', templateImageLabel:'Book cover template', templateTitle:'Template', fontLoadError:'Could not load the annotation font.',
  save:'Save project', undo:'Undo', redo:'Redo', saveReady:'Saved locally', savePending:'Unsaved changes', saving:'Saving…', saveFailed:'Could not save locally; your work remains in this session.', saveNameError:'Enter a project name before saving.', unsavedConfirm:'You have unsaved changes. Continue and discard them?', languageToggle:'التبديل إلى العربية',
  startingValues:'Editable starting values', build:'Cover construction', dimensions:'Dimensions and paper', guides:'Print guides', barcode:'ISBN barcode',
  paperback:'Paperback', hardcover:'Hardcover', jacket:'Dust jacket', arabicOpening:'Arabic opening · front left of spine', englishOpening:'English opening · front right of spine',
  construction:'Cover type', opening:'Book opening direction', trimWidth:'Panel width', trimHeight:'Panel height', spine:'Spine width', bleed:'Bleed', safe:'Safe margin',
  frontFlap:'Front flap', backFlap:'Back flap', hinge:'Hinge gap', turnIn:'Turn-in',
  spineMode:'Spine calculation', manual:'Enter manually', estimate:'Estimate from paper', pages:'Page count', sheetThickness:'Sheet thickness', adjustment:'Printer adjustment',
  pageHint:'Pages, not sheets. One sheet has two pages.', thicknessHint:'Enter thickness in millimetres; GSM alone is insufficient.',
  printerHint:'Use structural measurements supplied by your printer.',
  showGuides:'Show preview guides', fit:'Fit to view', zoomIn:'Zoom in', zoomOut:'Zoom out', dragHint:'Drag to pan the preview', previewKeyHint:'Template preview. Use arrow keys to pan, plus and minus to zoom, and 0 or Enter to fit.',
  preview:'Template preview', outsideSpread:'Outside spread', dimensionsLabel:'Document size', trimLabel:'Cut boundary', lastValid:'The preview shows the last valid values while you correct the fields.',
  spineRequired:'Enter a spine width or valid estimate inputs before export.', errors:'Check the marked fields before exporting.',
  includeGuides:'Include guide lines', includeMeasurements:'Include labels and measurements', includeMarks:'Add printer marks', exportHint:'These are reference templates, not PDF/X files or finished print artwork.',
  svg:'Download SVG', pdf:'Download PDF', backup:'Download project file', import:'Import project', newProject:'New project', rename:'Rename', duplicate:'Duplicate', open:'Open', delete:'Delete', close:'Close',
  projectName:'Project name', projectList:'Local projects', noProjects:'No saved projects yet. Start by editing the current cover.',
  confirmDelete:'Permanently delete this project from this browser?', importError:'Could not import the file. Check its structure and version.', importSuccess:'Project imported.',
  exportError:'Could not create the template. Check the measurements and try again.',
  barcodeEnabled:'Add ISBN-13 barcode', isbn:'ISBN-13', barcodeX:'Offset from back-panel start', barcodeY:'Offset from back-panel bottom', barcodeWidth:'Barcode width', barcodeHeight:'Barcode height',
  quietZones:'Reading quiet zones are preserved around the bars; the barcode is never mirrored.', unit:'mm', exportUnit:'mm',
  fieldPositive:'Enter a value greater than zero.', fieldNonnegative:'Enter zero or a positive value.', fieldNumber:'Enter a valid number.',
  safeOverlap:'Safe margins overlap inside the panel; reduce them or enlarge the panel.', pagesError:'Enter an even page count of at least two.', thicknessError:'Enter the printer-specified sheet thickness in millimetres.',
  spineError:'Enter a spine width or valid estimate inputs before export.', hingeError:'Enter the printer-specified hinge gap.', turnInError:'Enter the printer-specified turn-in.',
  jacketFlapsError:'Enter the printer-specified dust jacket flap widths.', isbnError:'Enter an ISBN-13 beginning with 978 or 979 and a valid check digit.', barcodeSizeError:'The barcode is below the suggested readable size (25 × 18 mm).', barcodePlacementError:'Move the barcode into the back panel safe area with its quiet zones.',
  front:'Front cover', back:'Back cover', spinePanel:'Spine', frontFlapPanel:'Front flap', backFlapPanel:'Back flap', frontHingePanel:'Front hinge', backHingePanel:'Back hinge',
  slug:'Printer slug', slugHeight:'Slug height', slugText:'Printer information', slugHint:'Optional area outside the bleed for printer information; it does not change the cut size.', slugHeightError:'Use zero or at least 8 mm so the text remains legible.', margins:'Safe margins', marginTop:'Top', marginRight:'Right', marginBottom:'Bottom', marginLeft:'Left', marginHint:'Margins are measured inward from each panel edge and do not change document size.'
};
export const messages: Record<Language, Record<MessageKey, string>> = { ar, en };
