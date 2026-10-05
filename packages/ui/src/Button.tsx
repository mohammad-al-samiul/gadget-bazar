import { colors } from '@gadgetbazar/design-tokens';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  children,
  style,
  ...props
}: ButtonProps): JSX.Element {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return colors.primary.blue;
      case 'accent':
        return colors.accent.orange;
      case 'secondary':
        return colors.neutral.lightGray;
      default:
        return colors.primary.blue;
    }
  };

  const getTextColor = () => {
    return variant === 'secondary' ? colors.neutral.nearBlack : colors.neutral.white;
  };

  return (
    <button
      style={{
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
        padding: '10px 20px',
        borderRadius: '8px',
        fontWeight: 600,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'background-color 0.2s ease',
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
