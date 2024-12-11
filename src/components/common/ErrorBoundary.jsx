// src/components/common/ErrorBoundary.jsx
import React, { Component } from 'react';
import { AlertCircle } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 에러 로깅 서비스에 에러 보고
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-center text-red-500 mb-4">
              <AlertCircle className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-semibold text-center mb-2">
              오류가 발생했습니다
            </h2>
            <p className="text-gray-600 text-center mb-4">
              문제가 지속되면 관리자에게 문의해주세요.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

