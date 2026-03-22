// Type declarations for @google/model-viewer web component
// https://modelviewer.dev/
declare namespace JSX {
    interface IntrinsicElements {
        'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
            src?: string;
            alt?: string;
            ar?: boolean;
            'ar-modes'?: string;
            'ar-scale'?: string;
            'camera-controls'?: boolean;
            'auto-rotate'?: boolean;
            'rotation-per-second'?: string;
            poster?: string;
            'shadow-intensity'?: string;
            'environment-image'?: string;
            exposure?: string;
            'touch-action'?: string;
            'field-of-view'?: string;
            'min-camera-orbit'?: string;
            'max-camera-orbit'?: string;
            style?: React.CSSProperties;
            className?: string;
            id?: string;
        };
    }
}
