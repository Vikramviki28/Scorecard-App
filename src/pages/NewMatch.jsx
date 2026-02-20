import { useNavigate } from 'react-router-dom';
import { useMatch, ACTIONS } from '../context/MatchContext';
import QuickMatchSetup from '../components/match/QuickMatchSetup';
import Logo from '../components/common/Logo';
import './NewMatch.css';

const NewMatch = () => {
  const navigate = useNavigate();
  const { dispatch } = useMatch();

  const handleStart = (formData) => {
    // Create new match
    dispatch({
      type: ACTIONS.CREATE_MATCH,
      payload: {
        config: {
          totalOvers: formData.totalOvers,
          playersPerTeam: 11,
          matchType: 'limited'
        }
      }
    });

    // Set teams (no players yet - will be added dynamically)
    dispatch({
      type: ACTIONS.SET_TEAMS,
      payload: {
        teamAName: formData.teamAName,
        teamBName: formData.teamBName,
        teamAPlayers: [], // Empty - players added during gameplay
        teamBPlayers: []
      }
    });

    // Set toss
    const tossDecision = formData.battingFirst === formData.tossWinner ? 'bat' : 'bowl';
    dispatch({
      type: ACTIONS.SET_TOSS,
      payload: {
        winner: formData.tossWinner,
        decision: tossDecision
      }
    });

    // Navigate to live match - will prompt for batsmen there
    navigate('/live-match');
  };

  return (
    <div className="new-match-container">
      <div className="new-match-header">
        <Logo size={50} />
        <h1 className="new-match-title">New Match</h1>
      </div>

      <div className="new-match-content">
        <QuickMatchSetup onStart={handleStart} />
      </div>
    </div>
  );
};

export default NewMatch;
