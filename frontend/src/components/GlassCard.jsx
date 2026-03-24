import './GlassCard.css';

export default function GlassCard({
  children,
  className = '',
  hoverable = false,
  compact = false,
  flush = false,
  style,
  onClick,
  ...rest
}) {
  const classes = [
    'glass-card',
    hoverable && 'glass-card--hoverable',
    compact && 'glass-card--compact',
    flush && 'glass-card--flush',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style} onClick={onClick} {...rest}>
      {children}
    </div>
  );
}
