import React, { useEffect, useState } from 'react';
import { useStickers, Sticker, SavedSticker } from '../../hooks/useCommunityFeatures';
import { Star, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StickerPickerProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectSticker: (sticker: Sticker) => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({
  userId,
  isOpen,
  onClose,
  onSelectSticker,
}) => {
  const {
    stickers,
    savedStickers,
    loading,
    fetchAllStickers,
    fetchSavedStickers,
    saveSticker,
    removeSticker,
    isStarred,
  } = useStickers(userId);

  const [tab, setTab] = useState<'all' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAllStickers();
      fetchSavedStickers();
    }
  }, [isOpen]);

  const displayStickers =
    tab === 'saved'
      ? savedStickers
          .map((s) => s.sticker)
          .filter((s) => s && s.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : stickers.filter((s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto z-50 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex gap-4">
                <button
                  onClick={() => setTab('all')}
                  className={`px-4 py-2 font-medium text-sm transition-colors ${
                    tab === 'all'
                      ? 'text-green1 border-b-2 border-green1'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All Stickers
                </button>
                <button
                  onClick={() => setTab('saved')}
                  className={`px-4 py-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    tab === 'saved'
                      ? 'text-green1 border-b-2 border-green1'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  Saved
                </button>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stickers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green1"
                />
              </div>
            </div>

            {/* Stickers Grid */}
            <div className="overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green1"></div>
                </div>
              ) : displayStickers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No stickers found</p>
                </div>
              ) : (
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
                  {displayStickers.map((sticker) => (
                    <motion.div
                      key={sticker?.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative group cursor-pointer"
                    >
                      {/* Sticker Image */}
                      <button
                        onClick={() => onSelectSticker(sticker!)}
                        className="w-full aspect-square bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-green1 transition-colors flex items-center justify-center group-hover:bg-green1/5"
                      >
                        <img
                          src={sticker?.image_url}
                          alt={sticker?.name}
                          className="w-12 h-12 object-contain"
                        />
                      </button>

                      {/* Star Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (sticker && isStarred(sticker.id)) {
                            removeSticker(sticker.id);
                          } else if (sticker) {
                            saveSticker(sticker.id);
                          }
                        }}
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            sticker && isStarred(sticker.id)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-400'
                          }`}
                        />
                      </button>

                      {/* Tooltip */}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {sticker?.name}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
