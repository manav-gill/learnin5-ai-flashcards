import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import StatCard from '../components/StatCard';
import './Dashboard.css';

const STATS = [
  {
    icon: '📚',
    label: 'Total Flashcards',
    value: '248',
    change: '+12 this week',
    changeDirection: 'up',
    accentColor: 'purple',
  },
  {
    icon: '🔥',
    label: 'Study Streak',
    value: '14',
    change: 'days in a row',
    changeDirection: 'up',
    accentColor: 'green',
  },
  {
    icon: '✅',
    label: 'Mastered',
    value: '89',
    change: '+5 today',
    changeDirection: 'up',
    accentColor: 'blue',
  },
  {
    icon: '⏱️',
    label: 'Time Studied',
    value: '4.2h',
    change: 'this week',
    changeDirection: 'up',
    accentColor: 'pink',
  },
];

const ACTIVITIES = [
  {
    title: 'Completed "JavaScript Closures" deck',
    time: '2 hours ago',
    color: 'purple',
  },
  {
    title: 'Created 8 new flashcards in "React Hooks"',
    time: '5 hours ago',
    color: 'green',
  },
  {
    title: 'Mastered "CSS Grid Basics" deck',
    time: 'Yesterday',
    color: 'blue',
  },
  {
    title: 'Started studying "Node.js Fundamentals"',
    time: 'Yesterday',
    color: 'pink',
  },
  {
    title: 'Achieved 7-day study streak 🎉',
    time: '2 days ago',
    color: 'green',
  },
];

export default function Dashboard() {
  return (
    <div className="dashboard">
      {/* Welcome */}
      <div className="dashboard__welcome animate-fade-in">
        <h1 className="dashboard__greeting">
          Welcome back, <span>Madhav</span> 👋
        </h1>
        <p className="dashboard__subtitle">
          You've mastered 36% of your flashcards. Keep up the great work!
        </p>
      </div>

      {/* Stats */}
      <div className="dashboard__stats stagger-children">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="dashboard__content">
        {/* Recent Activity */}
        <div>
          <h3 className="dashboard__section-title">Recent Activity</h3>
          <GlassCard>
            <div className="activity-list">
              {ACTIVITIES.map((activity, i) => (
                <div className="activity-item" key={i}>
                  <div className={`activity-item__dot activity-item__dot--${activity.color}`} />
                  <div className="activity-item__text">
                    <div className="activity-item__title">{activity.title}</div>
                    <div className="activity-item__time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="dashboard__section-title">Quick Actions</h3>
          <GlassCard>
            <div className="quick-actions">
              <Button variant="primary" fullWidth>
                ✨ Generate Flashcards
              </Button>
              <Button variant="green" fullWidth>
                📖 Study Now
              </Button>
              <Button variant="secondary" fullWidth>
                📊 View Progress
              </Button>
              <Button variant="ghost" fullWidth>
                ⚙️ Settings
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Button Showcase */}
      <div>
        <h3 className="dashboard__section-title">Component Preview</h3>
        <GlassCard>
          <p className="text-secondary mb-md" style={{ fontSize: '0.8125rem' }}>
            Button variants available in the design system:
          </p>
          <div className="dashboard__button-row">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="green">Green</Button>
            <Button variant="blue">Blue</Button>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="lg">Large</Button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
