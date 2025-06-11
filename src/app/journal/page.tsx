'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FormattedMessage, useIntl } from 'react-intl'
import { ArrowLeft, BookOpen, Plus, Edit3, Save, X, Search, Calendar, Lock, Heart, Star, Feather, Sparkles, Eye, EyeOff, ChevronDown, Filter, SortAsc, MoreHorizontal, Trash2 } from 'lucide-react'

interface JournalEntry {
  id: string
  title: string
  content: string
  date: string
  mood?: string
  tags: string[]
  isPrivate: boolean
  readingTime?: number
}

export default function JournalPage() {
  const router = useRouter()
  const intl = useIntl()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isWriting, setIsWriting] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMood, setSelectedMood] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'mood'>('date')
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)
  
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    mood: '😊',
    tags: [] as string[],
    isPrivate: true
  })

  const moods = [
    { emoji: '😊', label: intl.formatMessage({ id: 'journal.moods.happy' }), color: 'from-yellow-400 to-orange-400' },
    { emoji: '😢', label: intl.formatMessage({ id: 'journal.moods.sad' }), color: 'from-blue-400 to-blue-600' },
    { emoji: '😍', label: intl.formatMessage({ id: 'journal.moods.inLove' }), color: 'from-pink-400 to-red-500' },
    { emoji: '😤', label: intl.formatMessage({ id: 'journal.moods.frustrated' }), color: 'from-red-400 to-red-600' },
    { emoji: '🤔', label: intl.formatMessage({ id: 'journal.moods.thoughtful' }), color: 'from-indigo-400 to-purple-500' },
    { emoji: '😴', label: intl.formatMessage({ id: 'journal.moods.tired' }), color: 'from-gray-400 to-gray-600' },
    { emoji: '🥳', label: intl.formatMessage({ id: 'journal.moods.excited' }), color: 'from-purple-400 to-pink-500' },
    { emoji: '😰', label: intl.formatMessage({ id: 'journal.moods.anxious' }), color: 'from-orange-400 to-red-400' }
  ]

  useEffect(() => {
    loadEntries()
  }, [])

  const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200
    const words = content.split(' ').length
    return Math.ceil(words / wordsPerMinute)
  }

  const loadEntries = () => {
    const saved = localStorage.getItem('bodycount-journal')
    if (saved) {
      setEntries(JSON.parse(saved))
    } else {
      // Quelques entrées d'exemple
      const examples: JournalEntry[] = [
        {
          id: '1',
          title: intl.formatMessage({ id: 'journal.examples.loneliness.title' }),
          content: intl.formatMessage({ id: 'journal.examples.loneliness.content' }),
          date: new Date('2025-06-07').toISOString(),
          mood: '🤔',
          tags: ['solitude', 'rêves'],
          isPrivate: true,
          readingTime: 1
        },
        {
          id: '2',
          title: intl.formatMessage({ id: 'journal.examples.test.title' }),
          content: intl.formatMessage({ id: 'journal.examples.test.content' }),
          date: new Date('2025-06-04').toISOString(),
          mood: '😊',
          tags: [],
          isPrivate: true,
          readingTime: 1
        },
        {
          id: '3',
          title: intl.formatMessage({ id: 'journal.examples.reflections.title' }),
          content: intl.formatMessage({ id: 'journal.examples.reflections.content' }),
          date: new Date('2025-05-30').toISOString(),
          mood: '🤔',
          tags: ['réflexion', 'relations', 'peur'],
          isPrivate: true,
          readingTime: 2
        }
      ]
      setEntries(examples)
      localStorage.setItem('bodycount-journal', JSON.stringify(examples))
    }
  }

  const saveEntry = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) return

    const readingTime = calculateReadingTime(newEntry.content)
    const entry: JournalEntry = {
      id: Date.now().toString(),
      title: newEntry.title.trim(),
      content: newEntry.content.trim(),
      date: new Date().toISOString(),
      mood: newEntry.mood,
      tags: newEntry.tags,
      isPrivate: newEntry.isPrivate,
      readingTime
    }

    const updated = [entry, ...entries]
    setEntries(updated)
    localStorage.setItem('bodycount-journal', JSON.stringify(updated))
    
    // Reset form
    setNewEntry({
      title: '',
      content: '',
      mood: '😊',
      tags: [],
      isPrivate: true
    })
    setIsWriting(false)
  }

  const updateEntry = () => {
    if (!editingEntry) return

    const readingTime = calculateReadingTime(editingEntry.content)
    const updatedEntry = { ...editingEntry, readingTime }
    const updated = entries.map(entry => 
      entry.id === editingEntry.id ? updatedEntry : entry
    )
    setEntries(updated)
    localStorage.setItem('bodycount-journal', JSON.stringify(updated))
    setEditingEntry(null)
  }

  const deleteEntry = (id: string) => {
    if (!confirm(intl.formatMessage({ id: 'journal.deleteConfirm' }))) return
    
    const updated = entries.filter(entry => entry.id !== id)
    setEntries(updated)
    localStorage.setItem('bodycount-journal', JSON.stringify(updated))
  }

  const addTag = (tag: string) => {
    if (tag.trim() && !newEntry.tags.includes(tag.trim())) {
      setNewEntry({
        ...newEntry,
        tags: [...newEntry.tags, tag.trim()]
      })
    }
  }

  const removeTag = (tagToRemove: string) => {
    setNewEntry({
      ...newEntry,
      tags: newEntry.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const getMoodData = (emoji: string) => {
    return moods.find(m => m.emoji === emoji) || moods[0]
  }

  const sortedAndFilteredEntries = entries
    .filter(entry => {
      const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesMood = !selectedMood || entry.mood === selectedMood
      
      return matchesSearch && matchesMood
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'mood':
          return (a.mood || '').localeCompare(b.mood || '')
        case 'date':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime()
      }
    })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return intl.formatMessage({ id: 'journal.timeAgo.today' })
    if (diffDays === 2) return intl.formatMessage({ id: 'journal.timeAgo.yesterday' })
    if (diffDays <= 7) return intl.formatMessage({ id: 'journal.timeAgo.daysAgo' }, { days: diffDays - 1 })
    
    return date.toLocaleDateString(intl.locale, {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const formatLongDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-xl shadow-sm border-b border-white/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/home')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all duration-200 mr-8 group"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">
                  <FormattedMessage id="journal.backButton" />
                </span>
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-2xl shadow-lg">
                    <BookOpen className="h-7 w-7 text-white" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                      <Sparkles className="h-2 w-2 text-white" />
                    </div>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    <FormattedMessage id="journal.title" />
                  </h1>
                  <p className="text-sm text-gray-600 flex items-center space-x-1">
                    <Feather className="h-3 w-3" />
                    <span>
                      <FormattedMessage id="journal.subtitle" />
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'cards'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FormattedMessage id="journal.viewMode.cards" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FormattedMessage id="journal.viewMode.list" />
                </button>
              </div>
              
              <button
                onClick={() => setIsWriting(true)}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
                <span>
                  <FormattedMessage id="journal.writeButton" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Privacy Notice */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-3">
            <div className="bg-purple-100 p-2 rounded-xl">
              <Lock className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-purple-900 flex items-center space-x-2">
              <span>
                <FormattedMessage id="journal.privacy.title" />
              </span>
            </h3>
          </div>
          <p className="text-purple-700 text-sm leading-relaxed">
            <FormattedMessage id="journal.privacy.description" />
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  <FormattedMessage id="journal.stats.totalEntries" />
                </p>
                <p className="text-3xl font-bold text-gray-900">{entries.length}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  <FormattedMessage id="journal.stats.thisMonth" />
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {entries.filter(e => new Date(e.date).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  <FormattedMessage id="journal.stats.readingTime" />
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {entries.reduce((acc, e) => acc + (e.readingTime || 1), 0)} min
                </p>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-3 rounded-xl">
                <Eye className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={intl.formatMessage({ id: 'journal.filters.searchPlaceholder' })}
                className="w-full pl-12 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 appearance-none"
              >
                <option value="">
                  {intl.formatMessage({ id: 'journal.filters.allMoods' })}
                </option>
                {moods.map(mood => (
                  <option key={mood.emoji} value={mood.emoji}>
                    {mood.emoji} {mood.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            </div>

            <div className="relative">
              <SortAsc className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'mood')}
                className="w-full pl-12 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 appearance-none"
              >
                <option value="date">
                  {intl.formatMessage({ id: 'journal.filters.sortByDate' })}
                </option>
                <option value="title">
                  {intl.formatMessage({ id: 'journal.filters.sortByTitle' })}
                </option>
                <option value="mood">
                  {intl.formatMessage({ id: 'journal.filters.sortByMood' })}
                </option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Writing Modal */}
        {isWriting && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl">
                      <Feather className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      <FormattedMessage id="journal.newEntry.title" />
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsWriting(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 p-2 rounded-xl"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-3">
                      <FormattedMessage id="journal.newEntry.titleLabel" />
                    </label>
                    <input
                      type="text"
                      value={newEntry.title}
                      onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                      placeholder={intl.formatMessage({ id: 'journal.newEntry.titlePlaceholder' })}
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 text-lg"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-black mb-3">
                        <FormattedMessage id="journal.newEntry.moodLabel" />
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {moods.map(mood => (
                          <button
                            key={mood.emoji}
                            onClick={() => setNewEntry({ ...newEntry, mood: mood.emoji })}
                            className={`p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                              newEntry.mood === mood.emoji
                                ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-2xl mb-1">{mood.emoji}</div>
                            <div className="text-xs font-medium text-black">{mood.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-black mb-3">
                        <FormattedMessage id="journal.newEntry.tagsLabel" />
                      </label>
                      <input
                        type="text"
                        placeholder={intl.formatMessage({ id: 'journal.newEntry.tagsPlaceholder' })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            const value = e.currentTarget.value.trim()
                            if (value) {
                              addTag(value)
                              e.currentTarget.value = ''
                            }
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
                      />
                      {newEntry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {newEntry.tags.map(tag => (
                            <span
                              key={tag}
                              className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 border border-purple-200"
                            >
                              <span>#{tag}</span>
                              <button
                                onClick={() => removeTag(tag)}
                                className="text-purple-500 hover:text-purple-700 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-3">
                      <FormattedMessage id="journal.newEntry.contentLabel" />
                    </label>
                    <textarea
                      value={newEntry.content}
                      onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                      placeholder={intl.formatMessage({ id: 'journal.newEntry.contentPlaceholder' })}
                      rows={12}
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 resize-none text-base leading-relaxed"
                    />
                    <div className="mt-2 text-sm text-black">
                      {newEntry.content.length > 0 && (
                        <FormattedMessage 
                          id="journal.newEntry.readingTimeEstimate" 
                          values={{ minutes: calculateReadingTime(newEntry.content) }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      checked={newEntry.isPrivate}
                      onChange={(e) => setNewEntry({ ...newEntry, isPrivate: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                    />
                    <label htmlFor="isPrivate" className="text-sm font-medium text-black flex items-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>
                        <FormattedMessage id="journal.newEntry.privateLabel" />
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                    <button
                      onClick={() => setIsWriting(false)}
                      className="px-6 py-3 border border-gray-300 rounded-xl text-black font-medium hover:bg-gray-50 transition-all duration-200"
                    >
                      <FormattedMessage id="journal.newEntry.cancelButton" />
                    </button>
                    <button
                      onClick={saveEntry}
                      disabled={!newEntry.title.trim() || !newEntry.content.trim()}
                      className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      <Save className="h-5 w-5" />
                      <span>
                        <FormattedMessage id="journal.newEntry.saveButton" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Entries List */}
        <div className={viewMode === 'cards' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
          {sortedAndFilteredEntries.length === 0 ? (
            <div className="col-span-full bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-12 text-center">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-black mb-3">
                {entries.length === 0 ? 
                  <FormattedMessage id="journal.emptyState.noEntries" /> : 
                  <FormattedMessage id="journal.emptyState.noResults" />
                }
              </h3>
              <p className="text-black mb-6 max-w-md mx-auto leading-relaxed">
                {entries.length === 0 
                  ? <FormattedMessage id="journal.emptyState.noEntriesDescription" />
                  : <FormattedMessage id="journal.emptyState.noResultsDescription" />
                }
              </p>
              {entries.length === 0 && (
                <button
                  onClick={() => setIsWriting(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <FormattedMessage id="journal.emptyState.writeFirstEntry" />
                </button>
              )}
            </div>
          ) : (
            sortedAndFilteredEntries.map((entry) => {
              const moodData = getMoodData(entry.mood || '😊')
              const isExpanded = expandedEntry === entry.id
              
              return (
                <div key={entry.id} className={`bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-lg ${viewMode === 'list' ? 'mx-auto max-w-4xl' : ''}`}>
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${moodData.color} p-6`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-4">
                        <div className="text-4xl filter drop-shadow-sm">{entry.mood}</div>
                        <div className="text-white">
                          <h3 className="text-xl font-bold mb-1">{entry.title}</h3>
                          <div className="flex items-center space-x-3 text-sm text-white/90">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(entry.date)}</span>
                            </div>
                            {entry.readingTime && (
                              <>
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                  <Eye className="h-4 w-4" />
                                  <FormattedMessage 
                                    id="journal.readingTime" 
                                    values={{ minutes: entry.readingTime }} 
                                  />
                                </div>
                              </>
                            )}
                            {entry.isPrivate && (
                              <>
                                <span>•</span>
                                <div className="flex items-center space-x-1">
                                  <Lock className="h-4 w-4" />
                                  <span>
                                    <FormattedMessage id="journal.private" />
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingEntry(entry)}
                          className="text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/10 p-2 rounded-lg"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/10 p-2 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className={`text-black leading-relaxed mb-4 transition-all duration-300 ${
                      isExpanded ? '' : 'line-clamp-3'
                    }`}>
                      {entry.content}
                    </p>

                    {entry.content.length > 200 && (
                      <button
                        onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
                      >
                        <span>
                          {isExpanded ? 
                            <FormattedMessage id="journal.collapseButton" /> : 
                            <FormattedMessage id="journal.expandButton" />
                          }
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}

                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                        {entry.tags.map(tag => (
                          <span
                            key={tag}
                            className="bg-gray-100 text-black px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors duration-200"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
        
        {/* Edit Modal */}
        {editingEntry && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-xl">
                      <Edit3 className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-black">
                      <FormattedMessage id="journal.editEntry.title" />
                    </h3>
                  </div>
                  <button
                    onClick={() => setEditingEntry(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200 hover:bg-gray-100 p-2 rounded-xl"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-3">
                      <FormattedMessage id="journal.editEntry.titleLabel" />
                    </label>
                    <input
                      type="text"
                      value={editingEntry.title}
                      onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-3">
                      <FormattedMessage id="journal.editEntry.moodLabel" />
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {moods.map(mood => (
                        <button
                          key={mood.emoji}
                          onClick={() => setEditingEntry({ ...editingEntry, mood: mood.emoji })}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-105 ${
                            editingEntry.mood === mood.emoji
                              ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-1">{mood.emoji}</div>
                          <div className="text-xs font-medium text-black">{mood.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-black mb-3">
                      <FormattedMessage id="journal.editEntry.contentLabel" />
                    </label>
                    <textarea
                      value={editingEntry.content}
                      onChange={(e) => setEditingEntry({ ...editingEntry, content: e.target.value })}
                      rows={12}
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 resize-none text-base leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                    <button
                      onClick={() => setEditingEntry(null)}
                      className="px-6 py-3 border border-gray-300 rounded-xl text-black font-medium hover:bg-gray-50 transition-all duration-200"
                    >
                      <FormattedMessage id="journal.editEntry.cancelButton" />
                    </button>
                    <button
                      onClick={updateEntry}
                      className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                    >
                      <Save className="h-5 w-5" />
                      <span>
                        <FormattedMessage id="journal.editEntry.saveButton" />
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}
