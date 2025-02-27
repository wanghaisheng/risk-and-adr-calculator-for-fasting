// Make React available in module scope
const { useState, useEffect } = window.React;

function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showSubmit, setShowSubmit] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [animation, setAnimation] = useState('');
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);
  const [dateTime, setDateTime] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [reportStatus, setReportStatus] = useState('loading'); // 'loading', 'ready'
  const [reportData, setReportData] = useState(null);

  // New state for 7-day challenge
  const [challengeData, setChallengeData] = useState(() => {
    const saved = localStorage.getItem('healthChallengeData');
    return saved ? JSON.parse(saved) : {
      currentDay: 1,
      lastCompleted: null,
      dayStatuses: Array(7).fill('locked'),
      completedDays: [],
      completionData: []
    };
  });
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  useEffect(() => {
    // Set current date and time on load
    const now = new Date();
    setDateTime(now.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }));
    
    // Check challenge status on load
    checkChallengeStatus();
  }, []);

  // Check if we should unlock today's challenge
  const checkChallengeStatus = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    if (challengeData.lastCompleted) {
      const lastDate = new Date(challengeData.lastCompleted);
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      // If last completed is today, keep status as is
      if (challengeData.lastCompleted === today) {
        // Already completed today
        return;
      }
      
      // If last completion was yesterday, unlock next day
      if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
        // Advance to next day if completed yesterday
        if (challengeData.currentDay < 7) {
          const newDayStatuses = [...challengeData.dayStatuses];
          newDayStatuses[challengeData.currentDay] = 'unlocked';
          
          const newChallengeData = {
            ...challengeData,
            currentDay: challengeData.currentDay + 1,
            dayStatuses: newDayStatuses
          };
          
          setChallengeData(newChallengeData);
          localStorage.setItem('healthChallengeData', JSON.stringify(newChallengeData));
        }
      }
      
      // If more than one day has passed, break the streak
      const daysDiff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
      if (daysDiff > 1) {
        resetChallenge();
      }
    } else {
      // First time, unlock day 1
      const newDayStatuses = [...challengeData.dayStatuses];
      newDayStatuses[0] = 'unlocked';
      
      const newChallengeData = {
        ...challengeData,
        dayStatuses: newDayStatuses
      };
      
      setChallengeData(newChallengeData);
      localStorage.setItem('healthChallengeData', JSON.stringify(newChallengeData));
    }
  };

  const resetChallenge = () => {
    const newChallengeData = {
      currentDay: 1,
      lastCompleted: null,
      dayStatuses: ['unlocked', ...Array(6).fill('locked')],
      completedDays: [],
      completionData: []
    };
    
    setChallengeData(newChallengeData);
    localStorage.setItem('healthChallengeData', JSON.stringify(newChallengeData));
  };

  // Award points when answering questions
  useEffect(() => {
    const totalAnswered = Object.keys(answers).length;
    if (totalAnswered > 0) {
      setPoints(totalAnswered * 10);
      // Increase streak for consecutive answers
      if(totalAnswered > streak) {
        setStreak(totalAnswered);
        // Show animation when streak increases
        setAnimation('pulse');
        setTimeout(() => setAnimation(''), 1000);
      }
    }
  }, [answers, streak]);

  const questions = [
    {
      id: 'Q1',
      questionText: '运动量 (步数)',
      type: 'number',
      placeholder: '请输入步数'
    },
    {
      id: 'Q2',
      questionText: '饮水量 (毫升)',
      type: 'number',
      placeholder: '请输入毫升'
    },
    {
      id: 'Q3',
      questionText: '大便次数',
      type: 'number',
      placeholder: '请输入次数'
    },
    {
      id: 'Q4',
      questionText: '睡眠时长 (小时)',
      type: 'number',
      placeholder: '请输入小时'
    },
    {
      id: 'Q5',
      questionText: '寒热感受',
      type: 'radio',
      answerOptions: [
        { answerText: '怕冷', value: '怕冷' },
        { answerText: '怕热', value: '怕热' },
        { answerText: '既怕冷又怕热', value: '既怕冷又怕热' },
        { answerText: '无上述变化', value: '无上述变化' },
      ],
    },
    {
      id: 'Q6',
      questionText: '心慌',
      type: 'radio',
      answerOptions: [
        { answerText: '是', value: '是' },
        { answerText: '否', value: '否' },
      ],
    },
    {
      id: 'Q7',
      questionText: '虚汗',
      type: 'radio',
      answerOptions: [
        { answerText: '是', value: '是' },
        { answerText: '否', value: '否' },
      ],
    },
    {
      id: 'Q8',
      questionText: '整体感受',
      type: 'radio',
      answerOptions: [
        { answerText: '非常轻松', value: '非常轻松' },
        { answerText: '轻松', value: '轻松' },
        { answerText: '一般', value: '一般' },
        { answerText: '艰难', value: '艰难' },
        { answerText: '非常艰难', value: '非常艰难' },
      ],
    },
    {
      id: 'Q9',
      questionText: '情绪变化',
      type: 'checkbox',
      answerOptions: [
        { answerText: '焦虑', value: '焦虑' },
        { answerText: '恐惧', value: '恐惧' },
        { answerText: '低落', value: '低落' },
        { answerText: '兴奋', value: '兴奋' },
        { answerText: '愤怒', value: '愤怒' },
        { answerText: '无上述变化', value: '无上述变化' },
      ],
    },
    {
      id: 'Q10',
      questionText: '头晕程度',
      type: 'slider',
      min: 0,
      max: 10,
      step: 1,
      labels: ['一点没有', '有一些', '非常强烈']
    },
    {
      id: 'Q11',
      questionText: '头痛程度',
      type: 'slider',
      min: 0,
      max: 10,
      step: 1,
      labels: ['一点没有', '有一些', '非常强烈']
    },
    {
      id: 'Q12',
      questionText: '乏力程度',
      type: 'slider',
      min: 0,
      max: 10,
      step: 1,
      labels: ['一点没有', '有一些', '非常强烈']
    },
    {
      id: 'Q13',
      questionText: '饥饿程度',
      type: 'slider',
      min: 0,
      max: 10,
      step: 1,
      labels: ['一点没有', '有一些', '非常强烈']
    },
    {
      id: 'Q14',
      questionText: '烧心程度',
      type: 'slider',
      min: 0,
      max: 10,
      step: 1,
      labels: ['一点没有', '有一些', '非常强烈']
    },
    {
      id: 'Q15',
      questionText: '情绪波动',
      type: 'slider',
      min: 0,
      max: 10,
      step: 1,
      labels: ['一点没有', '有一些', '非常强烈']
    },
    {
      id: 'Q16',
      questionText: '睡眠质量',
      type: 'slider',
      min: 0,
      max: 10,
      step: 1,
      labels: ['很差', '一般', '很好']
    },
  ];

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowSubmit(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleInputChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCheckboxChange = (questionId, value) => {
    const currentValues = answers[questionId] || [];
    let newValues;
    
    // Handle "无上述变化" special case
    if (value === '无上述变化') {
      // If selecting "无上述变化", clear other selections
      newValues = currentValues.includes(value) ? [] : [value];
    } else {
      // If selecting anything else, remove "无上述变化" if present
      if (currentValues.includes(value)) {
        newValues = currentValues.filter(v => v !== value);
      } else {
        newValues = [...currentValues.filter(v => v !== '无上述变化'), value];
      }
    }
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: newValues
    }));
  };

  const handleSubmit = () => {
    setShowSummary(true);
    
    // Set initial report status to loading
    setReportStatus('loading');
    
    // Update challenge data
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const completedDay = challengeData.currentDay;
    const newDayStatuses = [...challengeData.dayStatuses];
    newDayStatuses[completedDay - 1] = 'completed';
    
    if (completedDay < 7) {
      newDayStatuses[completedDay] = 'unlocked';
    }
    
    const newCompletedDays = [...challengeData.completedDays, completedDay];
    const newCompletionData = [...challengeData.completionData, {
      day: completedDay,
      date: today,
      answers: {...answers},
      points: points
    }];
    
    const newChallengeData = {
      ...challengeData,
      currentDay: Math.min(completedDay + 1, 7),
      lastCompleted: today,
      dayStatuses: newDayStatuses,
      completedDays: newCompletedDays,
      completionData: newCompletionData
    };
    
    setChallengeData(newChallengeData);
    localStorage.setItem('healthChallengeData', JSON.stringify(newChallengeData));
    
    // Simulate API call to generate report
    // This is where you would call the deepseek API in the future
    setTimeout(() => {
      // Generate a simple report based on the answers
      const report = generatePreliminaryReport();
      setReportData(report);
      setReportStatus('ready');
    }, 2000); // Simulate 2 second API call
  };

  const generatePreliminaryReport = () => {
    // Extract some key metrics to generate insights
    const steps = answers['Q1'] ? parseInt(answers['Q1']) : 0;
    const waterIntake = answers['Q2'] ? parseInt(answers['Q2']) : 0;
    const sleepHours = answers['Q4'] ? parseFloat(answers['Q4']) : 0;
    const stressLevel = answers['Q15'] ? parseInt(answers['Q15']) : 0;
    const sleepQuality = answers['Q16'] ? parseInt(answers['Q16']) : 0;
    
    // Create sections for the report
    return {
      date: dateTime,
      overview: {
        title: "今日健康概况",
        content: `您今天记录了 ${steps} 步，摄入了 ${waterIntake} 毫升水，睡眠 ${sleepHours} 小时。`,
        score: Math.min(Math.round((steps/5000 + waterIntake/2000 + sleepHours/8) * 33), 100)
      },
      insights: [
        {
          title: "活动与水分",
          content: steps > 8000 
            ? "您今天的活动量很好！保持这个水平有助于心血管健康。" 
            : "建议增加日常活动量，争取达到每天8000-10000步。",
          icon: "👟"
        },
        {
          title: "睡眠状况",
          content: sleepQuality > 7 
            ? "您的睡眠质量良好，这对身体恢复非常重要。" 
            : "您的睡眠质量有待改善，建议规律作息，睡前避免使用电子设备。",
          icon: "😴"
        },
        {
          title: "情绪管理",
          content: stressLevel < 4 
            ? "您今天的情绪状态平稳，这对整体健康很有帮助。" 
            : "注意到您今天的情绪波动较大，建议尝试冥想或深呼吸来缓解压力。",
          icon: "🧘‍♀️"
        }
      ],
      recommendations: [
        "保持规律作息，建议每晚23点前入睡",
        "每天饮水2000毫升以上",
        "增加日常活动量，减少久坐时间",
        "注意饮食均衡，多摄入蔬果"
      ]
    };
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowSubmit(false);
    setShowSummary(false);
    setShowOnboarding(false); // Don't show onboarding when resetting
  };

  const startQuiz = () => {
    setShowOnboarding(false);
  };

  const openChallengeModal = () => {
    setShowChallengeModal(true);
  };

  const closeChallengeModal = () => {
    setShowChallengeModal(false);
  };

  const renderQuestionInput = (question) => {
    switch (question.type) {
      case 'number':
        return (
          <div className="relative">
            <input
              type="number"
              placeholder={question.placeholder}
              value={answers[question.id] || ''}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              className="py-4 px-5 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 w-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/40"
            />
            {question.id === 'Q1' && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 5L5 19M6.5 9C7.88071 9 9 7.88071 9 6.5C9 5.11929 7.88071 4 6.5 4C5.11929 4 4 5.11929 4 6.5C4 7.88071 5.11929 9 6.5 9ZM17.5 20C18.8807 20 20 18.8807 20 17.5C20 16.1193 18.8807 15 17.5 15C16.1193 15 15 16.1193 15 17.5C15 18.8807 16.1193 20 17.5 20Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
            {question.id === 'Q2' && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16C15.866 16 19 12.866 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 12.866 8.13401 16 12 16Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 16V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 19H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
        );
      case 'radio':
        return (
          <div className="grid grid-cols-1 gap-3">
            {question.answerOptions.map((option, index) => (
              <label 
                key={index} 
                className={`flex items-center py-4 px-5 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 ${answers[question.id] === option.value ? 'bg-blue-500/40 ring-2 ring-blue-300' : ''}`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={answers[question.id] === option.value}
                  onChange={() => handleInputChange(question.id, option.value)}
                  className="mr-3 h-5 w-5 accent-blue-500"
                />
                <span className="text-lg">{option.answerText}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {question.answerOptions.map((option, index) => (
              <label 
                key={index} 
                className={`flex items-center py-4 px-5 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 ${(answers[question.id] || []).includes(option.value) ? 'bg-blue-500/40 ring-2 ring-blue-300' : ''}`}
              >
                <input
                  type="checkbox"
                  value={option.value}
                  checked={(answers[question.id] || []).includes(option.value)}
                  onChange={() => handleCheckboxChange(question.id, option.value)}
                  className="mr-3 h-5 w-5 accent-blue-500"
                />
                <span className="text-lg">{option.answerText}</span>
              </label>
            ))}
          </div>
        );
      case 'slider':
        return (
          <div className="w-full mt-4">
            <div className="flex justify-between mb-2 text-sm">
              {question.labels.map((label, index) => (
                <span key={index}>{label}</span>
              ))}
            </div>
            <div className="flex items-center">
              <input
                type="range"
                min={question.min}
                max={question.max}
                step={question.step}
                value={answers[question.id] || 0}
                onChange={(e) => handleInputChange(question.id, Number(e.target.value))}
                className="w-full h-3 accent-blue-500"
              />
            </div>
            <div className="flex justify-center items-center mt-4">
              <div className="text-center text-4xl font-bold bg-white/20 w-16 h-16 rounded-full flex items-center justify-center">
                {answers[question.id] || 0}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderProgressBar = () => {
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    return (
      <div className="w-full h-3 bg-white/30 rounded-full mb-6">
        <div 
          className="h-full bg-green-400 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    );
  };

  // Get appropriate emoji for question
  const getQuestionEmoji = (questionId) => {
    const emojiMap = {
      'Q1': '👟', 'Q2': '💧', 'Q3': '🚽', 'Q4': '💤',
      'Q5': '🌡️', 'Q6': '💓', 'Q7': '💦', 'Q8': '😌',
      'Q9': '😊', 'Q10': '🌀', 'Q11': '🤕', 'Q12': '😫',
      'Q13': '🍽️', 'Q14': '🔥', 'Q15': '🎭', 'Q16': '😴'
    };
    return emojiMap[questionId] || '❓';
  };

  const renderChallengeProgress = () => {
    return (
      <div className="challenge-progress mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold">7天健康挑战</h3>
          <span className="text-sm bg-blue-500/30 py-1 px-2 rounded-full">第 {challengeData.currentDay} 天</span>
        </div>
        <div className="flex justify-between items-center">
          {challengeData.dayStatuses.map((status, index) => (
            <div 
              key={index} 
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                status === 'completed' ? 'bg-green-500 text-white' :
                status === 'unlocked' ? 'bg-blue-500/50 border-2 border-blue-300 animate-pulse' :
                'bg-gray-600/50 text-gray-400'
              } ${challengeData.currentDay - 1 === index ? 'ring-2 ring-white' : ''}`}
            >
              {status === 'completed' ? 
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg> :
                (index + 1)
              }
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-indigo-600 to-purple-700 text-white">
      {/* App Title - Always visible */}
      <div className="w-full max-w-md text-center mb-4">
        <h1 className="text-3xl font-bold mb-1">每日健康追踪</h1>
        <p className="text-white/80">记录您的健康状态，获得专业分析</p>
      </div>
      
      {showOnboarding ? (
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-indigo-400/30 flex items-center justify-center mb-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 6V4C16 2.89543 15.1046 2 14 2H10C8.89543 2 8 2.89543 8 4V6M3 6H21M19 6L12 5M19 6L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11V17M9 14H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">欢迎使用健康追踪</h2>
            <p className="mb-6">您将通过回答一系列问题来记录今天的健康状况。这将帮助您和您的健康顾问更好地了解您的身体变化。</p>
            
            <div className="w-full bg-white/5 p-4 rounded-xl mb-6">
              <h3 className="font-bold text-lg mb-3 flex items-center">
                <span className="text-2xl mr-2">🏆</span>
                7天健康挑战
              </h3>
              <p className="mb-4">连续7天完成健康记录，追踪您的健康趋势，获得健康分析报告。</p>
              {renderChallengeProgress()}
            </div>
            
            <div className="w-full space-y-4 mb-6">
              <div className="flex items-center p-3 bg-white/5 rounded-lg">
                <div className="bg-indigo-400/20 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <span className="text-lg">1</span>
                </div>
                <div className="flex-1">回答所有健康相关问题</div>
              </div>
              
              <div className="flex items-center p-3 bg-white/5 rounded-lg">
                <div className="bg-indigo-400/20 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <span className="text-lg">2</span>
                </div>
                <div className="flex-1">获得健康积分和连续记录奖励</div>
              </div>
              
              <div className="flex items-center p-3 bg-white/5 rounded-lg">
                <div className="bg-indigo-400/20 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                  <span className="text-lg">3</span>
                </div>
                <div className="flex-1">查看您的健康记录摘要</div>
              </div>
            </div>
            
            <button
              onClick={startQuiz}
              className="py-4 px-6 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 w-full shadow-lg flex items-center justify-center text-lg"
            >
              开始记录
              <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Bar */}
          <div className="w-full max-w-md flex justify-between items-center mb-3 text-white/80 text-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {dateTime}
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 20.91 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="mr-3">积分: {points}</span>
            <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 7V3M16 7V3M7 11H17M5 21H19C20.1046 21 21 20.1046 21 19V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V19C3 20.1046 3.89543 21 5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>连续: {streak}</span>
          </div>
        </div>
        
        {/* Challenge Progress Button - Show only when not in quiz or summary */}
        {!showSummary && (
          <div className="w-full max-w-md mb-3">
            <button 
              onClick={openChallengeModal}
              className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 flex items-center justify-between"
            >
              <span className="flex items-center">
                <span className="text-xl mr-2">🏆</span>
                <span>7天健康挑战: 第 {challengeData.currentDay} 天</span>
              </span>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5L16 12L9 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}

        <div className={`quiz-container w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl ${animation}`}>
          {showSummary ? (
            <div className="summary-section">
              <div className="flex flex-col items-center mb-6">
                <div className="text-4xl mb-2">🎉</div>
                <h2 className="text-3xl font-bold mb-2">问卷提交成功</h2>
                <div className="text-xl mb-2">感谢您完成今天的健康状态评估！</div>
                <div className="mt-2 text-2xl font-bold">总积分: {points}</div>
              </div>
              
              {/* Challenge completion badge */}
              <div className="mb-6 bg-indigo-500/20 p-4 rounded-xl text-center">
                <div className="text-2xl mb-1">🏆 挑战进度</div>
                <p className="mb-3">您已完成第 {challengeData.completedDays.length} 天的健康记录！</p>
                {renderChallengeProgress()}
                
                {challengeData.completedDays.length === 7 ? (
                  <div className="mt-3 bg-green-500/30 p-3 rounded-lg">
                    <p className="font-bold">恭喜您完成7天健康挑战！🎊</p>
                    <p>您的完整健康报告已生成</p>
                  </div>
                ) : (
                  <p className="text-sm mt-2">
                    继续完成挑战获取完整健康报告
                  </p>
                )}
              </div>
              
              {reportStatus === 'loading' ? (
                // Show loading animation while "generating" report
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
                  <p className="text-center text-lg">正在生成您的健康报告...</p>
                </div>
              ) : (
                // ... existing report display ...
                <div className="report-container">
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold">{reportData.overview.title}</h3>
                      <div className="bg-white/20 text-white py-1 px-3 rounded-full font-bold text-sm">
                        健康分数: {reportData.overview.score}
                      </div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl">
                      <p>{reportData.overview.content}</p>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">健康洞察</h3>
                  <div className="space-y-3 mb-6">
                    {reportData.insights.map((insight, index) => (
                      <div key={index} className="bg-white/10 p-4 rounded-xl">
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-2">{insight.icon}</span>
                          <span className="font-bold">{insight.title}</span>
                        </div>
                        <p>{insight.content}</p>
                      </div>
                    ))}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">建议</h3>
                  <div className="bg-white/10 p-4 rounded-xl mb-6">
                    <ul className="list-disc list-inside space-y-2">
                      {reportData.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* ...existing detailed answers toggle... */}
                </div>
              )}
              
              <button
                onClick={resetQuiz}
                className="py-4 px-6 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 w-full shadow-lg flex items-center justify-center text-lg"
              >
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4V10H7M23 20V14H17M20.49 9C19.9828 7.56678 19.1209 6.2854 17.9845 5.27542C16.8482 4.26543 15.4745 3.55976 14 3.22426C12.5255 2.88875 10.9933 2.93232 9.5458 3.35067C8.09834 3.76903 6.78329 4.54782 5.76 5.6M3.51 15C4.01723 16.4332 4.87913 17.7146 6.01547 18.7246C7.15181 19.7346 8.52552 20.4402 10 20.7757C11.4745 21.1112 13.0067 21.0677 14.4542 20.6493C15.9017 20.231 17.2167 19.4522 18.24 18.4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                返回主页
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <div className="question-count font-bold flex items-center">
                  <span className="text-2xl mr-2">{getQuestionEmoji(questions[currentQuestion].id)}</span>
                  <span>问题 {currentQuestion + 1}/{questions.length}</span>
                </div>
              </div>
              
              {renderProgressBar()}
              
              <div className="question-text text-2xl font-bold mb-6">
                {questions[currentQuestion].questionText}
              </div>
              
              <div className="answer-section mb-6">
                {renderQuestionInput(questions[currentQuestion])}
              </div>
              
              <div className="flex justify-between gap-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className={`py-3 px-4 rounded-xl transition-all duration-200 flex-1 flex items-center justify-center ${
                    currentQuestion === 0 
                      ? 'bg-gray-500/50 opacity-50 cursor-not-allowed' 
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  上一题
                </button>
                
                {showSubmit ? (
                  <button
                    onClick={handleSubmit}
                    className="py-3 px-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-xl transition-all duration-200 flex-1 flex items-center justify-center font-bold"
                  >
                    <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9 17L19 7M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    提交
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl transition-all duration-200 flex-1 flex items-center justify-center font-bold"
                  >
                    下一题
                    <svg className="w-5 h-5 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </>
    )}
    
    {/* Challenge Modal */}
    {showChallengeModal && (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-b from-indigo-700 to-purple-800 rounded-2xl p-6 w-full max-w-md relative">
          <button 
            onClick={closeChallengeModal}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">🏆</div>
            <h2 className="text-2xl font-bold mb-2">7天健康挑战</h2>
            <p>连续7天记录您的健康状态，解锁完整健康报告</p>
          </div>
          
          {renderChallengeProgress()}
          
          <div className="mt-6 space-y-3">
            {challengeData.completionData.map((data, index) => (
              <div key={index} className="bg-white/10 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-bold">第 {data.day} 天</div>
                  <div className="text-sm text-white/70">{new Date(data.date).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center">
                  <span className="text-lg mr-1">✓</span>
                  <span>{data.points} 分</span>
                </div>
              </div>
            ))}
            
            {challengeData.completedDays.length < 7 && (
              <div className="bg-white/5 p-3 rounded-lg border border-dashed border-white/30 flex justify-between items-center">
                <div>
                  <div className="font-bold">第 {challengeData.currentDay} 天</div>
                  <div className="text-sm text-white/70">今天</div>
                </div>
                <div className="bg-blue-500/50 py-1 px-3 rounded-full text-sm animate-pulse">
                  进行中
                </div>
              </div>
            )}
            
            {challengeData.completedDays.length === 7 && (
              <div className="bg-green-500/30 p-4 rounded-lg text-center mt-4">
                <p className="text-xl font-bold mb-2">🎊 挑战完成！</p>
                <p>恭喜您完成7天健康挑战！</p>
                <p className="text-sm mt-2">您的健康数据将帮助更好地了解您的身体状况</p>
              </div>
            )}
          </div>
          
          {challengeData.completedDays.length < 7 && (
            <div className="mt-6">
              <button
                onClick={closeChallengeModal}
                className="py-3 px-4 bg-white/20 hover:bg-white/30 rounded-xl w-full transition-all duration-200"
              >
                继续今日记录
              </button>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
  );
}

// Make Quiz available globally
window.Quiz = Quiz;
