declare module 'vanta/dist/vanta.globe.min' {
    interface VantaGlobeOptions {
        el: HTMLElement | null;
        THREE: any;
        mouseControls?: boolean;
        touchControls?: boolean;
        gyroControls?: boolean;
        minHeight?: number;
        minWidth?: number;
        scale?: number;
        scaleMobile?: number;
        color?: number;
        backgroundColor?: number;
    }

    interface VantaEffect {
        destroy: () => void;
        resize: () => void;
        setOptions: (options: Partial<VantaGlobeOptions>) => void;
    }

    export default function GLOBE(options: VantaGlobeOptions): VantaEffect;
}
