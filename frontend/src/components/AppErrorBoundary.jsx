import React from 'react';

/**
 * Simple Error Boundary to catch and display React errors
 */
class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Application Error:', error);
        console.error('Error Info:', errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #050B14 0%, #0A0F20 50%, #1A1025 100%)',
                    color: '#fff',
                    padding: '2rem',
                    fontFamily: 'Inter, sans-serif'
                }}>
                    <h1 style={{ color: '#FF3366', marginBottom: '1rem' }}>Application Error</h1>
                    <p style={{ color: '#94A3B8', marginBottom: '2rem' }}>Something went wrong</p>
                    <div style={{
                        background: 'rgba(255, 51, 102, 0.1)',
                        border: '1px solid #FF3366',
                        borderRadius: '8px',
                        padding: '1rem',
                        maxWidth: '600px',
                        width: '100%',
                        textAlign: 'left'
                    }}>
                        <h3 style={{ color: '#FF3366', fontSize: '1rem', marginBottom: '0.5rem' }}>Error Details:</h3>
                        <pre style={{
                            color: '#F8FAFC',
                            fontSize: '0.85rem',
                            overflow: 'auto',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        }}>
                            {this.state.error && this.state.error.toString()}
                        </pre>
                        {this.state.errorInfo && (
                            <details style={{ marginTop: '1rem' }}>
                                <summary style={{ cursor: 'pointer', color: '#00F2FF' }}>Stack Trace</summary>
                                <pre style={{
                                    color: '#94A3B8',
                                    fontSize: '0.75rem',
                                    marginTop: '0.5rem',
                                    overflow: 'auto'
                                }}>
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '2rem',
                            background: 'linear-gradient(135deg, #4361EE 0%, #7209B7 100%)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            padding: '0.75rem 2rem',
                            borderRadius: '6px',
                            color: '#fff',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default AppErrorBoundary;
