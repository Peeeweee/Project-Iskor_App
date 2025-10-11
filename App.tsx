import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { MatchConfig, Theme, View, Match, SavedTeam, Settings, TeamStat, SportDefaultSettings } from './types';
import { GameStatus, Sport, Font, Layout as UILayout } from './types';
import { useGameLogic } from './hooks/useGameLogic';
import SetupScreen from './components/SetupScreen';
import Dashboard from './components/Dashboard';
import AudienceView from './components/AudienceView';
import MatchView from './components/MatchView';
import Layout from './components/layout/Layout';
import SettingsPage from './components/SettingsPage';
import LandingPage from './components/LandingPage';
import AnalyticsPage from './components/AnalyticsPage';
import MatchHistoryPage from './components/MatchHistoryPage';
import TeamsPage from './components/TeamsPage';
import { TEAM_COLORS } from './constants';
import { getDateFromId } from './utils';
import './src/animations.css';

const initialMatches: Match[] = [
  { id: '1', sport: Sport.Basketball, teamA: { name: 'Lakers', color: '#FDB927' }, teamB: { name: 'Warriors', color: '#006BB6' }, status: 'In Progress', durationMinutes: 12, durationSeconds: 0, periods: 4, gameMode: 'time' },
  { id: '2', sport: Sport.Soccer, teamA: { name: 'Real Madrid', color: '#FEBE10' }, teamB: { name: 'Barcelona', color: '#A50044' }, status: 'Finished', durationMinutes: 45, durationSeconds: 0, periods: 2, gameMode: 'time', finalScoreA: 6, finalScoreB: 4 },
  { id: '3', sport: Sport.Volleyball, teamA: { name: 'Brazil', color: '#009B3A' }, teamB: { name: 'USA', color: '#B31336' }, status: 'Upcoming', durationMinutes: 0, durationSeconds: 0, periods: 5, gameMode: 'time' },
  { id: '4', sport: Sport.Basketball, teamA: { name: 'Celtics', color: '#008348' }, teamB: { name: 'Heat', color: '#98002E' }, status: 'Finished', durationMinutes: 12, durationSeconds: 0, periods: 4, gameMode: 'time', finalScoreA: 9, finalScoreB: 6 },
  { id: '5', sport: Sport.Soccer, teamA: { name: 'Man United', color: '#DA291C' }, teamB: { name: 'Liverpool', color: '#C8102E' }, status: 'Upcoming', durationMinutes: 45, durationSeconds: 0, periods: 2, gameMode: 'time' },
  { id: '6', sport: Sport.Volleyball, teamA: { name: 'Poland', color: '#DC143C' }, teamB: { name: 'Italy', color: '#008C45' }, status: 'In Progress', durationMinutes: 0, durationSeconds: 0, periods: 5, gameMode: 'time' },
];

