import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('[ErrorBoundary caught error]:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-surface-50">
          <div className="max-w-md w-full bg-white rounded-2xl border border-surface-200 shadow-xl p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-danger-50 border border-danger-100 flex items-center justify-center text-danger-600">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-surface-900 tracking-tight mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-surface-600 mb-6 leading-relaxed">
              An unexpected error occurred while rendering this view. You can reload the page or return to the main dashboard.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 rounded-lg bg-surface-50 border border-surface-200 text-left overflow-auto max-h-36">
                <p className="text-xs font-mono text-danger-700 font-semibold break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-lg bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors shadow-xs cursor-pointer"
              >
                Reload Page
              </button>
              <a
                href="/"
                className="px-5 py-2.5 rounded-lg bg-surface-100 text-surface-700 font-semibold text-sm hover:bg-surface-200 transition-colors cursor-pointer"
              >
                Return Home
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
