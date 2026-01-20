'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, BookOpen, CheckSquare, Square, Play, Loader2, Eye } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { ExamService, Question } from '@/services/examService';
import PracticeSessionModal from './PracticeSessionModal';
import SolutionViewerModal from './SolutionViewerModal';
import LatexRenderer from '@/components/ui/LatexRenderer';

export default function PYQExplorer({ examType }: { examType?: string }) {
  // Filter States
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Data States
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals
  const [isPracticeOpen, setIsPracticeOpen] = useState(false);
  const [isSolutionOpen, setIsSolutionOpen] = useState(false);

  // Fetch Questions on Load & Filter Change
  useEffect(() => {
    let isMounted = true;

    async function fetchQuestions() {
      setLoading(true);
      try {
        const filters: any = {};
        if (selectedSubject !== 'All') filters.subject = selectedSubject;
        if (selectedDifficulty !== 'All') filters.difficulty = selectedDifficulty;
        if (selectedYear !== 'All') filters.year = parseInt(selectedYear);

        const data = await ExamService.getPYQs(examType || 'jee-mains', filters);

        if (isMounted) {
          setQuestions(data);
          setLoading(false);
          // Clear selection when filters change significantly? Maybe better to keep if valid.
          // For simplicity, let's keep.
        }
      } catch (error) {
        console.error("Failed to fetch questions", error);
        if (isMounted) setLoading(false);
      }
    }

    fetchQuestions();

    return () => { isMounted = false; };
  }, [selectedSubject, selectedDifficulty, selectedYear, examType]);

  // Client-side Searching
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchText = q.text.toLowerCase().includes(query);
        const matchTopic = q.topics.some(t => t.toLowerCase().includes(query));
        if (!matchText && !matchTopic) return false;
      }
      return true;
    });
  }, [questions, searchQuery]);

  // Selection Handlers
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredQuestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQuestions.map(q => q.id)));
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const selectedQuestions = questions.filter(q => selectedIds.has(q.id));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
      {/* Header / Filters */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            PYQ Explorer
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search topics..."
                className="pl-9 h-9 w-full md:w-64 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="All">All Subjects</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Math">Math</option>
            {examType === 'bitsat' && <option value="English">English</option>}
          </select>

          <select
            className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="All">All Years</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </select>
        </div>
      </div>

      {/* List View */}
      <div className="flex-1 overflow-y-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        )}

        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 w-12 text-center border-b border-gray-100">
                <button onClick={toggleAll} className="hover:text-blue-600">
                  {selectedIds.size > 0 && selectedIds.size === filteredQuestions.length ? (
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 border-b border-gray-100">Year</th>
              <th className="px-4 py-3 border-b border-gray-100 w-1/2">Question</th>
              <th className="px-4 py-3 border-b border-gray-100">Subject</th>
              <th className="px-4 py-3 border-b border-gray-100 text-right">Difficulty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredQuestions.map((q) => {
              const isSelected = selectedIds.has(q.id);
              return (
                <tr
                  key={q.id}
                  className={`group transition-colors hover:bg-blue-50/30 ${isSelected ? 'bg-blue-50/50' : 'bg-white'}`}
                >
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleSelection(q.id)} className="text-gray-400 group-hover:text-blue-600">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">{q.year}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      {q.topics.map((t, idx) => (
                        <span key={idx} className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">{t}</span>
                      ))}
                    </div>
                    <div className="text-sm font-medium text-gray-900 line-clamp-2">
                      <LatexRenderer content={q.text} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{q.subject}</td>
                  <td className="px-4 py-3 text-right">
                    <Badge className={`inline-flex ${getDifficultyColor(q.difficulty)}`}>
                      {q.difficulty}
                    </Badge>
                  </td>
                </tr>
              );
            })}
            {!loading && filteredQuestions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  No questions found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Action Bar (Conditional) */}
      {selectedIds.size > 0 && (
        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
              {selectedIds.size}
            </div>
            <span className="text-sm font-medium text-gray-600">Selected</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setIsSolutionOpen(true)}>
              <Eye className="w-4 h-4 mr-2" /> View Solutions
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md shadow-blue-200"
              onClick={() => setIsPracticeOpen(true)}
            >
              <Play className="w-4 h-4" />
              Practice Selected
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <PracticeSessionModal
        isOpen={isPracticeOpen}
        onClose={() => setIsPracticeOpen(false)}
        examId={examType || 'jee-mains'}
        onComplete={() => console.log('Practice complete')}
        initialQuestions={selectedQuestions}
      />

      <SolutionViewerModal
        isOpen={isSolutionOpen}
        onClose={() => setIsSolutionOpen(false)}
        questions={selectedQuestions}
      />
    </div>
  );
}
