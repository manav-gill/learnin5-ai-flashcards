import GlassCard from './GlassCard';
import './StatCard.css';

export default function StatCard({
  icon,
  label,
  value,
  change,
  changeDirection = 'up',
  accentColor = 'purple',
}) {
  return (
    <GlassCard hoverable>
      <div className="stat-card">
        <div className={`stat-card__icon stat-card__icon--${accentColor}`}>
          {icon}
        </div>
        <div className="stat-card__content">
          <div className="stat-card__label">{label}</div>
          <div className="stat-card__value">{value}</div>
          {change && (
            <span className={`stat-card__change stat-card__change--${changeDirection}`}>
              {changeDirection === 'up' ? '↑' : '↓'} {change}
            </span>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
