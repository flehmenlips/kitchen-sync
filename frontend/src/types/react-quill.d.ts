declare module 'react-quill' {
    import React from 'react';

    export interface ReactQuillProps {
        value: string;
        onChange: (content: string) => void;
        theme?: string;
        modules?: any;
        formats?: string[];
        placeholder?: string;
        readOnly?: boolean;
        className?: string;
    }

    const ReactQuill: React.ComponentType<ReactQuillProps>;
    export default ReactQuill;
} 