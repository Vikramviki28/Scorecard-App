import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { decodeSharedMatch } from '../utils/shareCodec';
import './SharedScorecard.css';

const SharedScorecard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const [activeInnings, setActiveInnings] = useState(1);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const decoded = decodeSharedMatch(hash);
    if (decoded) {
      setData(decoded);
    } else {
      setError(true);
    }
  }, []);

  if (error) {
    return (
      <div className="ss">
        <nav className="ss-nav">
          <div className="ss-nav-brand" onClick={() => navigate('/')}>
            <span className="ss-nav-icon">🏏</span>
            <span className="ss-nav-title">stumps2stumps</span>
          </div>
        </nav>
        <div className="ss-error-card">
          <div className="ss-error-icon">😕</div>
          <div className="ss-error-title">Invalid Scorecard Link</div>
          <div className="ss-error-text">This link may be corrupted or expired. Ask the scorer to share it again.</div>
          <button className="ss-cta-btn" onClick={() => navigate('/')}>Go to Home</button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="ss">
        <div className="ss-loading">Loading scorecard...</div>
      </div>
    );
  }

  const innings = activeInnings === 1 ? data.i1 : data.i2;
  const teamAName = data.tA;
  const teamBName = data.tB;
  const winnerName = data.r.w === 'T' ? null : data.r.w === 'A' ? teamAName : teamBName;

  const getBatTeamName = (inn) => inn?.bt === 'A' ? teamAName : teamBName;
  const getBowlTeamName = (inn) => inn?.bt === 'A' ? teamBName : teamAName;

  const formatScore = (inn) => {
    if (!inn) return '';
    return `${inn.s[0]}/${inn.s[1]} (${inn.s[2].toFixed(1)} ov)`;
  };

  const getExtrasBreakdown = (inn) => {
    if (!inn) return '';
    const parts = [];
    if (inn.ex[1]) parts.push(`w ${inn.ex[1]}`);
    if (inn.ex[2]) parts.push(`nb ${inn.ex[2]}`);
    if (inn.ex[3]) parts.push(`b ${inn.ex[3]}`);
    if (inn.ex[4]) parts.push(`lb ${inn.ex[4]}`);
    return parts.length ? `(${parts.join(', ')})` : '';
  };

  return (
    <div className="ss">
      {/* Navbar */}
      <nav className="ss-nav">
        <div className="ss-nav-brand" onClick={() => navigate('/')}>
          <span className="ss-nav-icon">🏏</span>
          <span className="ss-nav-title">stumps2stumps</span>
        </div>
        <span className="ss-shared-badge">SHARED SCORECARD</span>
      </nav>

      {/* Hero */}
      <div className="ss-hero">
        <div className="ss-match-title">{teamAName} vs {teamBName}</div>
        <div className="ss-match-meta">{data.ov} Overs Match &middot; {data.ts}</div>
      </div>

      {/* Result Card */}
      <div className="ss-result-card">
        <div className="ss-trophy">🏆</div>
        {data.r.w === 'T' ? (
          <div className="ss-result-title">Match Tied!</div>
        ) : (
          <>
            <div className="ss-result-title">{winnerName} Won</div>
            <div className="ss-result-margin">by {data.r.m}</div>
          </>
        )}
        {data.mom && (
          <div className="ss-mom">
            <div className="ss-mom-label">Man of the Match</div>
            <div className="ss-mom-name">{data.mom.n}</div>
            <div className="ss-mom-stats">{data.mom.s}</div>
          </div>
        )}
      </div>

      {/* Innings Score Summary */}
      <div className="ss-innings-summary">
        {data.i1 && (
          <div className="ss-inn-score-card">
            <div className="ss-inn-team">{getBatTeamName(data.i1)}</div>
            <div className="ss-inn-score">{formatScore(data.i1)}</div>
          </div>
        )}
        {data.i2 && (
          <div className="ss-inn-score-card">
            <div className="ss-inn-team">{getBatTeamName(data.i2)}</div>
            <div className="ss-inn-score">{formatScore(data.i2)}</div>
          </div>
        )}
      </div>

      {/* Innings Tabs */}
      <div className="ss-card">
        <div className="ss-card-header">
          <span className="ss-card-title">Batting Scorecard</span>
          <div className="ss-tabs">
            <button
              className={`ss-tab ${activeInnings === 1 ? 'active' : ''}`}
              onClick={() => setActiveInnings(1)}
            >
              {getBatTeamName(data.i1)}
            </button>
            {data.i2 && (
              <button
                className={`ss-tab ${activeInnings === 2 ? 'active' : ''}`}
                onClick={() => setActiveInnings(2)}
              >
                {getBatTeamName(data.i2)}
              </button>
            )}
          </div>
        </div>

        {innings && (
          <>
            {/* Batting Table */}
            <div className="ss-table-wrap">
              <table className="ss-table">
                <thead>
                  <tr>
                    <th className="col-name">BATTER</th>
                    <th className="col-dismissal">DISMISSAL</th>
                    <th>R</th>
                    <th>B</th>
                    <th>4s</th>
                    <th>6s</th>
                    <th>SR</th>
                  </tr>
                </thead>
                <tbody>
                  {innings.b.map((b, i) => (
                    <tr key={i}>
                      <td className="col-name">
                        <span className={b[6] ? 'name-normal' : 'name-striker'}>
                          {b[0]}{b[6] === 0 ? ' *' : ''}
                        </span>
                      </td>
                      <td className="col-dismissal">
                        {b[6] ? (
                          <span className="dismissed">{b[7]}</span>
                        ) : (
                          <span className="not-out">Not Out</span>
                        )}
                      </td>
                      <td className="col-stat bold">{b[1]}</td>
                      <td className="col-stat">{b[2]}</td>
                      <td className="col-stat">{b[3]}</td>
                      <td className="col-stat">{b[4]}</td>
                      <td className="col-stat">{b[5]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Extras */}
            <div className="ss-summary-row">
              <span className="ss-summary-label">Extras</span>
              <span className="ss-summary-value">
                {innings.ex[0]} <span className="ss-summary-detail">{getExtrasBreakdown(innings)}</span>
              </span>
            </div>

            {/* Total */}
            <div className="ss-total-row">
              <div className="ss-total-left">
                <span className="ss-total-label">TOTAL</span>
                <span className="ss-total-detail">
                  ({innings.s[2].toFixed(1)} Ov)
                </span>
              </div>
              <div className="ss-total-value">{innings.s[0]}/{innings.s[1]}</div>
            </div>

            {/* Fall of Wickets */}
            {innings.f && innings.f.length > 0 && (
              <div className="ss-fow">
                <div className="ss-fow-title">Fall of Wickets</div>
                <div className="ss-fow-list">
                  {innings.f.map((f, i) => (
                    <span key={i} className="ss-fow-badge">
                      <span className="ss-fow-num">{f[1]}</span>-{f[0]} ({f[3]}, {f[2].toFixed(1)} ov)
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bowling Analysis */}
      {innings && (
        <div className="ss-card">
          <div className="ss-card-header">
            <span className="ss-card-title">Bowling Analysis</span>
            <span className="ss-card-badge">{getBowlTeamName(innings)}</span>
          </div>
          <div className="ss-table-wrap">
            <table className="ss-table">
              <thead>
                <tr>
                  <th className="col-name">BOWLER</th>
                  <th>O</th>
                  <th>M</th>
                  <th>R</th>
                  <th>W</th>
                  <th>ECON</th>
                </tr>
              </thead>
              <tbody>
                {innings.w.map((w, i) => (
                  <tr key={i}>
                    <td className="col-name">
                      <span className="name-normal">{w[0]}</span>
                    </td>
                    <td className="col-stat">{w[1]}</td>
                    <td className="col-stat">{w[2]}</td>
                    <td className="col-stat">{w[3]}</td>
                    <td className="col-stat bold wicket-count">{w[4]}</td>
                    <td className="col-stat">{w[5]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer CTA */}
      <div className="ss-footer">
        <p>Scored on <strong>stumps2stumps</strong></p>
        <button className="ss-cta-btn" onClick={() => navigate('/')}>
          Score Your Own Match
        </button>
      </div>
    </div>
  );
};

export default SharedScorecard;
