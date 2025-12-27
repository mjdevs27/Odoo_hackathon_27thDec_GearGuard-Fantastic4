// Design System Hook
// Use this hook to access design tokens throughout the application

import designSystem from './design-system.json';

export const useDesignSystem = () => {
    return designSystem;
};

// Helper functions for common design patterns
export const getButtonStyles = (
    variant: 'primary' | 'secondary' = 'primary',
    size: 'sm' | 'md' | 'lg' = 'md',
    isDark: boolean = false
) => {
    const theme = isDark ? 'dark' : 'light';
    const buttonConfig = designSystem.components.button[variant][theme];
    const sizeConfig = designSystem.components.button.sizes[size];

    return {
        backgroundColor: buttonConfig.bg,
        color: buttonConfig.text,
        padding: sizeConfig.padding,
        fontSize: sizeConfig.fontSize,
        borderRadius: sizeConfig.borderRadius,
        border: buttonConfig.border ? `1px solid ${buttonConfig.border}` : 'none',
        boxShadow: buttonConfig.shadow || 'none',
        transition: `all ${designSystem.effects.transition.base} ease`,
        cursor: 'pointer',
        fontWeight: designSystem.typography.fontWeight.semibold,
        ':hover': {
            backgroundColor: buttonConfig.hover,
        }
    };
};

export const getCardStyles = (isDark: boolean = false) => {
    const theme = isDark ? 'dark' : 'light';
    const cardConfig = designSystem.components.card[theme];

    return {
        backgroundColor: cardConfig.bg,
        border: `1px solid ${cardConfig.border}`,
        borderRadius: designSystem.components.card.borderRadius,
        padding: designSystem.components.card.padding,
        backdropFilter: `blur(${designSystem.effects.backdropBlur.sm})`,
        transition: `all ${designSystem.effects.transition.base} ease`,
        ':hover': {
            backgroundColor: cardConfig.hover.bg,
            borderColor: cardConfig.hover.border,
            boxShadow: cardConfig.hover.shadow,
        }
    };
};

export const getPriorityBadgeStyles = (
    priority: 'low' | 'medium' | 'high' | 'urgent',
    isDark: boolean = false
) => {
    const badgeConfig = designSystem.components.badge.priority[priority];
    const bg = isDark ? badgeConfig.darkBg : badgeConfig.bg;
    const text = isDark ? badgeConfig.darkText : badgeConfig.text;

    return {
        backgroundColor: bg,
        color: text,
        padding: designSystem.components.badge.padding,
        borderRadius: designSystem.components.badge.borderRadius,
        fontSize: designSystem.components.badge.fontSize,
        fontWeight: designSystem.components.badge.fontWeight,
        display: 'inline-block',
    };
};

export const getStageBadgeStyles = (
    stage: 'new' | 'in_progress' | 'repaired' | 'scrap',
    isDark: boolean = false
) => {
    const badgeConfig = designSystem.components.badge.stage[stage];
    const bg = isDark ? badgeConfig.darkBg : badgeConfig.bg;
    const text = isDark ? badgeConfig.darkText : badgeConfig.text;

    return {
        backgroundColor: bg,
        color: text,
        padding: designSystem.components.badge.padding,
        borderRadius: designSystem.components.badge.borderRadius,
        fontSize: designSystem.components.badge.fontSize,
        fontWeight: designSystem.components.badge.fontWeight,
        display: 'inline-block',
    };
};

export const getInputStyles = (isDark: boolean = false) => {
    const theme = isDark ? 'dark' : 'light';
    const inputConfig = designSystem.components.input[theme];

    return {
        backgroundColor: inputConfig.bg,
        border: `1px solid ${inputConfig.border}`,
        color: inputConfig.text,
        padding: designSystem.components.input.padding,
        borderRadius: designSystem.components.input.borderRadius,
        fontSize: designSystem.typography.fontSize.base,
        transition: `all ${designSystem.effects.transition.base} ease`,
        ':focus': {
            borderColor: inputConfig.focus.border,
            outline: 'none',
            boxShadow: `0 0 0 3px ${inputConfig.focus.ring}`,
        },
        '::placeholder': {
            color: inputConfig.placeholder,
        }
    };
};

// Color utilities
export const getPriorityColor = (priority: 'low' | 'medium' | 'high' | 'urgent') => {
    return designSystem.colors.priority[priority];
};

export const getStageColor = (stage: 'new' | 'in_progress' | 'repaired' | 'scrap') => {
    return designSystem.colors.stage[stage];
};

export default designSystem;
