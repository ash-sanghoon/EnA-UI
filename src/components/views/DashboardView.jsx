'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

const DashboardView = () => {
  // 샘플 데이터
  const processingStats = [
    { id: 1, label: '전체 프로젝트', value: 24, icon: <FileText /> },
    { id: 2, label: '처리 대기', value: 5, icon: <Clock /> },
    { id: 3, label: '처리 완료', value: 18, icon: <CheckCircle2 /> },
    { id: 4, label: '오류 발생', value: 1, icon: <AlertCircle /> },
  ];

  const recentActivity = [
    {
      id: 1,
      project: 'Ras Tanura Refinery',
      drawing: 'Heat Exchanger Layout',
      status: 'completed',
      time: '10분 전'
    },
    {
      id: 2,
      project: 'ADNOC Refinery',
      drawing: 'Pump Station 3',
      status: 'processing',
      time: '23분 전'
    },
    {
      id: 3,
      project: 'Qatar Energy Plant',
      drawing: 'Process Flow Diagram',
      status: 'error',
      time: '1시간 전'
    }
  ];

  const chartData = [
    { name: '1월', drawings: 65 },
    { name: '2월', drawings: 78 },
    { name: '3월', drawings: 82 },
    { name: '4월', drawings: 95 }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">대시보드</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        {processingStats.map((stat) => (
          <div key={stat.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <div className="text-purple-600">
                  {stat.icon}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">{stat.label}</div>
                <div className="text-2xl font-semibold">{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-4">월별 처리 현황</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="drawings" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">최근 활동</h2>
            <button className="text-purple-600 hover:text-purple-700 text-sm">
              전체 보기
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                <div>
                  <div className="font-medium">{activity.project}</div>
                  <div className="text-sm text-gray-500">{activity.drawing}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm ${
                    activity.status === 'completed' ? 'text-green-600' :
                    activity.status === 'processing' ? 'text-blue-600' :
                    'text-red-600'
                  }`}>
                    {activity.status === 'completed' ? '완료됨' :
                     activity.status === 'processing' ? '처리 중' :
                     '오류'}
                  </div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-medium">진행중인 프로젝트</h2>
        </div>
        <div className="p-6">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left text-sm font-medium text-gray-500 pb-4">프로젝트명</th>
                <th className="text-left text-sm font-medium text-gray-500 pb-4">회사</th>
                <th className="text-left text-sm font-medium text-gray-500 pb-4">처리된 도면</th>
                <th className="text-left text-sm font-medium text-gray-500 pb-4">진행률</th>
                <th className="text-left text-sm font-medium text-gray-500 pb-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { name: 'Ras Tanura Refinery', company: 'Saudi Aramco', processed: 45, total: 50 },
                { name: 'Ruwais Refinery', company: 'ADNOC', processed: 28, total: 40 },
                { name: 'North Field Expansion', company: 'Qatar Energy', processed: 15, total: 30 }
              ].map((project, idx) => (
                <tr key={idx}>
                  <td className="py-4">
                    <div className="font-medium">{project.name}</div>
                  </td>
                  <td className="py-4 text-gray-500">{project.company}</td>
                  <td className="py-4 text-gray-500">{project.processed}/{project.total}</td>
                  <td className="py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${(project.processed/project.total)*100}%` }}
                      />
                    </div>
                  </td>
                  <td className="py-4">
                    <button className="text-purple-600 hover:text-purple-700">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;