const App: React.FC = () => {
    const [view, setView] = useState<View>('landing');
    const [settings, setSettings] = useState<Settings>(() => {
        const saved = localStorage.getItem('scoreboardSettings');
        const defaultSettings: Settings = {
            theme: 'dark',
            font: Font.Display,
            layout: UILayout.Wide,
            defaultSport: Sport.Basketball,
            defaultTeamAColor: TEAM_COLORS[0],
            defaultTeamBColor: TEAM_COLORS[1],
            sportDefaults: {
                [Sport.Basketball]: { durationMinutes: 12, durationSeconds: 0, periods: 4, targetScore: 21 },
                [Sport.Soccer]: { durationMinutes: 45, durationSeconds: 0, periods: 2, targetScore: 10 },
                [Sport.Volleyball]: { durationMinutes: 0, durationSeconds: 0, periods: 5, targetScore: 25 },
            }
        };
        try {
            if (saved) {
                // Deep merge to ensure new settings properties are added
                const parsed = JSON.parse(saved);
                return { 
                    ...defaultSettings, 
                    ...parsed,
                    sportDefaults: {
                        ...defaultSettings.sportDefaults,
                        ...(parsed.sportDefaults || {})
                    }
                };
            }
            const legacyTheme = localStorage.getItem('theme') as Theme | null;
            if (legacyTheme) {
                defaultSettings.theme = legacyTheme;
                localStorage.removeItem('theme');
            }
        } catch (error) {
            console.error("Could not parse settings from localStorage", error);
        }
        return defaultSettings;
    });

    const [matchConfig, setMatchConfig] = useState<MatchConfig | null>(null);
    const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
    const [matches, setMatches] = useState<Match[]>(() => {
        try {
            const savedMatches = localStorage.getItem('matches');
            return savedMatches ? JSON.parse(savedMatches) : initialMatches;
        } catch (error) {
            console.error("Could not parse matches from localStorage", error);
            return initialMatches;
        }
    });
    
    const [savedTeams, setSavedTeams] = useState<SavedTeam[]>(() => {
        try {
            const storedTeams = localStorage.getItem('savedTeams');
            return storedTeams ? JSON.parse(storedTeams) : [];
        } catch (error) {
            console.error("Could not parse saved teams from localStorage", error);
            return [];
        }
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [isExportingPdf, setIsExportingPdf] = useState(false);


    const { gameState, time, isRunning, actions, canUndo, canRedo } = useGameLogic(matchConfig, activeMatchId);

    useEffect(() => {
        localStorage.setItem('matches', JSON.stringify(matches));
    }, [matches]);
    
     useEffect(() => {
        localStorage.setItem('savedTeams', JSON.stringify(savedTeams));
    }, [savedTeams]);

    useEffect(() => {
        localStorage.setItem('scoreboardSettings', JSON.stringify(settings));
        const root = window.document.documentElement;
        root.className = '';
        root.classList.add(settings.theme);
    }, [settings]);

    const updateSettings = (newSettings: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const navigateTo = (newView: View) => {
      setSearchQuery(''); // Clear search when navigating
      setView(newView);
    };

    const handleLeaveMatch = () => {
        setMatchConfig(null);
        setActiveMatchId(null);
        navigateTo('dashboard');
    };

    const setupMatchForControl = (match: Match) => {
         const config: MatchConfig = {
            sport: match.sport,
            teamA: match.teamA,
            teamB: match.teamB,
            durationMinutes: match.durationMinutes,
            durationSeconds: match.durationSeconds,
            periods: match.periods,
            gameMode: match.gameMode,
            targetScore: match.targetScore,
        };
        setMatchConfig(config);
        setActiveMatchId(match.id);
    };

    const handleManageMatch = (match: Match) => {
        setupMatchForControl(match);
        navigateTo('match');
    };
    
    const handleGoToAudienceView = (match: Match) => {
        setActiveMatchId(match.id);
        setMatchConfig({
             sport: match.sport,
            teamA: match.teamA,
            teamB: match.teamB,
            durationMinutes: match.durationMinutes,
            durationSeconds: match.durationSeconds,
            periods: match.periods,
            gameMode: match.gameMode,
            targetScore: match.targetScore,
        });
        navigateTo('audience');
    };

    const handleMatchStart = (config: MatchConfig) => {
        const newMatch: Match = {
            ...config,
            id: `match-${Date.now()}`,
            status: 'Upcoming',
        };
        setMatches(prev => [...prev, newMatch]);
        setMatchConfig(config);
        setActiveMatchId(newMatch.id);
        navigateTo('match');
    };

    const handleDeleteMatch = (matchId: string) => {
        setMatches(prev => prev.filter(match => match.id !== matchId));
        localStorage.removeItem(`match-state-${matchId}`);
    };

    const handleArchiveMatch = (matchId: string) => {
        setMatches(prev =>
            prev.map(match =>
                match.id === matchId ? { ...match, isArchived: true } : match
            )
        );
    };
    
    const handleToggleCompleteMatch = (matchId: string, isCompleted: boolean) => {
        setMatches(prev =>
            prev.map(match =>
                match.id === matchId ? { ...match, isCompleted } : match
            )
        );
    };

    const handleUnarchiveMatch = (matchId: string) => {
        setMatches(prev =>
            prev.map(match =>
                match.id === matchId ? { ...match, isArchived: false } : match
            )
        );
    };
    
    const handleUpdateMatchConfig = (matchId: string, newConfig: Partial<MatchConfig>) => {
        let updatedMatch: Match | undefined;
        setMatches(prev =>
            prev.map(match => {
                if (match.id === matchId) {
                    updatedMatch = { ...match, ...newConfig };
                    return updatedMatch;
                }
                return match;
            })
        );

        if (activeMatchId === matchId && updatedMatch) {
            setMatchConfig(updatedMatch);
        }
    };
    
    const handleSaveTeam = (team: Omit<SavedTeam, 'id'> & { id?: string }) => {
        if (team.id) {
            setSavedTeams(prev => prev.map(t => t.id === team.id ? { ...t, name: team.name, color: team.color, sport: team.sport } : t));
        } else {
            const newTeam = { ...team, id: `team-${Date.now()}` };
            setSavedTeams(prev => [...prev, newTeam]);
            return newTeam; // Return the new team to be auto-selected
        }
    };

    const handleDeleteTeam = (teamId: string) => {
        setSavedTeams(prev => prev.filter(t => t.id !== teamId));
    };

    const handleExportData = () => {
        try {
            const dataToExport = {
                matches: JSON.parse(localStorage.getItem('matches') || '[]'),
                savedTeams: JSON.parse(localStorage.getItem('savedTeams') || '[]'),
                settings: JSON.parse(localStorage.getItem('scoreboardSettings') || '{}'),
            };
            const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
            const link = document.createElement("a");
            link.href = jsonString;
            link.download = `scoreboard_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
        } catch (error) {
            console.error("Failed to export data:", error);
            alert("Error exporting data.");
        }
    };

    const handleExportPdf = async () => {
        setIsExportingPdf(true);
        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');

            const doc = new jsPDF();
            const pageHeight = doc.internal.pageSize.height;
            let finalY = 0;

            doc.setFontSize(22).setFont('helvetica', 'bold');
            doc.text('Project: Iskor-App', 105, 20, { align: 'center' });
            doc.setFontSize(16).setFont('helvetica', 'normal');
            doc.text('Data Export', 105, 30, { align: 'center' });
            doc.setFontSize(12);
            doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' });

            const tableOptions = {
                startY: 60,
                headStyles: { fillColor: '#16A3B8' },
                theme: 'grid' as const, // FIX: Added 'as const' to assert literal type
                didDrawPage: (data: any) => { finalY = data.cursor.y; }
            };

            doc.setFontSize(18).setFont('helvetica', 'bold');
            doc.text('Application Settings', 14, tableOptions.startY - 10);
            autoTable(doc, { ...tableOptions, head: [['Setting', 'Value']], body: [
                ['Theme', settings.theme], ['Default Sport', settings.defaultSport],
                ['Audience View Font', settings.font], ['Audience View Layout', settings.layout],
                ['Default Team A Color', settings.defaultTeamAColor], ['Default Team B Color', settings.defaultTeamBColor],
            ]});

            const checkNewPage = (yPos: number) => {
                if (yPos + 40 > pageHeight) { doc.addPage(); return 30; }
                return yPos + 20;
            };

            let currentY = checkNewPage(finalY);
            
            const finishedMatches = matches.filter((m): m is Match & { finalScoreA: number; finalScoreB: number } => 
                m.status === 'Finished' && typeof m.finalScoreA === 'number' && typeof m.finalScoreB === 'number'
            );

            if (finishedMatches.length > 0) {
                doc.setFontSize(18).setFont('helvetica', 'bold');
                doc.text('Analytics Overview', 14, currentY - 10);

                const sportCounts = finishedMatches.reduce((acc: Record<Sport, number>, match) => {
                    acc[match.sport] = (acc[match.sport] || 0) + 1;
                    return acc;
                }, {} as Record<Sport, number>);

                const maxCount = Math.max(0, ...Object.values(sportCounts) as number[]);
                const mostPlayedSportName = Object.entries(sportCounts)
                    .filter(([, count]) => count === maxCount)
                    .map(([sport]) => sport)
                    .join(', ');

                const highestGamesBySport = (Object.values(Sport) as Sport[]).reduce((acc, sport: Sport) => {
                    const sportMatches = finishedMatches.filter(m => m.sport === sport);
                    if (sportMatches.length > 0) {
                        acc[sport] = sportMatches.reduce((max, match) => {
                            const totalScore = (match.finalScoreA ?? 0) + (match.finalScoreB ?? 0);
                            return totalScore > max.total ? { total: totalScore } : max;
                        }, { total: (sportMatches[0].finalScoreA ?? 0) + (sportMatches[0].finalScoreB ?? 0) });
                    } else {
                        acc[sport] = { total: 0 };
                    }
                    return acc;
                }, {} as Record<Sport, { total: number }>);

                const highestScoresText = (Object.values(Sport) as Sport[]).map(sport => `${sport}: ${highestGamesBySport[sport]?.total ?? '0'}`).join('\n');

                const mostDecisiveVictoriesBySport = (Object.values(Sport) as Sport[]).reduce((acc, sport: Sport) => {
                    const sportMatches = finishedMatches.filter(m => m.sport === sport);
                    if (sportMatches.length > 0) {
                        acc[sport] = sportMatches.reduce((max, match) => {
                            const diff = Math.abs((match.finalScoreA ?? 0) - (match.finalScoreB ?? 0));
                            return diff > max.diff ? { diff } : max;
                        }, { diff: Math.abs((sportMatches[0].finalScoreA ?? 0) - (sportMatches[0].finalScoreB ?? 0)) });
                    } else {
                        acc[sport] = { diff: 0 };
                    }
                    return acc;
                }, {} as Record<Sport, { diff: number }>);
                
                const mostDecisiveText = (Object.values(Sport) as Sport[]).map(sport => `${sport}: +${mostDecisiveVictoriesBySport[sport]?.diff ?? '0'}`).join('\n');

                autoTable(doc, {
                    ...tableOptions,
                    startY: currentY,
                    head: [['Metric', 'Value']],
                    body: [
                        ['Total Matches Played', finishedMatches.length.toString()],
                        ['Most Played Sport(s)', mostPlayedSportName],
                        ['Highest Scoring Games (Total Points)', highestScoresText],
                        ['Most Decisive Victories (Point Diff)', mostDecisiveText],
                    ],
                     didParseCell: (data) => {
                        if (data.row.index >= 2) {
                            (data.cell.styles as any).cellWidth = 'wrap';
                        }
                    },
                });

                currentY = checkNewPage(finalY);
            }
            
            if (savedTeams.length > 0) {
              doc.setFontSize(18).setFont('helvetica', 'bold');
              doc.text('Saved Teams', 14, currentY - 10);
              autoTable(doc, { ...tableOptions, startY: currentY, head: [['Name', 'Color', 'Sport Association']], body: savedTeams.map(team => [team.name, team.color, team.sport || 'Universal'])});
              currentY = checkNewPage(finalY);
            }
            
            if (finishedMatches.length > 0) {
                const teamStats = finishedMatches.reduce((acc, match) => {
                    const teams = [match.teamA, match.teamB];
                    const scores = [match.finalScoreA, match.finalScoreB];
                    for (let i = 0; i < teams.length; i++) {
                        const team = teams[i];
                        if (!acc[team.name]) acc[team.name] = { wins: 0, losses: 0, ties: 0, totalGames: 0, teamConfig: team };
                        acc[team.name].totalGames++;
                        if (scores[i] > scores[1 - i]) acc[team.name].wins++;
                        else if (scores[i] < scores[1 - i]) acc[team.name].losses++;
                        else acc[team.name].ties++;
                    }
                    return acc;
                }, {} as Record<string, TeamStat>);

                const leaderboard = (Object.values(teamStats) as TeamStat[]).map((team: TeamStat) => ({
                    ...team,
                    winRate: team.totalGames > 0 ? (team.wins / team.totalGames * 100) : 0,
                })).sort((a, b) => b.wins - a.wins || b.winRate - a.winRate);
                
                const top5Teams = leaderboard.slice(0, 5);

                if (top5Teams.length > 0) {
                    doc.setFontSize(18).setFont('helvetica', 'bold');
                    doc.text('Top 5 Teams Leaderboard', 14, currentY - 10);
                    autoTable(doc, {
                        ...tableOptions, startY: currentY,
                        head: [['#', 'Team', 'W', 'L', 'GP', 'Win %']],
                        body: top5Teams.map((team, index) => [
                            index + 1, team.teamConfig.name, team.wins, team.losses, team.totalGames, `${team.winRate.toFixed(1)}%`
                        ]),
                        didParseCell: (data) => {
                            if (data.section === 'body' && data.column.index === 1) {
                                const teamStat = top5Teams[data.row.index];
                                if (teamStat) (data.cell.styles as any).textColor = teamStat.teamConfig.color;
                            }
                        }
                    });
                    currentY = checkNewPage(finalY);
                }

                doc.setFontSize(18).setFont('helvetica', 'bold');
                doc.text('Completed Match History', 14, currentY - 10);
                autoTable(doc, {
                    ...tableOptions, startY: currentY,
                    head: [['Date', 'Sport', 'Matchup', 'Final Score', 'Winner']],
                    body: finishedMatches.map(match => {
                        const winner = (match.finalScoreA ?? 0) > (match.finalScoreB ?? 0) ? match.teamA.name : ((match.finalScoreB ?? 0) > (match.finalScoreA ?? 0) ? match.teamB.name : 'Tie');
                        return [getDateFromId(match.id, { year: 'numeric', month: 'short', day: 'numeric' }), match.sport, `${match.teamA.name} vs ${match.teamB.name}`, `${match.finalScoreA} - ${match.finalScoreB}`, winner];
                    }),
                });
            }

            doc.save(`scoreboard_pro_export_${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error("Failed to export PDF:", error);
            alert("Error exporting PDF. Check console for details.");
        } finally {
            setIsExportingPdf(false);
        }
    };

    const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("File is not readable.");
                const data = JSON.parse(text);
                if (data.matches && data.savedTeams && data.settings) {
                    if (window.confirm("Are you sure you want to import this data? This will overwrite all your current matches, teams, and settings.")) {
                        setMatches(data.matches);
                        setSavedTeams(data.savedTeams);
                        setSettings(data.settings);
                        alert("Data imported successfully!");
                        navigateTo('dashboard');
                    }
                } else {
                    throw new Error("Invalid backup file format. The file must contain 'matches', 'savedTeams', and 'settings' keys.");
                }
            } catch (error) {
                alert(`Error importing data: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        };
        reader.readAsText(file);
    };

    const handleClearData = () => {
        if (window.prompt('This action is irreversible and will delete all your matches, teams, and settings. To confirm, please type "DELETE" below.') === 'DELETE') {
            localStorage.removeItem('matches');
            localStorage.removeItem('savedTeams');
            localStorage.removeItem('scoreboardSettings');
            window.location.reload();
        }
    };

    useEffect(() => {
        if (!activeMatchId || !gameState?.status) return;

        const newStatus = (() => {
            switch (gameState.status) {
                case GameStatus.InProgress:
                case GameStatus.Paused:
                case GameStatus.PeriodBreak:
                    return 'In Progress';
                case GameStatus.Finished:
                    return 'Finished';
                case GameStatus.NotStarted:
                default:
                    return 'Upcoming';
            }
        })();

        setMatches(prevMatches =>
            prevMatches.map(match => {
                if (match.id === activeMatchId) {
                    const updatedMatch: Match = { ...match, status: newStatus };
                    if (newStatus === 'Finished' && gameState) {
                        updatedMatch.finalScoreA = gameState.teamA.score;
                        updatedMatch.finalScoreB = gameState.teamB.score;
                        updatedMatch.periodScores = gameState.periodScores;
                    }
                    return updatedMatch;
                }
                return match;
            })
        );
    }, [gameState?.status, activeMatchId, gameState]);

    const renderView = () => {
        const handleCreateMatch = () => navigateTo('setup');
        const handleGoToHistory = () => navigateTo('history');
        const dashboardProps = {
            matches,
            onManageMatch: handleManageMatch,
            onGoToAudienceView: handleGoToAudienceView,
            onCreateMatch: handleCreateMatch,
            onDeleteMatch: handleDeleteMatch,
            onArchiveMatch: handleArchiveMatch,
            onUnarchiveMatch: handleUnarchiveMatch,
            onGoToHistory: handleGoToHistory,
            onToggleCompleteMatch: handleToggleCompleteMatch,
            searchQuery
        };

        switch (view) {
            case 'dashboard':
                return <Dashboard {...dashboardProps} />;
            case 'setup':
                return <SetupScreen onStartMatch={handleMatchStart} onBack={() => navigateTo('dashboard')} savedTeams={savedTeams} onSaveTeam={handleSaveTeam} settings={settings} />;
            case 'settings':
                return <SettingsPage settings={settings} updateSettings={updateSettings} onExportData={handleExportData} onImportData={handleImportData} onClearData={handleClearData} onExportPdf={handleExportPdf} isExportingPdf={isExportingPdf} />;
            case 'analytics':
                return <AnalyticsPage matches={matches} />;
            case 'history':
                return <MatchHistoryPage matches={matches} />;
            case 'teams':
                return <TeamsPage savedTeams={savedTeams} onSaveTeam={handleSaveTeam} onDeleteTeam={handleDeleteTeam} searchQuery={searchQuery} />;
            case 'match':
                if (matchConfig && gameState && activeMatchId) {
                    const activeMatch = matches.find(m => m.id === activeMatchId);
                    if (activeMatch) {
                        return <MatchView
                            match={activeMatch}
                            matchConfig={matchConfig}
                            gameState={gameState}
                            clock={{ time, isRunning }}
                            actions={actions}
                            onLeaveMatch={handleLeaveMatch}
                            activeMatchId={activeMatchId}
                            onUpdateMatchConfig={(newConfig) => handleUpdateMatchConfig(activeMatchId, newConfig)}
                            canUndo={canUndo}
                            canRedo={canRedo}
                            theme={settings.theme}
                            toggleTheme={cycleTheme}
                        />;
                    }
                }
                return <Dashboard {...dashboardProps} />;
            default:
                return <Dashboard {...dashboardProps} />;
        }
    };
    
    const themes: Theme[] = ['light', 'dark', 'viola', 'coder'];
    const cycleTheme = () => {
        const currentIndex = themes.indexOf(settings.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        updateSettings({ theme: themes[nextIndex] });
    };

    if (view === 'landing') {
        return <LandingPage onGetStarted={() => navigateTo('dashboard')} toggleTheme={cycleTheme} theme={settings.theme} />;
    }
    
    if (view === 'audience' && matchConfig && activeMatchId) {
        return <AudienceView config={matchConfig} matchId={activeMatchId} onExit={() => navigateTo('dashboard')} theme={settings.theme} />;
    }

    return (
      <Layout 
        activeView={view}
        navigateTo={navigateTo}
        theme={settings.theme}
        toggleTheme={cycleTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      >
        {renderView()}
      </Layout>
    );
};

export default App;