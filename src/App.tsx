import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { AiQuestionGenerator } from './components/AiQuestionGenerator';
import { CbtExamView } from './components/CbtExamView';
import { BimbinganScheduleView } from './components/BimbinganScheduleView';
import { ModulesView } from './components/ModulesView';
import { DeviceTrackingView } from './components/DeviceTrackingView';
import { GasIntegrationView } from './components/GasIntegrationView';
import { QuestionAnalysisView } from './components/QuestionAnalysisView';
import { LearningMediaView } from './components/LearningMediaView';
import { LoginModal } from './components/LoginModal';
import { SchoolSettingsModal } from './components/SchoolSettingsModal';
import {
  UserProfile,
  Question,
  ExamPacket,
  ExamResult,
  OsnSubject,
  BimbinganSchedule,
  OsnModule,
  LearningMedia,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_QUESTIONS,
  INITIAL_EXAMS,
  INITIAL_BIMBINGAN_SCHEDULES,
  INITIAL_MODULES,
  INITIAL_EXAM_RESULTS,
  INITIAL_LEARNING_MEDIA,
} from './data/mockData';
import { getOrCreateDeviceToken, forceGenerateNewDeviceToken } from './services/deviceSecurity';
import { GraduationCap, ShieldCheck } from 'lucide-react';
import {
  saveExamResultToFirestore,
  subscribeExamResults,
  saveUserToFirestore,
  subscribeUsers,
  syncInitialUsersToFirestore,
  saveExamPacketToFirestore,
  saveLearningMediaToFirestore,
  subscribeLearningMedia,
  saveQuestionToFirestore,
  saveMultipleQuestionsToFirestore,
  saveScheduleToFirestore,
  saveModuleToFirestore,
  subscribeExamPackets,
  syncInitialExamsToFirestore,
} from './services/firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('osn_registered_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const existingIds = new Set(parsed.map((u: UserProfile) => u.id));
          const missingDefaults = INITIAL_USERS.filter((u) => !existingIds.has(u.id));
          return [...parsed, ...missingDefaults];
        }
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_USERS;
  });

  const handleRegisterUser = (newUser: UserProfile) => {
    setAllUsers((prev) => {
      const updated = [newUser, ...prev.filter((u) => u.id !== newUser.id)];
      try {
        localStorage.setItem('osn_registered_users', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    saveUserToFirestore(newUser).catch((err) =>
      console.warn('Firebase user sync warning:', err)
    );
  };
  // Realtime synchronization of User Accounts with Firebase Firestore
  useEffect(() => {
    // Push current list of accounts to Firestore to guarantee presence in Firebase
    syncInitialUsersToFirestore(allUsers);

    // Subscribe to realtime updates from Firestore
    const unsubscribe = subscribeUsers((firestoreUsers) => {
      if (firestoreUsers && firestoreUsers.length > 0) {
        setAllUsers((prev) => {
          const map = new Map<string, UserProfile>();
          prev.forEach((u) => map.set(u.id, u));
          firestoreUsers.forEach((u) => map.set(u.id, u));
          const merged = Array.from(map.values());
          try {
            localStorage.setItem('osn_registered_users', JSON.stringify(merged));
          } catch (e) {
            console.error(e);
          }
          return merged;
        });
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isSchoolSettingsOpen, setIsSchoolSettingsOpen] = useState<boolean>(false);

  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [exams, setExams] = useState<ExamPacket[]>(() => {
    try {
      const saved = localStorage.getItem('osn_cbt_exams');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const savedMap = new Map<string, ExamPacket>();
          parsed.forEach((e: ExamPacket) => savedMap.set(e.id, e));

          const mergedDefaults = INITIAL_EXAMS.map((initEx) => {
            const savedEx = savedMap.get(initEx.id);
            if (savedEx) {
              const hasQuestions = Array.isArray(savedEx.questions) && savedEx.questions.length > 0;
              return {
                ...initEx,
                ...savedEx,
                questions: hasQuestions ? savedEx.questions : initEx.questions,
              };
            }
            return initEx;
          });

          const customExams = parsed.filter(
            (e: ExamPacket) => !INITIAL_EXAMS.some((initEx) => initEx.id === e.id)
          );
          return [...mergedDefaults, ...customExams];
        }
      }
    } catch (e) {
      console.error('Error reading exams from localStorage:', e);
    }
    return INITIAL_EXAMS;
  });

  // Save exams to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('osn_cbt_exams', JSON.stringify(exams));
    } catch (e) {
      console.error('Error saving exams to localStorage:', e);
    }
  }, [exams]);

  // Realtime synchronization of Exam Packets with Firebase Firestore
  useEffect(() => {
    syncInitialExamsToFirestore(INITIAL_EXAMS).catch((err) =>
      console.warn('Sync initial exams warning:', err)
    );

    const unsubscribe = subscribeExamPackets((firestoreExams) => {
      if (firestoreExams && firestoreExams.length > 0) {
        setExams((prev) => {
          const map = new Map<string, ExamPacket>();
          prev.forEach((ex) => map.set(ex.id, ex));

          firestoreExams.forEach((fsEx) => {
            const existing = map.get(fsEx.id);
            const validQuestions =
              Array.isArray(fsEx.questions) && fsEx.questions.length > 0
                ? fsEx.questions
                : Array.isArray(existing?.questions) && existing.questions.length > 0
                ? existing.questions
                : INITIAL_EXAMS.find((ie) => ie.id === fsEx.id)?.questions || [];

            map.set(fsEx.id, {
              ...fsEx,
              questions: validQuestions,
            });
          });
          return Array.from(map.values());
        });
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const [bimbinganSchedules, setBimbinganSchedules] = useState<BimbinganSchedule[]>(
    INITIAL_BIMBINGAN_SCHEDULES
  );
  const [modules, setModules] = useState<OsnModule[]>(INITIAL_MODULES);
  const [examResults, setExamResults] = useState<ExamResult[]>(() => {
    try {
      const saved = localStorage.getItem('osn_cbt_exam_results');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading exam results from localStorage:', e);
    }
    return INITIAL_EXAM_RESULTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('osn_cbt_exam_results', JSON.stringify(examResults));
    } catch (e) {
      console.error('Error saving exam results to localStorage:', e);
    }
  }, [examResults]);

  // Realtime synchronization with Firebase Firestore
  useEffect(() => {
    const unsubscribe = subscribeExamResults((firestoreResults) => {
      if (firestoreResults && firestoreResults.length > 0) {
        setExamResults((prev) => {
          const mergedMap = new Map<string, ExamResult>();
          prev.forEach((r) => mergedMap.set(r.id, r));
          firestoreResults.forEach((r) => mergedMap.set(r.id, r));
          return Array.from(mergedMap.values());
        });
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const [learningMediaList, setLearningMediaList] = useState<LearningMedia[]>(() => {
    try {
      const saved = localStorage.getItem('osn_learning_media');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading learning media from localStorage:', e);
    }
    return INITIAL_LEARNING_MEDIA;
  });

  useEffect(() => {
    try {
      localStorage.setItem('osn_learning_media', JSON.stringify(learningMediaList));
    } catch (e) {
      console.error('Error saving learning media to localStorage:', e);
    }
  }, [learningMediaList]);

  // Realtime synchronization of Learning Media with Firebase Firestore
  useEffect(() => {
    const unsubscribe = subscribeLearningMedia((firestoreMedia) => {
      if (firestoreMedia && firestoreMedia.length > 0) {
        setLearningMediaList((prev) => {
          const mergedMap = new Map<string, LearningMedia>();
          prev.forEach((m) => mergedMap.set(m.id, m));
          firestoreMedia.forEach((m) => mergedMap.set(m.id, m));
          return Array.from(mergedMap.values());
        });
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Jump helpers from dashboard / modules
  const [selectedSubjectForGenerator, setSelectedSubjectForGenerator] = useState<OsnSubject>('Matematika');
  const [activeExamFromDashboard, setActiveExamFromDashboard] = useState<ExamPacket | null>(null);

  // Device Tracking state
  const [deviceInfo, setDeviceInfo] = useState(getOrCreateDeviceToken());

  // Verify / Bind device token on mount or user switch
  useEffect(() => {
    const info = getOrCreateDeviceToken();
    setDeviceInfo(info);

    if (isLoggedIn && currentUser) {
      fetch('/api/device-sessions/verify-or-bind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser.id,
          studentName: currentUser.name,
          deviceToken: info.token,
          deviceName: info.name,
        }),
      })
        .then((res) => res.json())
        .catch((err) => console.log('Device binding notice:', err));
    }
  }, [currentUser, isLoggedIn]);

  // Guard: Restrict security (Tracking 1-Device), gas (Export GAS), and analysis views to Admin only (Dihilangkan dari Guru & Siswa)
  useEffect(() => {
    if (
      currentUser.role !== 'admin' &&
      (activeTab === 'security' || activeTab === 'gas' || activeTab === 'analysis')
    ) {
      setActiveTab('dashboard');
    }
  }, [currentUser.role, activeTab]);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.subject) {
      setSelectedSubjectForGenerator(user.subject);
    }
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);

    // Bind device token immediately upon login
    fetch('/api/device-sessions/verify-or-bind', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId: user.id,
        studentName: user.name,
        deviceToken: deviceInfo.token,
        deviceName: deviceInfo.name,
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.log('Device login bind notice:', err));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsLoginModalOpen(true);
  };

  const handleAddQuestion = (newQuestion: Question) => {
    setQuestions((prev) => [newQuestion, ...prev]);
    saveQuestionToFirestore(newQuestion).catch((err) =>
      console.warn('Firebase question sync warning:', err)
    );
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleAddBimbinganSchedule = (newSchedule: BimbinganSchedule) => {
    setBimbinganSchedules((prev) => [newSchedule, ...prev]);
    saveScheduleToFirestore(newSchedule).catch((err) =>
      console.warn('Firebase schedule sync warning:', err)
    );
  };

  const handleAddQuestionsToSchedule = (scheduleId: string, newQuestions: Question[]) => {
    setBimbinganSchedules((prev) =>
      prev.map((s) => {
        if (s.id === scheduleId) {
          const updated = {
            ...s,
            coachingQuestions: [...s.coachingQuestions, ...newQuestions],
          };
          saveScheduleToFirestore(updated).catch((err) =>
            console.warn('Firebase schedule questions sync warning:', err)
          );
          return updated;
        }
        return s;
      })
    );
    saveMultipleQuestionsToFirestore(newQuestions).catch((err) =>
      console.warn('Firebase multiple questions sync warning:', err)
    );
  };

  const handleAddModule = (newModule: OsnModule) => {
    setModules((prev) => [newModule, ...prev]);
    saveModuleToFirestore(newModule).catch((err) =>
      console.warn('Firebase module sync warning:', err)
    );
  };

  const handleAddQuestionsToModule = (moduleId: string, newQuestions: Question[]) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id === moduleId) {
          const existingQuestions = m.moduleQuestions || [];
          const updated = {
            ...m,
            moduleQuestions: [...existingQuestions, ...newQuestions],
          };
          saveModuleToFirestore(updated).catch((err) =>
            console.warn('Firebase module questions sync warning:', err)
          );
          return updated;
        }
        return m;
      })
    );
    saveMultipleQuestionsToFirestore(newQuestions).catch((err) =>
      console.warn('Firebase multiple questions sync warning:', err)
    );
  };

  const handleAddExamPacket = (newExam: ExamPacket) => {
    setExams((prev) => [newExam, ...prev]);
    saveExamPacketToFirestore(newExam).catch((err) =>
      console.warn('Firebase exam packet sync warning:', err)
    );
  };

  const handleFinishExam = (result: ExamResult) => {
    const studentAttempts = examResults.filter(
      (r) => r.examId === result.examId && r.studentId === result.studentId
    ).length;
    const finalResult: ExamResult = {
      ...result,
      attemptNumber: result.attemptNumber || studentAttempts + 1,
    };
    setExamResults((prev) => [finalResult, ...prev]);
    saveExamResultToFirestore(finalResult).catch((err) =>
      console.warn('Firebase exam result sync warning:', err)
    );
  };

  const handleAddMedia = (newMedia: LearningMedia) => {
    setLearningMediaList((prev) => [newMedia, ...prev.filter((m) => m.id !== newMedia.id)]);
    saveLearningMediaToFirestore(newMedia).catch((err) =>
      console.warn('Firebase learning media sync warning:', err)
    );
  };

  const handleDeleteMedia = (mediaId: string) => {
    setLearningMediaList((prev) => prev.filter((m) => m.id !== mediaId));
  };

  const handleStartExamFromDashboard = (exam: ExamPacket) => {
    setActiveExamFromDashboard(exam);
    setActiveTab('cbt');
  };

  const handleSelectSubjectForGen = (sub: OsnSubject) => {
    setSelectedSubjectForGenerator(sub);
  };

  const handleRefreshDeviceToken = () => {
    setDeviceInfo(getOrCreateDeviceToken());
  };

  const handleSendToGoogleSheets = async (result: ExamResult): Promise<boolean> => {
    console.log('Sending result to GAS:', result);
    return true;
  };

  return (
    <div className="min-h-screen bg-[#10081a] text-slate-100 flex flex-col font-sans selection:bg-[#9333ea] selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        allUsers={allUsers}
        deviceToken={deviceInfo.token}
        onResetDevicePrompt={() => setActiveTab('security')}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onOpenSchoolSettings={() => setIsSchoolSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            totalQuestions={questions.length}
            exams={exams}
            bimbinganSchedules={bimbinganSchedules}
            setActiveTab={setActiveTab}
            onSelectSubjectForGenerator={handleSelectSubjectForGen}
            onStartExam={handleStartExamFromDashboard}
          />
        )}

        {activeTab === 'bimbingan' && (
          <BimbinganScheduleView
            schedules={bimbinganSchedules}
            currentUser={currentUser}
            onAddSchedule={handleAddBimbinganSchedule}
            onAddQuestionsToSchedule={handleAddQuestionsToSchedule}
          />
        )}

        {activeTab === 'cbt' && (
          <CbtExamView
            exams={exams}
            currentUser={currentUser}
            onFinishExam={handleFinishExam}
            activeExamFromDashboard={activeExamFromDashboard}
            onClearActiveExamFromDashboard={() => setActiveExamFromDashboard(null)}
            onSendToGoogleSheets={handleSendToGoogleSheets}
            onAddExamPacket={handleAddExamPacket}
            questionBank={questions}
            examResults={examResults}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'generator' && (
          <AiQuestionGenerator
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            selectedSubjectDefault={selectedSubjectForGenerator}
            bimbinganSchedules={bimbinganSchedules}
            onAddQuestionsToSchedule={handleAddQuestionsToSchedule}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'modules' && (
          <ModulesView
            modules={modules}
            onAddModule={handleAddModule}
            onAddQuestionsToModule={handleAddQuestionsToModule}
            currentUser={currentUser}
            onSelectSubjectForGenerator={handleSelectSubjectForGen}
            setActiveTab={setActiveTab}
            activeSubject={selectedSubjectForGenerator}
          />
        )}

        {activeTab === 'media' && (
          <LearningMediaView
            mediaList={learningMediaList}
            currentUser={currentUser}
            onAddMedia={handleAddMedia}
            onDeleteMedia={handleDeleteMedia}
            initialSubject={selectedSubjectForGenerator}
          />
        )}

        {activeTab === 'security' && currentUser.role === 'admin' && (
          <DeviceTrackingView
            currentUser={currentUser}
            currentDeviceToken={deviceInfo.token}
            onRefreshDeviceToken={handleRefreshDeviceToken}
          />
        )}

        {activeTab === 'analysis' && currentUser.role === 'admin' && (
          <QuestionAnalysisView
            questions={questions}
            exams={exams}
            examResults={examResults}
            currentUser={currentUser}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'gas' && currentUser.role === 'admin' && (
          <GasIntegrationView examResults={examResults} questions={questions} />
        )}
      </main>

      {/* Login & Register Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegisterUser}
        allUsers={allUsers}
        deviceToken={deviceInfo.token}
      />

      {/* Admin School Logo & Identity Settings Modal */}
      <SchoolSettingsModal
        isOpen={isSchoolSettingsOpen}
        onClose={() => setIsSchoolSettingsOpen(false)}
      />

      {/* Footer with SMAN 1 Pardasuka Identity */}
      <footer className="mt-auto border-t border-purple-950 bg-[#0c0615] py-8 text-xs text-purple-300/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-700/60 flex items-center justify-center text-amber-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">SMAN 1 PARDASUKA</p>
              <p className="text-[11px] text-purple-400">
                Kabupaten Pringsewu, Provinsi Lampung • Portal Pembinaan Olimpiade Sains (OSN)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Sistem 1-Device Terproteksi
            </span>
            <span>•</span>
            <span>Jadwal Bimbingan & CBT Terpisah</span>
            <span>•</span>
            <span>AI Bloom & SOLO Engine</span>
            <span>•</span>
            <span>Google Apps Script Sync</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
