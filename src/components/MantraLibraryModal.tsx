import React, { useState } from 'react';
import { X, Search, Plus, Sparkles, Check, Trash2, BookOpen } from 'lucide-react';
import { Language, Mantra } from '../types';

interface MantraLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  mantras: Mantra[];
  selectedMantraId: string;
  onSelectMantra: (mantra: Mantra) => void;
  onAddCustomMantra: (mantra: Mantra) => void;
  onDeleteCustomMantra: (id: string) => void;
}

export const MantraLibraryModal: React.FC<MantraLibraryModalProps> = ({
  isOpen,
  onClose,
  language,
  mantras,
  selectedMantraId,
  onSelectMantra,
  onAddCustomMantra,
  onDeleteCustomMantra,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State for new custom mantra
  const [customNameHi, setCustomNameHi] = useState('');
  const [customNameEn, setCustomNameEn] = useState('');
  const [customTextHi, setCustomTextHi] = useState('');
  const [customTextEn, setCustomTextEn] = useState('');
  const [customDeityHi, setCustomDeityHi] = useState('');
  const [customMeaningHi, setCustomMeaningHi] = useState('');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', labelHi: 'सभी मंत्र', labelEn: 'All Mantras' },
    { id: 'shiva', labelHi: 'भगवान शिव', labelEn: 'Lord Shiva' },
    { id: 'krishna', labelHi: 'श्री कृष्ण / राधा', labelEn: 'Krishna / Radha' },
    { id: 'ram', labelHi: 'प्रभु श्री राम', labelEn: 'Lord Ram' },
    { id: 'vedic', labelHi: 'वैदिक / गायत्री', labelEn: 'Vedic / Gayatri' },
    { id: 'devi', labelHi: 'माँ दुर्गा / देवी', labelEn: 'Devi / Durga' },
    { id: 'hanuman', labelHi: 'श्री हनुमान', labelEn: 'Hanuman' },
    { id: 'ganesha', labelHi: 'भगवान गणेश', labelEn: 'Ganesha' },
    { id: 'custom', labelHi: 'मेरे निजी मंत्र', labelEn: 'My Custom' },
  ];

  const filteredMantras = mantras.filter((m) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'custom'
        ? !!m.isCustom
        : m.category === selectedCategory;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      m.nameHi.toLowerCase().includes(query) ||
      m.nameEn.toLowerCase().includes(query) ||
      m.textHi.toLowerCase().includes(query) ||
      m.textEn.toLowerCase().includes(query) ||
      m.deityHi.toLowerCase().includes(query) ||
      m.deityEn.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const handleSaveCustomMantra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTextHi.trim()) return;

    const newMantra: Mantra = {
      id: `custom-${Date.now()}`,
      nameHi: customNameHi.trim() || customTextHi.trim().slice(0, 20),
      nameEn: customNameEn.trim() || 'Custom Mantra',
      textHi: customTextHi.trim(),
      textEn: customTextEn.trim() || customTextHi.trim(),
      meaningHi: customMeaningHi.trim() || 'व्यक्तिगत भक्ति मंत्र।',
      meaningEn: 'Personal sacred devotional chant.',
      deityHi: customDeityHi.trim() || 'इष्टदेव',
      deityEn: customDeityHi.trim() || 'Ishta Devata',
      category: 'custom',
      isCustom: true,
    };

    onAddCustomMantra(newMantra);
    onSelectMantra(newMantra);

    // Reset Form
    setCustomNameHi('');
    setCustomNameEn('');
    setCustomTextHi('');
    setCustomTextEn('');
    setCustomDeityHi('');
    setCustomMeaningHi('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-[#FAF6EF] dark:bg-[#1E1A16] border border-[#B89A60]/40 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#B89A60]/20 bg-[#F0E7D8]/60 dark:bg-[#26201B]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#C88735]/15 text-[#C88735]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-rozha text-lg sm:text-xl font-bold text-[#3C3026] dark:text-[#F0E7D8]">
                {language === 'hi' ? 'पावन मंत्र संग्रह' : 'Sacred Mantra Library'}
              </h3>
              <p className="text-xs text-[#3C3026]/70 dark:text-[#F0E7D8]/70">
                {language === 'hi'
                  ? 'अपने इष्टदेव का मंत्र चुनें अथवा अपना नया मंत्र जोड़ें'
                  : 'Select your deity mantra or create a custom one'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#C88735] hover:bg-[#B45309] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'नया मंत्र' : 'Add Custom'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#3C3026]/60 dark:text-[#F0E7D8]/60 hover:bg-[#F0E7D8] dark:hover:bg-[#2E2922] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Categories Filter */}
        <div className="p-3 sm:p-4 border-b border-[#B89A60]/20 space-y-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#3C3026]/40 dark:text-[#F0E7D8]/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'मंत्र, देवता या नाम खोजें...'
                  : 'Search mantras, deities, or keywords...'
              }
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F0E7D8]/60 dark:bg-[#28221D] border border-[#B89A60]/30 text-xs sm:text-sm text-[#3C3026] dark:text-[#F0E7D8] placeholder-[#3C3026]/40 dark:placeholder-[#F0E7D8]/40 focus:outline-none focus:border-[#C88735]"
            />
          </div>

          {/* Category Chips Carousel */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#C88735] text-white shadow-xs'
                    : 'bg-[#F0E7D8]/70 dark:bg-[#28221D] text-[#3C3026]/80 dark:text-[#F0E7D8]/80 hover:bg-[#E2D3BE]'
                }`}
              >
                {language === 'hi' ? cat.labelHi : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Add Custom Mantra Accordion Form */}
        {showAddForm && (
          <form
            onSubmit={handleSaveCustomMantra}
            className="p-4 bg-amber-500/10 dark:bg-amber-950/20 border-b border-amber-500/30 space-y-3 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-rozha text-sm font-bold text-[#C88735] dark:text-amber-400">
                {language === 'hi' ? 'नया व्यक्तिगत मंत्र जोड़ें' : 'Create Custom Mantra'}
              </h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-[#3C3026]/60 dark:text-[#F0E7D8]/60 hover:text-red-500"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] font-medium text-[#3C3026]/80 dark:text-[#F0E7D8]/80 block mb-1">
                  {language === 'hi' ? 'मंत्र का नाम (हिन्दी)' : 'Mantra Title (Hindi)'}
                </label>
                <input
                  type="text"
                  required
                  value={customNameHi}
                  onChange={(e) => setCustomNameHi(e.target.value)}
                  placeholder="उदा. श्री कृष्ण शरणं मम"
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1A16] border border-[#B89A60]/30 text-xs text-[#3C3026] dark:text-[#F0E7D8] focus:outline-none focus:border-[#C88735]"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#3C3026]/80 dark:text-[#F0E7D8]/80 block mb-1">
                  {language === 'hi' ? 'इष्टदेव / देवता' : 'Deity'}
                </label>
                <input
                  type="text"
                  value={customDeityHi}
                  onChange={(e) => setCustomDeityHi(e.target.value)}
                  placeholder="उदा. श्री कृष्ण"
                  className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1A16] border border-[#B89A60]/30 text-xs text-[#3C3026] dark:text-[#F0E7D8] focus:outline-none focus:border-[#C88735]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#3C3026]/80 dark:text-[#F0E7D8]/80 block mb-1">
                {language === 'hi' ? 'मंत्र का मूल पाठ (देवनागरी लिपि)' : 'Mantra Original Text (Devanagari)'} *
              </label>
              <textarea
                required
                rows={2}
                value={customTextHi}
                onChange={(e) => setCustomTextHi(e.target.value)}
                placeholder="यहाँ मूल मंत्र लिखें... (उदा. ॐ नमो नारायणाय)"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1E1A16] border border-[#B89A60]/30 text-xs sm:text-sm font-devanagari text-[#3C3026] dark:text-[#F0E7D8] focus:outline-none focus:border-[#C88735]"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-[#3C3026]/80 dark:text-[#F0E7D8]/80 block mb-1">
                {language === 'hi' ? 'अंग्रेजी उच्चारण (वैकल्पिक)' : 'English Transliteration (Optional)'}
              </label>
              <input
                type="text"
                value={customTextEn}
                onChange={(e) => setCustomTextEn(e.target.value)}
                placeholder="e.g. Om Namo Narayanaya"
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E1A16] border border-[#B89A60]/30 text-xs text-[#3C3026] dark:text-[#F0E7D8] focus:outline-none focus:border-[#C88735]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-gradient-to-r from-[#C88735] to-[#B89A60] text-white text-xs font-semibold shadow-xs hover:opacity-95 transition-opacity"
            >
              {language === 'hi' ? 'मंत्र सहेजें एवं चुनें' : 'Save & Select Mantra'}
            </button>
          </form>
        )}

        {/* Mantras List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {filteredMantras.length === 0 ? (
            <div className="text-center py-12 text-[#3C3026]/50 dark:text-[#F0E7D8]/50">
              <p className="text-sm">
                {language === 'hi'
                  ? 'कोई मंत्र नहीं मिला। नया मंत्र जोड़ने हेतु ऊपर क्लिक करें।'
                  : 'No mantras found. Click above to add your own.'}
              </p>
            </div>
          ) : (
            filteredMantras.map((mantra) => {
              const isSelected = mantra.id === selectedMantraId;

              return (
                <div
                  key={mantra.id}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 dark:bg-amber-950/25 border-[#C88735] ring-2 ring-[#C88735]/40 shadow-md'
                      : 'bg-[#F0E7D8]/60 dark:bg-[#26201B] border-[#B89A60]/25 hover:border-[#B89A60]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-[#C88735]/15 text-[#C88735] dark:text-amber-400 text-[10px] font-semibold">
                          {language === 'hi' ? mantra.deityHi : mantra.deityEn}
                        </span>
                        {mantra.isCustom && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 text-[10px] font-semibold">
                            {language === 'hi' ? 'कस्टम' : 'Custom'}
                          </span>
                        )}
                        <h4 className="text-xs sm:text-sm font-bold text-[#3C3026] dark:text-[#F0E7D8]">
                          {language === 'hi' ? mantra.nameHi : mantra.nameEn}
                        </h4>
                      </div>

                      {/* Mantra Text */}
                      <p className="font-rozha text-base sm:text-lg text-[#3C3026] dark:text-[#F0E7D8] font-bold leading-relaxed my-1">
                        {mantra.textHi}
                      </p>

                      {mantra.textEn && (
                        <p className="text-xs text-[#C88735] dark:text-[#D4B982] font-marcellus italic">
                          {mantra.textEn}
                        </p>
                      )}

                      {/* Meaning preview */}
                      <p className="text-[11px] text-[#3C3026]/75 dark:text-[#F0E7D8]/75 mt-2 line-clamp-2">
                        {language === 'hi' ? mantra.meaningHi : mantra.meaningEn}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => {
                          onSelectMantra(mantra);
                          onClose();
                        }}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-[#C88735] hover:bg-[#B45309] text-white shadow-xs'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{language === 'hi' ? 'सक्रिय' : 'Active'}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{language === 'hi' ? 'चुनें' : 'Select'}</span>
                          </>
                        )}
                      </button>

                      {mantra.isCustom && (
                        <button
                          onClick={() => onDeleteCustomMantra(mantra.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Delete Custom Mantra"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
