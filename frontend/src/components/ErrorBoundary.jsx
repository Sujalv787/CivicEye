import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 40, fontFamily: 'monospace', background: '#1a1a2e', color: '#fff', minHeight: '100vh' }}>
                    <h1 style={{ color: '#f87171', marginBottom: 16 }}>Something went wrong</h1>
                    <pre style={{ color: '#fbbf24', whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: 16 }}>
                        {this.state.error?.toString()}
                    </pre>
                    <details style={{ color: '#94a3b8' }}>
                        <summary>Component Stack</summary>
                        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, marginTop: 8 }}>
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </details>
                </div>
            );
        }
        return this.props.children;
    }
}
