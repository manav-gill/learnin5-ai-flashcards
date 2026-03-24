import './Button.css';

export default function Button({
  children,
  variant = 'primary',
  size,
  fullWidth = false,
  iconOnly = false,
  className = '',
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size && `btn--${size}`,
    fullWidth && 'btn--full',
    iconOnly && 'btn--icon',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
